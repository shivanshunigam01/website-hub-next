"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { LayoutDashboard, BookOpen, Heart, Award, MessageCircle, LifeBuoy, Clock, TrendingUp, Bell, Search, ShoppingBag, User, Building2 } from "lucide-react";
import { AccountSecurityPanel } from "@/components/auth/AccountSecurityPanel";
import { AccountProfilePanel } from "@/components/auth/AccountProfilePanel";
import { TutorSearchPanel, tutorSearchToUrl } from "@/components/tutors/TutorSearchPanel";
import type { TutorSearchFilters } from "@/types/tutor-search";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useApp } from "@/hooks/use-app";
import { DashboardShell, DashboardSection, StatCard } from "@/components/dashboard/Shell";
import { NOTIFICATIONS } from "@/data/mock";
import { useTutors } from "@/hooks/use-catalog";
import { useLearning } from "@/hooks/use-learning";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CertificateCard } from "@/components/lms/CertificateCard";
import { StudentExchangePanel } from "@/components/marketplace/StudentExchangePanel";
import { DashboardProfileCard } from "@/components/dashboard/DashboardProfileCard";
import { UserAccommodationInquiriesPanel } from "@/components/accommodation/UserAccommodationInquiriesPanel";

const ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "exchange", label: "Student Exchange", icon: ShoppingBag },
  { id: "find-tutors", label: "Find Tutors", icon: Search },
  { id: "continue", label: "Continue Learning", icon: BookOpen },
  { id: "saved", label: "Saved Tutors", icon: Heart },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "accommodation", label: "Accommodation", icon: Building2 },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "account", label: "Account & Profile", icon: User },
];

function Student() {
  const { user } = useApp();
  const navigate = useNavigate();
  const { enrollments, certificates, loading } = useLearning();
  const { data: tutors = [] } = useTutors();

  const openFullSearch = (filters: TutorSearchFilters) => {
    navigate({ to: "/tutors", search: tutorSearchToUrl(filters) });
  };

  const inProgress = enrollments.filter((e) => e.status !== "completed").slice(0, 5);
  const completedCount = enrollments.filter((e) => e.status === "completed").length;

  return (
    <RequireAuth roles={["student"]}>
    <DashboardShell items={ITEMS} title="Student">
      <DashboardSection id="overview" title={`Hi ${user?.name?.split(" ")[0] || "there"} 👋`} description="Track your courses, progress, and certificates.">
        <DashboardProfileCard
          name={user?.name ?? "Student"}
          email={user?.email}
          avatarUrl={user?.avatarUrl}
          roleLabel="Student account"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Enrolled" value={String(enrollments.length)} icon={BookOpen} />
          <StatCard label="In progress" value={String(enrollments.length - completedCount)} icon={Clock} color="from-purple-400 to-fuchsia-600" />
          <StatCard label="Certificates" value={String(certificates.length)} icon={Award} color="from-amber-400 to-orange-600" />
          <StatCard label="Completed" value={String(completedCount)} icon={TrendingUp} color="from-emerald-400 to-teal-600" />
        </div>
      </DashboardSection>

      <DashboardSection
        id="exchange"
        title="Student Exchange"
        description="Post books, notes, devices and more. Listings go live after admin approval."
        action={
          <Link to="/marketplace" className="text-sm font-medium text-primary hover:underline">
            Browse exchange →
          </Link>
        }
      >
        <StudentExchangePanel />
      </DashboardSection>

      <DashboardSection
        id="find-tutors"
        title="Find a tutor"
        description="Search by subject, location, online or in-person, and verified tutors."
        action={
          <Link to="/tutors" className="text-sm font-medium text-primary hover:underline">
            Open full search →
          </Link>
        }
      >
        <TutorSearchPanel variant="dashboard" onSearch={openFullSearch} showResults />
      </DashboardSection>

      <DashboardSection
        id="continue"
        title="Continue learning"
        action={<Link to="/courses" className="text-sm font-medium text-primary hover:underline">Browse all</Link>}
      >
        <div className="bg-card border rounded-2xl p-5 space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Loading your courses…</p>}
          {!loading && inProgress.length === 0 && (
            <p className="text-sm text-muted-foreground">
              You have not enrolled yet. <Link to="/courses" className="text-primary font-medium hover:underline">Browse courses</Link>
            </p>
          )}
          {inProgress.map((e) => (
            <div key={e.id} className="flex gap-4 items-center">
              <div
                className={`h-16 w-24 rounded-lg shrink-0 ${e.course?.gradient?.startsWith("from-") ? `bg-gradient-to-br ${e.course.gradient}` : ""}`}
                style={e.course?.gradient && !e.course.gradient.startsWith("from-") ? { background: e.course.gradient } : undefined}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{e.course?.title ?? "Course"}</div>
                <div className="text-xs text-muted-foreground">By {e.course?.instructorName ?? "Instructor"}</div>
                <Progress value={e.progressPercent} className="mt-2 h-1.5" />
              </div>
              <Button size="sm" asChild>
                <Link to="/courses/$id" params={{ id: e.courseId }}>Resume</Link>
              </Button>
            </div>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection id="saved" title="Saved tutors" description="Quick access to your favourites.">
        <div className="bg-card border rounded-2xl p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tutors.slice(0, 6).map((t) => (
            <Link to="/tutors/$id" params={{ id: t.id }} key={t.id} className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 -mx-2">
              <div className="h-10 w-10 rounded-full grid place-items-center text-white font-bold text-sm" style={{ background: t.gradient }}>{t.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.subject}</div>
              </div>
              <span className="text-xs text-amber-600">★ {t.rating}</span>
            </Link>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection id="certificates" title="Certificates" description="Auto-issued when you complete every lesson in a course.">
        {certificates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Complete a course to earn your first certificate.</p>
        ) : (
          <div className="space-y-6">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
        )}
      </DashboardSection>

      <DashboardSection id="notifications" title="Notifications">
        <div className="bg-card border rounded-2xl p-5">
          <ul className="space-y-3">
            {NOTIFICATIONS.map((n) => (
              <li key={n.id} className="text-sm border-b last:border-0 pb-3 last:pb-0">
                <div className="font-semibold flex items-center gap-2">{n.title}{n.unread && <Badge className="bg-primary h-1.5 w-1.5 p-0 rounded-full" />}</div>
                <div className="text-xs text-muted-foreground">{n.body} · {n.time}</div>
              </li>
            ))}
          </ul>
        </div>
      </DashboardSection>

      <DashboardSection
        id="accommodation"
        title="Accommodation enquiries"
        description="Your chats with TeacherPoint about PGs and hostels — admin replies appear here."
        action={
          <Link to="/accommodation" className="text-sm font-medium text-primary hover:underline">
            Browse accommodation →
          </Link>
        }
      >
        <UserAccommodationInquiriesPanel />
      </DashboardSection>

      <DashboardSection id="messages" title="Messages" description="Recent conversations with your tutors.">
        <div className="bg-card border rounded-2xl p-5 text-sm text-muted-foreground">
          Open the full messaging page for chats. <Link to="/messages" className="text-primary font-medium hover:underline">Go to messages →</Link>
        </div>
      </DashboardSection>

      <DashboardSection id="support" title="Support" description="We're here to help.">
        <div className="bg-card border rounded-2xl p-5 text-sm">
          Need help with bookings, payments or your account? <Link to="/support" className="text-primary font-medium hover:underline">Contact support →</Link>
        </div>
      </DashboardSection>

      <DashboardSection
        id="account"
        title="Account & profile"
        description="Update your profile photo, password, and security settings."
      >
        <div className="space-y-6">
          <AccountProfilePanel role="student" />
          <AccountSecurityPanel role="student" />
        </div>
      </DashboardSection>
    </DashboardShell>
    </RequireAuth>
  );
}

export default Student;
