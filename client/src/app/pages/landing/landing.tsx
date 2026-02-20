import React from "react";

import {
  Card,
  CardBody,
  CardHeader,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import ShieldAltIcon from "@patternfly/react-icons/dist/esm/icons/shield-alt-icon";
import BrainIcon from "@patternfly/react-icons/dist/esm/icons/brain-icon";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { Paths } from "@app/Routes";

const TRUSTED_LIBRARIES_CARD_ID = "trusted-libraries-card";
const REDHAT_AI_COMPONENTS_CARD_ID = "redhat-ai-components-card";

export const Landing: React.FC = () => {

  return (
    <>
      <DocumentMetadata title="Packages" />
      <PageSection>
        <Title headingLevel="h1" size="2xl">
          Packages
        </Title>
      </PageSection>
      <PageSection>
        <Grid hasGutter>
          <GridItem sm={12} md={6}>
            <Stack hasGutter>
              <StackItem>
                <Card isCompact isClickable>
                  <CardHeader
                    selectableActions={{
                      to: Paths.trustedLibraries,
                      isExternalLink: true,
                      selectableActionAriaLabelledby: TRUSTED_LIBRARIES_CARD_ID,
                      selectableActionProps: {
                        rel: "noopener noreferrer",
                      },
                    }}
                  >
                    <Flex spaceItems={{ default: "spaceItemsSm" }}>
                      <FlexItem>
                        <ShieldAltIcon size="lg" />
                      </FlexItem>
                      <FlexItem>
                        <Content component="h4" id={TRUSTED_LIBRARIES_CARD_ID}>
                          Trusted Libraries
                        </Content>
                      </FlexItem>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Content component="small">
                      Curated Python packages from the calunga-dev distribution.
                    </Content>
                  </CardBody>
                </Card>
              </StackItem>
            </Stack>
          </GridItem>
          <GridItem sm={12} md={6}>
            <Stack hasGutter>
              <StackItem>
                <Card isCompact isClickable>
                  <CardHeader
                    selectableActions={{
                      to: Paths.redHatAIComponents,
                      isExternalLink: true,
                      selectableActionAriaLabelledby: REDHAT_AI_COMPONENTS_CARD_ID,
                      selectableActionProps: {
                        rel: "noopener noreferrer",
                      },
                    }}
                  >
                    <Flex spaceItems={{ default: "spaceItemsSm" }}>
                      <FlexItem>
                        <BrainIcon size="lg" />
                      </FlexItem>
                      <FlexItem>
                        <Content component="h4" id={REDHAT_AI_COMPONENTS_CARD_ID}>
                          Red Hat AI Components
                        </Content>
                      </FlexItem>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Content component="small">
                      Red Hat AI / AIPCC distributions: select a distribution to
                      browse packages.
                    </Content>
                  </CardBody>
                </Card>
              </StackItem>
            </Stack>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
};
