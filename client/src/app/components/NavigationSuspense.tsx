import type React from "react";
import { useNavigation } from "react-router-dom";

import { LoadingDataEmptyState } from "./LoadingDataEmptyState";

export const NavigationSuspense: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigation = useNavigation();

  if (navigation.state === "loading") {
    return <LoadingDataEmptyState />;
  }

  return children;
};
