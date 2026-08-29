import * as path from 'node:path';
import * as fs from 'node:fs';
import { Stack, type StackProps } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import type { Construct } from 'constructs';

export interface RedirectStackProps extends StackProps {
  /** The non-canonical domain, e.g. the .co.nz twin of the canonical domain. */
  readonly fromDomain: string;
  /** Where it should land, e.g. https://the-canonical-domain. */
  readonly toOrigin: string;
  readonly hostedZone: { readonly zoneName: string; readonly hostedZoneId: string };
  readonly certificateArn: string;
  /**
   * Whether this stack owns the A/AAAA records for `fromDomain`. Defaults true.
   * False while that hostname is served by someone else — see the same prop on
   * SiteStack.
   */
  readonly manageDns?: boolean;
}

/**
 * Serves nothing. Its whole job is a 301 from the second domain to the canonical
 * one, so the two never serve duplicate content and search signals stay in one place.
 */
export class RedirectStack extends Stack {
  constructor(scope: Construct, id: string, props: RedirectStackProps) {
    super(scope, id, props);

    const source = fs
      .readFileSync(path.join(__dirname, '..', 'functions', 'redirect.js'), 'utf8')
      .replace('__CANONICAL_ORIGIN__', props.toOrigin);

    const redirectFn = new cloudfront.Function(this, 'RedirectFunction', {
      code: cloudfront.FunctionCode.fromInline(source),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    const distribution = new cloudfront.Distribution(this, 'RedirectDistribution', {
      defaultBehavior: {
        // The function always returns before the origin is consulted, so this
        // origin exists only because a behaviour must name one.
        origin: new origins.HttpOrigin('example.invalid'),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        functionAssociations: [
          {
            function: redirectFn,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      domainNames: [props.fromDomain],
      certificate: acm.Certificate.fromCertificateArn(this, 'Cert', props.certificateArn),
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    });

    if (props.manageDns ?? true) {
      const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
        zoneName: props.hostedZone.zoneName,
        hostedZoneId: props.hostedZone.hostedZoneId,
      });
      const target = route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution),
      );
      new route53.ARecord(this, 'AliasA', { zone, recordName: props.fromDomain, target });
      new route53.AaaaRecord(this, 'AliasAAAA', {
        zone,
        recordName: props.fromDomain,
        target,
      });
    }
  }
}
