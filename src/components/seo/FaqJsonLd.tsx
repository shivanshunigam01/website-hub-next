import { buildFaqPageJsonLd } from "@/lib/json-ld";

export function FaqJsonLd() {
  const jsonLd = buildFaqPageJsonLd();
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
