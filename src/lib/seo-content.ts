import { DEFAULT_PAGE_TITLE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-config";
import type { RouteMetaEntry } from "@/lib/page-metadata";

/** Keyword-rich meta descriptions (150–160 chars) per public route. */
export const SEO_ROUTE_COPY: Record<string, RouteMetaEntry> = {
  "/": {
    title: DEFAULT_PAGE_TITLE,
    description:
      "Find verified online tutors and home teachers worldwide. Search by subject, read ratings & reviews, book qualified professionals, explore courses, teaching jobs, and free learning resources.",
    openGraph: {
      title: `${SITE_NAME} — Find online tutors & teachers worldwide`,
      description:
        "Trusted platform for students: search tutors by subject & local area, verified ID proof, ratings, courses, assignments help, and premium membership.",
    },
  },
  "/tutors": {
    title: "Find Verified Tutors Online & Local · TeacherPoint",
    description:
      "Search thousands of qualified tutors by subject, skill, level, and local area. Read ratings, reviews, and feedback. Choose highly verified online and home tutors near you.",
  },
  "/courses": {
    title: "Online Courses — Programming, Science & Skills · TeacherPoint",
    description:
      "Browse expert-led courses in Python, Java, data structures, physics, maths, IELTS, and business. Digital certificates, lesson plans, and learning resources for students worldwide.",
  },
  "/tutor-jobs": {
    title: "Teaching Jobs & Tutor Jobs — Apply Online · TeacherPoint",
    description:
      "Browse online teaching, home tutoring, and assignment jobs. Apply to verified openings, set your time zone, and earn with TeacherPoint's trusted application process.",
  },
  "/online-tutors": {
    title: "Online Tutors — Live Video Teaching · TeacherPoint",
    description:
      "Learn from verified online teachers across time zones. Filter by subject — science, programming, engineering, languages — with proof-checked profiles and student ratings.",
  },
  "/home-tutors": {
    title: "Home Tutors Near You — Local In-Person Teaching · TeacherPoint",
    description:
      "Find local home tutors in your area for maths, science, languages, and exam prep. Verified address proof, ratings, and reviews from students in your zone.",
  },
  "/online-teaching": {
    title: "Online Teaching Jobs — Work From Anywhere · TeacherPoint",
    description:
      "Teach students worldwide with flexible online teaching jobs. Apply as a qualified professional, set your schedule across time zones, and get paid securely.",
  },
  "/home-teaching": {
    title: "Home Teaching Jobs — Local Tutoring Roles · TeacherPoint",
    description:
      "Find home teaching jobs in your local area. Connect with students for in-person tutoring, coaching, and academic support with verified profiles.",
  },
  "/teaching-jobs": {
    title: "Teaching Jobs — Online, Home & Institutional · TeacherPoint",
    description:
      "Discover teaching jobs across subjects and countries. Online teachers, home tutors, and coaching roles with transparent application process and teacher rankings.",
  },
  "/assignment-help": {
    title: "Assignment Help — Projects, Dissertations & Coaching · TeacherPoint",
    description:
      "Get assignment help from qualified professionals. Academic projects, dissertations, and complex problems solved with proof-checked tutors and fast response times.",
  },
  "/assignment-jobs": {
    title: "Assignment Jobs — Earn Solving Academic Problems · TeacherPoint",
    description:
      "Earn online by solving assignments in your subject. Fresh academic coaching jobs daily for qualified teachers in programming, engineering, science, and commerce.",
  },
  "/marketplace": {
    title: "Student Exchange — Buy & Sell Learning Resources · TeacherPoint",
    description:
      "Buy and sell notes, lesson plans, worksheets, research papers, and educational tools. Free student store for digital activities, presentations, and study materials.",
  },
  "/post-requirement": {
    title: "Post a Tutoring Requirement — Find Teachers Fast · TeacherPoint",
    description:
      "Post your tutoring need and get matched with verified teachers. Set subject, budget, local area, and schedule — students choose tutors with ratings and reviews.",
  },
  "/workshops": {
    title: "Live Workshops — Online & In-Person Learning · TeacherPoint",
    description:
      "Join workshops led by qualified tutors in programming, science, skills, and exam prep. Register online for digital teaching sessions with certificates.",
  },
  "/pricing": {
    title: "Pricing — Free, Premium Membership & Coins · TeacherPoint",
    description:
      "Transparent pricing for students and teachers. Free website access, premium membership, coins pricing, and secure pay-teachers options with refund policy protection.",
  },
  "/faq": {
    title: "FAQs — Tutors, Courses, Jobs & Membership · TeacherPoint",
    description:
      "Answers about finding tutors, online teaching, applying jobs, premium membership, coins, privacy policy, refund policy, and staying safe on TeacherPoint.",
  },
  "/reviews": {
    title: "Reviews & Testimonials — Teacher Rankings · TeacherPoint",
    description:
      "Read student reviews, ratings, and feedback for tutors and teachers. Choose highly qualified online and local tutors with verified proof-checked profiles.",
  },
  "/about": {
    title: "About TeacherPoint — Trusted Learning Platform",
    description:
      "TeacherPoint connects thousands of students with verified tutors worldwide. Learn about our mission for safe, high-quality online and local teaching.",
  },
  "/contact": {
    title: "Contact TeacherPoint — Support & Help",
    description:
      "Contact our team for tutor search help, teaching jobs, pricing, premium membership, privacy policy questions, and account support.",
  },
  "/support": {
    title: "Support Center · TeacherPoint",
    description:
      "Get help with tutors, courses, teaching jobs, payments, refund policy, and account safety. Our support team guides students and teachers worldwide.",
  },
  "/privacy": {
    title: "Privacy Policy · TeacherPoint",
    description:
      "Read how TeacherPoint protects student and teacher data, ID proof, address proof, and payment information. Stay safe while learning online.",
  },
  "/terms": {
    title: "Terms and Conditions · TeacherPoint",
    description:
      "Terms of use for students, tutors, and teachers on TeacherPoint. Policies for tutoring, courses, jobs, membership, and community guidelines.",
  },
  "/refund": {
    title: "Refund & Cancellation Policy · TeacherPoint",
    description:
      "Refund policy for courses, tutor sessions, premium membership, and coins. Understand cancellation rules before you pay teachers on TeacherPoint.",
  },
  "/accommodation": {
    title: "Student Accommodation — PG, Hostel & Stays · TeacherPoint",
    description:
      "Find verified PGs, hostels, and student apartments near colleges and coaching centers. Browse local area options with safe enquiry and support.",
  },
  "/register": {
    title: "Create Free Account — Students & Teachers · TeacherPoint",
    description: "Sign up free on TeacherPoint. Students find tutors; teachers apply for jobs, offer courses, and build verified profiles with ratings.",
  },
  "/login": {
    title: "Log in · TeacherPoint",
    description: "Log in to your TeacherPoint account to search tutors, manage courses, apply teaching jobs, and access premium membership features.",
  },
};

export function mergeSeoCopy(path: string, base: RouteMetaEntry): RouteMetaEntry {
  const enriched = SEO_ROUTE_COPY[path];
  if (!enriched) return base;
  return {
    ...base,
    ...enriched,
    openGraph: { ...base.openGraph, ...enriched.openGraph },
  };
}

export { SITE_DESCRIPTION };
