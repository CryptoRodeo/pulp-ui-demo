/**
 * Single source of truth for repository entries shown on the landing page and in nav.
 * Kept in a separate module to avoid circular imports (layout/header must not import Routes).
 * Paths are duplicated here; Paths in Routes.tsx must stay in sync for routing.
 */
export const REPOSITORY_ENTRIES = [
  {
    path: "/trusted-libraries",
    label: "Trusted Libraries",
    description:
      "Curated Python packages from the calunga-dev distribution.",
    imageName: "trusted-libraries.svg",
  },
  {
    path: "/redhat-ai-components",
    label: "Red Hat AI Components",
    description:
      "Red Hat AI / AIPCC distributions: select a distribution to browse packages.",
    imageName: "rhai.svg",
  },
] as const;
