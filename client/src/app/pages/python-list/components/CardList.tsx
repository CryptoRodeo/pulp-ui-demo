import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Bullseye,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Content,
  Flex,
  FlexItem,
  Icon,
  Label,
  Skeleton,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
  Truncate,
} from "@patternfly/react-core";
import { css } from "@patternfly/react-styles";
import clipboardCopyStyles from "@patternfly/react-styles/css/components/ClipboardCopy/clipboard-copy";
import CertificateIcon from "@patternfly/react-icons/dist/esm/icons/certificate-icon";
import CopyIcon from "@patternfly/react-icons/dist/esm/icons/copy-icon";
import UserIcon from "@patternfly/react-icons/dist/esm/icons/user-icon";

import type { DistributionResponse } from "@app/client";
import { ConditionalDataListBody } from "@app/components/DataListControls/ConditionalDataListBody";
import { FilterToolbar, FilterType } from "@app/components/FilterToolbar";
import { SimplePagination } from "@app/components/SimplePagination";
import { useLocalTableControls } from "@app/hooks/table-controls";
import { useFetchUniquePackages } from "@app/queries/packages";
import { Paths } from "@app/Routes";

import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { WithPackage } from "./WithPackage";

type ICardListProps = {
  /** When null, toolbar + filters are still shown and the list area shows an error state */
  distribution: DistributionResponse | null;
  /** Unique table name for filter/sort/pagination state (per page). Default: "python-table" */
  tableName?: string;
  /** If provided, card click and package links use this path instead of Paths.pythonDetails. */
  getPackageDetailPath?: (
    distribution: DistributionResponse,
    packageName: string,
  ) => string;
};

export const CardList: React.FC<ICardListProps> = ({
  distribution,
  tableName = "python-table",
  getPackageDetailPath,
}) => {
  const navigate = useNavigate();
  const [copiedPackageName, setCopiedPackageName] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (copiedPackageName === null) return;
    const t = setTimeout(() => setCopiedPackageName(null), 1500);
    return () => clearTimeout(t);
  }, [copiedPackageName]);

  const { packages, isFetching, fetchError } = useFetchUniquePackages(
    { distributionPath: distribution?.base_path ?? "" },
    !distribution,
  );
  const effectivePackages = distribution ? packages : [];
  const effectiveFetchError = distribution ? fetchError : true;
  const effectiveIsFetching = !!distribution && isFetching;

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
        placeholderText: "Filter by package name...",
        getItemValue: (item) => item.name || "",
        inputStyle: { minWidth: "20rem" },
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
  } = tableControls;

  const getDetailPath = (packageName: string) => {
    if (!distribution) return "";
    if (getPackageDetailPath) return getPackageDetailPath(distribution, packageName);
    return `/${distribution.base_path}/${packageName}`;
  };

  const handleCopy = (packageName: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`pip install ${packageName}`);
    setCopiedPackageName(packageName);
  };

  const onClickCard = (packageName: string) => {
    if (!distribution) return;
    const path = getDetailPath(packageName);
    if (path) navigate(path);
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
                                  <Tooltip
                                    content={
                                      copiedPackageName === item.name
                                        ? "Copied"
                                        : "Copy"
                                    }
                                  >
                                    <div
                                      className={css(
                                        clipboardCopyStyles.clipboardCopy,
                                        clipboardCopyStyles.modifiers.inline,
                                      )}
                                      style={{
                                        position: "relative",
                                        zIndex: 1,
                                        cursor: "pointer",
                                      }}
                                      role="button"
                                      tabIndex={0}
                                      onClick={(e) => handleCopy(item.name ?? "", e)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          handleCopy(item.name ?? "", e);
                                        }
                                      }}
                                      aria-label="Copy pip install command"
                                    >
                                      <span
                                        className={css(
                                          clipboardCopyStyles.clipboardCopyText,
                                        )}
                                      >
                                        pip install {item.name ?? ""}
                                      </span>
                                      <span
                                        className={css(
                                          clipboardCopyStyles.clipboardCopyActions,
                                          clipboardCopyStyles.clipboardCopyActionsItem,
                                        )}
                                        style={{
                                          pointerEvents: "none",
                                          color:
                                            "var(--pf-v6-c-clipboard-copy__actions-item--button--Color)",
                                        }}
                                      >
                                        <CopyIcon
                                          style={{
                                            verticalAlign: "-0.125em",
                                            marginLeft:
                                              "var(--pf-t--global--spacer--gap--text-to-element--compact, 0.25rem)",
                                          }}
                                        />
                                      </span>
                                    </div>
                                  </Tooltip>
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
