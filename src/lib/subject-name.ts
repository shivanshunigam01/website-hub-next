export function normalizeSubjectName(raw: string): string {
  return String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

const KEYBOARD_MASH = ["asdf", "qwer", "zxcv", "hjkl", "asdasca", "zxcfas", "qwerty", "asdfgh", "zxcvbn"];

/** Client-side check before calling POST /subjects/ensure */
export function isValidSubjectName(raw: string): boolean {
  const name = normalizeSubjectName(raw);
  if (name.length < 2 || name.length > 80) return false;
  if (!/[\p{L}]/u.test(name)) return false;

  const lower = name.toLowerCase();
  if (KEYBOARD_MASH.some((p) => lower.includes(p))) return false;
  if (/(.)\1{3,}/u.test(lower)) return false;

  const letters = lower.replace(/[^\p{L}]/gu, "");
  if (letters.length >= 6) {
    const vowels = letters.replace(/[^aeiouàáâãäåæèéêëìíîïòóôõöùúûüýÿ]/gi, "").length;
    if (vowels === 0) return false;
    if (letters.length >= 8 && vowels / letters.length < 0.12) return false;
  }

  if (!/^[\p{L}\p{N}\s\-+.#&'/(),]+$/u.test(name)) return false;
  return true;
}
