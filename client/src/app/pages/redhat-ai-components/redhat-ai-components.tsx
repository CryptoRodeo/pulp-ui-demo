import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  Title,
  Toolbar,
  ToolbarContent,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td, type ThProps } from "@patternfly/react-table";
import CpuIcon from "@patternfly/react-icons/dist/esm/icons/cpu-icon";
import ServerIcon from "@patternfly/react-icons/dist/esm/icons/server-icon";
import TagIcon from "@patternfly/react-icons/dist/esm/icons/tag-icon";

import type { DistributionResponse } from "@app/client";
import {
  FilterToolbar,
  FilterType,
  type FilterCategory,
  type IFilterValues,
} from "@app/components/FilterToolbar";
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { LoadingDataEmptyState } from "@app/components/LoadingDataEmptyState";
import {
  getItemsMatchingFilterSubset,
  getLocalFilterDerivedState,
} from "@app/hooks/table-controls/filtering";
import { useFetchDistributions } from "@app/queries/distributions";
import {
  getAIPCCDistributions,
  getAIPCCDistributionDimensions,
  getAIPCCDistributionDescription,
  isTestDistribution,
} from "@app/utils/distributions";
import { getRedHatAIComponentsDistributionPath } from "@app/Routes";

const RHAI_FILTER_KEYS = ["productVersion", "accelerator", "baseImage"] as const;
type RHAIFilterKey = (typeof RHAI_FILTER_KEYS)[number];

/** Base filter category definitions (getItemValue). Used for chained option derivation and final filtering. */
const RHAI_BASE_FILTER_CATEGORIES: FilterCategory<
  DistributionResponse,
  RHAIFilterKey
>[] = [
  {
    categoryKey: "productVersion",
    title: "Product version",
    type: FilterType.multiselect,
    placeholderText: "Product version",
    selectOptions: [],
    getItemValue: (item) => getAIPCCDistributionDimensions(item).productVersion,
  },
  {
    categoryKey: "accelerator",
    title: "Accelerator",
    type: FilterType.multiselect,
    placeholderText: "Accelerator",
    selectOptions: [],
    getItemValue: (item) => getAIPCCDistributionDimensions(item).accelerator,
  },
  {
    categoryKey: "baseImage",
    title: "RHEL version",
    type: FilterType.multiselect,
    placeholderText: "RHEL version",
    selectOptions: [],
    getItemValue: (item) =>
      getAIPCCDistributionDimensions(item).baseImage ?? "",
  },
];

/** Lighter blue tint (lighter than PF blue-50). */
const RHAI_FILTER_CARD_STYLE = {
  backgroundColor: "rgba(222, 243, 255, 0.28)",
} as React.CSSProperties;

/** URL param to show test distributions (e.g. ?showTest=1). Omit or falsy = hide -test distributions. */
const SHOW_TEST_PARAM = "showTest";

export const RedHatAIComponents: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showTest = searchParams.get(SHOW_TEST_PARAM) === "1" || searchParams.get(SHOW_TEST_PARAM) === "true";

  const { distributions, isFetching, fetchError } = useFetchDistributions();
  const aipccDistributions = useMemo(
    () => getAIPCCDistributions(distributions),
    [distributions],
  );

  /** Hide distributions whose base_path or name ends with "-test" unless ?showTest=1. */
  const visibleDistributions = useMemo(
    () =>
      showTest
        ? aipccDistributions
        : aipccDistributions.filter((d) => !isTestDistribution(d)),
    [aipccDistributions, showTest],
  );

  const [filterValues, setFilterValues] = useState<IFilterValues<RHAIFilterKey>>(
    {},
  );

  /** Chained options: each filter's options come from items matching the other filters. */
  const filterCategories = useMemo((): FilterCategory<
    DistributionResponse,
    RHAIFilterKey
  >[] => {
    const itemsForProductVersion = getItemsMatchingFilterSubset(
      visibleDistributions,
      filterValues,
      RHAI_BASE_FILTER_CATEGORIES,
      ["accelerator", "baseImage"],
    );
    const itemsForAccelerator = getItemsMatchingFilterSubset(
      visibleDistributions,
      filterValues,
      RHAI_BASE_FILTER_CATEGORIES,
      ["productVersion", "baseImage"],
    );
    const itemsForBaseImage = getItemsMatchingFilterSubset(
      visibleDistributions,
      filterValues,
      RHAI_BASE_FILTER_CATEGORIES,
      ["productVersion", "accelerator"],
    );

    const uniqueVersions = [
      ...new Set(
        itemsForProductVersion.map((d) =>
          getAIPCCDistributionDimensions(d).productVersion,
        ),
      ),
    ]
      .filter(Boolean)
      .sort();
    const uniqueAccelerators = [
      ...new Set(
        itemsForAccelerator.map((d) =>
          getAIPCCDistributionDimensions(d).accelerator,
        ),
      ),
    ]
      .filter(Boolean)
      .sort();
    const uniqueBaseImages = [
      ...new Set(
        itemsForBaseImage
          .map((d) => getAIPCCDistributionDimensions(d).baseImage)
          .filter(Boolean),
      ),
    ].sort() as string[];

    return [
      {
        ...RHAI_BASE_FILTER_CATEGORIES[0],
        selectOptions: uniqueVersions.map((v) => ({ value: v, label: v })),
      },
      {
        ...RHAI_BASE_FILTER_CATEGORIES[1],
        selectOptions: uniqueAccelerators.map((v) => ({ value: v, label: v })),
      },
      {
        ...RHAI_BASE_FILTER_CATEGORIES[2],
        selectOptions: uniqueBaseImages.map((v) => ({ value: v, label: v })),
      },
    ];
  }, [visibleDistributions, filterValues]);

  /** Clear filter values that are no longer in the chained options (e.g. selected "CUDA 12.9" then switched to version 3.0). */
  useEffect(() => {
    let next = { ...filterValues };
    let changed = false;
    for (const cat of filterCategories) {
      const key = cat.categoryKey as RHAIFilterKey;
      const selected = filterValues[key];
      if (!selected?.length) continue;
      const options = (cat as { selectOptions?: { value: string }[] }).selectOptions ?? [];
      const optionValues = new Set(options.map((o) => o.value));
      const valid = selected.filter((v) => optionValues.has(v));
      if (valid.length !== selected.length) {
        next[key] = valid.length ? valid : undefined;
        changed = true;
      }
    }
    if (changed) setFilterValues(next);
  }, [filterCategories]);

  const { filteredItems: filteredDistributions } =
    getLocalFilterDerivedState<DistributionResponse, RHAIFilterKey>({
      items: visibleDistributions,
      filterCategories,
      filterState: { filterValues },
    });

  const [activeSortIndex, setActiveSortIndex] = useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<
    "asc" | "desc" | null
  >(null);

  const getSortableRowValues = (d: DistributionResponse): (string | number)[] => {
    const dims = getAIPCCDistributionDimensions(d);
    return [
      d.name,
      getAIPCCDistributionDescription(d),
      dims.productVersion || "",
      dims.accelerator || "",
      dims.baseImage ?? "",
    ];
  };

  const sortedDistributions = useMemo(() => {
    if (activeSortIndex === null || activeSortDirection === null) {
      return filteredDistributions;
    }
    return [...filteredDistributions].sort((a, b) => {
      const aVal = getSortableRowValues(a)[activeSortIndex];
      const bVal = getSortableRowValues(b)[activeSortIndex];
      const aStr = String(aVal);
      const bStr = String(bVal);
      const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
      return activeSortDirection === "asc" ? cmp : -cmp;
    });
  }, [filteredDistributions, activeSortIndex, activeSortDirection]);

  const getSortParams = (columnIndex: number): ThProps["sort"] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: "asc",
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const hasActiveFilters = Object.values(filterValues).some(
    (v) => v && v.length > 0,
  );

  const onDistributionCardClick = React.useCallback(
    (d: DistributionResponse) => {
      navigate(getRedHatAIComponentsDistributionPath(d.base_path));
    },
    [navigate],
  );

  return (
    <>
      <DocumentMetadata title="Red Hat AI Components" productName="Red Hat AI Components" />
      <LoadingWrapper
        isFetching={isFetching}
        fetchError={fetchError}
        isFetchingState={<LoadingDataEmptyState />}
      >
        <PageSection>
          <Title headingLevel="h1" size="2xl">
            Red Hat AI Components
          </Title>
        </PageSection>
        <PageSection>
          <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
            <FlexItem>
              <Grid hasGutter>
                <GridItem sm={12} md={4} style={{ display: "flex" }}>
                  <Card style={{ ...RHAI_FILTER_CARD_STYLE, height: "100%", width: "100%" }}>
                    <CardHeader>
                      <CardTitle component="h3">
                        <span className="pf-v6-u-mr-sm">
                          <TagIcon size="md" />
                        </span>
                        Product version
                      </CardTitle>
                    </CardHeader>
                    <CardBody
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        paddingBottom: "var(--pf-v6-global--spacer--2xl)",
                      }}
                    >
                      <div className="pf-v6-u-mb-md" style={{ flex: "1 1 auto" }}>
                        <Content>
                          <p>
                            Choose which Red Hat AI or product release to target (e.g. 3.0, 3.2).
                            Each version has its own package index and support lifecycle, so pick the one that matches your environment.
                          </p>
                        </Content>
                      </div>
                      <div style={{ marginTop: "auto", width: "100%" }} className="pf-v6-u-w-100">
                        <Toolbar customLabelGroupContent={<></>}>
                          <ToolbarContent>
                            <FilterToolbar<DistributionResponse, RHAIFilterKey>
                              showFiltersSideBySide
                              filterGroupBreakpoint="lg"
                              filterCategories={[filterCategories[0]]}
                              filterValues={filterValues}
                              setFilterValues={setFilterValues}
                              showChips={false}
                            />
                          </ToolbarContent>
                        </Toolbar>
                      </div>
                    </CardBody>
                  </Card>
                </GridItem>
                <GridItem sm={12} md={4} style={{ display: "flex" }}>
                  <Card style={{ ...RHAI_FILTER_CARD_STYLE, height: "100%", width: "100%" }}>
                    <CardHeader>
                      <CardTitle component="h3">
                        <span className="pf-v6-u-mr-sm">
                          <CpuIcon size="md" />
                        </span>
                        Accelerator
                      </CardTitle>
                    </CardHeader>
                    <CardBody
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        paddingBottom: "var(--pf-v6-global--spacer--2xl)",
                      }}
                    >
                      <div className="pf-v6-u-mb-md" style={{ flex: "1 1 auto" }}>
                        <Content>
                          <p>
                            Match your runtime: CPU-only, or a specific CUDA or ROCm version.
                            Packages are built per accelerator, so selecting the right one ensures compatibility with your GPUs.
                          </p>
                        </Content>
                      </div>
                      <div style={{ marginTop: "auto", width: "100%" }} className="pf-v6-u-w-100">
                        <Toolbar customLabelGroupContent={<></>}>
                          <ToolbarContent>
                            <FilterToolbar<DistributionResponse, RHAIFilterKey>
                              showFiltersSideBySide
                              filterGroupBreakpoint="lg"
                              filterCategories={[filterCategories[1]]}
                              filterValues={filterValues}
                              setFilterValues={setFilterValues}
                              showChips={false}
                            />
                          </ToolbarContent>
                        </Toolbar>
                      </div>
                    </CardBody>
                  </Card>
                </GridItem>
                <GridItem sm={12} md={4} style={{ display: "flex" }}>
                  <Card style={{ ...RHAI_FILTER_CARD_STYLE, height: "100%", width: "100%" }}>
                    <CardHeader>
                      <CardTitle component="h3">
                        <span className="pf-v6-u-mr-sm">
                          <ServerIcon size="md" />
                        </span>
                        RHEL version
                      </CardTitle>
                    </CardHeader>
                    <CardBody
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        paddingBottom: "var(--pf-v6-global--spacer--2xl)",
                      }}
                    >
                      <div className="pf-v6-u-mb-md" style={{ flex: "1 1 auto" }}>
                        <Content>
                          <p>
                            RHEL or Universal Base Image (UBI) version (e.g. UBI 9, UBI 10). The index matches the base image used by container images—choose the one your image is based on.
                          </p>
                        </Content>
                      </div>
                      <div style={{ marginTop: "auto", width: "100%" }} className="pf-v6-u-w-100">
                        <Toolbar customLabelGroupContent={<></>}>
                          <ToolbarContent>
                            <FilterToolbar<DistributionResponse, RHAIFilterKey>
                              showFiltersSideBySide
                              filterGroupBreakpoint="lg"
                              filterCategories={[filterCategories[2]]}
                              filterValues={filterValues}
                              setFilterValues={setFilterValues}
                              showChips={false}
                            />
                          </ToolbarContent>
                        </Toolbar>
                      </div>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </FlexItem>
            {hasActiveFilters && (
              <FlexItem>
                <Flex direction={{ default: "column" }} gap={{ default: "gapXs" }}>
                  <Toolbar
                    customLabelGroupContent={<></>}
                    style={{ paddingBottom: 0 }}
                  >
                    <ToolbarContent>
                      <FilterToolbar<DistributionResponse, RHAIFilterKey>
                        showFiltersSideBySide
                        filterGroupBreakpoint="lg"
                        filterCategories={filterCategories}
                        filterValues={filterValues}
                        setFilterValues={setFilterValues}
                        showChips={true}
                        showFilterControls={false}
                      />
                    </ToolbarContent>
                  </Toolbar>
                  <Button
                    variant="link"
                    onClick={() => setFilterValues({})}
                    isInline
                    style={{ alignSelf: "flex-start" }}
                  >
                    Clear all filters
                  </Button>
                </Flex>
              </FlexItem>
            )}
            <FlexItem
              style={
                hasActiveFilters
                  ? {
                      marginTop:
                        "calc(-1 * var(--pf-v6-global--spacer--md) - 0.5rem)",
                    }
                  : undefined
              }
            >
              {filteredDistributions.length === 0 ? (
                <EmptyState
                  headingLevel="h3"
                  titleText={
                    visibleDistributions.length === 0
                      ? "No distributions available"
                      : "No distributions match filters"
                  }
                >
                  <EmptyStateBody>
                    {visibleDistributions.length === 0
                      ? "There are no Red Hat AI distributions to display."
                      : "No distributions match the current filters. Clear or adjust filters to see more."}
                  </EmptyStateBody>
                </EmptyState>
              ) : (
                <Table
                  aria-label="Distributions"
                  variant="compact"
                  style={{
                    marginTop: hasActiveFilters ? 0 : "1rem",
                    tableLayout: "auto",
                  }}
                >
                  <Thead>
                    <Tr>
                      <Th>Distribution</Th>
                      <Th>Description</Th>
                      <Th modifier="wrap" sort={getSortParams(2)}>
                        Product version
                      </Th>
                      <Th modifier="wrap" sort={getSortParams(3)}>
                        Accelerator
                      </Th>
                      <Th modifier="wrap" sort={getSortParams(4)}>
                        RHEL version
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortedDistributions.map((d) => {
                      const dims = getAIPCCDistributionDimensions(d);
                      return (
                        <Tr key={d.base_path}>
                          <Td dataLabel="Distribution" style={{ whiteSpace: "normal" }}>
                            <Button
                              variant="link"
                              isInline
                              onClick={() => onDistributionCardClick(d)}
                            >
                              {d.name}
                            </Button>
                          </Td>
                          <Td dataLabel="Description" style={{ whiteSpace: "normal" }}>
                            {getAIPCCDistributionDescription(d)}
                          </Td>
                          <Td dataLabel="Product version" modifier="wrap">
                            {dims.productVersion || "—"}
                          </Td>
                          <Td dataLabel="Accelerator" modifier="wrap">
                            {dims.accelerator || "—"}
                          </Td>
                          <Td dataLabel="RHEL version" modifier="wrap">
                            {dims.baseImage ?? "—"}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              )}
            </FlexItem>
          </Flex>
        </PageSection>
      </LoadingWrapper>
    </>
  );
};
