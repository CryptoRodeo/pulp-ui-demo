import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import axios from "axios";
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Spinner,
} from "@patternfly/react-core";
import UserNinjaIcon from "@patternfly/react-icons/dist/esm/icons/user-ninja-icon";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";

import { NotFoundEmptyState } from "@app/components/NotFoundEmptyState";
import { LazyRouteElement } from "@app/components/LazyRouteElement";
import { useFetchUniquePackageMetadata } from "@app/queries/packages";

const PythonDetailsWithPrefetchedPkg = React.lazy(
  () =>
    import("../python-details").then((m) => ({
      default: m.PythonDetailsWithPrefetchedPkg,
    })),
);

/**
 * Fetches package metadata with a non-suspense query, then renders PythonDetails.
 * Handles loading and error states in-place so we never throw into
 * LazyRouteElement's ErrorBoundary (which would show "Something went wrong").
 */
export const RHAIPackageDetailGate: React.FC<{
  distributionBasePath: string;
  packageName: string;
}> = ({ distributionBasePath, packageName }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const versionParam = searchParams.get("version") ?? undefined;

  const { pkg, isFetching, fetchError } = useFetchUniquePackageMetadata(
    {
      distributionPath: distributionBasePath,
      packageName,
      packageVersion: versionParam,
    },
    false,
  );

  if (isFetching && !pkg) {
    return (
      <Bullseye>
        <Spinner aria-label="Loading package" />
      </Bullseye>
    );
  }

  if (fetchError) {
    if (axios.isAxiosError(fetchError) && fetchError.response?.status === 404) {
      return (
        <Bullseye>
          <NotFoundEmptyState />
        </Bullseye>
      );
    }
    return (
      <Bullseye>
        <EmptyState
          titleText="Error loading package"
          headingLevel="h4"
          icon={UserNinjaIcon}
          variant={EmptyStateVariant.sm}
        >
          <EmptyStateBody>
            Try refreshing the page or contact your admin.
            <Button
              variant="primary"
              className={spacing.mtSm}
              onClick={() => navigate(-1)}
            >
              Go back
            </Button>
          </EmptyStateBody>
        </EmptyState>
      </Bullseye>
    );
  }

  if (!pkg) {
    return (
      <Bullseye>
        <Spinner aria-label="Loading package" />
      </Bullseye>
    );
  }

  return (
    <LazyRouteElement
      identifier="redhat-ai-package-detail"
      component={<PythonDetailsWithPrefetchedPkg pkg={pkg} />}
    />
  );
};
