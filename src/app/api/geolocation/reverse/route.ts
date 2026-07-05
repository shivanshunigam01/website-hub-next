import { NextRequest, NextResponse } from "next/server";
import { fetchGeoapifyReverse } from "@/lib/geoapify-server";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lon = Number(request.nextUrl.searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat and lon query params are required" }, { status: 400 });
  }

  const result = await fetchGeoapifyReverse(lat, lon);
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "private, max-age=300",
      "X-Location-Source": "geoapify-reverse",
    },
  });
}
