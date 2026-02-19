import React from "react";
import { generatePath, useNavigate } from "react-router-dom";

import {
  Bullseye,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ClipboardCopy,
  Content,
  Flex,
  FlexItem,
  Icon,
  Label,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Skeleton,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Truncate,
  type MenuToggleElement,
} from "@patternfly/react-core";
import CertificateIcon from "@patternfly/react-icons/dist/esm/icons/certificate-icon";
import UserIcon from "@patternfly/react-icons/dist/esm/icons/user-icon";

import type { DistributionResponse } from "@app/client";
import { ConditionalDataListBody } from "@app/components/DataListControls/ConditionalDataListBody";
import { FilterToolbar, FilterType } from "@app/components/FilterToolbar";
import { SimplePagination } from "@app/components/SimplePagination";
import { useLocalTableControls } from "@app/hooks/table-controls";
import { useFetchUniquePackages } from "@app/queries/packages";
import { Paths } from "@app/Routes";
import { toCamelCase } from "@app/utils/utils";

import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { WithPackage } from "./WithPackage";

type ICardListProps = {
  /** When null, toolbar + filters are still shown and the list area shows an error state */
  distribution: DistributionResponse | null;
  /** Unique table name for filter/sort/pagination state (per page). Default: "python-table" */
  tableName?: string;
};

export const CardList: React.FC<ICardListProps> = ({
  distribution,
  tableName = "python-table",
}) => {
  const navigate = useNavigate();
  const { packages, isFetching, fetchError } = useFetchUniquePackages(
    { distributionPath: distribution?.base_path ?? "" },
    !distribution,
  );
  const effectivePackages = distribution ? packages : [];
  const effectiveFetchError = distribution ? fetchError : true;
  const effectiveIsFetching = !!distribution && isFetching;

  // Sorting
  const [isSortByOpen, setIsSortByOpen] = React.useState<boolean>(false);

  // Table
  const tableControls = useLocalTableControls({
    tableName,
    idProperty: "name",
    items: effectivePackages,
    isLoading: effectiveIsFetching,
    columnNames: {
      name: "Name",
    },
    hasActionsColumn: false,
    isSortEnabled: true,
    sortableColumns: ["name"],
    initialSort: {
      columnKey: "name",
      direction: "asc",
    },
    getSortValues: (item) => {
      return {
        name: item.name,
      };
    },
    isPaginationEnabled: true,
    isFilterEnabled: true,
    filterCategories: [
      {
        categoryKey: "name",
        title: "Name",
        type: FilterType.search,
        placeholderText: "Search by name...",
        getItemValue: (item) => item.name || "",
      },
    ],
    isExpansionEnabled: false,
  });

  const {
    currentPageItems,
    propHelpers: {
      toolbarProps,
      filterToolbarProps,
      paginationToolbarItemProps,
      paginationProps,
    },
    sortableColumns,
    sortState: { activeSort, setActiveSort },
  } = tableControls;

  const onClickCard = (packageName: string) => {
    if (!distribution) return;
    navigate(
      generatePath(Paths.pythonDetails, {
        distributionBasePath: distribution.base_path,
        pythonId: packageName,
      }),
    );
  };

  return (
    <Stack>
      <StackItem>
        <Toolbar {...toolbarProps}>
          <ToolbarContent>
            <FilterToolbar
              showFiltersSideBySide
              filterGroupBreakpoint="sm"
              {...filterToolbarProps}
            />
            <ToolbarItem variant="separator" />
            <ToolbarItem>
              Sort by:
              <Select
                id="sort-by"
                isOpen={isSortByOpen}
                selected={activeSort?.columnKey}
                onSelect={(_e, value) => {
                  setActiveSort({
                    // biome-ignore lint/suspicious/noExplicitAny: allowed
                    columnKey: value as any,
                    direction: activeSort?.direction ?? "asc",
                  });
                }}
                onOpenChange={(isOpen) => setIsSortByOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsSortByOpen(!isSortByOpen)}
                    isExpanded={isSortByOpen}
                    style={
                      {
                        width: "200px",
                      } as React.CSSProperties
                    }
                  >
                    {toCamelCase(activeSort?.columnKey ?? "")}
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
              >
                <SelectList>
                  {sortableColumns?.map((e) => (
                    <SelectOption key={e} value={e}>
                      {toCamelCase(e)}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarItem>
            <ToolbarItem {...paginationToolbarItemProps}>
              <SimplePagination
                idPrefix={tableName}
                isTop
                paginationProps={paginationProps}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </StackItem>
      <StackItem>
        <Stack aria-label="python-list" hasGutter>
          <ConditionalDataListBody
            isLoading={effectiveIsFetching}
            isError={!!effectiveFetchError}
            isNoData={effectivePackages.length === 0}
          >
            {currentPageItems?.map((item, rowIndex) => {
              return (
                distribution && (
                  <StackItem
                    key={`${item.name}`}
                    aria-labelledby={`Item-${rowIndex}`}
                  >
                    <Card isCompact isClickable>
                      <WithPackage
                        distribution={distribution}
                      packageName={item.name}
                    >
                      {({ pkg, isFetching }) => {
                        return (
                          <>
                            <CardHeader
                              selectableActions={{
                                onClickAction: () => onClickCard(item.name),
                                selectableActionAriaLabelledby: `${item.name}-card}`,
                              }}
                            >
                              <Flex spaceItems={{ default: "spaceItemsSm" }}>
                                <FlexItem>
                                  <Content component="h4">{item.name}</Content>
                                </FlexItem>
                                <FlexItem>
                                  <LoadingWrapper
                                    isFetching={isFetching}
                                    isFetchingState={
                                      <Skeleton fontSize="sm" width="50px" />
                                    }
                                  >
                                    <Label isCompact>
                                      {pkg?.info?.version}
                                    </Label>
                                  </LoadingWrapper>
                                </FlexItem>
                              </Flex>
                            </CardHeader>
                            <CardBody>
                              <LoadingWrapper
                                isFetching={isFetching}
                                isFetchingState={<Skeleton fontSize="sm" />}
                              >
                                <Content component="small">
                                  {pkg?.info?.summary}
                                </Content>
                              </LoadingWrapper>
                            </CardBody>
                            <CardFooter>
                              <Flex spaceItems={{ default: "spaceItemsSm" }}>
                                <FlexItem>
                                  <LoadingWrapper
                                    isFetching={isFetching}
                                    isFetchingState={
                                      <Skeleton fontSize="sm" width="350px" />
                                    }
                                  >
                                    <Flex
                                      spaceItems={{ default: "spaceItemsSm" }}
                                    >
                                      <FlexItem>
                                        <Icon>
                                          <UserIcon />
                                        </Icon>{" "}
                                        {pkg && (
                                          <Truncate
                                            maxCharsDisplayed={35}
                                            content={
                                              pkg?.info?.author ||
                                              pkg?.info?.author_email ||
                                              pkg?.info?.maintainer_email ||
                                              "Unknown"
                                            }
                                          />
                                        )}
                                      </FlexItem>
                                      <FlexItem>
                                        <Icon>
                                          <CertificateIcon />
                                        </Icon>{" "}
                                        {pkg && (
                                          <Truncate
                                            maxCharsDisplayed={35}
                                            content={
                                              pkg?.info?.license ||
                                              pkg?.info?.license_expression ||
                                              "Unknown"
                                            }
                                          />
                                        )}
                                      </FlexItem>
                                    </Flex>
                                  </LoadingWrapper>
                                </FlexItem>
                                <FlexItem align={{ default: "alignRight" }}>
                                  <ClipboardCopy
                                    isReadOnly
                                    hoverTip="Copy"
                                    clickTip="Copied"
                                    variant="inline-compact"
                                  >
                                    pip install {item.name ?? ""}
                                  </ClipboardCopy>
                                </FlexItem>
                              </Flex>
                            </CardFooter>
                          </>
                        );
                      }}
                      </WithPackage>
                    </Card>
                  </StackItem>
                )
              );
            })}
          </ConditionalDataListBody>
        </Stack>
      </StackItem>
      <StackItem>
        <Bullseye>
          <SimplePagination
            idPrefix={tableName}
            isTop={false}
            paginationProps={paginationProps}
          />
        </Bullseye>
      </StackItem>
    </Stack>
  );
};
