import { NextResponse } from "next/server";
import { getGeoapifyApiKey } from "@/lib/geoapify-server";

export type AddressSuggestion = {
  id: string;
  label: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
};

/** GET /api/geolocation/autocomplete?q=delhi */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] as AddressSuggestion[] });
  }

  const key = getGeoapifyApiKey();
  if (!key) {
    return NextResponse.json(
      { suggestions: [], error: "Geocoding is not configured" },
      { status: 503 },
    );
  }

  const params = new URLSearchParams({
    text: q,
    apiKey: key,
    limit: "8",
    format: "json",
  });

  try {
    const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return NextResponse.json({ suggestions: [], error: "Lookup failed" }, { status: 502 });
    }
    const data = (await res.json()) as {
      results?: Array<{
        place_id?: string;
        formatted?: string;
        city?: string;
        county?: string;
        state?: string;
        country?: string;
        lat?: number;
        lon?: number;
      }>;
    };

    const suggestions: AddressSuggestion[] = (data.results || [])
      .map((r) => ({
        id: String(r.place_id || `${r.lat},${r.lon},${r.formatted}`),
        label: r.formatted || [r.city, r.state, r.country].filter(Boolean).join(", "),
        city: r.city || r.county || r.state || "",
        country: r.country || "",
        lat: r.lat,
        lng: r.lon,
      }))
      .filter((s) => s.label.length >= 5);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [], error: "Lookup failed" }, { status: 502 });
  }
}
