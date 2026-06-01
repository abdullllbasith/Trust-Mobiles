export function normalizeImages(images: unknown): string[] {
  if (!images) return [];

  if (Array.isArray(images)) {
    return images.filter((img): img is string => typeof img === "string" && img.trim().length > 0);
  }

  if (typeof images === "string") {
    const trimmed = images.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((img): img is string => typeof img === "string" && img.trim().length > 0);
        }
      } catch {
        return [trimmed];
      }
    }

    return [trimmed];
  }

  return [];
}
