import { lazy } from "react";
import { createBrowserRouter, useParams, type Params } from "react-router-dom";

import { LazyRouteElement } from "@app/components/LazyRouteElement";

import App from "./App";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { queryClient } from "./queries/config";
import { uniquePackageMetadataQueryOptions } from "./queries/packages";

const PythonList = lazy(() => import("./pages/python-list"));
const PythonDetails = lazy(() => import("./pages/python-details"));
const NotFound = lazy(() => import("./pages/not-found"));

export const PathParam = {
  DISTRIBUTION_BASE_PATH: "distributionBasePath",
  PYTHON_ID: "pythonId",
} as const;

type PathParamType = (typeof PathParam)[keyof typeof PathParam];

export const Paths = {
  python: "/",
  pythonDetails: `/:${PathParam.DISTRIBUTION_BASE_PATH}/:${PathParam.PYTHON_ID}`,
} as const;

export const distributionBasePathQueryParam = "distribution";

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
          path: Paths.python,
          element: (
            <LazyRouteElement identifier="python" component={<PythonList />} />
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
          loader: async ({ params, request }) => {
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
            return {
              package: response,
            };
          },
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
