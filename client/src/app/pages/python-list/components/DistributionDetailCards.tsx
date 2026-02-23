import React from "react";

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  ClipboardCopy,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import BookIcon from "@patternfly/react-icons/dist/esm/icons/book-icon";
import EnvelopeIcon from "@patternfly/react-icons/dist/esm/icons/envelope-icon";

import type { DistributionResponse } from "@app/client";
import { formatDateTime } from "@app/utils/utils";
import { getBaseImageRegistryUrl } from "@app/utils/distributions";

export interface DistributionDetailCardsProps {
  distribution: DistributionResponse | null;
  /** When null, package count is loading or unavailable */
  packageCount: number | null;
  /** Show base image registry URL (e.g. for AIPCC distributions) */
  showBaseImageUrl?: boolean;
  /** Optional lead description shown at top of About card (keeps page title + cards only) */
  leadDescription?: string;
}

export const DistributionDetailCards: React.FC<DistributionDetailCardsProps> = ({
  distribution,
  packageCount,
  showBaseImageUrl = false,
  leadDescription,
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
  const cardBodyStyle = { flexGrow: 1, display: "flex", flexDirection: "column" as const };

  return (
    <Grid hasGutter style={{ marginTop: "1rem" }}>
      <GridItem sm={12} lg={6}>
        <Card style={cardStyle}>
          <CardTitle component="h3">About</CardTitle>
          <CardBody style={cardBodyStyle}>
            {leadDescription && (
              <p className="pf-v6-u-mb-md" style={{ marginTop: 0 }}>
                {leadDescription}
              </p>
            )}
            {distribution.description && (
              <p className="pf-v6-u-mb-md">{distribution.description}</p>
            )}
            <Flex gap={{ default: "gapMd" }} alignItems={{ default: "alignItemsCenter" }} style={{ flexWrap: "wrap", marginTop: "auto" }}>
              <Button
                component="a"
                href="https://docs.example.com/placeholder"
                target="_blank"
                rel="noopener noreferrer"
                variant="link"
                size="sm"
                icon={<BookIcon />}
                iconPosition="end"
              >
                View Documentation
              </Button>
              <Button
                component="a"
                href={showBaseImageUrl ? "mailto:aipcc-team@redhat.com" : "https://access.redhat.com/support"}
                target="_blank"
                rel="noopener noreferrer"
                variant="link"
                size="sm"
                icon={<EnvelopeIcon />}
                iconPosition="end"
              >
                Contact Us
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem sm={12} lg={6}>
        <Card style={cardStyle}>
          <CardTitle component="h3">Details</CardTitle>
          <CardBody style={cardBodyStyle}>
            <DescriptionList className="pf-v6-u-mb-0">
              {distribution.base_url && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Index URL</DescriptionListTerm>
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
