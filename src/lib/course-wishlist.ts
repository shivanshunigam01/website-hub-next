const WISHLIST_KEY = "tp.courseWishlist";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

export function isCourseInWishlist(courseId: string): boolean {
  return readIds().includes(courseId);
}

/** Returns true if the course is now on the wishlist. */
export function toggleCourseWishlist(courseId: string): boolean {
  const ids = readIds();
  const idx = ids.indexOf(courseId);
  if (idx >= 0) {
    ids.splice(idx, 1);
    writeIds(ids);
    return false;
  }
  ids.unshift(courseId);
  writeIds(ids);
  return true;
}
