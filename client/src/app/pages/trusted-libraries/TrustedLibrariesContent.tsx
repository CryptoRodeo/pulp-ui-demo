import React from "react";

import { Divider, PageSection, Title } from "@patternfly/react-core";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { LoadingDataEmptyState } from "@app/components/LoadingDataEmptyState";
import { useFetchDistributions } from "@app/queries/distributions";
import { useFetchUniquePackages } from "@app/queries/packages";
import { getTrustedLibrariesDistributions } from "@app/utils/distributions";

import { CardList } from "@app/pages/python-list/components/CardList";
import { DistributionDetailCards } from "@app/pages/python-list/components/DistributionDetailCards";
import { DistributionSelector } from "@app/pages/python-list/components/DistributionsSelector";

/** Inner content; any throw here (including in hooks) is caught by parent ErrorBoundary */
export const TrustedLibrariesContent: React.FC = () => {
  const { distributions, isFetching, fetchError } = useFetchDistributions();
  const trustedDistributions = React.useMemo(
    () => getTrustedLibrariesDistributions(distributions),
    [distributions],
  );
  const selectedDistribution = trustedDistributions[0] ?? null;

  const { packages } = useFetchUniquePackages(
    { distributionPath: selectedDistribution?.base_path ?? "" },
    !selectedDistribution,
  );
  const packageCount = selectedDistribution ? packages.length : null;

  const onDistributionSelected = React.useCallback(() => {}, []);

  return (
    <>
      <DocumentMetadata title="Trusted Libraries" />
      <LoadingWrapper
        isFetching={isFetching}
        fetchError={fetchError}
        isFetchingState={<LoadingDataEmptyState />}
      >
        <PageSection>
          <DistributionSelector
            distributions={trustedDistributions}
            selected={selectedDistribution}
            onChange={onDistributionSelected}
          />
        </PageSection>
        <Divider />
        <PageSection>
          <Title headingLevel="h1" size="2xl">
            {selectedDistribution?.name ?? "calunga-dev"}
          </Title>
          <DistributionDetailCards
            distribution={selectedDistribution}
            packageCount={packageCount}
            showBaseImageUrl={false}
          />
        </PageSection>
        <PageSection>
          <CardList
            distribution={selectedDistribution}
            tableName="trusted-libraries-table"
          />
        </PageSection>
      </LoadingWrapper>
    </>
  );
};
