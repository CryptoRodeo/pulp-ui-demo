import React from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";

import type { UniquePackageMetadataResponse } from "@app/api/models";
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
import { useFetchDistributions } from "@app/queries/distributions";
import {
  useFetchPackageContent,
  useSuspenseUniquePackageMetadata,
} from "@app/queries/packages";
import {
  getRedHatAIComponentsDistributionPath,
  PathParam,
  Paths,
} from "@app/Routes";
import { RedHatAISplatContext } from "@app/pages/redhat-ai-components/RedHatAISplatHandler";
import {
  getAIPCCDistributions,
  TRUSTED_LIBRARIES_BASE_PATH,
} from "@app/utils/distributions";

import { FilesTab, OverviewTab, VersionsTab } from "./components";

/** Shared props for package detail content (used when pkg comes from hook or from pre-fetched prop). */
interface PythonDetailsContentProps {
  pkg: UniquePackageMetadataResponse;
  pathname: string;
  distributionParam: string | undefined;
  packageName: string;
  versionParam: string | undefined;
  isFetching?: boolean;
}

const PythonDetailsContent: React.FC<PythonDetailsContentProps> = ({
  pkg,
  pathname,
  distributionParam,
  packageName,
  versionParam,
  isFetching = false,
}) => {
  const [activeTabKey, setActiveTabKey] = React.useState<number>(0);

  React.useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      const main = document.getElementById("main-content-page-layout-horizontal-nav");
      if (main) main.scrollTo(0, 0);
    };
    scrollToTop();
    const t = setTimeout(scrollToTop, 0);
    return () => clearTimeout(t);
  }, [pathname, packageName]);

  const { distributions } = useFetchDistributions();
  const rhaiDistributionName = React.useMemo(() => {
    if (!pathname.startsWith("/redhat-ai-components") || !distributionParam)
      return null;
    const aipcc = getAIPCCDistributions(distributions ?? []);
    const dist = aipcc.find((d) => d.base_path === distributionParam);
    return dist?.name ?? distributionParam;
  }, [pathname, distributionParam, distributions]);

  const { contentPkg } = useFetchPackageContent({
    name: packageName,
    version: versionParam,
  });

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

  const documentTitleProductName = pathname.startsWith("/redhat-ai-components")
    ? "Red Hat AI Components"
    : pathname.startsWith("/trusted-libraries")
      ? "Trusted Libraries"
      : undefined;

  return (
    <>
      <DocumentMetadata
        title={info.name ?? "Python"}
        productName={documentTitleProductName}
      />
      <PageSection type="breadcrumb">
        <Breadcrumb>
          {pathname.startsWith("/redhat-ai-components") &&
            distributionParam && (
              <BreadcrumbItem>
                <Link to={Paths.redHatAIComponents}>Indexes</Link>
              </BreadcrumbItem>
            )}
          {pathname.startsWith("/redhat-ai-components") &&
            distributionParam && (
              <BreadcrumbItem>
                <Link
                  to={getRedHatAIComponentsDistributionPath(distributionParam)}
                >
                  {rhaiDistributionName ?? distributionParam}
                </Link>
              </BreadcrumbItem>
            )}
          {(!pathname.startsWith("/redhat-ai-components") ||
            !distributionParam) && (
            <BreadcrumbItem>
              <Link
                to={
                  pathname.startsWith("/trusted-libraries")
                    ? Paths.trustedLibraries
                    : Paths.landing
                }
              >
                Packages
              </Link>
            </BreadcrumbItem>
          )}
          <BreadcrumbItem isActive>{info.name}</BreadcrumbItem>
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
                  packageDetailPath={pathname}
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

/** Uses suspense to load package metadata. Used for trusted-libraries and path-based package detail routes. */
export const PythonDetails: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const params = useParams();
  const splatContext = React.useContext(RedHatAISplatContext);
  const packageNameParam = splatContext?.packageName ?? params[PathParam.PYTHON_ID];
  const distributionParam =
    splatContext?.distributionBasePath ?? params[PathParam.DISTRIBUTION_BASE_PATH];

  const isTrustedLibrariesRoute = pathname.startsWith("/trusted-libraries");
  const packageName = packageNameParam ?? "";
  const distributionBasePath = isTrustedLibrariesRoute
    ? TRUSTED_LIBRARIES_BASE_PATH
    : (distributionParam ?? "");

  const [searchParams] = useSearchParams();
  const versionParam = searchParams.get("version") ?? undefined;

  const { pkg, isFetching } = useSuspenseUniquePackageMetadata({
    distributionPath: distributionBasePath,
    packageName,
    packageVersion: versionParam,
  });

  if (!pkg) {
    return (
      <PageSection>
        <h1>No package found</h1>
      </PageSection>
    );
  }

  return (
    <PythonDetailsContent
      pkg={pkg}
      pathname={pathname}
      distributionParam={distributionParam ?? undefined}
      packageName={packageName}
      versionParam={versionParam}
      isFetching={isFetching}
    />
  );
};

/** Renders package detail using pre-fetched pkg (e.g. from RHAIPackageDetailGate). Avoids suspense query so the error boundary is not triggered. */
export const PythonDetailsWithPrefetchedPkg: React.FC<{
  pkg: UniquePackageMetadataResponse;
}> = ({ pkg }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const params = useParams();
  const splatContext = React.useContext(RedHatAISplatContext);
  const packageNameParam = splatContext?.packageName ?? params[PathParam.PYTHON_ID];
  const distributionParam =
    splatContext?.distributionBasePath ?? params[PathParam.DISTRIBUTION_BASE_PATH];
  const packageName = packageNameParam ?? "";
  const [searchParams] = useSearchParams();
  const versionParam = searchParams.get("version") ?? undefined;

  return (
    <PythonDetailsContent
      pkg={pkg}
      pathname={pathname}
      distributionParam={distributionParam ?? undefined}
      packageName={packageName}
      versionParam={versionParam}
    />
  );
};
