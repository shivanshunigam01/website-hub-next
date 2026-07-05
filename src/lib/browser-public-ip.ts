/**
 * Detect the visitor's public IP from the browser (same network path as Google, etc.).
 * Helps when VPN split-tunnel sends api.teacherpoint.org direct but other sites via VPN.
 */
export async function detectBrowserPublicIp(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const providers = [
    "https://api64.ipify.org?format=json",
    "https://api.ipify.org?format=json",
  ];

  for (const url of providers) {
    try {
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = (await res.json()) as { ip?: string };
      const ip = data.ip?.trim();
      if (ip) return ip;
    } catch {
      // try next provider
    }
  }

  return null;
}

function isPublicIp(ip: string): boolean {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return false;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("127.")) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return false;
  return true;
}

export function isBrowserPublicIp(ip: string | null | undefined): ip is string {
  return !!ip && isPublicIp(ip);
}
