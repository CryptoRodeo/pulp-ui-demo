import type React from "react";
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Title,
  Flex,
  FlexItem,
  Label,
  Tooltip,
} from "@patternfly/react-core";
import { InfoCircleIcon, ExternalLinkAltIcon } from "@patternfly/react-icons";
import type { UniquePackageMetadataResponse } from "@app/api/models";
import { groupClassifiers, truncateLicense } from "../helpers";

interface MetadataSidebarProps {
  info: NonNullable<UniquePackageMetadataResponse["info"]>;
}

export const MetadataSidebar: React.FC<MetadataSidebarProps> = ({ info }) => {
  const homePageUrl = info.home_page?.trim() || "";
  const classifiers = info.classifiers ?? [];
  const grouped = groupClassifiers(classifiers);
  const author = info.author || info.author_email || "Unknown";
  const licenseText = info.license_expression || info.license || "";

  // project_urls may arrive as a Record<string, string> or as an array of
  // "label, url" strings (depending on the Pulp API endpoint). Normalize both
  // formats into a consistent { label, url } list.
  const rawUrls = info.project_urls;
  const projectUrlEntries: { label: string; url: string }[] = Array.isArray(
    rawUrls,
  )
    ? (rawUrls as string[]).flatMap((entry) => {
        const idx = entry.indexOf(", ");
        return idx !== -1
          ? [{ label: entry.slice(0, idx), url: entry.slice(idx + 2) }]
          : [];
      })
    : Object.entries(rawUrls ?? {}).map(([label, url]) => ({
        label,
        url: String(url),
      }));

  const allLinks = [
    ...(homePageUrl ? [{ label: "Homepage", url: homePageUrl }] : []),
    ...projectUrlEntries,
  ];

  return (
    <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
      {/* Package Details Card */}
      <FlexItem>
        <Card isCompact>
          <CardBody>
            <Title headingLevel="h4" size="md" style={{ marginBottom: "1rem" }}>
              <Flex
                alignItems={{ default: "alignItemsCenter" }}
                spaceItems={{ default: "spaceItemsSm" }}
              >
                <FlexItem>
                  <InfoCircleIcon
                    style={{
                      color: "var(--pf-v6-global--info-color--100)",
                    }}
                  />
                </FlexItem>
                <FlexItem>Package Details</FlexItem>
              </Flex>
            </Title>
            <DescriptionList isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>License</DescriptionListTerm>
                <DescriptionListDescription>
                  {licenseText.length > 50 ? (
                    <Tooltip content={licenseText}>
                      <span>{truncateLicense(licenseText)}</span>
                    </Tooltip>
                  ) : (
                    licenseText || "Unknown"
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Author</DescriptionListTerm>
                <DescriptionListDescription>
                  {author}
                </DescriptionListDescription>
              </DescriptionListGroup>
              {(info.maintainer || info.maintainer_email) && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Maintainer</DescriptionListTerm>
                  <DescriptionListDescription>
                    {info.maintainer || info.maintainer_email}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {info.requires_python && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Requires Python</DescriptionListTerm>
                  <DescriptionListDescription>
                    {info.requires_python}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
          </CardBody>
        </Card>
      </FlexItem>

      {/* Project Links Card */}
      {allLinks.length > 0 && (
        <FlexItem>
          <Card isCompact>
            <CardBody>
              <Title
                headingLevel="h4"
                size="md"
                style={{ marginBottom: "1rem" }}
              >
                Project Links
              </Title>
              <Flex
                direction={{ default: "column" }}
                gap={{ default: "gapSm" }}
              >
                {allLinks.map((link) => (
                  <FlexItem key={`${link.label}-${link.url}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLinkAltIcon style={{ marginRight: "0.5rem" }} />
                      {link.label}
                    </a>
                  </FlexItem>
                ))}
              </Flex>
            </CardBody>
          </Card>
        </FlexItem>
      )}

      {/* Classifiers Card */}
      {classifiers.length > 0 && (
        <FlexItem>
          <Card isCompact>
            <CardBody>
              <Title
                headingLevel="h4"
                size="md"
                style={{ marginBottom: "1rem" }}
              >
                Classifiers
              </Title>
              <Flex
                direction={{ default: "column" }}
                gap={{ default: "gapMd" }}
              >
                {Object.entries(grouped).map(([category, items]) => (
                  <FlexItem key={category}>
                    <Title headingLevel="h5" size="sm">
                      {category}
                    </Title>
                    <Flex
                      gap={{ default: "gapSm" }}
                      style={{ marginTop: "0.25rem" }}
                      wrap={{ default: "wrap" }}
                    >
                      {items.map((item) => (
                        <FlexItem key={item}>
                          <Label color="grey" isCompact>
                            {item}
                          </Label>
                        </FlexItem>
                      ))}
                    </Flex>
                  </FlexItem>
                ))}
              </Flex>
            </CardBody>
          </Card>
        </FlexItem>
      )}
    </Flex>
  );
};
