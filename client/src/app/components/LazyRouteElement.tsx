import type React from "react";
import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  Spinner,
} from "@patternfly/react-core";
import { ErrorFallback } from "./ErrorFallback";
import { NavigationSuspense } from "./NavigationSuspense";

export const LazyRouteElement = ({
  identifier,
  component,
}: {
  identifier: string;
  component: React.ReactNode;
}) => {
  return (
    <Suspense
      key={identifier}
      fallback={
        <Bullseye>
          <EmptyState
            titleText="Loading assets"
            headingLevel="h4"
            icon={Spinner}
            aria-label="Loading assets"
            role="status"
          >
            <EmptyStateBody>
              Preparing page. This may take a moment.
            </EmptyStateBody>
          </EmptyState>
        </Bullseye>
      }
    >
      <ErrorBoundary FallbackComponent={ErrorFallback} key={identifier}>
        <NavigationSuspense>{component}</NavigationSuspense>
      </ErrorBoundary>
    </Suspense>
  );
};
