import type React from "react";
import { useMemo, useState } from "react";
import {
  Title,
  ClipboardCopy,
  Label,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Toolbar,
  ToolbarContent,
  Button,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import type { UniquePackageMetadataResponse } from "@app/api/models";
import { FilterToolbar, FilterType, type FilterCategory, type IFilterValues } from "@app/components/FilterToolbar";
import { getLocalFilterDerivedState } from "@app/hooks/table-controls/filtering";
import prettyBytes from "pretty-bytes";

type ReleaseFiles = NonNullable<UniquePackageMetadataResponse["releases"]>;
type ReleaseFile = NonNullable<ReleaseFiles[string]>[number];

const FILES_FILTER_KEYS = [
  "packagetype",
  "pythonVersion",
  "requiresPython",
] as const;
type FilesFilterKey = (typeof FILES_FILTER_KEYS)[number];

interface FilesTabProps {
  releases: ReleaseFiles;
  currentVersion: string;
}

export const FilesTab: React.FC<FilesTabProps> = ({
  releases,
  currentVersion,
}) => {
  const files = useMemo(() => {
    return releases[currentVersion] ?? [];
  }, [releases, currentVersion]);

  const uniquePackagetypes = useMemo(
    () =>
      [...new Set(files.map((f) => f.packagetype ?? "unknown"))].filter(Boolean).sort(),
    [files],
  );
  const uniquePythonVersions = useMemo(
    () =>
      [...new Set(files.map((f) => f.python_version ?? "N/A"))].filter(Boolean).sort(),
    [files],
  );
  const uniqueRequiresPython = useMemo(
    () =>
      [...new Set(files.map((f) => f.requires_python ?? ""))].filter(Boolean).sort(),
    [files],
  );

  const filterCategories = useMemo(
    (): FilterCategory<ReleaseFile, FilesFilterKey>[] => [
      {
        categoryKey: "packagetype",
        title: "Package type",
        type: FilterType.multiselect,
        placeholderText: "Package type",
        selectOptions: uniquePackagetypes.map((v) => ({ value: v, label: v })),
        getItemValue: (item) => item.packagetype ?? "unknown",
      },
      {
        categoryKey: "pythonVersion",
        title: "Python version",
        type: FilterType.multiselect,
        placeholderText: "Python version",
        selectOptions: uniquePythonVersions.map((v) => ({ value: v, label: v })),
        getItemValue: (item) => item.python_version ?? "N/A",
      },
      {
        categoryKey: "requiresPython",
        title: "Requires Python",
        type: FilterType.multiselect,
        placeholderText: "Requires Python",
        selectOptions: uniqueRequiresPython.map((v) => ({ value: v, label: v })),
        getItemValue: (item) => item.requires_python ?? "",
      },
    ],
    [uniquePackagetypes, uniquePythonVersions, uniqueRequiresPython],
  );

  const [filterValues, setFilterValues] = useState<IFilterValues<FilesFilterKey>>({});

  const { filteredItems: filteredFiles } =
    getLocalFilterDerivedState<ReleaseFile, FilesFilterKey>({
      items: files,
      filterCategories,
      filterState: { filterValues },
    });

  const hasActiveFilters = Object.values(filterValues).some(
    (v) => v && v.length > 0,
  );

  if (files.length === 0) {
    return (
      <EmptyState titleText="No files found" headingLevel="h3">
        <EmptyStateBody>
          No distribution files were found for version {currentVersion}.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <>
      <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
        <FlexItem>
          <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
            <FlexItem>
              <Title headingLevel="h2" size="xl">
                Files
              </Title>
            </FlexItem>
            <FlexItem>
              <p>Distribution files for version {currentVersion}.</p>
            </FlexItem>
          </Flex>
        </FlexItem>
        <FlexItem>
          <Toolbar customLabelGroupContent={<></>}>
            <ToolbarContent>
              <FilterToolbar<ReleaseFile, FilesFilterKey>
                showFiltersSideBySide
                filterGroupBreakpoint="lg"
                filterCategories={filterCategories}
                filterValues={filterValues}
                setFilterValues={setFilterValues}
                endToolbarItems={
                  hasActiveFilters ? (
                    <Button
                      variant="link"
                      onClick={() => setFilterValues({})}
                      isInline
                    >
                      Clear all filters
                    </Button>
                  ) : undefined
                }
              />
            </ToolbarContent>
          </Toolbar>
        </FlexItem>
      </Flex>
      {filteredFiles.length === 0 ? (
        <EmptyState titleText="No files match filters" headingLevel="h3">
          <EmptyStateBody>
            No distribution files match the current filters. Clear or adjust
            filters to see more results.
          </EmptyStateBody>
        </EmptyState>
      ) : (
        <Table
          aria-label="Files table"
          variant="compact"
          style={{ marginTop: "1rem" }}
        >
          <Thead>
            <Tr>
              <Th>File</Th>
              <Th>Package type</Th>
              <Th>Python Version</Th>
              <Th>Requires Python</Th>
              <Th>Size</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredFiles.map((file) => (
              <Tr key={file.digests?.sha256 ?? file.filename ?? undefined}>
                <Td dataLabel="File">
                  <div>
                    <span>{file.filename ?? "Unknown file"}</span>
                    {file.digests?.sha256 && (
                      <div
                        style={{
                          marginTop: "0.25rem",
                          fontSize:
                            "var(--pf-t--global--font--size--body--sm)",
                          color: "var(--pf-v6-global--Color--200)",
                          fontFamily:
                            "var(--pf-v6-global--FontFamily--monospace)",
                        }}
                      >
                        <ClipboardCopy
                          isReadOnly
                          hoverTip="Copy"
                          clickTip="Copied"
                          variant="inline-compact"
                        >
                          {file.digests.sha256}
                        </ClipboardCopy>
                      </div>
                    )}
                  </div>
                </Td>
                <Td dataLabel="Package type">
                  <Label
                    color={file.packagetype === "sdist" ? "orange" : "blue"}
                    isCompact
                  >
                    {file.packagetype ?? "unknown"}
                  </Label>
                </Td>
                <Td dataLabel="Python Version">
                  <code
                    style={{
                      backgroundColor:
                        "var(--pf-v6-global--BackgroundColor--200)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "var(--pf-v6-global--FontSize--sm)",
                      fontFamily:
                        "var(--pf-v6-global--FontFamily--monospace)",
                    }}
                  >
                    {file.python_version ?? "N/A"}
                  </code>
                </Td>
                <Td dataLabel="Requires Python">
                  {file.requires_python ?? "—"}
                </Td>
                <Td dataLabel="Size">
                  {prettyBytes(file.size ?? 0)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </>
  );
};
