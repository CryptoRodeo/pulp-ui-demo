import React from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  Button,
  Flex,
  FlexItem,
  Label,
  PageSection,
  PageSectionVariants,
  Spinner,
  Tab,
  TabContent,
  TabContentBody,
  Tabs,
  TabTitleText,
  Title,
} from "@patternfly/react-core";
import { CopyIcon } from "@patternfly/react-icons";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import {
  useFetchPackageContent,
  useSuspenseUniquePackageMetadata,
} from "@app/queries/packages";
import {
  distributionBasePathQueryParam,
  PathParam,
  Paths,
  useRouteParams,
} from "@app/Routes";

import { FilesTab, OverviewTab, VersionsTab } from "./components";

export const PythonDetails: React.FC = () => {
  const distributionBasePath = useRouteParams(PathParam.DISTRIBUTION_BASE_PATH);
  const packageName = useRouteParams(PathParam.PYTHON_ID);

  const [searchParams] = useSearchParams();
  const versionParam = searchParams.get("version") ?? undefined;

  const [activeTabKey, setActiveTabKey] = React.useState<number>(0);

  const { pkg, isFetching } = useSuspenseUniquePackageMetadata({
    distributionPath: distributionBasePath,
    packageName,
    packageVersion: versionParam,
  });

  const { contentPkg } = useFetchPackageContent({
    name: packageName,
    version: versionParam,
  });

  // When a specific version is selected, the Pulp PyPI JSON endpoint still
  // returns latest-version metadata in `info`. Override with version-accurate
  // fields from the content API.
  const rawInfo = pkg?.info;
  const info = React.useMemo(() => {
    if (!contentPkg || !rawInfo) return rawInfo;

    const parseJson = <T,>(value: unknown): T | undefined => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value) as T;
        } catch {
          return undefined;
        }
      }
      return value as T | undefined;
    };

    return {
      ...rawInfo,
      version: contentPkg.version ?? rawInfo.version,
      summary: contentPkg.summary ?? rawInfo.summary,
      description: contentPkg.description ?? rawInfo.description,
      description_content_type:
        contentPkg.description_content_type ?? rawInfo.description_content_type,
      author: contentPkg.author ?? rawInfo.author,
      author_email: contentPkg.author_email ?? rawInfo.author_email,
      maintainer: contentPkg.maintainer ?? rawInfo.maintainer,
      maintainer_email: contentPkg.maintainer_email ?? rawInfo.maintainer_email,
      license: contentPkg.license ?? rawInfo.license,
      license_expression:
        contentPkg.license_expression ?? rawInfo.license_expression,
      requires_python: contentPkg.requires_python ?? rawInfo.requires_python,
      home_page: contentPkg.home_page ?? rawInfo.home_page,
      keywords: contentPkg.keywords ?? rawInfo.keywords,
      classifiers:
        parseJson<string[]>(contentPkg.classifiers) ?? rawInfo.classifiers,
      requires_dist:
        parseJson<string[]>(contentPkg.requires_dist) ?? rawInfo.requires_dist,
      project_urls:
        parseJson<Record<string, string>>(contentPkg.project_urls) ??
        rawInfo.project_urls,
    };
  }, [contentPkg, rawInfo]);

  const releases = pkg?.releases;

  if (isFetching) {
    return (
      <PageSection>
        <Bullseye style={{ padding: "4rem 0" }}>
          <Spinner aria-label="Loading package details" />
        </Bullseye>
      </PageSection>
    );
  }

  if (!info) {
    return (
      <PageSection>
        <h1>No package found</h1>
      </PageSection>
    );
  }

  // The Pulp server's version-specific PyPI JSON endpoint always returns the
  // latest version in info.version, so we fall back to the query-param value.
  const currentVersion = versionParam ?? info.version ?? "";
  const classifiers = info.classifiers ?? [];

  return (
    <>
      <DocumentMetadata title={info.name ?? "Python"} />
      <PageSection type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link
              to={{
                pathname: Paths.python,
                search: `?${distributionBasePathQueryParam}=${distributionBasePath}`,
              }}
            >
              Packages
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Package details</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>
        <Flex
          justifyContent={{ default: "justifyContentSpaceBetween" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <FlexItem>
            <Flex
              direction={{ default: "column" }}
              spaceItems={{ default: "spaceItemsSm" }}
            >
              <FlexItem>
                <Flex
                  alignItems={{ default: "alignItemsCenter" }}
                  spaceItems={{ default: "spaceItemsSm" }}
                >
                  <FlexItem>
                    <Title headingLevel="h1" size="2xl">
                      {info.name}
                    </Title>
                  </FlexItem>
                  <FlexItem>
                    <Label color="blue" isCompact>
                      v{currentVersion}
                    </Label>
                  </FlexItem>
                </Flex>
              </FlexItem>
              <FlexItem>
                <p style={{ fontSize: "var(--pf-v6-global--FontSize--lg)" }}>
                  {info.summary}
                </p>
              </FlexItem>
              <FlexItem>
                <Flex spaceItems={{ default: "spaceItemsSm" }}>
                  {classifiers.slice(0, 5).map((tag) => {
                    const parts = tag.split(" :: ");
                    const shortTag = parts[parts.length - 1];
                    return (
                      <FlexItem key={tag}>
                        <Label color="grey" isCompact>
                          #{shortTag}
                        </Label>
                      </FlexItem>
                    );
                  })}
                </Flex>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Button
              variant="secondary"
              icon={<CopyIcon />}
              onClick={() => {
                navigator.clipboard.writeText(
                  `pip install ${info.name}==${currentVersion}`,
                );
              }}
            >
              pip install {info.name}=={currentVersion}
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection>
        <Tabs
          activeKey={activeTabKey}
          onSelect={(_event, tabIndex) => setActiveTabKey(tabIndex as number)}
        >
          <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>}>
            <TabContent>
              <TabContentBody hasPadding>
                <OverviewTab info={info} />
              </TabContentBody>
            </TabContent>
          </Tab>
          <Tab eventKey={1} title={<TabTitleText>Versions</TabTitleText>}>
            <TabContent>
              <TabContentBody hasPadding>
                <VersionsTab
                  releases={releases ?? {}}
                  currentVersion={currentVersion}
                  distributionBasePath={distributionBasePath}
                  packageName={info.name ?? ""}
                />
              </TabContentBody>
            </TabContent>
          </Tab>
          <Tab eventKey={2} title={<TabTitleText>Files</TabTitleText>}>
            <TabContent>
              <TabContentBody hasPadding>
                <FilesTab
                  releases={releases ?? {}}
                  currentVersion={currentVersion}
                />
              </TabContentBody>
            </TabContent>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};
