import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

export interface GithubOidcStackProps extends StackProps {
  /** owner/repo, e.g. Slaymish/colewebsite. Case-sensitive. */
  readonly repository: string;
  /**
   * Numeric GitHub owner and repository ids. GitHub now issues the `sub` claim as
   * `repo:<owner>@<ownerId>/<repo>@<repoId>:environment:<name>` so that deleting
   * and recreating a repository under the same name cannot inherit a trust
   * policy. Both id-bearing and plain forms are accepted below, because the
   * plain form is still what older runners emit.
   *
   *   gh api repos/OWNER/REPO --jq '.id, .owner.id'
   */
  readonly ownerId?: string;
  readonly repositoryId?: string;
  /**
   * GitHub environment names each role may be assumed from. When a workflow job
   * declares an `environment:`, GitHub swaps the OIDC `sub` claim from
   * `repo:owner/name:ref:refs/heads/main` to `repo:owner/name:environment:<name>`,
   * so pinning to a branch never matches. Scoping by environment is also tighter
   * than by branch, because an environment can carry its own protection rules.
   */
  readonly contentEnvironments: string[];
  readonly infraEnvironments: string[];
  /**
   * ARN of an existing GitHub OIDC provider. An account may only have one per
   * URL, so if another project already created it, import it here instead of
   * letting this stack try to create a second and fail.
   */
  readonly existingProviderArn?: string;
}

/**
 * Two federated roles, no long-lived access keys anywhere.
 *
 * The split matters because content deploys run constantly and infra deploys run
 * rarely, so the frequent one gets almost no power. Note that the CDK bootstrap
 * execution role is necessarily broad — it has to be able to create whatever a
 * stack declares. The protection that actually holds is the trust policy below,
 * pinning assumption to one repository and to named environments.
 */
export class GithubOidcStack extends Stack {
  constructor(scope: Construct, id: string, props: GithubOidcStackProps) {
    super(scope, id, props);

    const provider = props.existingProviderArn
      ? iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
          this,
          'GithubProvider',
          props.existingProviderArn,
        )
      : new iam.OpenIdConnectProvider(this, 'GithubProvider', {
          url: 'https://token.actions.githubusercontent.com',
          clientIds: ['sts.amazonaws.com'],
        });

    const [owner, name] = props.repository.split('/');
    const qualified =
      props.ownerId && props.repositoryId
        ? `${owner}@${props.ownerId}/${name}@${props.repositoryId}`
        : undefined;

    // An array in a StringLike condition is OR, so each role trusts only the
    // environments it actually needs.
    const principalFor = (environments: string[]) =>
      new iam.OpenIdConnectPrincipal(provider).withConditions({
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': environments.flatMap((env) => [
            `repo:${props.repository}:environment:${env}`,
            ...(qualified ? [`repo:${qualified}:environment:${env}`] : []),
          ]),
        },
      });

    // Role names are prefixed per site. They are account-global, so reusing
    // 'github-infra-deploy' from another project's stack means whichever
    // deploys second silently takes the name over and repoints its trust policy.
    const infraRole = new iam.Role(this, 'InfraDeployRole', {
      roleName: 'github-infra-deploy-coleanderson',
      assumedBy: principalFor(props.infraEnvironments),
      description: 'Assumes the CDK bootstrap roles. Rarely used.',
    });

    infraRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [
          `arn:aws:iam::${this.account}:role/cdk-*-deploy-role-*`,
          `arn:aws:iam::${this.account}:role/cdk-*-file-publishing-role-*`,
          `arn:aws:iam::${this.account}:role/cdk-*-lookup-role-*`,
        ],
      }),
    );

    const contentRole = new iam.Role(this, 'ContentDeployRole', {
      roleName: 'github-content-deploy-coleanderson',
      assumedBy: principalFor(props.contentEnvironments),
      description: 'Syncs built files and invalidates the CDN. Runs on every push.',
    });

    // Wildcarded by name prefix because the stacks owning these deploy
    // independently of this one. SiteStack pins the bucket names to match.
    contentRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:DeleteObject', 's3:GetObject'],
        resources: ['arn:aws:s3:::coleanderson-site-*/*'],
      }),
    );
    contentRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:ListBucket'],
        resources: ['arn:aws:s3:::coleanderson-site-*'],
      }),
    );
    contentRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['cloudfront:CreateInvalidation'],
        resources: [`arn:aws:cloudfront::${this.account}:distribution/*`],
      }),
    );
    // deploy.yml reads the bucket name and distribution id from the site stack's
    // outputs. Without this the call is denied, and because a denial and an
    // absent stack look identical to `describe-stacks`, the workflow used to
    // report "stack does not exist yet", skip, and go green having shipped
    // nothing. deploy.yml now separates the two; this is the other half.
    contentRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['cloudformation:DescribeStacks'],
        resources: [
          `arn:aws:cloudformation:${this.region}:${this.account}:stack/ColeAnderson*/*`,
        ],
      }),
    );

    new CfnOutput(this, 'InfraRoleArn', { value: infraRole.roleArn });
    new CfnOutput(this, 'ContentRoleArn', { value: contentRole.roleArn });
  }
}
