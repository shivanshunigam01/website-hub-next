import { SEO_FAQ_ITEMS } from "@/lib/seo-faq";
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
        description:
          "TeacherPoint connects students and parents with tutors, online courses, teaching jobs, and student services.",
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

export function buildFaqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/faq#faq`,
    mainEntity: SEO_FAQ_ITEMS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

export function buildTutorProfileJsonLd(tutor: {
  id: string;
  name: string;
  description?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": tutor.url,
    mainEntity: {
      "@type": "Person",
      name: tutor.name,
      description: tutor.description,
      url: tutor.url,
    },
  };
}

export function buildCourseJsonLd(course: {
  id: string;
  title: string;
  description?: string;
  url: string;
  price?: number;
  currency?: string;
}) {
  const offer =
    course.price && course.price > 0
      ? {
          "@type": "Offer",
          price: course.price,
          priceCurrency: course.currency || "INR",
          availability: "https://schema.org/InStock",
          url: course.url,
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": course.url,
    name: course.title,
    description: course.description,
    url: course.url,
    provider: { "@id": `${SITE_URL}/#organization` },
    ...(offer ? { offers: offer } : { isAccessibleForFree: true }),
  };
}
