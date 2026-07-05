"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SELECT_OTHER_VALUE,
  splitEnumOtherField,
  splitSelectWithOther,
  toSelectOptions,
  withOtherOption,
  type SelectWithOtherOption,
} from "@/lib/select-with-other";

type BaseProps = {
  options: readonly string[] | readonly SelectWithOtherOption[];
  placeholder?: string;
  otherLabel?: string;
  otherPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  selectClassName?: string;
  id?: string;
  name?: string;
};

/** Free-text field — custom value is saved directly (e.g. grade, subject). */
type FreeTextProps = BaseProps & {
  mode?: "free-text";
  value: string;
  onValueChange: (value: string) => void;
};

/** Enum field — selecting Other stores enum sentinel + separate custom text (e.g. gender, teacherType). */
type EnumOtherProps = BaseProps & {
  mode: "enum-other";
  value: string;
  customValue?: string;
  onValueChange: (value: string) => void;
  onCustomValueChange: (custom: string) => void;
  otherEnumValue?: string;
};

export type SelectWithOtherProps = FreeTextProps | EnumOtherProps;

export function SelectWithOther(props: SelectWithOtherProps) {
  const {
    options: rawOptions,
    placeholder = "Select an option",
    otherLabel = "Other",
    otherPlaceholder = "Please specify…",
    disabled,
    required,
    className,
    selectClassName,
    id: idProp,
    name,
  } = props;

  const autoId = useId();
  const selectId = idProp ?? autoId;
  const otherInputId = `${selectId}-other`;

  const options = useMemo(() => toSelectOptions(rawOptions), [rawOptions]);
  const selectOptions = useMemo(() => withOtherOption(options, otherLabel), [options, otherLabel]);

  const parsed = useMemo(() => {
    if (props.mode === "enum-other") {
      return splitEnumOtherField(
        props.value,
        props.customValue,
        options,
        props.otherEnumValue ?? "other",
      );
    }
    return splitSelectWithOther(props.value, options);
  }, [props, options]);

  const [selectValue, setSelectValue] = useState(parsed.selectValue);
  const [otherText, setOtherText] = useState(parsed.otherText);

  useEffect(() => {
    setSelectValue(parsed.selectValue);
    setOtherText(parsed.otherText);
  }, [parsed.selectValue, parsed.otherText]);

  const showOtherInput = selectValue === SELECT_OTHER_VALUE;

  const emitFreeText = (nextSelect: string, nextOther: string) => {
    if (props.mode === "enum-other") return;
    if (nextSelect === SELECT_OTHER_VALUE) {
      props.onValueChange(nextOther.trim());
      return;
    }
    props.onValueChange(nextSelect);
  };

  const emitEnumOther = (nextSelect: string, nextOther: string) => {
    if (props.mode !== "enum-other") return;
    const otherEnum = props.otherEnumValue ?? "other";
    if (nextSelect === SELECT_OTHER_VALUE) {
      props.onValueChange(otherEnum);
      props.onCustomValueChange(nextOther.trim());
      return;
    }
    props.onValueChange(nextSelect);
    props.onCustomValueChange("");
  };

  const handleSelectChange = (next: string) => {
    setSelectValue(next);
    if (props.mode === "enum-other") {
      emitEnumOther(next, otherText);
    } else {
      emitFreeText(next, otherText);
    }
  };

  const handleOtherChange = (nextOther: string) => {
    setOtherText(nextOther);
    if (props.mode === "enum-other") {
      emitEnumOther(SELECT_OTHER_VALUE, nextOther);
    } else {
      emitFreeText(SELECT_OTHER_VALUE, nextOther);
    }
  };

  return (
    <div className={className}>
      <Select value={selectValue || undefined} onValueChange={handleSelectChange} disabled={disabled}>
        <SelectTrigger id={selectId} className={selectClassName} aria-required={required}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {selectOptions.map((opt) => (
            <SelectItem key={`${opt.value}-${opt.label}`} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {name && !showOtherInput ? <input type="hidden" name={name} value={selectValue} /> : null}
      {name && showOtherInput ? (
        <input
          type="hidden"
          name={name}
          value={props.mode === "enum-other" ? (props.otherEnumValue ?? "other") : otherText}
        />
      ) : null}
      {showOtherInput && (
        <div className="mt-2">
          <Label htmlFor={otherInputId} className="sr-only">
            {otherPlaceholder}
          </Label>
          <Input
            id={otherInputId}
            value={otherText}
            onChange={(e) => handleOtherChange(e.target.value)}
            placeholder={otherPlaceholder}
            disabled={disabled}
            required={required}
          />
        </div>
      )}
    </div>
  );
}
