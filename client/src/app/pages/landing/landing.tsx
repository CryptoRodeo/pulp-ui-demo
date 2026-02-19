import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  PageSection,
  Title,
} from "@patternfly/react-core";
import CubeIcon from "@patternfly/react-icons/dist/esm/icons/cube-icon";
import CatalogIcon from "@patternfly/react-icons/dist/esm/icons/catalog-icon";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { Paths } from "@app/Routes";

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <DocumentMetadata title="Package repositories" />
      <PageSection>
        <Title headingLevel="h1" size="2xl">
          Package repositories
        </Title>
      </PageSection>
      <PageSection>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <Card
            isClickable
            isSelectable
            onClick={() => navigate(Paths.trustedLibraries)}
          >
            <CardHeader>
              <CubeIcon size="lg" style={{ marginRight: "0.5rem" }} />
              <Title headingLevel="h2" size="lg">
                Trusted Libraries
              </Title>
            </CardHeader>
            <CardBody>
              Curated Python packages from the calunga-dev distribution.
            </CardBody>
            <CardFooter>Browse packages →</CardFooter>
          </Card>
          <Card
            isClickable
            isSelectable
            onClick={() => navigate(Paths.redHatAIComponents)}
          >
            <CardHeader>
              <CatalogIcon size="lg" style={{ marginRight: "0.5rem" }} />
              <Title headingLevel="h2" size="lg">
                Red Hat AI Components
              </Title>
            </CardHeader>
            <CardBody>
              Red Hat AI / AIPCC distributions: select a distribution to browse
              packages.
            </CardBody>
            <CardFooter>Browse distributions →</CardFooter>
          </Card>
        </div>
      </PageSection>
    </>
  );
};
