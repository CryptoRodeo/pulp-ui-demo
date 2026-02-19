import { lazy } from "react";
import { createBrowserRouter, redirect, useParams, type Params } from "react-router-dom";

import { LazyRouteElement } from "@app/components/LazyRouteElement";

import App from "./App";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { queryClient } from "./queries/config";
import { uniquePackageMetadataQueryOptions } from "./queries/packages";
import { TRUSTED_LIBRARIES_BASE_PATH } from "@app/utils/distributions";

const Landing = lazy(() => import("./pages/landing"));
const TrustedLibraries = lazy(() => import("./pages/trusted-libraries"));
const RedHatAIComponents = lazy(() => import("./pages/redhat-ai-components"));
const RedHatAIDistributionDetail = lazy(
  () => import("./pages/redhat-ai-components/redhat-ai-distribution-detail"),
);
const PythonDetails = lazy(() => import("./pages/python-details"));
const NotFound = lazy(() => import("./pages/not-found"));

export const PathParam = {
  DISTRIBUTION_BASE_PATH: "distributionBasePath",
  PYTHON_ID: "pythonId",
} as const;

type PathParamType = (typeof PathParam)[keyof typeof PathParam];

export const Paths = {
  /** Main landing page with product links */
  landing: "/",
  /** Trusted Libraries (calunga-dev) distribution */
  trustedLibraries: "/trusted-libraries",
  /** Red Hat AI Components (AIPCC) distributions grid */
  redHatAIComponents: "/redhat-ai-components",
  /** Python package list - route removed; /python returns 404 */
  python: "/python",
  /** Red Hat AI Components distribution detail (packages list). Use getRedHatAIComponentsDistributionPath(basePath). */
  redHatAIComponentsDistribution: "/redhat-ai-components/*",
  /** Generic package detail (from /python list); no product prefix */
  pythonDetails: `/:${PathParam.DISTRIBUTION_BASE_PATH}/:${PathParam.PYTHON_ID}`,
} as const;

/** URL for a specific RHAI distribution's package list. */
export function getRedHatAIComponentsDistributionPath(distributionBasePath: string): string {
  return `${Paths.redHatAIComponents}/${distributionBasePath}`;
}

/** URL for a package detail under Trusted Libraries (no /main/ in path; single distribution). */
export function getTrustedLibrariesPackageDetailPath(packageName: string): string {
  return `${Paths.trustedLibraries}/${packageName}`;
}

/** URL for a package detail under Red Hat AI Components (product in path). */
export function getRedHatAIComponentsPackageDetailPath(
  distributionBasePath: string,
  packageName: string,
): string {
  return `${Paths.redHatAIComponents}/${distributionBasePath}/${packageName}`;
}

export const distributionBasePathQueryParam = "distribution";

const packageDetailLoader = async ({
  params,
  request,
}: {
  params: Params<string>;
  request: Request;
}) => {
  const distributionBasePath = usePathFromParams(
    params,
    PathParam.DISTRIBUTION_BASE_PATH,
  );
  const packageName = usePathFromParams(params, PathParam.PYTHON_ID);
  const url = new URL(request.url);
  const version = url.searchParams.get("version") ?? undefined;
  const response = await queryClient.ensureQueryData(
    uniquePackageMetadataQueryOptions({
      distributionPath: distributionBasePath,
      packageName,
      packageVersion: version,
    }),
  );
  return { package: response };
};

/** Loader for Trusted Libraries package detail (path is /trusted-libraries/:pythonId, no distribution segment). */
const trustedLibrariesPackageDetailLoader = async ({
  params,
  request,
}: {
  params: Params<string>;
  request: Request;
}) => {
  const packageName = usePathFromParams(params, PathParam.PYTHON_ID);
  const url = new URL(request.url);
  const version = url.searchParams.get("version") ?? undefined;
  const response = await queryClient.ensureQueryData(
    uniquePackageMetadataQueryOptions({
      distributionPath: TRUSTED_LIBRARIES_BASE_PATH,
      packageName,
      packageVersion: version,
    }),
  );
  return { package: response };
};

export const usePathFromParams = (
  params: Params<string>,
  pathParam: PathParamType,
) => {
  const value = params[pathParam];
  if (value === undefined) {
    throw new Error(
      `ASSERTION FAILURE: required path parameter not set: ${pathParam}`,
    );
  }
  return value;
};

export const AppRoutes = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: (
            <LazyRouteElement identifier="landing" component={<Landing />} />
          ),
        },
        {
          path: "trusted-libraries",
          element: (
            <LazyRouteElement
              identifier="trusted-libraries"
              component={<TrustedLibraries />}
            />
          ),
        },
        {
          path: "trusted-libraries/main/:pythonId",
          loader: ({ params }) =>
            redirect(`/trusted-libraries/${params.pythonId ?? ""}`, { replace: true }),
        },
        {
          path: "trusted-libraries/:pythonId",
          element: (
            <LazyRouteElement
              identifier="trusted-libraries-package-detail"
              component={<PythonDetails />}
            />
          ),
          errorElement: <RouteErrorBoundary />,
          loader: trustedLibrariesPackageDetailLoader,
        },
        {
          path: "redhat-ai-components",
          element: (
            <LazyRouteElement
              identifier="redhat-ai-components"
              component={<RedHatAIComponents />}
            />
          ),
        },
        {
          path: "redhat-ai-components/:distributionBasePath/:pythonId",
          element: (
            <LazyRouteElement
              identifier="redhat-ai-package-detail"
              component={<PythonDetails />}
            />
          ),
          errorElement: <RouteErrorBoundary />,
          loader: packageDetailLoader,
        },
        {
          path: "redhat-ai-components/*",
          element: (
            <LazyRouteElement
              identifier="redhat-ai-distribution-detail"
              component={<RedHatAIDistributionDetail />}
            />
          ),
        },
        {
          path: Paths.pythonDetails,
          element: (
            <LazyRouteElement
              identifier="advisory-details"
              component={<PythonDetails />}
            />
          ),
          errorElement: <RouteErrorBoundary />,
          loader: packageDetailLoader,
        },
        {
          path: "*",
          element: (
            <LazyRouteElement identifier="not-found" component={<NotFound />} />
          ),
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);

export const useRouteParams = (pathParam: PathParamType) => {
  const params = useParams();
  const value = params[pathParam];
  if (value === undefined) {
    throw new Error(
      `ASSERTION FAILURE: required path parameter not set: ${pathParam}`,
    );
  }
  return value;
};
