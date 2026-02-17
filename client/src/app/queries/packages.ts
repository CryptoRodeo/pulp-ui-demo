import type {
  HubRequestParams,
  UniquePackageMetadataResponse,
  UniquePackageResponse,
} from "@app/api/models";
import { client } from "@app/axios-config/apiInit";
import type { PythonPythonPackageContentResponse } from "@app/client";
import { apiPypiSimpleRead, contentPythonPackagesList } from "@app/client";
import { PULP_DOMAIN } from "@app/Constants";
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { mockQueryFn } from "./helpers";
import {
  packageMock,
  packagesMock,
  uniquePackageMock,
  uniquePackagesMock,
} from "./mocks/packages.mock";

export const UniquePackagesQueryKey = "unique-packages";
export const PackagesQueryKey = "packages";
export const PackageByIdQueryKey = "package-by-id";
export const PackageMetadataQueryKey = "package-metadata";
export const PackageContentQueryKey = "package-content";

export const useFetchUniquePackages = (
  args: { distributionPath: string },
  disableQuery = false,
) => {
  const { distributionPath } = args;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [UniquePackagesQueryKey, distributionPath],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await apiPypiSimpleRead({
          client,
          path: {
            pulp_domain: PULP_DOMAIN,
            path: distributionPath,
          },
          headers: {
            Accept: "application/vnd.pypi.simple.v1+json",
          },
          maxRedirects: 0,
        });
        return response.data as UniquePackageResponse;
      }, uniquePackagesMock),
    enabled: !disableQuery,
  });

  return {
    packages: data?.projects || [],
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

// Note: apiPypiPypiRead from @app/client cannot be used here because
// the generated client's path serializer encodes slashes in the `meta`
// parameter with encodeURIComponent, turning `package/version/json` into
// `package%2Fversion%2Fjson`. The Pulp server uses PurePath to parse the
// meta path and encoded slashes break the pattern matching.
export const useFetchUniquePackageMetadata = (
  args: {
    distributionPath: string;
    packageName: string;
    packageVersion?: string;
  },
  disableQuery = false,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    ...uniquePackageMetadataQueryOptions(args),
    enabled: !disableQuery,
  });
  return {
    pkg: data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const useSuspenseUniquePackageMetadata = (args: {
  distributionPath: string;
  packageName: string;
  packageVersion?: string;
}) => {
  const { data, isLoading, error, refetch } = useSuspenseQuery({
    ...uniquePackageMetadataQueryOptions(args),
  });
  return {
    pkg: data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const uniquePackageMetadataQueryOptions = (args: {
  distributionPath: string;
  packageName: string;
  packageVersion?: string;
}) => {
  const { distributionPath, packageName, packageVersion } = args;

  const meta = !packageVersion
    ? `${packageName}/json`
    : `${packageName}/${packageVersion}/json`;

  return queryOptions({
    queryKey: [
      PackageMetadataQueryKey,
      distributionPath,
      packageName,
      packageVersion,
    ],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await client.get({
          url: `/api/pypi/${PULP_DOMAIN}/${distributionPath}/pypi/${meta}/`,
          responseType: "json",
        });
        return response.data as UniquePackageMetadataResponse;
      }, uniquePackageMock),
  });
};

export const useFetchPackageById = (
  packageId: string,
  disableQuery = false,
) => {
  const isPulpHref =
    packageId.startsWith("/api/pulp/") || packageId.startsWith("/pulp/");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [PackageByIdQueryKey, packageId],
    queryFn: () =>
      mockQueryFn(async () => {
        if (isPulpHref) {
          const response = await client.get({
            url: packageId,
            responseType: "json",
          });
          return response.data as PythonPythonPackageContentResponse;
        }

        const response = await contentPythonPackagesList({
          client,
          path: {
            pulp_domain: PULP_DOMAIN,
          },
          query: { name: packageId, limit: 1 },
        });
        const results = response.data?.results ?? [];
        return results[
          results.length - 1
        ] as PythonPythonPackageContentResponse;
      }, packageMock),
    enabled: !disableQuery,
  });

  return {
    pkg: data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const useFetchPackages = (
  params: HubRequestParams = {},
  disableQuery = false,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [PackagesQueryKey, params],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await contentPythonPackagesList({
          client,
          path: {
            pulp_domain: PULP_DOMAIN,
          },
        });
        return response.data;
      }, packagesMock),
    enabled: !disableQuery,
  });

  return {
    result: {
      data: data?.results || [],
      total: data?.count ?? 0,
      params: params,
    },
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const useFetchPackageContent = (args: {
  name: string;
  version?: string;
}) => {
  const { name, version } = args;

  const { data, isLoading, error } = useQuery({
    queryKey: [PackageContentQueryKey, name, version],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await contentPythonPackagesList({
          client,
          path: { pulp_domain: PULP_DOMAIN },
          query: { name, version, limit: 1 },
        });
        const results = response.data?.results ?? [];
        return results[0] as PythonPythonPackageContentResponse | undefined;
      }, packageMock),
    enabled: !!version,
  });

  return {
    contentPkg: data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
  };
};
