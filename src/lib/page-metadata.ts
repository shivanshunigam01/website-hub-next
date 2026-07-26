import type { Metadata } from "next";
import {
  DEFAULT_PAGE_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_URL,
  TWITTER_HANDLE,
  absoluteUrl,
} from "@/lib/site-config";
import { mergeSeoCopy } from "@/lib/seo-content";
import { keywordsForPage } from "@/lib/seo-keywords";

export type RouteMetaEntry = {
  title: string;
  description?: string;
  noIndex?: boolean;
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
  };
};

/** Per-route SEO — mirrors TanStack `head()` configs from website-hub */
export const ROUTE_METADATA: Record<string, RouteMetaEntry> = {
  "/": {
    title: DEFAULT_PAGE_TITLE,
    description: SITE_DESCRIPTION,
    openGraph: {
      title: `${SITE_NAME} — Learn from the best`,
      description: "The trusted edtech exchange for tutors, courses, and student services.",
    },
  },
  "/about": {
    title: "About · TeacherPoint",
    description: "TeacherPoint's mission, story and team.",
  },
  "/accommodation": {
    title: "Student Accommodation — PG, Hostel & Stays · TeacherPoint",
    description:
      "Find verified PGs, student hostels and apartments near your coaching, college or city. Browse options, enquire instantly, and move in stress-free.",
    openGraph: {
      title: "Student Accommodation — TeacherPoint",
      description: "Verified PGs, hostels and student apartments around the world.",
    },
  },
  "/admin": { title: "Admin Dashboard · TeacherPoint", noIndex: true },
  "/assignment-help": {
    title: "Assignment Help · TeacherPoint",
    description: "Get expert help with assignments, projects and homework — submit your brief and receive quotes in minutes.",
  },
  "/assignment-jobs": {
    title: "Assignment Jobs · TeacherPoint",
    description: "Earn online by solving assignments in your subject. Fresh briefs daily, fast payouts.",
  },
  "/contact": {
    title: "Contact · TeacherPoint",
    description: "Get in touch with the TeacherPoint team.",
  },
  "/courses": {
    title: "Courses · TeacherPoint",
    description: "Browse expert-led courses with industry-recognized certificates.",
  },
  "/faq": {
    title: "FAQ · TeacherPoint",
    description: "Common questions about TeacherPoint.",
  },
  "/forgot-password": {
    title: "Forgot password · TeacherPoint",
    description: "Reset your TeacherPoint student, tutor, or parent account password.",
  },
  "/home-teaching": {
    title: "Home Teaching Jobs · TeacherPoint",
    description: "Find in-person home tutoring jobs in your neighbourhood. Set your radius, rate and schedule.",
  },
  "/home-tutors": {
    title: "Home Tutors · TeacherPoint",
    description: "Find verified home tutors near you for in-person tutoring across all subjects and grades.",
  },
  "/login": {
    title: "Log in · TeacherPoint",
    description: "Log in to your TeacherPoint account.",
  },
  "/lms": { title: "Course builder · TeacherPoint", noIndex: true },
  "/marketing": {
    title: "Marketing & Partners · TeacherPoint",
    description: "Backlinks, partner network and SEO assets for TeacherPoint.",
    openGraph: {
      title: "Marketing & Partners · TeacherPoint",
      description: "Our partner network and SEO marketing kit.",
    },
  },
  "/marketplace": {
    title: "Student Exchange · Buy & Sell with TeacherPoint",
    description:
      "Student Exchange — buy & sell study materials, books, devices, services, ride share and accommodation.",
    openGraph: {
      title: "TeacherPoint Student Exchange — Buy, Sell, Share",
      description: "Classifieds for the learning community. Free to post for students.",
      url: "/marketplace",
    },
  },
  "/offline": {
    title: "You're offline · TeacherPoint",
    description: "No internet connection — your cached content is still available.",
    noIndex: true,
  },
  "/online-teaching": {
    title: "Online Teaching Jobs · TeacherPoint",
    description: "Teach from anywhere. Online tutoring jobs with students worldwide, paid weekly.",
  },
  "/online-tutors": {
    title: "Online Tutors · TeacherPoint",
    description: "Learn live from verified online tutors over video — flexible schedules, every subject.",
  },
  "/messages": { title: "Messages · TeacherPoint", noIndex: true },
  "/my-posts": { title: "My Posts · TeacherPoint", noIndex: true },
  "/parent": { title: "Parent Dashboard · TeacherPoint", noIndex: true },
  "/payments": { title: "Payments · TeacherPoint", noIndex: true },
  "/post-requirement": {
    title: "Post a Tutoring Requirement · TeacherPoint",
    description:
      "Post your tutoring need and get matched with verified teachers. Set subject, budget, and schedule in minutes.",
  },
  "/pricing": {
    title: "Pricing · TeacherPoint",
    description: "Free, Pro and Premium plans for every learner.",
  },
  "/privacy": {
    title: "Privacy Policy · TeacherPoint",
    description: "How TeacherPoint collects, uses, and protects your personal data.",
    openGraph: {
      title: "Privacy Policy · TeacherPoint",
      description: "Read our privacy policy before using TeacherPoint.",
    },
  },
  "/profile": { title: "Complete your profile · TeacherPoint" },
  "/refund": {
    title: "Refund & Cancellation Policy · TeacherPoint",
    description: "Refund and cancellation rules for courses, tutor sessions, and subscriptions on TeacherPoint.",
    openGraph: {
      title: "Refund & Cancellation Policy · TeacherPoint",
      description: "Understand when refunds apply on TeacherPoint purchases.",
    },
  },
  "/register": {
    title: "Create account · TeacherPoint",
    description: "Sign up free for TeacherPoint.",
  },
  "/reset-password": {
    title: "Reset password · TeacherPoint",
    description: "Choose a new TeacherPoint account password.",
  },
  "/reviews": { title: "Reviews · TeacherPoint" },
  "/role-select": { title: "Sign up · TeacherPoint" },
  "/student": { title: "Student Dashboard · TeacherPoint", noIndex: true },
  "/support": { title: "Support · TeacherPoint" },
  "/teacher": { title: "Teacher Dashboard · TeacherPoint", noIndex: true },
  "/teacher/onboarding/profile": { title: "Complete tutor profile · TeacherPoint" },
  "/teaching-jobs": {
    title: "Teaching Jobs · TeacherPoint",
    description: "Browse verified teaching jobs near you — online, home and institutional roles across every subject.",
  },
  "/terms": {
    title: "Terms and Conditions · TeacherPoint",
    description: "Terms of use for students and tutors on TeacherPoint.",
    openGraph: {
      title: "Terms and Conditions · TeacherPoint",
      description: "Read the terms for students and tutors before signing up.",
    },
  },
  "/tutor-jobs": {
    title: "Find Tutor Jobs · TeacherPoint",
    description:
      "Browse tutoring jobs posted by students and approved by TeacherPoint — online, home, and hybrid roles.",
  },
  "/tutors": {
    title: "Find a Tutor · TeacherPoint",
    description: "Advanced tutor search by subject, location, online or in-person, verified badge, rating and price.",
  },
  "/verify-email": { title: "Verify your email · TeacherPoint", noIndex: true },
  "/workshops": {
    title: "Workshops · TeacherPoint",
    description:
      "Join live workshops led by expert tutors — online or in person. Browse upcoming sessions and register in one click.",
  },
};

export const DYNAMIC_ROUTE_METADATA: Record<string, RouteMetaEntry> = {
  "/courses": { title: "Course · TeacherPoint" },
  "/tutor-jobs": { title: "Tutor Job · TeacherPoint" },
  "/tutors": { title: "Tutor · TeacherPoint" },
  "/workshops": { title: "Workshop · TeacherPoint" },
};

export function buildMetadata({
  title = DEFAULT_PAGE_TITLE,
  description = SITE_DESCRIPTION,
  path = "/",
  noIndex = false,
  openGraph,
  keywords,
}: RouteMetaEntry & { path?: string; keywords?: string[] }): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = openGraph?.title ?? title;
  const ogDescription = openGraph?.description ?? description;
  const ogUrl = openGraph?.url ? absoluteUrl(openGraph.url) : url;
  const keywordList = keywords ?? keywordsForPage(path);

  return {
    title,
    description,
    keywords: keywordList,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    category: "education",
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: ogUrl,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [{ url: SITE_OG_IMAGE, alt: `${SITE_NAME} logo` }],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: ogTitle,
      description: ogDescription,
      images: [SITE_OG_IMAGE],
    },
    applicationName: SITE_NAME,
    appleWebApp: {
      capable: true,
      title: SITE_NAME,
      statusBarStyle: "black-translucent",
    },
  };
}

export function metadataForPath(path: string): Metadata {
  const base = ROUTE_METADATA[path] ?? {
    title: DEFAULT_PAGE_TITLE,
    description: SITE_DESCRIPTION,
  };
  const entry = mergeSeoCopy(path, base);
  return buildMetadata({ ...entry, path, keywords: keywordsForPage(path) });
}

export function createStaticPageMetadata(path: string) {
  return function generateMetadata() {
    return metadataForPath(path);
  };
}

export function createDynamicPageMetadata(routePrefix: string) {
  const entry = DYNAMIC_ROUTE_METADATA[routePrefix] ?? { title: DEFAULT_PAGE_TITLE };
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ id: string }>;
  }): Promise<Metadata> {
    const { id } = await params;
    return buildMetadata({ ...entry, path: `${routePrefix}/${id}` });
  };
}
