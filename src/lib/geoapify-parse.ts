import type { GeoapifyReverseResponse, LocationDetectResult, UserLocation } from "@/lib/geolocation-types";

type GeoapifyProps = NonNullable<GeoapifyReverseResponse["features"]>[number]["properties"];

function pickCity(props: GeoapifyProps | undefined): string {
  if (!props) return "";
  return (
    props.city ??
    props.suburb ??
    props.municipality ??
    props.district ??
    props.county ??
    props.state ??
    ""
  );
}

export function fromGeoapifyProps(props: GeoapifyProps | undefined): UserLocation | null {
  if (!props?.country) return null;
  return {
    country: props.country,
    countryCode: (props.country_code ?? "").toUpperCase(),
    city: pickCity(props),
    state: props.state,
    formatted: props.formatted,
  };
}

/** Normalize Geoapify /v1/ipinfo JSON into our location shape. */
export function parseGeoapifyIpResponse(data: Record<string, unknown>): LocationDetectResult {
  if (typeof data.country === "string") {
    const props = data as GeoapifyProps;
    return {
      location: fromGeoapifyProps(props),
      geoapify: { features: [{ properties: props }] },
    };
  }

  const featureProps = (data as GeoapifyReverseResponse).features?.[0]?.properties;
  if (featureProps?.country) {
    return {
      location: fromGeoapifyProps(featureProps),
      geoapify: data as GeoapifyReverseResponse,
    };
  }

  const countryObj = data.country as { name?: string; iso_code?: string; iso_alpha2?: string } | undefined;
  const countryName = countryObj?.name;
  if (!countryName) {
    return { location: null, geoapify: null };
  }

  const cityRaw = (data.city as { name?: string } | string | undefined);
  const city =
    typeof cityRaw === "string" ? cityRaw : typeof cityRaw === "object" ? cityRaw?.name ?? "" : "";

  const stateRaw = data.state;
  const state =
    typeof stateRaw === "object" && stateRaw !== null && "name" in stateRaw
      ? String((stateRaw as { name?: string }).name ?? "")
      : typeof stateRaw === "string"
        ? stateRaw
        : undefined;

  const props: GeoapifyProps = {
    country: countryName,
    country_code: String(countryObj?.iso_code ?? countryObj?.iso_alpha2 ?? "").toLowerCase(),
    city,
    state,
    formatted: typeof data.formatted === "string" ? data.formatted : undefined,
  };

  return {
    location: fromGeoapifyProps(props),
    geoapify: { features: [{ properties: props }] },
  };
}

export function parseGeoapifyReverseResponse(data: GeoapifyReverseResponse): LocationDetectResult {
  const props = data.features?.[0]?.properties;
  return {
    location: fromGeoapifyProps(props),
    geoapify: data,
  };
}
