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

/**
 * True if this distribution is a test variant (base_path or name ends with "-test").
 * Used to hide test distributions on the RHAI list unless ?showTest=1 is in the URL.
 */
export function isTestDistribution(d: DistributionResponse): boolean {
  const path = (d.base_path ?? "").trim();
  const name = (d.name ?? "").trim();
  return path.endsWith("-test") || name.toLowerCase().endsWith("-test");
}

/**
 * Parsed dimensions from an AIPCC distribution's base_path (and name as fallback for base image).
 * The API only provides base_path and name—there are no separate fields for product version,
 * accelerator, or RHEL/UBI. These are derived by parsing the path structure (e.g. rhoai/3.0/cuda-ubi9
 * → product, version, accelerator label, base image).
 */
export interface AIPCCDistributionDimensions {
  /** Product name, e.g. "rhoai", "spyre" (first segment of base_path). */
  product: string;
  /** Product version, e.g. "3.0", "3.2", "3.4-EA1" (second segment). */
  productVersion: string;
  /** Accelerator label for display/filter: "CPU", "CUDA", "CUDA 12.9", "CUDA 13.0", "ROCm", "ROCm 6.4", etc. */
  accelerator: string;
  /** Base image / RHEL variant, e.g. "UBI 9", or null if not detectable. */
  baseImage: string | null;
}

/**
 * Derive accelerator display label from the last path segment (e.g. cuda-ubi9 → "CUDA", cuda12.9-ubi9 → "CUDA 12.9").
 */
function getAcceleratorLabelFromLastSegment(lastSegment: string): string {
  const part = lastSegment.split("-")[0] ?? "";
  const lower = part.toLowerCase();
  if (lower === "cpu") return "CPU";
  const cudaMatch = lower.match(/^cuda(\d+\.\d+)?$/);
  if (cudaMatch) return cudaMatch[1] ? `CUDA ${cudaMatch[1]}` : "CUDA";
  const rocmMatch = lower.match(/^rocm(\d+\.\d+)?$/);
  if (rocmMatch) return rocmMatch[1] ? `ROCm ${rocmMatch[1]}` : "ROCm";
  return part ? part.charAt(0).toUpperCase() + part.slice(1) : "CPU";
}

/**
 * Derive filterable dimensions from an AIPCC distribution's base_path (and name as fallback).
 * base_path format: {product}/{version}/{accelerator-variant}-{base}, e.g. rhoai/3.0/cuda-ubi9, rhoai/3.2/cuda12.9-ubi9.
 */
export function getAIPCCDistributionDimensions(
  d: DistributionResponse,
): AIPCCDistributionDimensions {
  const path = (d.base_path ?? "").trim();
  const segments = path.split("/").filter(Boolean);
  const product = segments[0] ?? "";
  const productVersion = segments[1] ?? "";
  const lastSegment = (segments[segments.length - 1] ?? "").toLowerCase();

  const accelerator = getAcceleratorLabelFromLastSegment(lastSegment);
  const baseImage = getBaseImageLabel(d);

  return { product, productVersion, accelerator, baseImage };
}

/**
 * Human-readable description for an AIPCC distribution. Used in both the
 * distribution table and the index detail page so copy stays consistent.
 */
export function getAIPCCDistributionDescription(
  d: DistributionResponse,
): string {
  const { productVersion, accelerator, baseImage } =
    getAIPCCDistributionDimensions(d);
  const product = "RHOAI";
  const parts: string[] = [];
  if (productVersion) parts.push(`${product} ${productVersion}`);
  if (accelerator) parts.push(`on ${accelerator}`);
  if (baseImage) parts.push(`with ${baseImage}`);
  const stack = parts.length === 0 ? "this index" : parts.join(" ");
  if (isSdistsDistribution(d)) {
    return `Python source distributions (sdists) for ${stack}. Sdists are source packages you build in your own pipeline—often used for compliance or custom builds. RHOAI (Red Hat OpenShift AI) and UBI (Universal Base Image) define the supported product and base image.`;
  }
  return `Pre-built Python wheels for ${stack}. Wheels are binary packages for fast installs without compiling. RHOAI (Red Hat OpenShift AI), the accelerator (e.g. CUDA, ROCm), and UBI (Universal Base Image) define the supported stack for reproducible, supply-chain-secure installs.`;
}

/** True if this distribution is the sdists (source distributions) variant (name or base_path contains "sdists"). */
export function isSdistsDistribution(d: DistributionResponse): boolean {
  const text = `${d.name ?? ""} ${d.base_path ?? ""}`.toLowerCase();
  return text.includes("sdists");
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
