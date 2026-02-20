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

  const cardStyle = {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
  };
  const cardBodyStyle = { flexGrow: 1 };

  return (
    <Grid hasGutter style={{ marginTop: "1rem" }}>
      <GridItem sm={12} lg={8}>
        <Card style={cardStyle}>
          <CardTitle component="h3">About</CardTitle>
          <CardBody style={cardBodyStyle}>
            {distribution.description && (
              <p className="pf-v6-u-mb-md">{distribution.description}</p>
            )}
            <div>
              {showBaseImageUrl ? (
                <p className="pf-v6-u-mb-0">
                  For issues with this distribution, contact the{" "}
                  <a href="mailto:aipcc-team@redhat.com">AIPCC team</a>.
                </p>
              ) : (
                <>
                  <p className="pf-v6-u-mb-sm">
                    For issues with this distribution or to request access,
                    contact Red Hat support.
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
            </div>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem sm={12} lg={4}>
        <Card style={cardStyle}>
          <CardTitle component="h3">Details</CardTitle>
          <CardBody style={cardBodyStyle}>
            <DescriptionList className="pf-v6-u-mb-0">
              {distribution.base_url && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Distribution URL</DescriptionListTerm>
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
              <DescriptionListGroup>
                <DescriptionListTerm>Last updated</DescriptionListTerm>
                <DescriptionListDescription>
                  {formatDateTime(distribution.pulp_last_updated) ?? "—"}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};
