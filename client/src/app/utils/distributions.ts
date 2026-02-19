import type { DistributionResponse } from "@app/client";

import { CALUNGA_DEV_BASE_PATH } from "@app/Constants";

/** Display name for the Trusted Libraries product in the API */
export const TRUSTED_LIBRARIES_DISPLAY_NAME = "calunga-dev";

/** Base path used for the Trusted Libraries package index when you "Browse packages" (matches working view) */
export const TRUSTED_LIBRARIES_BASE_PATH = "main";

/**
 * True if this distribution is the Trusted Libraries (calunga-dev) product.
 * Excludes it from Red Hat AI Components so it only appears on the Trusted Libraries page.
 * Covers both API shapes: base_path "calunga-dev" and name "calunga-dev" with base_path "main".
 */
export function isTrustedLibrariesDistribution(
  d: DistributionResponse,
): boolean {
  if (d.base_path === CALUNGA_DEV_BASE_PATH) return true;
  return (
    d.name === TRUSTED_LIBRARIES_DISPLAY_NAME &&
    d.base_path === TRUSTED_LIBRARIES_BASE_PATH
  );
}

/** Trusted Libraries: distributions that represent the calunga-dev product (0, 1, or 2 from API) */
export function getTrustedLibrariesDistributions(
  distributions: DistributionResponse[],
): DistributionResponse[] {
  return distributions.filter(isTrustedLibrariesDistribution);
}

/**
 * Distribution to use for the Trusted Libraries page. Prefers the distribution that
 * actually serves the package list: name "calunga-dev" with base_path "main" (the one
 * you get when clicking "Browse packages" on calunga-dev). Falls back to base_path
 * "calunga-dev" or a synthetic distribution so packages still load.
 */
export function getTrustedLibrariesDefaultDistribution(
  distributions: DistributionResponse[],
): DistributionResponse {
  const byMain = distributions.find(
    (d) => d.name === TRUSTED_LIBRARIES_DISPLAY_NAME && d.base_path === TRUSTED_LIBRARIES_BASE_PATH,
  );
  if (byMain) return byMain;
  const byCalungaDev = getTrustedLibrariesDistributions(distributions)[0];
  if (byCalungaDev) return byCalungaDev;
  return {
    base_path: TRUSTED_LIBRARIES_BASE_PATH,
    name: TRUSTED_LIBRARIES_DISPLAY_NAME,
  } as DistributionResponse;
}

/** Red Hat AI Components: all distributions except Trusted Libraries (calunga-dev never included) */
export function getAIPCCDistributions(
  distributions: DistributionResponse[],
): DistributionResponse[] {
  return distributions.filter((d) => !isTrustedLibrariesDistribution(d));
}

/** Derive base image label from AIPCC distribution name/base_path (e.g. ubi9 → "UBI 9"). Returns null if not detectable. */
export function getBaseImageLabel(d: DistributionResponse): string | null {
  const text = `${d.name ?? ""} ${d.base_path ?? ""}`.toLowerCase();
  if (text.includes("ubi9")) return "UBI 9";
  if (text.includes("ubi8")) return "UBI 8";
  if (text.includes("ubi7")) return "UBI 7";
  return null;
}

const REGISTRY_BASE = "registry.redhat.io/rhoai";

/**
 * Derive a plausible registry.redhat.io base image URL from an AIPCC distribution name.
 * Simulated mapping: no API field exists today; based on name patterns like
 * rhoai-3.0-cuda-ubi9, rhoai-3.2-cuda12.9-ubi9, rhoai-3.2-rocm7.0-ubi9.
 * Returns e.g. registry.redhat.io/rhoai/pytorch-2-rhel9:3.2-cuda12.9
 */
export function getBaseImageRegistryUrl(d: DistributionResponse): string | null {
  const name = (d.name ?? "").toLowerCase();
  if (!name.startsWith("rhoai-")) return null;

  const parts = name.replace(/-test$|-sdists-test$|-sdists$/g, "").split("-");
  const version = parts.find((p) => /^\d+\.\d+$/.test(p)) ?? "3.0";
  const hasRocm = name.includes("rocm");
  const hasCuda = name.includes("cuda");

  let tag: string;
  if (hasCuda && name.includes("cuda12.9")) tag = `${version}-cuda12.9`;
  else if (hasCuda) tag = `${version}-cuda12.9`;
  else if (hasRocm && name.includes("rocm7.0")) tag = `${version}-rocm7.0`;
  else if (hasRocm && name.includes("rocm6.4")) tag = `${version}-rocm6.4`;
  else if (hasRocm) tag = `${version}-rocm`;
  else tag = `${version}-cpu`;

  const imageName = hasRocm ? "pytorch-2-rocm-rhel9" : "pytorch-2-rhel9";
  return `${REGISTRY_BASE}/${imageName}:${tag}`;
}
