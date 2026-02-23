import React from "react";
import { Link } from "react-router-dom";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Content,
  Divider,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  List,
  ListItem,
  PageSection,
  Title,
} from "@patternfly/react-core";
import ShieldAltIcon from "@patternfly/react-icons/dist/esm/icons/shield-alt-icon";
import BrainIcon from "@patternfly/react-icons/dist/esm/icons/brain-icon";
import CheckCircleIcon from "@patternfly/react-icons/dist/esm/icons/check-circle-icon";
import OutlinedCheckCircleIcon from "@patternfly/react-icons/dist/esm/icons/outlined-check-circle-icon";
import OutlinedClipboardIcon from "@patternfly/react-icons/dist/esm/icons/outlined-clipboard-icon";
import OutlinedBuildingIcon from "@patternfly/react-icons/dist/esm/icons/outlined-building-icon";
import ExternalLinkAltIcon from "@patternfly/react-icons/dist/esm/icons/external-link-alt-icon";
import EnvelopeIcon from "@patternfly/react-icons/dist/esm/icons/envelope-icon";
import GlobeIcon from "@patternfly/react-icons/dist/esm/icons/globe-icon";
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { Paths } from "@app/Routes";
import { REPOSITORY_ENTRIES } from "@app/repositories";

/** Red for Trusted Libraries and Red Hat AI Components card icons only. */
const REPO_CARD_ICON_RED = "#EE0000";

const iconByPath: Record<string, React.ComponentType<{ size?: "sm" | "md" | "lg"; style?: React.CSSProperties }>> = {
  [Paths.trustedLibraries]: ShieldAltIcon,
  [Paths.redHatAIComponents]: BrainIcon,
};

export const Landing: React.FC = () => {
  return (
    <>
      <DocumentMetadata title="Packages" />
      {/* Hero / mission */}
      <PageSection style={{ textAlign: "center", paddingTop: "4rem", paddingBottom: "var(--pf-v6-global--spacer--3xl)" }}>
        <Title headingLevel="h1" size="3xl">
          Enterprise precision. Proven integrity.
        </Title>
        <Content component="p" style={{ marginTop: "1rem", maxWidth: "52rem", marginLeft: "auto", marginRight: "auto" }}>
          We deliver verified, language-native builds with complete provenance from source to binary.
          Every package is cryptographically signed and security-hardened, giving you a trusted
          foundation to deploy production workloads with confidence—and compliance-ready.
        </Content>
        <Content component="p" style={{ marginTop: "0.75rem", maxWidth: "52rem", marginLeft: "auto", marginRight: "auto" }}>
          We bridge the gap between open source velocity and enterprise requirements: get the
          packages you need with the security, compliance, and support your organization
          demands—without sacrificing developer{"\u00a0"}experience.
        </Content>
        <Grid hasGutter style={{ marginTop: "1.75rem" }}>
          <GridItem sm={12} md={4}>
            <Card isCompact style={{ height: "100%", textAlign: "center" }}>
              <CardBody>
                <OutlinedCheckCircleIcon size="xl" style={{ marginBottom: "0.5rem", width: "1.69rem", height: "1.69rem", color: REPO_CARD_ICON_RED }} />
                <Title headingLevel="h3" size="md">
                  Verified &amp; signed
                </Title>
                <Content component="p" style={{ marginTop: "0.25rem" }}>
                  Cryptographic attestation for every artifact.
                </Content>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem sm={12} md={4}>
            <Card isCompact style={{ height: "100%", textAlign: "center" }}>
              <CardBody>
                <OutlinedClipboardIcon size="xl" style={{ marginBottom: "0.5rem", width: "1.69rem", height: "1.69rem", color: REPO_CARD_ICON_RED }} />
                <Title headingLevel="h3" size="md">
                  Compliance ready
                </Title>
                <Content component="p" style={{ marginTop: "0.25rem" }}>
                  Full SBOM and provenance for regulatory needs.
                </Content>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem sm={12} md={4}>
            <Card isCompact style={{ height: "100%", textAlign: "center" }}>
              <CardBody>
                <OutlinedBuildingIcon size="xl" style={{ marginBottom: "0.5rem", width: "1.69rem", height: "1.69rem", color: REPO_CARD_ICON_RED }} />
                <Title headingLevel="h3" size="md">
                  Production grade
                </Title>
                <Content component="p" style={{ marginTop: "0.25rem" }}>
                  Enterprise support and continuous maintenance.
                </Content>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>

      <div style={{ paddingTop: "2.5rem", paddingBottom: "0.75rem" }}>
        <Divider />
      </div>
      {/* Select a package source (each may be a single index or a collection of indexes) */}
      <PageSection style={{ paddingTop: "0.75rem" }}>
        <Title headingLevel="h2" size="xl">
          Select a package source
        </Title>
        <Content component="p" style={{ marginTop: "0.25rem" }}>
          Each is built with Red Hat&apos;s commitment to security, provenance, and
          continuous maintenance. Choose the one that matches your use case.
        </Content>
        <Grid hasGutter style={{ marginTop: "1.5rem" }}>
          {REPOSITORY_ENTRIES.map((repo) => {
            const Icon = iconByPath[repo.path];
            const cardId = `${repo.path.slice(1).replace(/\//g, "-")}-card`;
            return (
              <GridItem key={repo.path} sm={12} lg={6}>
                    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                      <CardHeader>
                        <Flex spaceItems={{ default: "spaceItemsSm" }}>
                          <FlexItem>
                            {Icon ? <Icon size="lg" style={{ color: REPO_CARD_ICON_RED }} /> : null}
                          </FlexItem>
                          <FlexItem style={{ flex: 1 }}>
                            <Content component="h3" id={cardId} style={{ marginBottom: "0.125rem" }}>
                              {repo.label}
                            </Content>
                            <Content component="p" style={{ fontSize: "var(--pf-v6-global--FontSize--sm)", color: "var(--pf-v6-global--Color--200)" }}>
                              {repo.subtitle}
                            </Content>
                          </FlexItem>
                        </Flex>
                      </CardHeader>
                      <CardBody style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <Content component="p">
                          {repo.longDescription}
                        </Content>
                        <List style={{ paddingLeft: 0 }}>
                          {repo.valueBullets.map((bullet, i) => (
                            <ListItem key={i} icon={<CheckCircleIcon size="sm" />}>
                              {bullet}
                            </ListItem>
                          ))}
                        </List>
                        <div style={{ marginTop: "auto" }}>
                          <Content
                            component="p"
                            style={{
                              fontSize: "var(--pf-v6-global--FontSize--sm)",
                              padding: "0.5rem 0.75rem",
                              backgroundColor: "var(--pf-v6-global--BackgroundColor--200)",
                              borderRadius: "var(--pf-v6-global--BorderRadius--sm)",
                            }}
                          >
                            <strong>Best for:</strong> {repo.chooseWhen}
                          </Content>
                          <Divider style={{ marginTop: "1rem", marginBottom: "1rem" }} />
                          <Flex justifyContent={{ default: "justifyContentSpaceBetween" }} alignItems={{ default: "alignItemsCenter" }} style={{ flexWrap: "wrap" }} gap={{ default: "gapMd" }}>
                            <FlexItem>
                              <Button
                                component={Link}
                                to={repo.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="primary"
                                size="sm"
                                icon={<ExternalLinkAltIcon />}
                                iconPosition="end"
                              >
                                View Packages
                              </Button>
                            </FlexItem>
                            <FlexItem>
                              <Flex gap={{ default: "gapMd" }} alignItems={{ default: "alignItemsCenter" }}>
                                <Button
                                  component="a"
                                  href="https://www.redhat.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  variant="link"
                                  size="sm"
                                  icon={<GlobeIcon />}
                                  iconPosition="end"
                                >
                                  Learn More
                                </Button>
                                <Button
                                  component="a"
                                  href="mailto:support@redhat.com"
                                  variant="link"
                                  size="sm"
                                  icon={<EnvelopeIcon />}
                                  iconPosition="end"
                                >
                                  Contact Us
                                </Button>
                              </Flex>
                            </FlexItem>
                          </Flex>
                        </div>
                      </CardBody>
                    </Card>
                  </GridItem>
                );
              })}
        </Grid>
      </PageSection>
    </>
  );
};
