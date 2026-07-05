import { FAQS } from "@/data/mock";
import { POPULAR_SUBJECT_LINKS } from "@/lib/seo-keywords";
import {
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_URL,
  SOCIAL_LINKS,
} from "@/lib/site-config";

export function buildGlobalJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: SITE_OG_IMAGE, width: 512, height: 512 },
        description: "Global edtech platform connecting students with verified tutors and online teachers.",
        email: CONTACT_EMAIL,
        sameAs: Object.values(SOCIAL_LINKS),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: CONTACT_EMAIL,
          availableLanguage: ["English", "Hindi", "Arabic", "Spanish", "French", "German", "Italian", "Chinese"],
        },
      },
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#educational-organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
        areaServed: "Worldwide",
        knowsAbout: POPULAR_SUBJECT_LINKS.map((s) => s.label),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["en", "hi", "ar", "es", "fr", "de", "it", "zh"],
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/tutors?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#popular-subjects`,
        name: "Popular tutoring subjects",
        itemListElement: POPULAR_SUBJECT_LINKS.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          url: `${SITE_URL}/tutors?subject=${encodeURIComponent(item.subject)}`,
        })),
      },
    ],
  };
}
