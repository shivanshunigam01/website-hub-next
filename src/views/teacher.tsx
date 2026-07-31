"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  DollarSign,
  Star,
  MessageCircle,
  Plus,
  User,
  Presentation,
  Briefcase,
  Building2,
  Loader2,
  Handshake,
} from "lucide-react";
import { AccountSecurityPanel } from "@/components/auth/AccountSecurityPanel";
import { AccountProfilePanel } from "@/components/auth/AccountProfilePanel";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ProfileCompletionProgress } from "@/components/teacher/ProfileCompletionProgress";
import { useApp } from "@/hooks/use-app";
import { TEACHER_ONBOARDING_PATH } from "@/lib/auth-redirect";
import { computeTeacherProfileProgress } from "@/lib/teacher-profile-utils";
import { DashboardShell, DashboardSection, StatCard } from "@/components/dashboard/Shell";
import { useCourses } from "@/hooks/use-catalog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { DashboardProfileCard } from "@/components/dashboard/DashboardProfileCard";
import { TeacherJobApplicationsPanel } from "@/components/teacher/TeacherJobApplicationsPanel";
import { TeacherConnectionsPanel } from "@/components/teacher/TeacherConnectionsPanel";
import { TeacherWorkshopsPanel } from "@/components/workshops/TeacherWorkshopsPanel";
import { UserAccommodationInquiriesPanel } from "@/components/accommodation/UserAccommodationInquiriesPanel";
import { useMyConnections } from "@/hooks/use-connections-api";
import { useMyJobApplications } from "@/hooks/use-proposals-api";
import { useReceivedPayments } from "@/hooks/use-payments-api";
import { fetchReviewSummary, fetchTutorReviews } from "@/services/learning-api";
import { formatPrice } from "@/lib/currencies";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";

const ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "workshops", label: "Workshops", icon: Presentation },
  { id: "students", label: "Job Applications", icon: Briefcase },
  { id: "connections", label: "Connections", icon: Users },
  { id: "accommodation", label: "Accommodation", icon: Building2 },
  { id: "earnings", label: "Earnings", icon: DollarSign },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "notifications", label: "Notifications", icon: Handshake },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "account", label: "Account & Profile", icon: User },
];

function Teacher() {
  const { user } = useApp();
  const nav = useNavigate();
  const progress = computeTeacherProfileProgress(user);
  const { data: courses = [] } = useCourses();
  const myCourses = useMemo(
    () => courses.filter((c) => c.instructorId === user?.id || c.instructor === user?.name),
    [courses, user?.id, user?.name],
  );
  const { data: connections = [] } = useMyConnections(!!user);
  const { data: applications = [] } = useMyJobApplications(!!user);
  const { data: received = [], isLoading: earningsLoading } = useReceivedPayments(!!user);

  const { data: reviewSummary } = useQuery({
    queryKey: ["tutor-review-summary", user?.id],
    queryFn: () => fetchReviewSummary({ tutorId: user!.id }),
    enabled: !!user?.id,
  });
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["tutor-reviews-dash", user?.id],
    queryFn: () => fetchTutorReviews(user!.id),
    enabled: !!user?.id,
  });

  const activeConnections = connections.filter((c) =>
    ["connected", "approved", "pending"].includes(c.status),
  ).length;
  const paidReceived = received.filter((p) => p.status === "paid");
  const earningsTotal = paidReceived.reduce((s, p) => s + Number(p.amount || 0), 0);
  const currency = paidReceived[0]?.currency || "INR";
  const now = new Date();
  const mtd = paidReceived
    .filter((p) => {
      if (!p.createdAt) return false;
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  const chartData = useMemo(() => {
    const ref = new Date();
    const months: { key: string; label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months.push({
        key,
        label: d.toLocaleString(undefined, { month: "short" }),
        revenue: 0,
      });
    }
    for (const p of paidReceived) {
      if (!p.createdAt) continue;
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const row = months.find((m) => m.key === key);
      if (row) row.revenue += Number(p.amount || 0);
    }
    return months.map(({ label, revenue }) => ({ month: label, revenue }));
  }, [paidReceived]);

  const avgRating =
    reviewSummary?.count && reviewSummary.rating != null
      ? Number(reviewSummary.rating).toFixed(1)
      : "—";

  useEffect(() => {
    if (!user) return;
    if (user.role === "teacher" && !user.profileComplete) {
      nav({ to: TEACHER_ONBOARDING_PATH });
    }
  }, [user, nav]);

  return (
    <RequireAuth roles={["teacher"]}>
      <DashboardShell items={ITEMS} title="Teacher">
        <DashboardSection
          id="overview"
          title={`Welcome, ${user?.name?.split(" ")[0] || "Tutor"}`}
          description={`Profile ${progress.percent}% complete`}
          action={
            <Button className="bg-gradient-primary" asChild>
              <Link to="/lms">
                <Plus className="mr-2 h-4 w-4" />
                New course
              </Link>
            </Button>
          }
        >
          <DashboardProfileCard
            name={user?.name ?? "Tutor"}
            email={user?.email}
            avatarUrl={user?.avatarUrl}
            roleLabel="Tutor account"
          />
          <ProfileCompletionProgress progress={progress} className="mb-4" />
          {user?.profileComplete && user.id && (
            <Button variant="outline" size="sm" className="mb-4" asChild>
              <Link to={`/tutors/${user.id}`}>View public profile</Link>
            </Button>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Connections" value={String(activeConnections)} icon={Users} />
            <StatCard
              label="Earnings (MTD)"
              value={formatPrice(mtd, currency)}
              icon={DollarSign}
              color="from-emerald-400 to-teal-600"
            />
            <StatCard
              label="Avg. rating"
              value={avgRating}
              icon={Star}
              color="from-amber-400 to-orange-500"
            />
            <StatCard
              label="My courses"
              value={String(myCourses.length)}
              icon={BookOpen}
              color="from-purple-400 to-fuchsia-600"
            />
          </div>
        </DashboardSection>

        <DashboardSection
          id="courses"
          title="My courses"
          description="Courses you created."
          action={
            <Link to="/lms" className="text-sm font-medium text-primary hover:underline">
              Open builder →
            </Link>
          }
        >
          <div className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2">
            {myCourses.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground">
                No courses yet.{" "}
                <Link to="/lms" className="font-medium text-primary hover:underline">
                  Create one in the LMS
                </Link>
                .
              </p>
            ) : (
              myCourses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border p-3">
                  <div className="h-12 w-16 shrink-0 rounded-lg" style={{ background: c.gradient }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{c.title}</div>
                    <div className="text-xs text-muted-foreground">
                      ★ {c.rating} · {(c.students ?? 0).toLocaleString()} students
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardSection>

        <DashboardSection
          id="workshops"
          title="Workshops"
          description="Request live workshops for your students. Admin approval required before publishing."
        >
          <TeacherWorkshopsPanel />
        </DashboardSection>

        <DashboardSection
          id="students"
          title="My job applications"
          description="Tutor jobs you applied for — approved assignments are highlighted."
          action={
            <Link to="/tutor-jobs" className="text-sm font-medium text-primary hover:underline">
              Browse jobs →
            </Link>
          }
        >
          <TeacherJobApplicationsPanel />
        </DashboardSection>

        <DashboardSection
          id="connections"
          title="Connection requests"
          description="Students/parents who want to message, call, or hire you. Admin approves first; full contact unlocks after they pay."
          action={
            <Link to="/messages" className="text-sm font-medium text-primary hover:underline">
              Open inbox →
            </Link>
          }
        >
          <TeacherConnectionsPanel />
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

        <DashboardSection
          id="earnings"
          title="Earnings"
          description={`Total received ${formatPrice(earningsTotal, currency)} · ${applications.length} job applications`}
        >
          {earningsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-72 rounded-2xl border bg-card p-5">
              {paidReceived.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No tutor-session payments received yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            {paidReceived.length > 0 ? (
              <div className="mt-4 space-y-2 rounded-2xl border bg-card p-4">
                <h3 className="text-sm font-semibold">Recent paid sessions</h3>
                <ul className="divide-y text-sm">
                  {paidReceived.slice(0, 8).map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span className="text-muted-foreground">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"} ·{" "}
                        {p.invoiceId || p.id.slice(-8)}
                      </span>
                      <span className="flex items-center gap-2 font-medium">
                        {formatPrice(Number(p.amount || 0), p.currency || currency)}
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Paid
                        </Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          )}
        </DashboardSection>

        <DashboardSection id="reviews" title="Recent reviews">
          <div className="space-y-3 rounded-2xl border bg-card p-5">
            {reviewsLoading ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
            ) : reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews on your public profile yet.</p>
            ) : (
              reviews.slice(0, 8).map((r) => (
                <div key={r.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="text-sm font-semibold">
                    {r.studentName || "Student"}{" "}
                    <span className="text-amber-500">{"★".repeat(Math.round(r.rating || 0))}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.comment || ""}</p>
                </div>
              ))
            )}
          </div>
        </DashboardSection>

        <DashboardSection id="notifications" title="Notifications">
          <NotificationsPanel />
        </DashboardSection>

        <DashboardSection id="messages" title="Messages">
          <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
            <Link to="/messages" className="font-medium text-primary hover:underline">
              Open inbox →
            </Link>
          </div>
        </DashboardSection>

        <DashboardSection
          id="account"
          title="Account & profile"
          description="Update your profile photo, password, and security settings."
        >
          <div className="space-y-6">
            <AccountProfilePanel role="teacher" />
            <AccountSecurityPanel role="teacher" />
          </div>
        </DashboardSection>
      </DashboardShell>
    </RequireAuth>
  );
}

export default Teacher;
