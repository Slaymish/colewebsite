import * as path from 'node:path';
import * as fs from 'node:fs';
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import type { Construct } from 'constructs';

export interface SiteStackProps extends StackProps {
  /** Fully-qualified host this distribution serves, e.g. test.example.nz. */
  readonly domainName: string;
  /**
   * 'prod' or 'test'. Fixes the bucket name, which matters: the content deploy
   * role grants on a `coleanderson-site-*` prefix, and CDK's generated names
   * would not match it.
   */
  readonly siteEnv: 'prod' | 'test';
  readonly hostedZone: { readonly zoneName: string; readonly hostedZoneId: string };
  /** Must live in us-east-1 to attach to CloudFront. */
  readonly certificateArn: string;
  /**
   * Basic-auth credential for the test environment, already base64-encoded as
   * `Basic dXNlcjpwYXNz`. Supplied at synth time, never committed. Omit for
   * production.
   */
  readonly basicAuthHeader?: string;
  /** Test builds are excluded from search. Production must never set this. */
  readonly noindex?: boolean;
}

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const isProduction = !props.basicAuthHeader;

    // Private bucket. CloudFront is the only reader, via Origin Access Control.
    const bucket = new s3.Bucket(this, 'SiteBucket', {
      // Explicit and predictable so the content role's resource ARNs can be
      // scoped by prefix rather than granted on every bucket in the account.
      bucketName: `coleanderson-site-${props.siteEnv}-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProduction,
    });

    const viewerRequest = props.basicAuthHeader
      ? this.basicAuthFunction(props.basicAuthHeader)
      : this.rewriteFunction();

    // Only the gated environment has anything to remember. Production has no
    // sign-in, so it has no cookie to set and no response function at all.
    const viewerResponse = props.basicAuthHeader
      ? this.authCookieFunction(props.basicAuthHeader)
      : undefined;

    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        // withOriginAccessControl, not the legacy origin access identity.
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: this.securityHeaders(
          props.noindex ?? false,
          !isProduction,
        ),
        compress: true,
        functionAssociations: [
          {
            function: viewerRequest,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
          ...(viewerResponse
            ? [
                {
                  function: viewerResponse,
                  eventType: cloudfront.FunctionEventType.VIEWER_RESPONSE,
                },
              ]
            : []),
        ],
      },
      domainNames: [props.domainName],
      certificate: acm.Certificate.fromCertificateArn(this, 'Cert', props.certificateArn),
      defaultRootObject: 'index.html',
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      // Australia and New Zealand edge locations are only in PRICE_CLASS_ALL.
      // Every visitor to this site is in NZ. Do not "optimise" this to 100 or 200.
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      errorResponses: [
        {
          // A real 404, not an SPA rewrite to index.html with a 200 status,
          // which would poison indexing for a site whose job is being found.
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: Duration.minutes(5),
        },
      ],
    });

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      zoneName: props.hostedZone.zoneName,
      hostedZoneId: props.hostedZone.hostedZoneId,
    });

    const recordTarget = route53.RecordTarget.fromAlias(
      new targets.CloudFrontTarget(distribution),
    );
    new route53.ARecord(this, 'AliasA', {
      zone,
      recordName: props.domainName,
      target: recordTarget,
    });
    new route53.AaaaRecord(this, 'AliasAAAA', {
      zone,
      recordName: props.domainName,
      target: recordTarget,
    });

    // Consumed by the deploy workflow, which syncs content and invalidates.
    new CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new CfnOutput(this, 'SiteUrl', { value: `https://${props.domainName}` });
  }

  private rewriteFunction(): cloudfront.Function {
    return new cloudfront.Function(this, 'RewriteFunction', {
      code: cloudfront.FunctionCode.fromFile({
        filePath: path.join(__dirname, '..', 'functions', 'rewrite.js'),
      }),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });
  }

  private basicAuthFunction(header: string): cloudfront.Function {
    return new cloudfront.Function(this, 'BasicAuthFunction', {
      code: cloudfront.FunctionCode.fromInline(
        this.credentialled('basic-auth.js', header),
      ),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });
  }

  /** Sets the preview cookie once a sign-in has succeeded. See the function's header. */
  private authCookieFunction(header: string): cloudfront.Function {
    return new cloudfront.Function(this, 'AuthCookieFunction', {
      code: cloudfront.FunctionCode.fromInline(
        this.credentialled('basic-auth-cookie.js', header),
      ),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });
  }

  /** Both auth functions carry the same credential, substituted at synth time. */
  private credentialled(file: string, header: string): string {
    return fs
      .readFileSync(path.join(__dirname, '..', 'functions', file), 'utf8')
      .replace('__BASIC_AUTH_TOKEN__', header);
  }

  /**
   * `embeddable` is the test environment only. Contentful's editor shows the
   * preview in an iframe on app.contentful.com, and the production posture —
   * X-Frame-Options: DENY plus frame-ancestors 'none' — makes that pane blank
   * with no error anywhere except the browser console. X-Frame-Options has no
   * allow-list (ALLOW-FROM is dead and was never honoured by Chrome), so the
   * header is dropped there and CSP names the one permitted embedder instead.
   */
  private securityHeaders(
    noindex: boolean,
    embeddable: boolean,
  ): cloudfront.ResponseHeadersPolicy {
    const CONTENTFUL_APP = 'https://app.contentful.com';
    return new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      securityHeadersBehavior: {
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(365),
          includeSubdomains: true,
          preload: true,
          override: true,
        },
        contentTypeOptions: { override: true },
        ...(embeddable
          ? {}
          : {
              frameOptions: {
                frameOption: cloudfront.HeadersFrameOption.DENY,
                override: true,
              },
            }),
        referrerPolicy: {
          referrerPolicy:
            cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
        contentSecurityPolicy: {
          contentSecurityPolicy: [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            // Contentful's image CDN does format negotiation and resizing for
            // free, so the images are served from there rather than through us.
            "img-src 'self' https://images.ctfassets.net data:",
            // Contentful serves non-image assets from hosts of its own, and it
            // splits video off `assets` onto `videos` for some spaces and not
            // others. The wrong guess is a video that renders its poster and
            // never plays, reporting nothing outside the browser console.
            "media-src 'self' https://videos.ctfassets.net https://assets.ctfassets.net",
            "font-src 'self'",
            "connect-src 'self'",
            embeddable
              ? `frame-ancestors 'self' ${CONTENTFUL_APP}`
              : "frame-ancestors 'none'",
            "base-uri 'self'",
            "object-src 'none'",
          ].join('; '),
          override: true,
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          {
            header: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
            override: true,
          },
          ...(noindex
            ? [{ header: 'X-Robots-Tag', value: 'noindex, nofollow', override: true }]
            : []),
        ],
      },
    });
  }
}
