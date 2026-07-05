export const SELECT_OTHER_VALUE = "__other__";

export type SelectWithOtherOption = {
  value: string;
  label: string;
};

export function toSelectOptions(
  items: readonly string[] | readonly SelectWithOtherOption[],
): SelectWithOtherOption[] {
  return items.map((item) =>
    typeof item === "string" ? { value: item, label: item } : item,
  );
}

export function withOtherOption(
  options: SelectWithOtherOption[],
  label = "Other",
): SelectWithOtherOption[] {
  return [...options, { value: SELECT_OTHER_VALUE, label }];
}

/** Split a stored value into select + optional custom text (free-text fields). */
export function splitSelectWithOther(
  storedValue: string | undefined,
  options: SelectWithOtherOption[],
): { selectValue: string; otherText: string } {
  if (!storedValue?.trim()) return { selectValue: "", otherText: "" };
  if (options.some((o) => o.value === storedValue)) {
    return { selectValue: storedValue, otherText: "" };
  }
  return { selectValue: SELECT_OTHER_VALUE, otherText: storedValue };
}

/** Merge select + custom text for free-text fields. */
export function mergeSelectWithOther(
  selectValue: string,
  otherText: string,
  options: SelectWithOtherOption[],
): string {
  if (selectValue === SELECT_OTHER_VALUE) return otherText.trim();
  if (options.some((o) => o.value === selectValue)) return selectValue;
  return otherText.trim() || selectValue;
}

/** Split enum field stored as `other` + companion custom text. */
export function splitEnumOtherField(
  enumValue: string | undefined,
  customValue: string | undefined,
  options: SelectWithOtherOption[],
  otherEnumValue = "other",
): { selectValue: string; otherText: string } {
  if (enumValue === otherEnumValue) {
    return { selectValue: SELECT_OTHER_VALUE, otherText: customValue ?? "" };
  }
  if (enumValue && options.some((o) => o.value === enumValue)) {
    return { selectValue: enumValue, otherText: "" };
  }
  return { selectValue: "", otherText: "" };
}

export function mergeEnumOtherField(
  selectValue: string,
  otherText: string,
  otherEnumValue = "other",
): { value: string; custom: string } {
  if (selectValue === SELECT_OTHER_VALUE) {
    return { value: otherEnumValue, custom: otherText.trim() };
  }
  return { value: selectValue, custom: "" };
}
