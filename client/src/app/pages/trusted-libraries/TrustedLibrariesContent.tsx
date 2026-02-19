import React from "react";

import { Divider, PageSection, Title } from "@patternfly/react-core";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { LoadingDataEmptyState } from "@app/components/LoadingDataEmptyState";
import { useFetchDistributions } from "@app/queries/distributions";
import { useFetchUniquePackages } from "@app/queries/packages";
import { getTrustedLibrariesPackageDetailPath } from "@app/Routes";
import { getTrustedLibrariesDefaultDistribution } from "@app/utils/distributions";

import { CardList } from "@app/pages/python-list/components/CardList";
import { DistributionDetailCards } from "@app/pages/python-list/components/DistributionDetailCards";

/**
 * Trusted Libraries: same content as the Python list when calunga-dev is selected,
 * with calunga-dev pre-selected (no distribution dropdown).
 */
export const TrustedLibrariesContent: React.FC = () => {
  const { distributions, isFetching, fetchError } = useFetchDistributions();
  const selectedDistribution = React.useMemo(
    () => getTrustedLibrariesDefaultDistribution(distributions),
    [distributions],
  );

  const { packages } = useFetchUniquePackages(
    { distributionPath: selectedDistribution.base_path },
    false,
  );
  const packageCount = packages.length;

  return (
    <>
      <DocumentMetadata title="Trusted Libraries" />
      <LoadingWrapper
        isFetching={isFetching}
        fetchError={fetchError}
        isFetchingState={<LoadingDataEmptyState />}
      >
        <PageSection>
          <Title headingLevel="h1" size="2xl">
            {selectedDistribution.name}
          </Title>
          <DistributionDetailCards
            distribution={selectedDistribution}
            packageCount={packageCount}
            showBaseImageUrl={false}
          />
        </PageSection>
        <Divider />
        <PageSection>
          <CardList
            distribution={selectedDistribution}
            tableName="trusted-libraries-table"
            getPackageDetailPath={(_dist, packageName) =>
              getTrustedLibrariesPackageDetailPath(packageName)
            }
          />
        </PageSection>
      </LoadingWrapper>
    </>
  );
};
