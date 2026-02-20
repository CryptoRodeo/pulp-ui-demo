import { lazy } from "react";
import {
  createBrowserRouter,
  Outlet,
  redirect,
  useParams,
  type Params,
} from "react-router-dom";

import { LazyRouteElement } from "@app/components/LazyRouteElement";

import App from "./App";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { queryClient } from "./queries/config";
import { distributionsQueryOptions } from "./queries/distributions";
import { uniquePackageMetadataQueryOptions } from "./queries/packages";
import { TRUSTED_LIBRARIES_BASE_PATH } from "@app/utils/distributions";
import { getAIPCCDistributions } from "@app/utils/distributions";

const Landing = lazy(() => import("./pages/landing"));
const TrustedLibraries = lazy(() => import("./pages/trusted-libraries"));
const RedHatAIComponents = lazy(() => import("./pages/redhat-ai-components"));
const RedHatAISplatHandler = lazy(
  () => import("./pages/redhat-ai-components/RedHatAISplatHandler"),
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

/** Loader for RHAI splat route: prefetch package when URL is package detail so errors are handled by route error boundary. */
const redhatAISplatLoader = async ({
  params,
  request,
}: {
  params: Params<string>;
  request: Request;
}) => {
  const splat = params["*"] ?? "";
  const segments = splat.split("/").filter(Boolean);
  if (segments.length <= 1) return null;
  const distributionsData = await queryClient.ensureQueryData(
    distributionsQueryOptions(),
  );
  const distributions = Array.isArray(distributionsData?.results)
    ? distributionsData.results
    : [];
  const aipccDistributions = getAIPCCDistributions(distributions);
  if (aipccDistributions.some((d) => d.base_path === splat)) return null;
  const distributionBasePath = segments.slice(0, -1).join("/");
  const packageName = segments[segments.length - 1];
  const url = new URL(request.url);
  const version = url.searchParams.get("version") ?? undefined;
  // Prefetch only; do not throw on 404/error so the route renders and
  // RHAIPackageDetailGate can show NotFoundEmptyState or error UI.
  try {
    await queryClient.prefetchQuery(
      uniquePackageMetadataQueryOptions({
        distributionPath: distributionBasePath,
        packageName,
        packageVersion: version,
      }),
    );
  } catch {
    // Leave cache in error state; gate will read it and show 404 or error.
  }
  return null;
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
          element: <Outlet />,
          children: [
            {
              index: true,
              element: (
                <LazyRouteElement
                  identifier="redhat-ai-components"
                  component={<RedHatAIComponents />}
                />
              ),
            },
            {
              path: "*",
              element: (
                <LazyRouteElement
                  identifier="redhat-ai-splat"
                  component={<RedHatAISplatHandler />}
                />
              ),
              errorElement: <RouteErrorBoundary />,
              loader: redhatAISplatLoader,
            },
          ],
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
