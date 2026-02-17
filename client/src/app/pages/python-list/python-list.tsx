import React from "react";
import { useSearchParams } from "react-router-dom";

import {
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
  Title,
} from "@patternfly/react-core";
import CubesIcon from "@patternfly/react-icons/dist/esm/icons/cubes-icon";

import type { DistributionResponse } from "@app/client";
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { useFetchDistributions } from "@app/queries/distributions";

import { CardList } from "./components/CardList";
import { DistributionSelector } from "./components/DistributionsSelector";

export const PythonList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const distributionParam = searchParams.get("distribution");

  const { distributions } = useFetchDistributions();
  const selectedDistribution = React.useMemo(() => {
    return distributions.find((d) => d.name === distributionParam) ?? null;
  }, [distributions, distributionParam]);

  const onDistributionSelected = React.useCallback(
    (value: DistributionResponse) => {
      setSearchParams({ distribution: value.name }, { replace: true });
    },
    [setSearchParams],
  );

  return (
    <>
      <DocumentMetadata title={"Python"} />
      <PageSection>
        <DistributionSelector
          distributions={distributions}
          selected={selectedDistribution}
          onChange={onDistributionSelected}
        />
      </PageSection>
      <Divider />
      {selectedDistribution ? (
        <>
          <PageSection>
            <Title headingLevel="h1" size="2xl">
              {selectedDistribution.name}
            </Title>
          </PageSection>
          <PageSection>
            <CardList distribution={selectedDistribution} />
          </PageSection>
        </>
      ) : (
        <PageSection>
          <EmptyState
            titleText="Empty state"
            headingLevel="h4"
            icon={CubesIcon}
          >
            <EmptyStateBody>
              Packages are grouped in distributions. Select one to see packages.
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <DistributionSelector
                  distributions={distributions}
                  selected={selectedDistribution}
                  onChange={onDistributionSelected}
                />
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        </PageSection>
      )}
    </>
  );
};
