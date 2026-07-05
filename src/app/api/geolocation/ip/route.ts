import { NextRequest, NextResponse } from "next/server";
import { fetchGeoapifyIp, resolveGeoLookupIp } from "@/lib/geoapify-server";

export async function GET(request: NextRequest) {
  const queryIp = request.nextUrl.searchParams.get("ip");
  const { ip, source } = resolveGeoLookupIp(request, queryIp);

  if (!ip) {
    return NextResponse.json(
      { location: null, geoapify: null, resolvedIp: null, ipSource: source },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Location-Source": "none",
        },
      },
    );
  }

  const result = await fetchGeoapifyIp(ip);
  return NextResponse.json(
    { ...result, resolvedIp: ip, ipSource: source },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Location-Source": "geoapify-ip",
        "X-Client-IP": ip,
        "X-IP-Source": source,
      },
    },
  );
}
