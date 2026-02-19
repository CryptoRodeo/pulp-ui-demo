import React from "react";
import { ErrorBoundary } from "react-error-boundary";

import { TrustedLibrariesErrorFallback } from "./TrustedLibrariesErrorFallback";
import { TrustedLibrariesContent } from "./TrustedLibrariesContent";

/**
 * Wrapper so any error in TrustedLibrariesContent (including in hooks) is caught
 * and we show an in-page fallback instead of the full-page "Oops! Something went wrong."
 */
export const TrustedLibraries: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={TrustedLibrariesErrorFallback}>
      <TrustedLibrariesContent />
    </ErrorBoundary>
  );
};
