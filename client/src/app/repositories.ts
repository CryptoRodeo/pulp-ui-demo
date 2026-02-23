/**
 * Single source of truth for repository entries shown on the landing page and in nav.
 * Kept in a separate module to avoid circular imports (layout/header must not import Routes).
 * Paths are duplicated here; Paths in Routes.tsx must stay in sync for routing.
 */
export interface RepositoryEntry {
  path: string;
  label: string;
  imageName: string;
  /** Short tagline (e.g. "Enterprise-Grade Package Security"). */
  subtitle: string;
  /** One-line summary for nav/small previews. */
  description: string;
  /** Full paragraph for landing page card. */
  longDescription: string;
  /** Bullet value-adds for the landing card. */
  valueBullets: readonly string[];
  /** "Choose when" guidance (e.g. "Pick this when you need..."). */
  chooseWhen: string;
}

export const REPOSITORY_ENTRIES: readonly RepositoryEntry[] = [
  {
    path: "/trusted-libraries",
    label: "Trusted Libraries",
    imageName: "trusted-libraries.svg",
    subtitle: "Enterprise-Grade Package Security",
    description: "Curated Python packages from the calunga-dev distribution.",
    longDescription:
      "Curated, continuously maintained libraries built in SLSA Level 3 infrastructure with full provenance and attestation. Every package is cryptographically signed and includes comprehensive SBOMs, ensuring complete supply chain transparency and enterprise compliance.",
    valueBullets: [
      "SLSA Level 3 infrastructure",
      "Zero-known CVEs at release",
      "Signed SBOM & attestation",
      "Continuous security monitoring",
      "Enterprise support available",
    ],
    chooseWhen:
      "Choose Trusted Libraries when you need security-vetted, compliance-ready open source libraries for general Python applications.",
  },
  {
    path: "/redhat-ai-components",
    label: "Red Hat AI Components",
    imageName: "rhai.svg",
    subtitle: "AI Development Platform",
    description:
      "Red Hat AI / AIPCC indexes: select an index to browse packages.",
    longDescription:
      "A unified platform delivering optimized packages for AI and machine learning workloads. Hardware-tuned builds for GPU/TPU acceleration, pre-configured base images, and curated Python wheels ensure reproducible environments from development through production.",
    valueBullets: [
      "Hardware-accelerated builds (GPU/TPU)",
      "Pre-configured base images",
      "ML framework support (PyTorch, TensorFlow, JAX)",
      "Unified package index per accelerator",
      "Inference-ready deployments",
    ],
    chooseWhen:
      "Choose Red Hat AI Components when you're building or deploying AI/ML workloads and need optimized, accelerator-specific packages and base images.",
  },
] as const;
