import React from "react";
import { useSearchParams } from "react-router-dom";

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ClipboardCopy,
  Divider,
  Flex,
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
import { useFetchUniquePackages } from "@app/queries/packages";
import {
  getAIPCCDistributions,
  getBaseImageRegistryUrl,
} from "@app/utils/distributions";

import { CardList } from "@app/pages/python-list/components/CardList";
import { DistributionDetailCards } from "@app/pages/python-list/components/DistributionDetailCards";

export const RedHatAIComponents: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const distributionParam = searchParams.get("distribution");

  const { distributions, isFetching, fetchError } = useFetchDistributions();
  const aipccDistributions = React.useMemo(
    () => getAIPCCDistributions(distributions),
    [distributions],
  );
  const selectedDistribution = React.useMemo(
    () =>
      aipccDistributions.find((d) => d.base_path === distributionParam) ?? null,
    [aipccDistributions, distributionParam],
  );

  const { packages } = useFetchUniquePackages(
    { distributionPath: selectedDistribution?.base_path ?? "" },
    !selectedDistribution,
  );
  const packageCount = selectedDistribution ? packages.length : null;

  const onDistributionCardClick = React.useCallback(
    (d: DistributionResponse) => {
      setSearchParams({ distribution: d.base_path }, { replace: true });
    },
    [setSearchParams],
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
              <GridItem key={d.name} sm={12} md={6} lg={4} xl={3}>
                <Card
                  isClickable
                  isSelectable
                  isSelected={selectedDistribution?.name === d.name}
                  onClick={() => onDistributionCardClick(d)}
                >
                  <CardHeader>
                    <Title headingLevel="h3" size="md">
                      {d.name}
                    </Title>
                  </CardHeader>
                  <CardBody>
                    {d.base_path}
                    {getBaseImageRegistryUrl(d) && (
                      <Flex
                        className="pf-v6-u-mt-sm"
                        direction={{ default: "column" }}
                        gap={{ default: "gapXs" }}
                      >
                        <span className="pf-v6-u-font-size-sm pf-v6-u-color-200">
                          Base image
                        </span>
                        <ClipboardCopy
                          isReadOnly
                          hoverTip="Copy"
                          clickTip="Copied"
                          variant="inline-compact"
                        >
                          {getBaseImageRegistryUrl(d)}
                        </ClipboardCopy>
                      </Flex>
                    )}
                  </CardBody>
                  <CardFooter>Browse packages →</CardFooter>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </PageSection>
        {selectedDistribution && (
          <>
            <Divider />
            <PageSection>
              <Title headingLevel="h2" size="lg">
                {selectedDistribution.name}
              </Title>
              <DistributionDetailCards
                distribution={selectedDistribution}
                packageCount={packageCount}
                showBaseImageUrl
              />
            </PageSection>
            <PageSection>
              <CardList
                distribution={selectedDistribution}
                tableName="redhat-ai-components-table"
              />
            </PageSection>
          </>
        )}
      </LoadingWrapper>
    </>
  );
};
