"use client";

import { Link, useSearch } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { GraduationCap, BookOpen, Users } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const PORTALS = [
  {
    id: "student" as const,
    title: "Student",
    desc: "Courses, tutors, messages, and your learning dashboard.",
    icon: GraduationCap,
    color: "from-sky-400 to-blue-600",
    path: "/login/student",
  },
  {
    id: "teacher" as const,
    title: "Tutor",
    desc: "Jobs, connections, earnings, and your teaching profile.",
    icon: BookOpen,
    color: "from-purple-400 to-fuchsia-600",
    path: "/login/teacher",
  },
  {
    id: "parent" as const,
    title: "Parent",
    desc: "Manage requirements and follow your child's tutors.",
    icon: Users,
    color: "from-emerald-400 to-teal-600",
    path: "/login/parent",
  },
];

export default function LoginChooser() {
  const { t } = useTranslation("common");
  const { redirect } = useSearch<{ redirect?: string }>();

  return (
    <section className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8 flex justify-center">
        <BrandLogo size="login" />
      </div>
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Log in</h1>
        <p className="mt-3 text-muted-foreground">Choose how you use TeacherPoint.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("login.newHere", "New here?")}{" "}
          <Link to="/role-select" className="font-semibold text-primary">
            {t("login.createAccount", "Create an account")}
          </Link>
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {PORTALS.map((p) => (
          <Link
            key={p.id}
            to={p.path}
            search={redirect ? { redirect } : undefined}
            className="group block rounded-2xl border bg-card p-6 text-left transition hover:-translate-y-1 hover:shadow-card"
          >
            <div
              className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${p.color} text-white transition group-hover:scale-110`}
            >
              <p.icon className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-bold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            <p className="mt-4 text-sm font-semibold text-primary">Continue →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
