import type React from "react";

import { EmptyState, EmptyStateBody, Spinner } from "@patternfly/react-core";

export const LoadingDataEmptyState: React.FC = () => {
  return (
    <EmptyState
      titleText="Loading data"
      headingLevel="h4"
      icon={Spinner}
      aria-label="Loading data"
      role="status"
    >
      <EmptyStateBody>Preparing data. This may take a moment.</EmptyStateBody>
    </EmptyState>
  );
};
