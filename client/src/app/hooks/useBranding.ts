import { useMemo } from "react";
import { type BrandingStrings, brandingStrings } from "@pulp-ui/common";
import { useIsDarkMode } from "./useDarkMode";
/**
 * Wrap the branding strings in a hook so components access it in a standard
 * React way instead of a direct import.  This allows the branding implementation
 * to change in future with a minimal amount of refactoring in existing components.
 */
export const useBranding = (): BrandingStrings => {
  const isDark = useIsDarkMode();
  return useMemo(() => {
    if (!isDark) return brandingStrings;

    return {
      ...brandingStrings,
      masthead: {
        ...brandingStrings.masthead,
        leftBrand: brandingStrings.masthead.leftBrand
          ? {
              ...brandingStrings.masthead.leftBrand,
              src:
                // Use dark mode branding if they exist,
                // default to original source branding if not.
                brandingStrings.masthead.leftBrand.darkModeSrc ||
                brandingStrings.masthead.leftBrand.src,
            }
          : undefined,
      },
      about: {
        ...brandingStrings.about,
        imageSrc:
          brandingStrings.about.darkModeImageSrc ||
          brandingStrings.about.imageSrc,
      },
    };
  }, [isDark]);
};

export default useBranding;
