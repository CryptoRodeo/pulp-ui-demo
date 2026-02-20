import React from "react";
import { useParams } from "react-router-dom";

import { Bullseye, Spinner } from "@patternfly/react-core";

import { LazyRouteElement } from "@app/components/LazyRouteElement";
import { useFetchDistributions } from "@app/queries/distributions";
import { getAIPCCDistributions } from "@app/utils/distributions";

import { RHAIPackageDetailGate } from "./RHAIPackageDetailGate";

const RedHatAIDistributionDetail = React.lazy(
  () => import("./redhat-ai-distribution-detail"),
);

/** Context for RHAI splat route so distribution/package detail can read parsed path. */
export const RedHatAISplatContext = React.createContext<{
  distributionBasePath: string;
  packageName?: string;
} | null>(null);

/**
 * Handles "redhat-ai-components/*" so base_path with slashes (e.g. rhoai/3.0/cpu-ubi9-test) work.
 * Splat is either: distribution path only, or distribution path + "/" + package name.
 * If the splat matches a distribution's base_path exactly, show distribution detail; else treat last segment as package.
 */
export const RedHatAISplatHandler: React.FC = () => {
  const params = useParams();
  const splat = params["*"] ?? "";
  const { distributions, isFetching: isFetchingDistributions } =
    useFetchDistributions();
  const aipccDistributions = React.useMemo(
    () => getAIPCCDistributions(distributions),
    [distributions],
  );

  const parsed = React.useMemo(() => {
    const segments = splat.split("/").filter(Boolean);
    if (segments.length === 0) return { distributionBasePath: "", packageName: undefined as string | undefined };
    const isDistributionPath =
      aipccDistributions.some((d) => d.base_path === splat);
    if (segments.length === 1 || isDistributionPath) {
      return { distributionBasePath: splat, packageName: undefined as string | undefined };
    }
    const packageName = segments[segments.length - 1];
    const distributionBasePath = segments.slice(0, -1).join("/");
    return { distributionBasePath, packageName };
  }, [splat, aipccDistributions]);

  const segments = splat.split("/").filter(Boolean);
  const needDistributionsToDecide = segments.length >= 2;
  if (needDistributionsToDecide && isFetchingDistributions) {
    return (
      <Bullseye>
        <Spinner aria-label="Loading" />
      </Bullseye>
    );
  }

  if (parsed.packageName !== undefined) {
    return (
      <RedHatAISplatContext.Provider value={parsed}>
        <RHAIPackageDetailGate
          distributionBasePath={parsed.distributionBasePath}
          packageName={parsed.packageName}
        />
      </RedHatAISplatContext.Provider>
    );
  }

  return (
    <RedHatAISplatContext.Provider value={parsed}>
      <LazyRouteElement
        identifier="redhat-ai-distribution-detail"
        component={<RedHatAIDistributionDetail />}
      />
    </RedHatAISplatContext.Provider>
  );
};

export default RedHatAISplatHandler;
