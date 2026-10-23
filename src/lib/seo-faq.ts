/** Factual FAQ copy for AEO/GEO — aligned with implemented product behavior. */
export type SeoFaqItem = { q: string; a: string };

export const SEO_FAQ_ITEMS: SeoFaqItem[] = [
  {
    q: "How do I find a tutor on TeacherPoint?",
    a:
      "Open Find a Tutor, filter by subject, online or home tutoring, location, and other profile fields. Open a tutor profile to see their bio, subjects, and reviews, then send a connection or message when you are signed in.",
  },
  {
    q: "How does TeacherPoint work for students?",
    a:
      "Create a free student or parent account, complete your profile, search tutors or post a tutoring requirement, and use messaging and payments on the platform when you connect with a teacher.",
  },
  {
    q: "What is the difference between online and home tutoring?",
    a:
      "Online tutors teach over video; home tutors offer in-person sessions in their listed area. Teacher profiles show which modes they offer so you can choose what fits your schedule.",
  },
  {
    q: "How are tutors verified?",
    a:
      "Teachers complete onboarding with profile and qualification details. Staff can review teacher status in the admin console. Look for profile completeness and platform reviews before you book.",
  },
  {
    q: "How does course enrollment work?",
    a:
      "Browse published courses, open a course page, and enroll when signed in as a student. Courses with a price require a completed Razorpay payment recorded on your account before enrollment is allowed.",
  },
  {
    q: "What payment methods are supported?",
    a:
      "Tutor sessions and paid flows use Razorpay checkout (cards, UPI, and other methods Razorpay supports in your region). Payment is confirmed on the server after signature verification — not from the browser alone.",
  },
  {
    q: "What is the refund policy?",
    a:
      "See the Refund & Cancellation Policy page for current rules on courses, tutor sessions, and subscriptions. Policies are updated there as the product evolves.",
  },
  {
    q: "How do tutors apply for jobs?",
    a:
      "Tutors browse approved job posts on Tutor Jobs and submit proposals. Students post requirements that go through admin approval before they appear publicly.",
  },
];
