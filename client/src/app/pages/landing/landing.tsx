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
import { REPOSITORY_ENTRIES } from "@app/repositories";

const iconByPath: Record<string, React.ComponentType<{ size?: "sm" | "md" | "lg" }>> = {
  [Paths.trustedLibraries]: ShieldAltIcon,
  [Paths.redHatAIComponents]: BrainIcon,
};

export const Landing: React.FC = () => {
  return (
    <>
      <DocumentMetadata title="Packages" />
      <PageSection>
        <Title headingLevel="h1" size="2xl">
          Select a repository
        </Title>
      </PageSection>
      <PageSection>
        <Grid hasGutter>
          {REPOSITORY_ENTRIES.map((repo) => {
            const Icon = iconByPath[repo.path];
            const cardId = `${repo.path.slice(1).replace(/\//g, "-")}-card`;
            return (
              <GridItem key={repo.path} sm={12} md={6}>
                <Stack hasGutter>
                  <StackItem>
                    <Card isCompact isClickable>
                      <CardHeader
                        selectableActions={{
                          to: repo.path,
                          isExternalLink: true,
                          selectableActionAriaLabelledby: cardId,
                          selectableActionProps: {
                            rel: "noopener noreferrer",
                          },
                        }}
                      >
                        <Flex spaceItems={{ default: "spaceItemsSm" }}>
                          <FlexItem>
                            {Icon ? <Icon size="lg" /> : null}
                          </FlexItem>
                          <FlexItem>
                            <Content component="h4" id={cardId}>
                              {repo.label}
                            </Content>
                          </FlexItem>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <Content component="small">
                          {repo.description}
                        </Content>
                      </CardBody>
                    </Card>
                  </StackItem>
                </Stack>
              </GridItem>
            );
          })}
        </Grid>
      </PageSection>
    </>
  );
};
