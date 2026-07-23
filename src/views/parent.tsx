"use client";

import { Link } from "@/lib/navigation";
import {
  LayoutDashboard,
  Heart,
  CreditCard,
  MessageCircle,
  BookOpen,
  User,
  Search,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AccountSecurityPanel } from "@/components/auth/AccountSecurityPanel";
import { AccountProfilePanel } from "@/components/auth/AccountProfilePanel";
import { DashboardShell, DashboardSection, StatCard } from "@/components/dashboard/Shell";
import { DashboardProfileCard } from "@/components/dashboard/DashboardProfileCard";
import { useApp } from "@/hooks/use-app";
import { useTutors } from "@/hooks/use-catalog";
import { Button } from "@/components/ui/button";

const ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "children", label: "Children", icon: BookOpen },
  { id: "tutors", label: "Find Tutors", icon: Heart },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "account", label: "Account & Profile", icon: User },
];

function Parent() {
  const { user, profileComplete } = useApp();
  const { data: tutors = [] } = useTutors();
  const firstName = user?.name?.split(" ")[0] || "there";
  const children = user?.parentProfile?.children ?? [];

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
          {!profileComplete ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-4 text-sm">
              <p className="font-medium">Complete your parent profile</p>
              <p className="text-muted-foreground mt-1">
                Add a phone number or at least one child (name plus age or grade) to finish setup.
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/profile">Complete profile</Link>
              </Button>
            </div>
          ) : null}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Children on profile" value={String(children.length)} icon={BookOpen} />
            <StatCard
              label="Profile"
              value={profileComplete ? "Complete" : "Incomplete"}
              icon={User}
              color="from-emerald-400 to-teal-600"
            />
            <StatCard
              label="Find help"
              value="Post a need"
              icon={Search}
              color="from-sky-400 to-blue-600"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/post-requirement">Post a tutoring requirement</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/tutors">Browse tutors</Link>
            </Button>
          </div>
        </DashboardSection>

        <DashboardSection id="children" title="Your children" description="Details saved on your parent profile.">
          {children.length === 0 ? (
            <div className="bg-card border rounded-2xl p-5 text-sm text-muted-foreground">
              No children added yet.{" "}
              <Link to="/profile" className="text-primary font-medium hover:underline">
                Add child details →
              </Link>
            </div>
          ) : (
            <div className="bg-card border rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
              {children.map((child, i) => (
                <div key={`${child.name}-${i}`} className="rounded-xl border p-4">
                  <div className="font-semibold">{child.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {[child.age != null ? `Age ${child.age}` : null, child.grade ? `Grade ${child.grade}` : null]
                      .filter(Boolean)
                      .join(" · ") || "Details pending"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>

        <DashboardSection id="tutors" title="Recommended tutors">
          <div className="bg-card border rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
            {tutors.slice(0, 4).map((t) => (
              <Link
                to="/tutors/$id"
                params={{ id: t.id }}
                key={t.id}
                className="flex items-center gap-3 hover:bg-muted/40 rounded-lg p-2"
              >
                <div
                  className="h-10 w-10 rounded-full grid place-items-center text-white font-bold text-sm"
                  style={{ background: t.gradient }}
                >
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.subject} · ${t.price}/hr
                  </div>
                </div>
                <span className="text-xs text-amber-600">★ {t.rating}</span>
              </Link>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection id="payments" title="Payments">
          <div className="bg-card border rounded-2xl p-5 text-sm text-muted-foreground">
            <Link to="/payments" className="text-primary font-medium hover:underline">
              View payment history →
            </Link>
          </div>
        </DashboardSection>

        <DashboardSection id="messages" title="Messages">
          <div className="bg-card border rounded-2xl p-5 text-sm text-muted-foreground">
            <Link to="/messages" className="text-primary font-medium hover:underline">
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
