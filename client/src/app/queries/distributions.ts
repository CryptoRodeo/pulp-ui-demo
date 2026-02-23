import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { client } from "@app/axios-config/apiInit";
import { distributionsList } from "@app/client";
import { PULP_DOMAIN } from "@app/Constants";

import { mockQueryFn } from "./helpers";
import { distributionsMock } from "./mocks/distributions.mock";

export const DistributionsQueryKey = "distributions";

/**
 * Fetches all distributions. Test distributions (base_path or name ending in "-test")
 * are filtered out on the client for the RHAI list unless the page is loaded with
 * ?showTest=1. If the backend adds a filter (e.g. exclude_test or base_path__iendswith),
 * we could pass it here to avoid loading test distributions.
 */
export const distributionsQueryOptions = () =>
  queryOptions({
    queryKey: [DistributionsQueryKey],
    queryFn: () =>
      mockQueryFn(async () => {
        const response = await distributionsList({
          client,
          path: {
            pulp_domain: PULP_DOMAIN,
          },
        });
        return response.data;
      }, distributionsMock),
  });

export const useFetchDistributions = (disableQuery = false) => {
  const { data, isLoading, error, refetch } = useQuery({
    ...distributionsQueryOptions(),
    enabled: !disableQuery,
  });

  return {
    distributions: Array.isArray(data?.results) ? data.results : [],
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};
