export type AnalyticsEventName =
  | "blog_click"
  | "experience_click"
  | "project_click"
  | "cta_click"
  | "external_link_click"
  | "file_download_click";

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "event" | "config" | "js",
      target: string | Date,
      params?: AnalyticsEventParams
    ) => void;
  }
}

export function trackEvent(
  eventName: AnalyticsEventName,
  params: AnalyticsEventParams = {}
) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, {
    ...params,
    page_location: params.page_location ?? window.location.href,
  });
}

export function getLinkDomain(destinationUrl?: string | null) {
  if (!destinationUrl || typeof window === "undefined") return "";
  try {
    return new URL(destinationUrl, window.location.href).hostname;
  } catch {
    return "";
  }
}

export function isExternalUrl(destinationUrl?: string | null) {
  if (!destinationUrl || typeof window === "undefined") return false;
  if (destinationUrl.startsWith("mailto:") || destinationUrl.startsWith("tel:")) {
    return false;
  }
  const domain = getLinkDomain(destinationUrl);
  return Boolean(domain && domain !== window.location.hostname);
}

export function getFileNameFromUrl(fileUrl?: string | null) {
  if (!fileUrl || typeof window === "undefined") return "";
  try {
    const pathname = new URL(fileUrl, window.location.href).pathname;
    return decodeURIComponent(pathname.split("/").filter(Boolean).pop() ?? "");
  } catch {
    return "";
  }
}

export function getFileTypeFromUrl(fileUrl?: string | null) {
  const fileName = getFileNameFromUrl(fileUrl);
  const extension = fileName.split(".").pop();
  return extension && extension !== fileName ? extension.toLowerCase() : "";
}

export function isDownloadUrl(fileUrl?: string | null) {
  return /(?:pdf|doc|docx|xls|xlsx|ppt|pptx|zip|csv)$/i.test(
    getFileTypeFromUrl(fileUrl)
  );
}

