const CONTACT_RE =
  /(\+?\d[\d\s().-]{7,}\d)|([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|(https?:\/\/|www\.)/i;

const WORD_RE = /[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F\u0600-\u06FF0-9]+/g;

export function countWords(text = ""): number {
  const matches = String(text).match(WORD_RE);
  return matches ? matches.length : 0;
}

export function containsContactDetails(text = ""): boolean {
  return CONTACT_RE.test(String(text));
}

export function looksMeaningful(text = ""): boolean {
  const raw = String(text).trim();
  if (raw.length < 40) return false;

  const words = raw.match(WORD_RE) || [];
  if (words.length < 150) return false;

  const letters = (raw.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F\u0600-\u06FF]/g) || [])
    .length;
  const letterRatio = letters / Math.max(raw.replace(/\s/g, "").length, 1);
  if (letterRatio < 0.55) return false;

  const unique = new Set(raw.toLowerCase().replace(/\s+/g, ""));
  if (unique.size < 12) return false;
  if (/(.)\1{6,}/i.test(raw)) return false;

  const avgLen = words.reduce((s, w) => s + w.length, 0) / words.length;
  if (avgLen < 2.2 || avgLen > 14) return false;

  const consonantHeavy = words.filter((w) => {
    if (w.length < 5) return false;
    const vowels = (w.match(/[aeiouаеёиоуыэюяاويىَُِ\u0905-\u0914]/gi) || []).length;
    return vowels / w.length < 0.12;
  }).length;
  if (consonantHeavy / words.length > 0.35) return false;

  return true;
}

export function validateRequirementDetails(text = ""): {
  ok: boolean;
  code?: string;
  message?: string;
  words: number;
} {
  const trimmed = String(text).trim();
  const words = countWords(trimmed);
  if (!trimmed) return { ok: false, code: "empty", message: "Please describe your requirement.", words };
  if (containsContactDetails(trimmed)) {
    return {
      ok: false,
      code: "contact",
      message: "Please don't share any contact details (phone, email, website etc) here.",
      words,
    };
  }
  if (words < 150) {
    return {
      ok: false,
      code: "short",
      message: `Please write at least 150 words (currently ${words}).`,
      words,
    };
  }
  if (!looksMeaningful(trimmed)) {
    return {
      ok: false,
      code: "gibberish",
      message: "Please write a clear, meaningful description of what you need.",
      words,
    };
  }
  return { ok: true, words };
}
