"use client";

import { Link } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { GraduationCap, BookOpen, Users } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const ROLES = [
  {
    id: "student" as const,
    titleKey: "roleSelect.studentTitle",
    descKey: "roleSelect.studentDesc",
    icon: GraduationCap,
    color: "from-sky-400 to-blue-600",
  },
  {
    id: "teacher" as const,
    titleKey: "roleSelect.tutorTitle",
    descKey: "roleSelect.tutorDesc",
    icon: BookOpen,
    color: "from-purple-400 to-fuchsia-600",
  },
  {
    id: "parent" as const,
    titleKey: "roleSelect.parentTitle",
    descKey: "roleSelect.parentDesc",
    icon: Users,
    color: "from-emerald-400 to-teal-600",
  },
];

function RoleSelect() {
  const { t } = useTranslation("common");
  return (
    <section className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-8 flex justify-center">
        <BrandLogo size="login" />
      </div>
      <div className="text-center mb-10">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl">{t("roleSelect.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("roleSelect.subtitle")}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("roleSelect.haveAccount")}{" "}
          <Link to="/login" className="text-primary font-semibold">
            {t("roleSelect.login")}
          </Link>
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
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
            <h3 className="font-display font-bold text-xl">{t(r.titleKey)}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t(r.descKey)}</p>
            <p className="text-sm text-primary font-semibold mt-4">{t("roleSelect.continue")}</p>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link to="/login/student" className="font-semibold text-primary hover:underline">
          Student
        </Link>
        {" · "}
        <Link to="/login/teacher" className="font-semibold text-primary hover:underline">
          Tutor
        </Link>
        {" · "}
        <Link to="/login/parent" className="font-semibold text-primary hover:underline">
          Parent
        </Link>
      </p>
    </section>
  );
}

export default RoleSelect;
