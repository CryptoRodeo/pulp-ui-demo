import type { DistributionResponse } from "@app/client";

import { CALUNGA_DEV_BASE_PATH } from "@app/Constants";

/** Whether this distribution is the single Trusted Libraries (calunga-dev) product */
export function isTrustedLibrariesDistribution(
  d: DistributionResponse,
): boolean {
  return d.base_path === CALUNGA_DEV_BASE_PATH;
}

/** Trusted Libraries: single calunga-dev distribution */
export function getTrustedLibrariesDistributions(
  distributions: DistributionResponse[],
): DistributionResponse[] {
  return distributions.filter(isTrustedLibrariesDistribution);
}

/** Red Hat AI Components: all AIPCC distributions (non–calunga-dev) */
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
