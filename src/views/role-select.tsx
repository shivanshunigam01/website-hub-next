"use client";

import { Link } from "@/lib/navigation";
import { GraduationCap, BookOpen } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const ROLES = [
  {
    id: "student" as const,
    title: "I'm a Student",
    desc: "Find tutors, take courses, earn certificates.",
    icon: GraduationCap,
    color: "from-sky-400 to-blue-600",
  },
  {
    id: "teacher" as const,
    title: "I'm a Tutor",
    desc: "Create courses, mentor students, earn money.",
    icon: BookOpen,
    color: "from-purple-400 to-fuchsia-600",
  },
];

function RoleSelect() {
  return (
    <section className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="mb-8 flex justify-center">
        <BrandLogo size="login" />
      </div>
      <div className="text-center mb-10">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl">Create your account</h1>
        <p className="mt-3 text-muted-foreground">Choose how you will use TeacherPoint.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Log in
          </Link>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {ROLES.map((r) => (
          <Link
            key={r.id}
            to="/register"
            search={{ role: r.id }}
            className="bg-card border rounded-2xl p-6 text-left hover:shadow-card hover:-translate-y-1 transition group block"
          >
            <div
              className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${r.color} text-white grid place-items-center mb-4 group-hover:scale-110 transition`}
            >
              <r.icon className="h-7 w-7" />
            </div>
            <h3 className="font-display font-bold text-xl">{r.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{r.desc}</p>
            <p className="text-sm text-primary font-semibold mt-4">Continue →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RoleSelect;
