"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { LayoutDashboard, BookOpen, Heart, Award, MessageCircle, LifeBuoy, Clock, TrendingUp, Bell, Search, ShoppingBag, User, Building2, ClipboardList } from "lucide-react";
import { AccountSecurityPanel } from "@/components/auth/AccountSecurityPanel";
import { AccountProfilePanel } from "@/components/auth/AccountProfilePanel";
import { TutorSearchPanel, tutorSearchToUrl } from "@/components/tutors/TutorSearchPanel";
import type { TutorSearchFilters } from "@/types/tutor-search";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useApp } from "@/hooks/use-app";
import { DashboardShell, DashboardSection, StatCard } from "@/components/dashboard/Shell";
import { useLearning } from "@/hooks/use-learning";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CertificateCard } from "@/components/lms/CertificateCard";
import { StudentExchangePanel } from "@/components/marketplace/StudentExchangePanel";
import { DashboardProfileCard } from "@/components/dashboard/DashboardProfileCard";
import { UserAccommodationInquiriesPanel } from "@/components/accommodation/UserAccommodationInquiriesPanel";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { useSavedTutors } from "@/hooks/use-saved-tutors";
import { useMyRequirements } from "@/hooks/use-requirements-api";
import { useQuery } from "@tanstack/react-query";
import { fetchConversations } from "@/services/conversations-api";
import {
  jobTypeLabel,
  requirementStatusClass,
  requirementStatusLabel,
} from "@/lib/tutor-jobs-utils";
import { Loader2 } from "lucide-react";

const ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "my-posts", label: "My Posts", icon: ClipboardList },
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
  const { data: savedTutors = [], isLoading: savedLoading } = useSavedTutors(true);
  const { data: myPosts = [], isLoading: postsLoading } = useMyRequirements(true);
  const { data: conversations = [], isLoading: convLoading } = useQuery({
    queryKey: ["dashboard-conversations"],
    queryFn: () => fetchConversations(),
  });
  const approvedPosts = myPosts.filter((p) => p.status === "approved");

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
        id="my-posts"
        title="My Posts"
        description="Your tutoring requirements — approved posts go live on the tutor jobs board."
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/my-posts">Open My Posts →</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/post-requirement">Post requirement</Link>
            </Button>
          </div>
        }
      >
        {postsLoading ? (
          <p className="text-sm text-muted-foreground">Loading your posts…</p>
        ) : myPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">You haven&apos;t posted any requirements yet.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link to="/post-requirement">Post a requirement</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/tutors">Find teachers</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {(approvedPosts.length ? approvedPosts : myPosts).slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.subject} · {jobTypeLabel(post.jobType)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={requirementStatusClass(post.status)}>
                    {requirementStatusLabel(post.status)}
                  </Badge>
                  {post.status === "approved" ? (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/tutor-jobs/$id" params={{ id: post.id }}>
                        View live
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            {myPosts.length > 5 ? (
              <Button asChild variant="ghost" size="sm">
                <Link to="/my-posts">View all {myPosts.length} posts →</Link>
              </Button>
            ) : null}
          </div>
        )}
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

      <DashboardSection id="saved" title="Saved tutors" description="Tutors you favourited from their profile.">
        <div className="rounded-2xl border bg-card p-5">
          {savedLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : savedTutors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved tutors yet.{" "}
              <Link to="/tutors" className="font-medium text-primary hover:underline">
                Browse tutors
              </Link>{" "}
              and tap save on a profile.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {savedTutors.map((t) => (
                <Link
                  to="/tutors/$id"
                  params={{ id: t.id }}
                  key={t.id}
                  className="-mx-2 flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50"
                >
                  <div
                    className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white"
                    style={{ background: t.gradient }}
                  >
                    {t.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.subject}</div>
                  </div>
                  <span className="text-xs text-amber-600">★ {t.rating}</span>
                </Link>
              ))}
            </div>
          )}
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
        <NotificationsPanel />
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
        id="messages"
        title="Messages"
        description="Recent conversations with your tutors."
        action={
          <Link to="/messages" className="text-sm font-medium text-primary hover:underline">
            Open inbox →
          </Link>
        }
      >
        <div className="rounded-2xl border bg-card p-5">
          {convLoading ? (
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No conversations yet.{" "}
              <Link to="/tutors" className="font-medium text-primary hover:underline">
                Message a tutor
              </Link>{" "}
              to start (admin approval + payment unlock full chat).
            </p>
          ) : (
            <ul className="space-y-2">
              {conversations.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link
                    to="/messages"
                    search={{ tutorId: c.other?.id }}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{c.other?.name || "Chat"}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {c.lastMessage || c.connectionStatus || "New conversation"}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
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
