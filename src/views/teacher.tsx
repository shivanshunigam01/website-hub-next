"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { useEffect } from "react";
import { LayoutDashboard, BookOpen, Users, DollarSign, Star, MessageCircle, TrendingUp, Plus, User, Presentation, Briefcase, Building2 } from "lucide-react";
import { AccountSecurityPanel } from "@/components/auth/AccountSecurityPanel";
import { AccountProfilePanel } from "@/components/auth/AccountProfilePanel";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ProfileCompletionProgress } from "@/components/teacher/ProfileCompletionProgress";
import { useApp } from "@/hooks/use-app";
import { TEACHER_ONBOARDING_PATH } from "@/lib/auth-redirect";
import { computeTeacherProfileProgress } from "@/lib/teacher-profile-utils";
import { DashboardShell, DashboardSection, StatCard } from "@/components/dashboard/Shell";
import { REVENUE_DATA } from "@/data/mock";
import { useCourses } from "@/hooks/use-catalog";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { DashboardProfileCard } from "@/components/dashboard/DashboardProfileCard";
import { TeacherJobApplicationsPanel } from "@/components/teacher/TeacherJobApplicationsPanel";
import { TeacherWorkshopsPanel } from "@/components/workshops/TeacherWorkshopsPanel";
import { UserAccommodationInquiriesPanel } from "@/components/accommodation/UserAccommodationInquiriesPanel";

const ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "workshops", label: "Workshops", icon: Presentation },
  { id: "students", label: "Job Applications", icon: Briefcase },
  { id: "accommodation", label: "Accommodation", icon: Building2 },
  { id: "earnings", label: "Earnings", icon: DollarSign },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "account", label: "Account & Profile", icon: User },
];

function Teacher() {
  const { user } = useApp();
  const nav = useNavigate();
  const progress = computeTeacherProfileProgress(user);
  const { data: courses = [] } = useCourses();

  useEffect(() => {
    if (!user) return;
    if (user.role === "teacher" && progress.percent < 100) {
      nav({ to: TEACHER_ONBOARDING_PATH });
    }
  }, [user, nav, progress.percent]);

  return (
    <RequireAuth roles={["teacher"]}>
    <DashboardShell items={ITEMS} title="Teacher">
      <DashboardSection
        id="overview"
        title={`Welcome, ${user?.name?.split(" ")[0] || "Tutor"}`}
        description={`Profile ${progress.percent}% complete`}
        action={<Button className="bg-gradient-primary"><Plus className="h-4 w-4 mr-2" />New course</Button>}
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active students" value="412" change="+38 this week" icon={Users} />
          <StatCard label="Earnings (MTD)" value="$3,420" change="+12%" icon={DollarSign} color="from-emerald-400 to-teal-600" />
          <StatCard label="Avg. rating" value="4.9" icon={Star} color="from-amber-400 to-orange-500" />
          <StatCard label="Course views" value="8.2K" change="+5%" icon={TrendingUp} color="from-purple-400 to-fuchsia-600" />
        </div>
      </DashboardSection>

      <DashboardSection id="courses" title="My courses" description="Top performing courses." action={<Link to="/lms" className="text-sm font-medium text-primary hover:underline">Open builder →</Link>}>
        <div className="bg-card border rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
          {courses.slice(0, 4).map((c) => (
            <div key={c.id} className="flex items-center gap-3 border rounded-xl p-3">
              <div className="h-12 w-16 rounded-lg shrink-0" style={{ background: c.gradient }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground">★ {c.rating} · {c.students.toLocaleString()} students</div>
              </div>
            </div>
          ))}
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

      <DashboardSection id="earnings" title="Earnings trend">
        <div className="bg-card border rounded-2xl p-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_DATA}>
              <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardSection>

      <DashboardSection id="reviews" title="Recent reviews">
        <div className="bg-card border rounded-2xl p-5 space-y-3">
          {[
            { n: "Ananya", r: 5, t: "Best math teacher I've ever had!" },
            { n: "Diego", r: 5, t: "Clear explanations and patient." },
            { n: "Mei", r: 4, t: "Loved the homework feedback." },
          ].map((r) => (
            <div key={r.n} className="border-b last:border-0 pb-3 last:pb-0">
              <div className="text-sm font-semibold">{r.n} <span className="text-amber-500">{"★".repeat(r.r)}</span></div>
              <p className="text-sm text-muted-foreground">{r.t}</p>
            </div>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection id="messages" title="Messages">
        <div className="bg-card border rounded-2xl p-5 text-sm text-muted-foreground">
          <Link to="/messages" className="text-primary font-medium hover:underline">Open inbox →</Link>
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
