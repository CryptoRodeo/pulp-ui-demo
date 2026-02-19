import type React from "react";
import { useMemo } from "react";
import {
  Title,
  Label,
  Button,
  EmptyState,
  EmptyStateBody,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import { useNavigate } from "react-router-dom";
import type { UniquePackageMetadataResponse } from "@app/api/models";
import prettyBytes from "pretty-bytes";

type ReleaseFiles = NonNullable<UniquePackageMetadataResponse["releases"]>;

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
    const entries = Object.entries(releases).map(([version, files]) => {
      const firstFile = files[0];
      const totalSize = files.reduce((sum, f) => sum + (f.size ?? 0), 0);
      const uploadDate = firstFile?.upload_time_iso_8601 ?? firstFile?.upload_time;
      return {
        version,
        pythonVersion: firstFile?.python_version ?? "N/A",
        requiresPython: firstFile?.requires_python ?? "N/A",
        uploadDate,
        uploadTime: uploadDate ? new Date(uploadDate).getTime() : 0,
        size: totalSize,
      };
    });
    entries.sort((a, b) => b.uploadTime - a.uploadTime);
    return entries;
  }, [releases]);

  if (versionEntries.length === 0) {
    return (
      <EmptyState titleText="No versions found" headingLevel="h3">
        <EmptyStateBody>
          No versions were found for this package.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  const getStabilityLabel = (version: string) => {
    if (version.includes("rc"))
      return (
        <Label color="yellow" isCompact>
          RC
        </Label>
      );
    if (version.includes("beta"))
      return (
        <Label color="purple" isCompact>
          Beta
        </Label>
      );
    if (version.includes("alpha"))
      return (
        <Label color="red" isCompact>
          Alpha
        </Label>
      );
    if (version.includes("dev"))
      return (
        <Label color="grey" isCompact>
          Dev
        </Label>
      );
    return (
      <Label color="green" isCompact>
        Stable
      </Label>
    );
  };

  const navigateToVersion = (version: string) => {
    const separator = packageDetailPath.includes("?") ? "&" : "?";
    navigate(`${packageDetailPath}${separator}version=${encodeURIComponent(version)}`);
  };

  return (
    <>
      <Title headingLevel="h2" size="xl">
        Versions
      </Title>
      <p style={{ marginTop: "0.5rem" }}>
        All available versions of this package.
      </p>
      <Table
        aria-label="Versions table"
        variant="compact"
        style={{ marginTop: "1.5rem" }}
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
          {versionEntries.map((item) => {
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
                  {getStabilityLabel(item.version)}
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
    </>
  );
};
