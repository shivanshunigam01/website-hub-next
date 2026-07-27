"use client";

import { Link, useNavigate } from "@/lib/navigation";
import {
  LayoutDashboard,
  Heart,
  CreditCard,
  MessageCircle,
  BookOpen,
  User,
  Search,
  ClipboardList,
  Bell,
  Loader2,
  Building2,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AccountSecurityPanel } from "@/components/auth/AccountSecurityPanel";
import { AccountProfilePanel } from "@/components/auth/AccountProfilePanel";
import { DashboardShell, DashboardSection, StatCard } from "@/components/dashboard/Shell";
import { DashboardProfileCard } from "@/components/dashboard/DashboardProfileCard";
import { TutorSearchPanel, tutorSearchToUrl } from "@/components/tutors/TutorSearchPanel";
import type { TutorSearchFilters } from "@/types/tutor-search";
import { useApp } from "@/hooks/use-app";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyRequirements } from "@/hooks/use-requirements-api";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { PaymentsHistoryPanel } from "@/components/dashboard/PaymentsHistoryPanel";
import { UserAccommodationInquiriesPanel } from "@/components/accommodation/UserAccommodationInquiriesPanel";
import { useSavedTutors } from "@/hooks/use-saved-tutors";
import {
  jobTypeLabel,
  requirementStatusClass,
  requirementStatusLabel,
} from "@/lib/tutor-jobs-utils";

const ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "my-posts", label: "My Posts", icon: ClipboardList },
  { id: "children", label: "Children", icon: BookOpen },
  { id: "tutors", label: "Find Tutors", icon: Search },
  { id: "saved", label: "Saved Tutors", icon: Heart },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "accommodation", label: "Accommodation", icon: Building2 },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "account", label: "Account & Profile", icon: User },
];

function Parent() {
  const { user } = useApp();
  const navigate = useNavigate();
  const { data: myPosts = [], isLoading: postsLoading } = useMyRequirements(true);
  const { data: savedTutors = [], isLoading: savedLoading } = useSavedTutors(true);
  const approvedPosts = myPosts.filter((p) => p.status === "approved");
  const firstName = user?.name?.split(" ")[0] || "there";
  const children = user?.parentProfile?.children ?? [];

  const openFullSearch = (filters: TutorSearchFilters) => {
    navigate({ to: "/tutors", search: tutorSearchToUrl(filters) });
  };

  return (
    <RequireAuth roles={["parent"]}>
      <DashboardShell items={ITEMS} title="Parent">
        <DashboardSection
          id="overview"
          title={`Hi ${firstName}`}
          description="Manage tutors and learning for your children."
        >
          <DashboardProfileCard
            name={user?.name ?? "Parent"}
            email={user?.email}
            avatarUrl={user?.avatarUrl}
            roleLabel="Parent account"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Children on profile" value={String(children.length)} icon={BookOpen} />
            <StatCard
              label="Approved posts"
              value={String(approvedPosts.length)}
              icon={ClipboardList}
              color="from-emerald-400 to-teal-600"
            />
            <StatCard
              label="Saved tutors"
              value={String(savedTutors.length)}
              icon={Heart}
              color="from-sky-400 to-blue-600"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/post-requirement">Post a tutoring requirement</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/my-posts">My Posts</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/tutors">Browse tutors</Link>
            </Button>
          </div>
        </DashboardSection>

        <DashboardSection
          id="my-posts"
          title="My Posts"
          description="Your tutoring requirements — approved posts go live on the tutor jobs board."
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/my-posts">Open My Posts →</Link>
            </Button>
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
            </div>
          )}
        </DashboardSection>

        <DashboardSection id="children" title="Your children" description="Details saved on your parent profile.">
          {children.length === 0 ? (
            <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
              No children added yet.{" "}
              <Link to="/profile" className="font-medium text-primary hover:underline">
                Add child details →
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2">
              {children.map((child, i) => (
                <div key={`${child.name}-${i}`} className="rounded-xl border p-4">
                  <div className="font-semibold">{child.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {[child.age != null ? `Age ${child.age}` : null, child.grade ? `Grade ${child.grade}` : null]
                      .filter(Boolean)
                      .join(" · ") || "Details pending"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          id="tutors"
          title="Find a tutor"
          description="Search by subject, location, online or in-person."
          action={
            <Link to="/tutors" className="text-sm font-medium text-primary hover:underline">
              Open full search →
            </Link>
          }
        >
          <TutorSearchPanel variant="dashboard" onSearch={openFullSearch} showResults />
        </DashboardSection>

        <DashboardSection id="saved" title="Saved tutors" description="Tutors you favourited.">
          <div className="rounded-2xl border bg-card p-5">
            {savedLoading ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
            ) : savedTutors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No saved tutors yet.{" "}
                <Link to="/tutors" className="font-medium text-primary hover:underline">
                  Browse tutors
                </Link>
                .
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {savedTutors.map((t) => (
                  <Link
                    to="/tutors/$id"
                    params={{ id: t.id }}
                    key={t.id}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/40"
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

        <DashboardSection id="payments" title="Payments">
          <PaymentsHistoryPanel />
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

        <DashboardSection id="messages" title="Messages">
          <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
            <Link to="/messages" className="font-medium text-primary hover:underline">
              Open inbox →
            </Link>
          </div>
        </DashboardSection>

        <DashboardSection id="account" title="Account & profile" description="Photo, password, and security.">
          <div className="space-y-4">
            <AccountProfilePanel role="parent" />
            <AccountSecurityPanel role="parent" />
          </div>
        </DashboardSection>
      </DashboardShell>
    </RequireAuth>
  );
}

export default Parent;
