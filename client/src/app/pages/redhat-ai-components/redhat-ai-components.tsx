import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardBody,
  CardHeader,
  Content,
  Grid,
  GridItem,
  PageSection,
  Title,
} from "@patternfly/react-core";

import type { DistributionResponse } from "@app/client";
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { LoadingDataEmptyState } from "@app/components/LoadingDataEmptyState";
import { useFetchDistributions } from "@app/queries/distributions";
import { getAIPCCDistributions } from "@app/utils/distributions";
import { getRedHatAIComponentsDistributionPath } from "@app/Routes";

export const RedHatAIComponents: React.FC = () => {
  const navigate = useNavigate();

  const { distributions, isFetching, fetchError } = useFetchDistributions();
  const aipccDistributions = React.useMemo(
    () => getAIPCCDistributions(distributions),
    [distributions],
  );

  const onDistributionCardClick = React.useCallback(
    (d: DistributionResponse) => {
      navigate(getRedHatAIComponentsDistributionPath(d.base_path));
    },
    [navigate],
  );

  return (
    <>
      <DocumentMetadata title="Red Hat AI Components" />
      <LoadingWrapper
        isFetching={isFetching}
        fetchError={fetchError}
        isFetchingState={<LoadingDataEmptyState />}
      >
        <PageSection>
          <Title headingLevel="h1" size="2xl">
            Red Hat AI Components
          </Title>
        </PageSection>
        <PageSection>
          <Title headingLevel="h2" size="lg">
            Select a distribution
          </Title>
          <Grid hasGutter style={{ marginTop: "1rem" }}>
            {aipccDistributions.map((d) => (
              <GridItem key={d.name} sm={12} md={6}>
                <Card
                  isCompact
                  isClickable
                  onClick={() => onDistributionCardClick(d)}
                >
                  <CardHeader
                    selectableActions={{
                      onClickAction: () => onDistributionCardClick(d),
                      selectableActionAriaLabelledby: `${d.name}-card`,
                    }}
                  >
                    <Content component="h4">{d.name}</Content>
                  </CardHeader>
                  <CardBody>
                    <Content component="small">
                      Browse Python packages for this distribution.
                    </Content>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </PageSection>
      </LoadingWrapper>
    </>
  );
};
