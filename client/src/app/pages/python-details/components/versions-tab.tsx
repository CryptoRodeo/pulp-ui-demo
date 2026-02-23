import type React from "react";
import { useMemo, useState } from "react";
import {
  Title,
  Label,
  Button,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Toolbar,
  ToolbarContent,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import { useNavigate } from "react-router-dom";
import type { UniquePackageMetadataResponse } from "@app/api/models";
import {
  FilterToolbar,
  FilterType,
  type FilterCategory,
  type IFilterValues,
} from "@app/components/FilterToolbar";
import { getLocalFilterDerivedState } from "@app/hooks/table-controls/filtering";
import prettyBytes from "pretty-bytes";

type ReleaseFiles = NonNullable<UniquePackageMetadataResponse["releases"]>;

export type ReleaseTypeKey = "Stable" | "RC" | "Beta" | "Alpha" | "Dev";

function getReleaseType(version: string): ReleaseTypeKey {
  if (version.includes("rc")) return "RC";
  if (version.includes("beta")) return "Beta";
  if (version.includes("alpha")) return "Alpha";
  if (version.includes("dev")) return "Dev";
  return "Stable";
}

/** Compare two version strings (PEP 440–style); returns negative if a < b, 0 if equal, positive if a > b. */
function compareVersion(a: string, b: string): number {
  const tokenize = (v: string) =>
    v.split(/[.-]/).map((s) => (/^\d+$/.test(s) ? Number.parseInt(s, 10) : s.toLowerCase()));
  const partsA = tokenize(a);
  const partsB = tokenize(b);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const x = partsA[i];
    const y = partsB[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (typeof x === "number" && typeof y === "number") {
      if (x !== y) return x - y;
    } else {
      const sx = String(x);
      const sy = String(y);
      if (sx !== sy) return sx < sy ? -1 : 1;
    }
  }
  return 0;
}

type VersionEntry = {
  version: string;
  pythonVersion: string;
  requiresPython: string;
  uploadDate: string | undefined;
  uploadTime: number;
  size: number;
  releaseType: ReleaseTypeKey;
  isYanked: boolean;
};

const VERSION_FILTER_KEYS = [
  "releaseType",
  "pythonVersion",
  "requiresPython",
] as const;
type VersionFilterKey = (typeof VERSION_FILTER_KEYS)[number];

interface VersionsTabProps {
  releases: ReleaseFiles;
  currentVersion: string;
  /** Base path for this package detail (e.g. /trusted-libraries/Django or /redhat-ai-components/rhoai-3.0-ubi9/requests). Version links append ?version=... */
  packageDetailPath: string;
  packageName: string;
}

export const VersionsTab: React.FC<VersionsTabProps> = ({
  releases,
  currentVersion,
  packageDetailPath,
  packageName,
}) => {
  const navigate = useNavigate();

  const versionEntries = useMemo(() => {
    const entries: VersionEntry[] = Object.entries(releases).map(
      ([version, files]) => {
        const firstFile = files[0];
        const totalSize = files.reduce((sum, f) => sum + (f.size ?? 0), 0);
        const uploadDate =
          firstFile?.upload_time_iso_8601 ?? firstFile?.upload_time;
        return {
          version,
          pythonVersion: firstFile?.python_version ?? "N/A",
          requiresPython: firstFile?.requires_python ?? "N/A",
          uploadDate,
          uploadTime: uploadDate ? new Date(uploadDate).getTime() : 0,
          size: totalSize,
          releaseType: getReleaseType(version),
          isYanked: files.some((f) => f.yanked === true),
        };
      },
    );
    // Latest first: current version at top, then others by version descending
    entries.sort((a, b) => {
      if (a.version === currentVersion) return -1;
      if (b.version === currentVersion) return 1;
      return compareVersion(b.version, a.version);
    });
    return entries;
  }, [releases, currentVersion]);

  const uniquePythonVersions = useMemo(
    () =>
      [...new Set(versionEntries.map((e) => e.pythonVersion))].filter(Boolean).sort(),
    [versionEntries],
  );
  const uniqueRequiresPython = useMemo(
    () =>
      [...new Set(versionEntries.map((e) => e.requiresPython))].filter(Boolean).sort(),
    [versionEntries],
  );

  const filterCategories = useMemo(
    (): FilterCategory<VersionEntry, VersionFilterKey>[] => [
      {
        categoryKey: "releaseType",
        title: "Release type",
        type: FilterType.multiselect,
        placeholderText: "Release type",
        selectOptions: [
          { value: "Stable", label: "Stable" },
          { value: "RC", label: "RC" },
          { value: "Beta", label: "Beta" },
          { value: "Alpha", label: "Alpha" },
          { value: "Dev", label: "Dev" },
        ],
        getItemValue: (item) => item.releaseType,
      },
      {
        categoryKey: "pythonVersion",
        title: "Python version",
        type: FilterType.multiselect,
        placeholderText: "Python version",
        selectOptions: uniquePythonVersions.map((v) => ({ value: v, label: v })),
        getItemValue: (item) => item.pythonVersion,
      },
      {
        categoryKey: "requiresPython",
        title: "Requires Python",
        type: FilterType.multiselect,
        placeholderText: "Requires Python",
        selectOptions: uniqueRequiresPython.map((v) => ({ value: v, label: v })),
        getItemValue: (item) => item.requiresPython,
      },
    ],
    [uniquePythonVersions, uniqueRequiresPython],
  );

  const [filterValues, setFilterValues] = useState<
    IFilterValues<VersionFilterKey>
  >({});

  const { filteredItems: filteredVersionEntries } =
    getLocalFilterDerivedState<VersionEntry, VersionFilterKey>({
      items: versionEntries,
      filterCategories,
      filterState: { filterValues },
    });

  if (versionEntries.length === 0) {
    return (
      <EmptyState titleText="No versions found" headingLevel="h3">
        <EmptyStateBody>
          No versions were found for this package.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  const getStabilityLabel = (releaseType: ReleaseTypeKey) => {
    const color =
      releaseType === "Stable"
        ? "green"
        : releaseType === "RC"
          ? "yellow"
          : releaseType === "Beta"
            ? "purple"
            : releaseType === "Alpha"
              ? "red"
              : "grey";
    return (
      <Label color={color} isCompact>
        {releaseType}
      </Label>
    );
  };

  const navigateToVersion = (version: string) => {
    const separator = packageDetailPath.includes("?") ? "&" : "?";
    navigate(`${packageDetailPath}${separator}version=${encodeURIComponent(version)}`);
  };

  const hasActiveFilters = Object.values(filterValues).some(
    (v) => v && v.length > 0,
  );
  const noResultsMatchFilters =
    filteredVersionEntries.length === 0 && versionEntries.length > 0;

  return (
    <>
      <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
        <FlexItem>
          <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
            <FlexItem>
              <Title headingLevel="h2" size="xl">
                Versions
              </Title>
            </FlexItem>
            <FlexItem>
              <p>All available versions of this package.</p>
            </FlexItem>
          </Flex>
        </FlexItem>
        <FlexItem>
          <Toolbar customLabelGroupContent={<></>}>
            <ToolbarContent>
              <FilterToolbar<VersionEntry, VersionFilterKey>
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
      {noResultsMatchFilters ? (
        <EmptyState titleText="No versions match filters" headingLevel="h3">
          <EmptyStateBody>
            No versions match the current filters. Clear or adjust filters to see
            more results.
          </EmptyStateBody>
        </EmptyState>
      ) : (
      <Table
        aria-label="Versions table"
        variant="compact"
        style={{ marginTop: "1rem" }}
      >
        <Thead>
          <Tr>
            <Th>Version</Th>
            <Th>Release Type</Th>
            <Th>Python Version</Th>
            <Th>Requires Python</Th>
            <Th>Upload Date</Th>
            <Th>Size</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredVersionEntries.map((item) => {
            const isCurrentVersion = item.version === currentVersion;
            return (
              <Tr
                key={item.version}
                style={
                  isCurrentVersion
                    ? {
                        backgroundColor:
                          "var(--pf-v6-global--BackgroundColor--200)",
                      }
                    : undefined
                }
              >
                <Td dataLabel="Version">
                  <Button
                    variant="link"
                    isInline
                    onClick={() => navigateToVersion(item.version)}
                    style={{
                      fontWeight: isCurrentVersion ? "bold" : "normal",
                    }}
                  >
                    {item.version}
                  </Button>
                  {isCurrentVersion && (
                    <Label
                      color="blue"
                      isCompact
                      style={{ marginLeft: "0.5rem" }}
                    >
                      current
                    </Label>
                  )}
                </Td>
                <Td dataLabel="Release Type">
                  {getStabilityLabel(item.releaseType)}
                </Td>
                <Td dataLabel="Python Version">
                  <code
                    style={{
                      backgroundColor:
                        "var(--pf-v6-global--BackgroundColor--200)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "var(--pf-v6-global--FontSize--sm)",
                      fontFamily: "var(--pf-v6-global--FontFamily--monospace)",
                    }}
                  >
                    {item.pythonVersion}
                  </code>
                </Td>
                <Td dataLabel="Requires Python">{item.requiresPython}</Td>
                <Td dataLabel="Upload Date">
                  {item.uploadDate
                    ? new Date(item.uploadDate).toLocaleDateString()
                    : "N/A"}
                </Td>
                <Td dataLabel="Size">{prettyBytes(item.size)}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      )}
    </>
  );
};
