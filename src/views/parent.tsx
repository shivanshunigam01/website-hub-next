"use client";

import { Link } from "@/lib/navigation";
import { LayoutDashboard, Heart, CreditCard, MessageCircle, BookOpen, TrendingUp, Award } from "lucide-react";
import { DashboardShell, DashboardSection, StatCard } from "@/components/dashboard/Shell";
import { useCourses, useTutors } from "@/hooks/use-catalog";
import { Progress } from "@/components/ui/progress";

const ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "progress", label: "Child's Progress", icon: BookOpen },
  { id: "tutors", label: "Recommended Tutors", icon: Heart },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "messages", label: "Messages", icon: MessageCircle },
];

function Parent() {
  const { data: courses = [] } = useCourses();
  const { data: tutors = [] } = useTutors();
  return (
    <DashboardShell items={ITEMS} title="Parent">
      <DashboardSection id="overview" title="Hi Ryan 👋" description="Here's what your child Liam is up to.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Hours this week" value="6.5h" change="+1.2h" icon={TrendingUp} />
          <StatCard label="Active courses" value="4" icon={BookOpen} color="from-purple-400 to-fuchsia-600" />
          <StatCard label="Test score avg" value="91%" change="↑ 3%" icon={Award} color="from-amber-400 to-orange-500" />
          <StatCard label="Spent (MTD)" value="$129" icon={CreditCard} color="from-emerald-400 to-teal-600" />
        </div>
      </DashboardSection>

      <DashboardSection id="progress" title="Liam's progress">
        <div className="bg-card border rounded-2xl p-5">
          {courses.slice(0, 4).map((c, i) => (
            <div key={c.id} className="mb-3">
              <div className="flex justify-between text-sm">
                <span className="font-semibold truncate">{c.title}</span>
                <span className="text-muted-foreground">{[78, 45, 92, 30][i]}%</span>
              </div>
              <Progress value={[78, 45, 92, 30][i]} className="h-1.5 mt-1" />
            </div>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection id="tutors" title="Recommended tutors">
        <div className="bg-card border rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
          {tutors.slice(0, 4).map((t) => (
            <Link to="/tutors/$id" params={{ id: t.id }} key={t.id} className="flex items-center gap-3 hover:bg-muted/40 rounded-lg p-2">
              <div className="h-10 w-10 rounded-full grid place-items-center text-white font-bold text-sm" style={{ background: t.gradient }}>{t.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.subject} · ${t.price}/hr</div>
              </div>
              <span className="text-xs text-amber-600">★ {t.rating}</span>
            </Link>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection id="payments" title="Payments">
        <div className="bg-card border rounded-2xl p-5 text-sm text-muted-foreground">
          <Link to="/payments" className="text-primary font-medium hover:underline">View payment history →</Link>
        </div>
      </DashboardSection>

      <DashboardSection id="messages" title="Messages">
        <div className="bg-card border rounded-2xl p-5 text-sm text-muted-foreground">
          <Link to="/messages" className="text-primary font-medium hover:underline">Open inbox →</Link>
        </div>
      </DashboardSection>
    </DashboardShell>
  );
}


export default Parent;
