"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDetectedPhoneCountryCode } from "@/hooks/use-detected-phone-country-code";
import {
  PHONE_COUNTRY_CODES,
  findPhoneCountryByCode,
  formatPhoneCountryOption,
} from "@/lib/phone-codes";
import { cn } from "@/lib/utils";

type PhoneNumberFieldProps = {
  id?: string;
  label?: string;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (number: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  /** Auto-set dial code from GPS / IP / locale when the user has no saved phone */
  autoDetectCountry?: boolean;
  /** Skip auto-detect when the account already has a stored phone */
  userHasSavedPhone?: boolean;
  /** WhatsApp-verified number — user cannot change country or digits */
  locked?: boolean;
};

export function PhoneNumberField({
  id = "phoneNumber",
  label = "Phone",
  countryCode,
  onCountryCodeChange,
  phoneNumber,
  onPhoneNumberChange,
  required = true,
  placeholder = "9876543210",
  className,
  autoDetectCountry = true,
  userHasSavedPhone = false,
  locked = false,
}: PhoneNumberFieldProps) {
  const manualPickRef = useRef(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const shouldDetect = autoDetectCountry && !userHasSavedPhone && !locked;
  const { phoneCountryCode: detectedCode } = useDetectedPhoneCountryCode(shouldDetect);

  const selected = findPhoneCountryByCode(countryCode);

  useEffect(() => {
    if (!shouldDetect || manualPickRef.current || !detectedCode) return;
    if (detectedCode !== countryCode) {
      onCountryCodeChange(detectedCode);
    }
  }, [shouldDetect, detectedCode, countryCode, onCountryCodeChange]);

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1 flex gap-2">
        <Popover open={codeOpen} onOpenChange={setCodeOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={codeOpen}
              aria-label="Search country code"
              disabled={locked}
              className="h-10 w-[min(100%,11rem)] shrink-0 justify-between px-2.5 font-normal sm:w-[11rem]"
            >
              <span className="truncate text-left text-sm">
                {selected ? formatPhoneCountryOption(selected) : countryCode}
              </span>
              <ChevronsUpDown className="ms-1 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(100vw-2rem,20rem)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search country or code…" />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {PHONE_COUNTRY_CODES.map((entry) => (
                    <CommandItem
                      key={`${entry.code}-${entry.label}`}
                      value={`${entry.label} ${entry.code}`}
                      onSelect={() => {
                        manualPickRef.current = true;
                        onCountryCodeChange(entry.code);
                        setCodeOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          countryCode === entry.code ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{formatPhoneCountryOption(entry)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          id={id}
          name={id}
          type="tel"
          inputMode="numeric"
          required={required}
          placeholder={placeholder}
          value={phoneNumber}
          readOnly={locked}
          disabled={locked}
          onChange={(e) => onPhoneNumberChange(e.target.value.replace(/[^\d\s-]/g, ""))}
          className="flex-1"
        />
      </div>
    </div>
  );
}
