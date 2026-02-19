import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  PageSection,
  Title,
} from "@patternfly/react-core";
import ExclamationCircleIcon from "@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon";

import { Paths } from "@app/Routes";

/**
 * When something throws on Trusted Libraries, show title + in-page error (no CardList
 * so we never throw again). User can try again or go home.
 */
export const TrustedLibrariesErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ resetErrorBoundary }) => {
  const navigate = useNavigate();
  return (
    <>
      <PageSection>
        <Title headingLevel="h1" size="2xl">
          Trusted Libraries
        </Title>
      </PageSection>
      <PageSection>
        <EmptyState
          headingLevel="h4"
          titleText="Something went wrong"
          icon={ExclamationCircleIcon}
          variant={EmptyStateVariant.sm}
        >
          <EmptyStateBody>
            There was an error loading this page. You can try again or go back to
            the home page.
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button variant="primary" onClick={resetErrorBoundary}>
                Try again
              </Button>
              <Button variant="secondary" onClick={() => navigate(Paths.landing)}>
                Go to home
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </PageSection>
    </>
  );
};
