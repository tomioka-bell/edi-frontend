export const buildImageURL = (
  p?: string,
  baseOverride?: string
): string => {
  if (!p) return "";

  if (/^https?:\/\//i.test(p)) return p;

  const base =
    baseOverride ||
    (import.meta.env.VITE_API_BASE_URL as string);

  if (!base) return p;

  let folder = "profile";
  let filename = p;

  if (p.includes("/uploads/")) {
    const subPath = p.split("/uploads/")[1];
    const parts = subPath.split("/");

    filename = parts.pop() || "";
    folder = parts.join("/");
  } else {
    filename = p.split("/").pop() || p;
  }

  const encodedFilename = encodeURIComponent(filename);

  return `${base}/api/uploads/get-file?folder=${folder}&filename=${encodedFilename}`;
};
