export type { Course, Tutor, CategoryItem } from "@/types/catalog";
export type Role = "student" | "teacher" | "parent" | "admin";

export const GRADIENTS = [
  "linear-gradient(135deg,#38bdf8,#6366f1)",
  "linear-gradient(135deg,#a78bfa,#ec4899)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#10b981,#06b6d4)",
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#ec4899,#f43f5e)",
  "linear-gradient(135deg,#0ea5e9,#22d3ee)",
  "linear-gradient(135deg,#f97316,#eab308)",
];

/** Static nav labels — live category list comes from GET /categories */
export const CATEGORIES = [
  { id: "all", name: "All", icon: "Sparkles" },
  { id: "dev", name: "Development", icon: "Code" },
  { id: "ai", name: "AI & ML", icon: "Brain" },
  { id: "data", name: "Data Science", icon: "BarChart3" },
  { id: "design", name: "Design", icon: "Palette" },
  { id: "business", name: "Business", icon: "Briefcase" },
  { id: "marketing", name: "Marketing", icon: "Megaphone" },
  { id: "languages", name: "Languages", icon: "Languages" },
  { id: "school", name: "School", icon: "GraduationCap" },
];

export const SKILLS = [
  { name: "ChatGPT", icon: "Bot", color: "from-emerald-400 to-cyan-500" },
  { name: "Python", icon: "Code2", color: "from-blue-400 to-indigo-600" },
  { name: "Figma", icon: "Palette", color: "from-pink-400 to-rose-600" },
  { name: "Excel", icon: "Table", color: "from-green-400 to-emerald-600" },
  { name: "PowerBI", icon: "BarChart3", color: "from-yellow-400 to-orange-500" },
  { name: "React", icon: "Atom", color: "from-cyan-400 to-blue-500" },
  { name: "SQL", icon: "Database", color: "from-purple-400 to-indigo-600" },
  { name: "Tableau", icon: "PieChart", color: "from-teal-400 to-cyan-600" },
  { name: "AWS", icon: "Cloud", color: "from-orange-400 to-red-500" },
  { name: "Photoshop", icon: "Image", color: "from-blue-500 to-purple-600" },
  { name: "TensorFlow", icon: "Brain", color: "from-orange-400 to-pink-500" },
  { name: "Notion", icon: "FileText", color: "from-gray-400 to-gray-700" },
];

export const COMBOS = [
  { id: "k1", title: "Full Stack Developer Combo", courses: 6, hours: 120, price: 49, oldPrice: 299, includes: ["Web Dev", "React", "Node.js", "MongoDB", "AWS", "DevOps"], gradient: GRADIENTS[0] },
  { id: "k2", title: "AI & Data Science Pack", courses: 5, hours: 95, price: 59, oldPrice: 349, includes: ["Python", "ML", "Deep Learning", "NLP", "GenAI"], gradient: GRADIENTS[1] },
  { id: "k3", title: "Digital Marketer Pro", courses: 4, hours: 68, price: 39, oldPrice: 229, includes: ["SEO", "Ads", "Social", "Analytics"], gradient: GRADIENTS[3] },
  { id: "k4", title: "School Excellence Bundle", courses: 8, hours: 220, price: 69, oldPrice: 399, includes: ["Math", "Science", "English", "Tests"], gradient: GRADIENTS[4] },
];

export const TESTIMONIALS = [
  { id: "r1", name: "Aarav Patel", role: "Student, Class 12", rating: 5, text: "TeacherPoint helped me find the perfect math tutor. My grades jumped from B to A+ in 3 months!", initials: "AP" },
  { id: "r2", name: "Jessica Wong", role: "UI Designer", rating: 5, text: "The UI/UX bootcamp was hands-on and got me my first design job at a startup.", initials: "JW" },
  { id: "r3", name: "Mohammed Khan", role: "Software Engineer", rating: 5, text: "Best platform for live tutoring. The AI assistant recommended courses I actually needed.", initials: "MK" },
  { id: "r4", name: "Sofia Rodriguez", role: "Marketing Lead", rating: 5, text: "Loved the combo packs — saved tons and learned a complete skill stack.", initials: "SR" },
  { id: "r5", name: "Ryan O'Connor", role: "Parent", rating: 5, text: "I track my son's progress weekly. The parent dashboard is a game-changer.", initials: "RO" },
  { id: "r6", name: "Mei Lin", role: "Career Switcher", rating: 5, text: "Switched from finance to data science thanks to TeacherPoint mentors.", initials: "ML" },
];

export const FAQS = [
  { q: "How do I find the right tutor on TeacherPoint?", a: "Use our advanced filters — subject, price, location, language, and verified badges — to shortlist tutors. You can chat with up to 3 free trial sessions before booking." },
  { q: "Are courses on TeacherPoint certified?", a: "Yes — every course includes a verified completion certificate that can be shared on LinkedIn and added to your resume." },
  { q: "Can parents track their child's learning?", a: "Absolutely. The Parent Dashboard shows enrolled courses, attendance, test scores, and weekly learning hours in real time." },
  { q: "What payment methods are supported?", a: "We accept Razorpay, Stripe, PayPal, UPI, debit/credit cards, and net banking across multiple currencies." },
  { q: "Is there a refund policy?", a: "Yes — 7-day no-questions-asked refund on every course and tutor session purchase." },
  { q: "How do teachers get verified?", a: "Teachers submit ID, qualifications, and complete a demo class. Our review team verifies within 48 hours." },
  { q: "Do you support live and recorded learning?", a: "Both. Most courses include lifetime recorded access; tutors offer 1-on-1 live sessions in your timezone." },
  { q: "Can I become a teacher on TeacherPoint?", a: "Yes — apply via 'Become a Teacher'. Once verified, you can list courses, accept students, and earn weekly payouts." },
];

export const COMPANIES = ["Google", "Microsoft", "Amazon", "Meta", "Netflix", "Adobe", "IBM", "Spotify"];

export const STATS = [
  { value: "12,500+", label: "Verified Tutors" },
  { value: "850K+", label: "Active Students" },
  { value: "4.9★", label: "Average Rating" },
  { value: "120+", label: "Countries" },
];

export const HOW_IT_WORKS = [
  { step: "01", title: "Search", desc: "Discover tutors and courses tailored to your goals.", icon: "Search" },
  { step: "02", title: "Connect", desc: "Chat free, book a trial, and pick your perfect match.", icon: "MessageCircle" },
  { step: "03", title: "Learn", desc: "Live sessions, recorded lessons, and earn certificates.", icon: "GraduationCap" },
];

export const LEARNING_TIMELINE = [
  { title: "Watch Lessons", desc: "Industry-led video lessons, anytime, anywhere.", icon: "PlayCircle" },
  { title: "Practice Live", desc: "Hands-on assignments and 1-on-1 doubt clearing.", icon: "Target" },
  { title: "Build Projects", desc: "Real-world projects reviewed by mentors.", icon: "Hammer" },
  { title: "Get Certified", desc: "Earn an industry-recognized certificate.", icon: "Award" },
  { title: "Land a Job", desc: "Career support, mock interviews, and referrals.", icon: "Briefcase" },
];

export const COMPARISON = [
  { feature: "Verified Expert Tutors", us: true, others: false },
  { feature: "Live 1-on-1 Sessions", us: true, others: true },
  { feature: "Lifetime Course Access", us: true, others: false },
  { feature: "Industry Certificates", us: true, others: true },
  { feature: "Parent Dashboard", us: true, others: false },
  { feature: "AI Learning Assistant", us: true, others: false },
  { feature: "7-Day Refund Guarantee", us: true, others: false },
  { feature: "Multi-language Support", us: true, others: true },
];

export const NOTIFICATIONS = [
  { id: "n1", title: "New course recommendation", body: "AI Coding Agents Masterclass — perfect for your goals.", time: "2m ago", unread: true },
  { id: "n2", title: "Emma Smith accepted your booking", body: "Math session scheduled for Friday 6 PM.", time: "1h ago", unread: true },
  { id: "n3", title: "Certificate ready", body: "Your Python Bootcamp certificate is ready.", time: "Yesterday", unread: false },
  { id: "n4", title: "Weekly progress report", body: "You completed 4h of learning this week.", time: "2d ago", unread: false },
];

export const SUPPORT_TICKETS = [
  { id: "#1042", subject: "Refund request for PMP course", status: "Open", priority: "High", date: "May 12" },
  { id: "#1041", subject: "Cannot access certificate", status: "In Progress", priority: "Medium", date: "May 10" },
  { id: "#1038", subject: "Tutor reschedule request", status: "Resolved", priority: "Low", date: "May 8" },
];

export const PAYMENT_PLANS = [
  { name: "Free", price: 0, period: "forever", features: ["Browse tutors & courses", "3 free trial sessions", "Basic dashboard", "Community access"], cta: "Get Started", highlight: false },
  { name: "Pro", price: 19, period: "month", features: ["Unlimited tutor chats", "All courses 50% off", "AI learning assistant", "Priority support", "Downloadable certificates"], cta: "Start Pro Trial", highlight: true },
  { name: "Premium", price: 49, period: "month", features: ["Everything in Pro", "1-on-1 mentor included", "Career coaching", "Job referrals", "Family accounts (4 users)"], cta: "Go Premium", highlight: false },
];

export const REVENUE_DATA = [
  { month: "Jan", revenue: 42000, payouts: 28000 },
  { month: "Feb", revenue: 51000, payouts: 34000 },
  { month: "Mar", revenue: 67000, payouts: 45000 },
  { month: "Apr", revenue: 78000, payouts: 52000 },
  { month: "May", revenue: 92000, payouts: 61000 },
  { month: "Jun", revenue: 105000, payouts: 70000 },
];

export const ENROLLMENT_DATA = [
  { day: "Mon", count: 120 }, { day: "Tue", count: 180 }, { day: "Wed", count: 240 },
  { day: "Thu", count: 200 }, { day: "Fri", count: 320 }, { day: "Sat", count: 410 }, { day: "Sun", count: 380 },
];

export const ADMIN_USERS = [
  { id: "u1", name: "Aarav Patel", role: "Student", email: "aarav@example.com", joined: "May 12, 2026", status: "Active" },
  { id: "u2", name: "Emma Smith", role: "Teacher", email: "emma@example.com", joined: "Apr 22, 2026", status: "Active" },
  { id: "u3", name: "Ryan O'Connor", role: "Parent", email: "ryan@example.com", joined: "May 02, 2026", status: "Active" },
  { id: "u4", name: "Lisa Chen", role: "Teacher", email: "lisa@example.com", joined: "Mar 18, 2026", status: "Pending" },
  { id: "u5", name: "Mohammed Khan", role: "Student", email: "mk@example.com", joined: "May 09, 2026", status: "Active" },
];

export const DEMO_USERS: Record<Role, { name: string; email: string }> = {
  student: { name: "Demo Student", email: "student@teacherpoint.com" },
  teacher: { name: "Demo Tutor", email: "teacher@teacherpoint.com" },
  parent: { name: "Ryan O'Connor", email: "parent@teacherpoint.com" },
  admin: { name: "Aarav Mehta", email: "aarav@teacherpoint.com" },
};
