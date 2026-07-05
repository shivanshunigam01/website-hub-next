import type { LocationDetectResult } from "@/lib/geolocation-types";
import { parseGeoapifyIpResponse, parseGeoapifyReverseResponse } from "@/lib/geoapify-parse";
import type { GeoapifyReverseResponse } from "@/lib/geolocation-types";

/** Runtime key on Vercel/server (not baked into the client bundle). */
export function getGeoapifyApiKey(): string {
  return (
    process.env.GEOAPIFY_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY?.trim() ||
    process.env.VITE_GEOAPIFY_API_KEY?.trim() ||
    ""
  );
}

export function clientIpFromRequest(request: Request): string | undefined {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return request.headers.get("x-real-ip")?.trim() || undefined;
}

export function resolveGeoLookupIp(request: Request, queryIp?: string | null): {
  ip?: string;
  source: "client-reported" | "connection" | "none";
} {
  const trimmed = queryIp?.trim();
  if (trimmed && isPublicIp(trimmed)) {
    return { ip: trimmed, source: "client-reported" };
  }

  const connectionIp = clientIpFromRequest(request);
  if (connectionIp && isPublicIp(connectionIp)) {
    return { ip: connectionIp, source: "connection" };
  }

  return { source: "none" };
}

function isPublicIp(ip: string): boolean {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return false;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("127.")) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return false;
  return true;
}

function maskKey(url: string): string {
  return url.replace(/apiKey=[^&]+/, "apiKey=***");
}

export async function fetchGeoapifyIp(clientIp?: string): Promise<LocationDetectResult> {
  const key = getGeoapifyApiKey();
  const started = Date.now();
  const endpoint = "https://api.geoapify.com/v1/ipinfo";

  if (!key) {
    console.error("[Geoapify] Missing GEOAPIFY_API_KEY or NEXT_PUBLIC_GEOAPIFY_API_KEY on server");
    return {
      location: null,
      geoapify: null,
      debug: {
        source: "ip",
        clientIp,
        geoapifyEndpoint: endpoint,
        geoapifyHttpStatus: 0,
        durationMs: Date.now() - started,
        note: "API key missing on server",
      },
    };
  }

  const params = new URLSearchParams({ apiKey: key });
  if (clientIp) params.set("ip", clientIp);

  const url = `${endpoint}?${params}`;
  const res = await fetch(url);
  const durationMs = Date.now() - started;

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[Geoapify] ipinfo failed", res.status, body.slice(0, 300));
    return {
      location: null,
      geoapify: null,
      debug: {
        source: "ip",
        clientIp,
        geoapifyEndpoint: maskKey(url),
        geoapifyHttpStatus: res.status,
        durationMs,
        note: body.slice(0, 200),
      },
    };
  }

  const data = (await res.json()) as Record<string, unknown>;
  const parsed = parseGeoapifyIpResponse(data);
  const cityObj = data.city as { name?: string } | string | undefined;
  const countryObj = data.country as { name?: string; iso_code?: string } | string | undefined;

  console.info("[Geoapify] ipinfo OK", {
    clientIp: clientIp ?? "(auto-detect)",
    city: typeof cityObj === "object" ? cityObj?.name : cityObj,
    country: typeof countryObj === "object" ? countryObj?.name : countryObj,
    resolved: parsed.location,
    ms: durationMs,
  });

  return {
    ...parsed,
    debug: {
      source: "ip",
      clientIp,
      geoapifyEndpoint: maskKey(url),
      geoapifyHttpStatus: res.status,
      geoapifyCityRaw: typeof cityObj === "object" ? cityObj?.name : String(cityObj ?? ""),
      geoapifyCountryRaw:
        typeof countryObj === "object" ? countryObj?.name : String(countryObj ?? ""),
      resolvedCity: parsed.location?.city,
      resolvedCountry: parsed.location?.country,
      durationMs,
      note:
        "IP geolocation uses your ISP/network exit point — city can differ from GPS (e.g. Mumbai vs Ahmedabad). Allow browser location for accuracy.",
    },
  };
}

export async function fetchGeoapifyReverse(lat: number, lon: number): Promise<LocationDetectResult> {
  const key = getGeoapifyApiKey();
  const started = Date.now();
  const endpoint = "https://api.geoapify.com/v1/geocode/reverse";

  if (!key) {
    console.error("[Geoapify] Missing GEOAPIFY_API_KEY or NEXT_PUBLIC_GEOAPIFY_API_KEY on server");
    return {
      location: null,
      geoapify: null,
      debug: {
        source: "reverse",
        geoapifyEndpoint: endpoint,
        geoapifyHttpStatus: 0,
        durationMs: Date.now() - started,
        note: "API key missing on server",
      },
    };
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    apiKey: key,
  });
  const url = `${endpoint}?${params}`;
  const res = await fetch(url);
  const durationMs = Date.now() - started;

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[Geoapify] reverse failed", res.status, body.slice(0, 300));
    return {
      location: null,
      geoapify: null,
      debug: {
        source: "reverse",
        geoapifyEndpoint: maskKey(url),
        geoapifyHttpStatus: res.status,
        durationMs,
        note: body.slice(0, 200),
      },
    };
  }

  const data = (await res.json()) as GeoapifyReverseResponse;
  const parsed = parseGeoapifyReverseResponse(data);
  const props = data.features?.[0]?.properties;

  console.info("[Geoapify] reverse OK", {
    lat,
    lon,
    city: props?.city,
    state: props?.state,
    country: props?.country,
    resolved: parsed.location,
    ms: durationMs,
  });

  return {
    ...parsed,
    debug: {
      source: "reverse",
      geoapifyEndpoint: maskKey(url),
      geoapifyHttpStatus: res.status,
      geoapifyCityRaw: props?.city,
      geoapifyCountryRaw: props?.country,
      resolvedCity: parsed.location?.city,
      resolvedCountry: parsed.location?.country,
      durationMs,
      note: "Resolved from GPS coordinates (browser geolocation).",
    },
  };
}
