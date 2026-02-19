import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  Divider,
  PageSection,
  Title,
} from "@patternfly/react-core";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { LoadingDataEmptyState } from "@app/components/LoadingDataEmptyState";
import { useFetchDistributions } from "@app/queries/distributions";
import { useFetchUniquePackages } from "@app/queries/packages";
import { getAIPCCDistributions } from "@app/utils/distributions";
import { getRedHatAIComponentsPackageDetailPath, Paths } from "@app/Routes";

import { CardList } from "@app/pages/python-list/components/CardList";
import { DistributionDetailCards } from "@app/pages/python-list/components/DistributionDetailCards";

const RedHatAIDistributionDetail: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const distributionBasePath = params["*"] ?? "";

  const { distributions, isFetching, fetchError } = useFetchDistributions();
  const aipccDistributions = React.useMemo(
    () => getAIPCCDistributions(distributions),
    [distributions],
  );
  const distribution = React.useMemo(
    () => aipccDistributions.find((d) => d.base_path === distributionBasePath) ?? null,
    [aipccDistributions, distributionBasePath],
  );

  const { packages } = useFetchUniquePackages(
    { distributionPath: distribution?.base_path ?? "" },
    !distribution,
  );
  const packageCount = distribution ? packages.length : null;

  React.useEffect(() => {
    if (!isFetching && distributionBasePath && !distribution) {
      navigate(Paths.redHatAIComponents, { replace: true });
    }
  }, [isFetching, distributionBasePath, distribution, navigate]);

  if (!distribution && !isFetching) {
    return null;
  }

  return (
    <>
      <DocumentMetadata
        title={
          distribution
            ? `${distribution.name} — Red Hat AI Components`
            : "Red Hat AI Components"
        }
      />
      <LoadingWrapper
        isFetching={isFetching}
        fetchError={fetchError}
        isFetchingState={<LoadingDataEmptyState />}
      >
        {distribution && (
          <>
            <PageSection type="breadcrumb">
              <Breadcrumb>
                <BreadcrumbItem>
                  <Link to={Paths.redHatAIComponents}>Red Hat AI Components</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isActive>{distribution.name}</BreadcrumbItem>
              </Breadcrumb>
            </PageSection>
            <PageSection>
              <Title headingLevel="h1" size="2xl">
                {distribution.name}
              </Title>
              <DistributionDetailCards
                distribution={distribution}
                packageCount={packageCount}
                showBaseImageUrl
              />
            </PageSection>
            <Divider />
            <PageSection>
              <CardList
                distribution={distribution}
                tableName="redhat-ai-components-table"
                getPackageDetailPath={getRedHatAIComponentsPackageDetailPath}
              />
            </PageSection>
          </>
        )}
      </LoadingWrapper>
    </>
  );
};

export default RedHatAIDistributionDetail;
