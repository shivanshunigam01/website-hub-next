"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearch } from "@/lib/navigation";
import { Building2, Globe2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore, type Accommodation } from "@/hooks/use-admin-store";
import { AccommodationCard } from "@/components/accommodation/AccommodationCard";
import { AccommodationEnquiryDialog } from "@/components/accommodation/AccommodationEnquiryDialog";
import { useLocationContext } from "@/hooks/use-user-location";
import {
  getAccommodationsForUser,
  userCountryLabel,
} from "@/lib/accommodation-location";
import { canonicalUrl } from "@/lib/site-config";

type Search = { city?: string; enquiry?: string };

function AccommodationPage() {
  const { t } = useTranslation("common");
  const { accommodations } = useAdminStore();
  const { location, hasLocationAccess, isLoading: locationLoading } = useLocationContext();
  const search = useSearch<Search>();
  const [q, setQ] = useState(search.city ?? "");
  const [type, setType] = useState<string>("all");
  const [gender, setGender] = useState<string>("all");
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [selected, setSelected] = useState<Accommodation | null>(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    if (search.city) setQ(search.city);
  }, [search.city]);

  useEffect(() => {
    if (!search.enquiry) return;
    const match = accommodations.find((a) => a.id === search.enquiry);
    if (match) {
      setSelected(match);
      setEnquiryOpen(true);
    }
  }, [search.enquiry, accommodations]);

  const countryLabel = userCountryLabel(location);
  const geoScoped = hasLocationAccess && !!countryLabel && !showAllCountries;

  const scopedList = useMemo(
    () =>
      getAccommodationsForUser(accommodations, location, hasLocationAccess, {
        includeAllCountries: showAllCountries,
      }),
    [accommodations, location, hasLocationAccess, showAllCountries],
  );

  const cities = useMemo(
    () => Array.from(new Set(scopedList.map((a) => a.city))).sort(),
    [scopedList],
  );

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return scopedList
      .filter((a) => (type === "all" ? true : a.type === type))
      .filter((a) => (gender === "all" ? true : a.gender === gender))
      .filter((a) =>
        term
          ? a.city.toLowerCase().includes(term) ||
            a.country.toLowerCase().includes(term) ||
            a.name.toLowerCase().includes(term) ||
            a.address.toLowerCase().includes(term)
          : true,
      );
  }, [scopedList, q, type, gender]);

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <header className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-primary">
          <Building2 className="h-3.5 w-3.5" />
          {t("accommodation.badge")}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          {t("accommodation.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {t("accommodation.subtitle", { count: cities.length })}
        </p>
      </header>

      {geoScoped && !locationLoading ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Globe2 className="h-4 w-4 text-primary" />
            <span>
              {t("accommodation.showingIn", { country: countryLabel })}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAllCountries(true)}>
            {t("accommodation.showAllCountries")}
          </Button>
        </div>
      ) : null}

      {showAllCountries && hasLocationAccess ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{t("accommodation.showingWorldwide")}</span>
          <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setShowAllCountries(false)}>
            {t("accommodation.backToCountry", {
              country: countryLabel ?? t("accommodation.myCountry", "my country"),
            })}
          </Button>
        </div>
      ) : null}

      <div className="mb-6 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("accommodation.searchPlaceholder")}
            className="ps-10"
            maxLength={120}
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder={t("accommodation.allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("accommodation.allTypes")}</SelectItem>
            <SelectItem value="PG">{t("accommodation.typePG")}</SelectItem>
            <SelectItem value="Hostel">{t("accommodation.typeHostel")}</SelectItem>
            <SelectItem value="Apartment">{t("accommodation.typeApartment")}</SelectItem>
            <SelectItem value="Shared Room">{t("accommodation.typeShared")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger>
            <SelectValue placeholder={t("accommodation.allStudents")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("accommodation.allStudents")}</SelectItem>
            <SelectItem value="boys">{t("accommodation.boys")}</SelectItem>
            <SelectItem value="girls">{t("accommodation.girls")}</SelectItem>
            <SelectItem value="co-ed">{t("accommodation.coed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 font-display text-lg font-bold">{t("accommodation.emptyTitle")}</h3>
          <p className="text-sm text-muted-foreground">
            {geoScoped
              ? t("accommodation.emptyGeo", { country: countryLabel })
              : t("accommodation.emptyGeneric")}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQ("");
                setType("all");
                setGender("all");
              }}
            >
              {t("accommodation.clearFilters")}
            </Button>
            {geoScoped ? (
              <Button size="sm" onClick={() => setShowAllCountries(true)}>
                {t("accommodation.showAllCountries")}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <AccommodationCard
              key={a.id}
              accommodation={a}
              onInquire={(item) => {
                setSelected(item);
                setEnquiryOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <AccommodationEnquiryDialog
        accommodation={selected}
        open={enquiryOpen && !!selected}
        onOpenChange={(open) => {
          setEnquiryOpen(open);
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}

export default AccommodationPage;
