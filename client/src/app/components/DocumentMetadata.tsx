import useBranding from "@app/hooks/useBranding";

export const DocumentMetadata = ({
  title,
  productName,
}: {
  title?: string;
  /** When set, used as the suffix after the pipe (e.g. "Trusted Libraries", "Red Hat AI Components"). Otherwise branding.application.title is used. */
  productName?: string;
}) => {
  const branding = useBranding();
  const baseTitle = branding.application.title;
  // Avoid duplication: use baseTitle as suffix when title already equals or contains productName
  const suffix =
    productName != null &&
    title != null &&
    (title === productName || title.includes(productName))
      ? baseTitle
      : productName ?? baseTitle;
  // Never show "| Packages" in the tab title
  const documentTitle =
    suffix === "Packages"
      ? title ?? baseTitle
      : title
        ? `${title} | ${suffix}`
        : suffix;

  return <title>{documentTitle}</title>;
};
