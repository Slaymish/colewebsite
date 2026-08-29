import { Duration, Stack, type StackProps } from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';

export interface ExternalDnsStackProps extends StackProps {
  /** Fully-qualified hostnames to send off this account. */
  readonly domainNames: readonly string[];
  /** The IPv4 addresses the external host published. */
  readonly addresses: readonly string[];
  readonly hostedZone: { readonly zoneName: string; readonly hostedZoneId: string };
}

/**
 * Points hostnames in our own zone at a host that is not ours — today Cole's
 * Adobe Portfolio, which keeps serving the live domain while this site is
 * finished behind `test.<domain>`.
 *
 * The distributions that will eventually take these names back are not torn
 * down for this. They keep the hostnames as alternate domain names, so the
 * handover in either direction is a DNS change and nothing else.
 */
export class ExternalDnsStack extends Stack {
  constructor(scope: Construct, id: string, props: ExternalDnsStackProps) {
    super(scope, id, props);

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      zoneName: props.hostedZone.zoneName,
      hostedZoneId: props.hostedZone.hostedZoneId,
    });

    for (const domainName of props.domainNames) {
      new route53.ARecord(this, `A${domainName.replace(/[^a-zA-Z0-9]/g, '')}`, {
        zone,
        recordName: domainName,
        target: route53.RecordTarget.fromIpAddresses(...props.addresses),
        // Route 53 defaults this to 30 minutes. Taking a name back is a DNS
        // change and nothing else, so this is the length of the only window in
        // which that change is half-applied across the internet.
        ttl: Duration.minutes(5),
      });

      // Deliberately no AAAA. The external host published IPv4 only, and the
      // alias records these replace answered AAAA as well — leaving one behind
      // would keep sending every IPv6-capable visitor to the distribution this
      // is meant to take them off, which is most of them, and silently.
    }
  }
}
