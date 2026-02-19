import React from "react";

import {
  Card,
  CardBody,
  CardTitle,
  ClipboardCopy,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
} from "@patternfly/react-core";

import type { DistributionResponse } from "@app/client";
import { formatDateTime } from "@app/utils/utils";
import { getBaseImageRegistryUrl } from "@app/utils/distributions";

export interface DistributionDetailCardsProps {
  distribution: DistributionResponse | null;
  /** When null, package count is loading or unavailable */
  packageCount: number | null;
  /** Show base image registry URL (e.g. for AIPCC distributions) */
  showBaseImageUrl?: boolean;
}

export const DistributionDetailCards: React.FC<DistributionDetailCardsProps> = ({
  distribution,
  packageCount,
  showBaseImageUrl = false,
}) => {
  if (!distribution) return null;

  const baseImageUrl = showBaseImageUrl
    ? getBaseImageRegistryUrl(distribution)
    : null;

  return (
    <Grid hasGutter style={{ marginTop: "1rem" }}>
      <GridItem sm={12} md={4}>
        <Card>
          <CardTitle component="h3">Index &amp; base image</CardTitle>
          <CardBody>
            <DescriptionList className="pf-v6-u-display-flex pf-v6-u-flex-direction-column pf-v6-u-gap-md">
              {distribution.base_url && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Distribution index</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ClipboardCopy
                      isReadOnly
                      hoverTip="Copy"
                      clickTip="Copied"
                      variant="inline-compact"
                    >
                      {distribution.base_url}
                    </ClipboardCopy>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {baseImageUrl && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Base image</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ClipboardCopy
                      isReadOnly
                      hoverTip="Copy"
                      clickTip="Copied"
                      variant="inline-compact"
                    >
                      {baseImageUrl}
                    </ClipboardCopy>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem sm={12} md={4}>
        <Card>
          <CardTitle component="h3">Details</CardTitle>
          <CardBody>
            <DescriptionList className="pf-v6-u-mb-0">
              <DescriptionListGroup>
                <DescriptionListTerm>Package count</DescriptionListTerm>
                <DescriptionListDescription>
                  {packageCount !== null ? packageCount.toLocaleString() : "—"}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Last updated</DescriptionListTerm>
                <DescriptionListDescription>
                  {formatDateTime(distribution.pulp_last_updated) ?? "—"}
                </DescriptionListDescription>
              </DescriptionListGroup>
              {distribution.no_content_change_since && (
                <DescriptionListGroup>
                  <DescriptionListTerm>
                    Content unchanged since
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    {formatDateTime(distribution.no_content_change_since) ??
                      "—"}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {distribution.content_guard && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Access</DescriptionListTerm>
                  <DescriptionListDescription>Protected</DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem sm={12} md={4}>
        <Card>
          <CardTitle component="h3">Support</CardTitle>
          <CardBody>
            {showBaseImageUrl ? (
              <p className="pf-v6-u-mb-0">
                For issues with this distribution, contact the{" "}
                <a href="mailto:aipcc-team@redhat.com">AIPCC team</a>.
              </p>
            ) : (
              <>
                <p className="pf-v6-u-mb-sm">
                  For issues with this distribution or to request access, contact
                  Red Hat support.
                </p>
                <a
                  href="https://access.redhat.com/support"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Red Hat Customer Portal
                </a>
              </>
            )}
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};
