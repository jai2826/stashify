/**
 * Categorizes a MIME type, treating GIFs as a unique type.
 * @param {string} mimeType - The MIME type string (e.g., 'image/gif')
 * @returns {string} - Returns 'image', 'video', 'audio', 'gif', or 'other'
 */
export default function getFileType(
  mimeType: string
): string {
  if (!mimeType) return "unknown";

  const lowerMime = mimeType.toLowerCase();

  // Check for GIF specifically first
  if (lowerMime === "image/gif") {
    return "gif";
  }

  // Extract the base type for general categorization
  const baseType = lowerMime.split("/")[0];

  switch (baseType) {
    case "image":
      return "image";
    case "video":
      return "video";
    case "audio":
      return "audio";
    default:
      return "other";
  }
}
