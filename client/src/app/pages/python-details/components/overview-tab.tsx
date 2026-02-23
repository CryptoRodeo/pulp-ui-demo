import type React from "react";
import {
  ClipboardCopy,
  Content,
  Grid,
  GridItem,
  Title,
} from "@patternfly/react-core";
import Markdown from "react-markdown";
import type { UniquePackageMetadataResponse } from "@app/api/models";
import { MetadataSidebar } from "./metadata-sidebar";

import "./overview-tab.css";

interface OverviewTabProps {
  info: NonNullable<UniquePackageMetadataResponse["info"]>;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ info }) => {
  const description = info.description ?? "No description available.";

  return (
    <Grid hasGutter>
      <GridItem span={12} lg={9}>
        {/* About section */}
        <Title headingLevel="h2" size="xl">
          About
        </Title>
        <Content isEditorial style={{ marginTop: "0.5rem" }}>
          <div className="overview-markdown">
            <Markdown>{description}</Markdown>
          </div>
        </Content>

        {/* Installation section */}
        <Title headingLevel="h2" size="xl" style={{ marginTop: "2rem" }}>
          Installation
        </Title>
        <ClipboardCopy
          isReadOnly
          hoverTip="Copy"
          clickTip="Copied"
          style={{ marginTop: "0.5rem" }}
        >
          pip install {info.name ?? ""}
        </ClipboardCopy>
      </GridItem>

      <GridItem span={12} lg={3}>
        <MetadataSidebar info={info} />
      </GridItem>
    </Grid>
  );
};
