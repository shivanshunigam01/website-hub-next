"use client";

import { Navigate } from "@/lib/navigation";

import { useEffect, useMemo, useState } from "react";
import {
  Plus, PlayCircle, BookOpen, FilePen, ClipboardList, BadgeCheck,
  Trash2, GripVertical, Layers, Users as UsersIcon, FileText, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { DashboardShell, StatCard } from "@/components/dashboard/Shell";
import { useApp } from "@/hooks/use-app";
import { useQuery } from "@tanstack/react-query";
import { useCourses } from "@/hooks/use-catalog";
import { useLmsStore, totalLessonCount, type LessonType } from "@/hooks/use-lms-store";
import { fetchCourseEnrollmentsForTeacher } from "@/services/learning-api";
import { CertificateCard } from "@/components/lms/CertificateCard";
import type { Certificate } from "@/types/learning";
import { toast } from "sonner";

const LMS_NAV = [
  { id: "builder", label: "Course Builder", icon: BookOpen },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "enrollments", label: "Enrollments", icon: UsersIcon },
  { id: "assignments", label: "Assignments", icon: FilePen },
  { id: "quizzes", label: "Quizzes", icon: ClipboardList },
  { id: "certificates", label: "Certificates", icon: BadgeCheck },
];

function LMS() {
  const { role } = useApp();
  const [tab, setTab] = useState("builder");
  if (role !== "teacher") return <Navigate to="/role-select" />;

  return (
    <DashboardShell items={LMS_NAV} title="LMS" activeSection={tab} onSectionChange={setTab}>
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl">Learning Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Build dynamic curricula, organise categories, track enrolments, and issue verified certificates.
        </p>
      </div>

      {tab === "builder" && <BuilderPanel />}
      {tab === "categories" && <CategoriesPanel />}
      {tab === "enrollments" && <EnrollmentsPanel />}
      {tab === "assignments" && <AssignmentsPanel />}
      {tab === "quizzes" && <QuizzesPanel />}
      {tab === "certificates" && <CertificatesPanel />}
    </DashboardShell>
  );
}

/* ---------------- Course Builder ---------------- */

function BuilderPanel() {
  const { data: courses = [], isLoading } = useCourses({ status: "published" });
  const lms = useLmsStore();
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    if (courses.length && !courseId) setCourseId(courses[0].id);
  }, [courses, courseId]);

  useEffect(() => {
    if (!courseId) return;
    lms.loadCurriculum(courseId).catch(() => {});
  }, [courseId, lms]);

  const course = courses.find((c) => c.id === courseId);
  const curriculum = lms.getCurriculum(courseId);
  const enrolled = lms.enrollments.filter((e) => e.courseId === courseId);
  const lessonsTotal = totalLessonCount(curriculum);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading courses from API…</p>;
  }
  if (!courses.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No published courses yet. Run <code className="text-xs bg-muted px-1 rounded">npm run seed</code> in the backend, then refresh.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-[260px] flex-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Active course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger className="mt-1 max-w-md"><SelectValue /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              Instructor: <span className="font-semibold text-foreground">{course?.instructor ?? "—"}</span> ·
              Category: <span className="font-semibold text-foreground">{course?.category ?? "—"}</span>
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:w-auto">
            <StatBox label="Modules" value={curriculum.modules.length} />
            <StatBox label="Lessons" value={lessonsTotal} />
            <StatBox label="Enrolled" value={enrolled.length} />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold">Dynamic curriculum</h2>
            <p className="text-xs text-muted-foreground">Drag-friendly modules with typed lessons (video, reading, quiz, assignment).</p>
          </div>
          <Button
            size="sm"
            onClick={() => { lms.addModule(courseId, `Module ${curriculum.modules.length + 1}`); toast.success("Module added"); }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add module
          </Button>
        </div>

        {curriculum.modules.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No modules yet — start by adding one.
          </div>
        )}

        <div className="space-y-3">
          {curriculum.modules.map((m, mi) => (
            <div key={m.id} className="rounded-xl border bg-background/40 p-4">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">MODULE {mi + 1}</span>
                <Input
                  value={m.title}
                  onChange={(e) => lms.updateModule(courseId, m.id, e.target.value)}
                  className="font-semibold flex-1 h-9"
                />
                <Button size="icon" variant="ghost" onClick={() => { lms.deleteModule(courseId, m.id); toast.success("Module deleted"); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <ul className="mt-3 space-y-2">
                {m.lessons.map((l) => (
                  <li key={l.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 rounded-lg border bg-card p-2">
                    <PlayCircle className="h-4 w-4 text-primary" />
                    <Input
                      value={l.title}
                      onChange={(e) => lms.updateLesson(courseId, m.id, l.id, { title: e.target.value })}
                      className="h-8"
                    />
                    <Select value={l.type} onValueChange={(v) => lms.updateLesson(courseId, m.id, l.id, { type: v as LessonType })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={l.duration}
                      onChange={(e) => lms.updateLesson(courseId, m.id, l.id, { duration: e.target.value })}
                      className="h-8 w-20"
                    />
                    <Button size="icon" variant="ghost" onClick={() => lms.deleteLesson(courseId, m.id, l.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>

              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => lms.addLesson(courseId, m.id, {})}
              >
                <Plus className="h-4 w-4 mr-1" /> Add lesson
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-background/60 px-4 py-2 text-center">
      <p className="text-[11px] uppercase text-muted-foreground">{label}</p>
      <p className="font-display font-bold text-xl">{value}</p>
    </div>
  );
}

/* ---------------- Categories ---------------- */

function CategoriesPanel() {
  const lms = useLmsStore();

  return (
    <div className="space-y-5">
      <div className="bg-card border rounded-2xl p-5">
        <h2 className="font-display font-bold">Categories & subcategories</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Categories are loaded from the API (seeded in the database). Teachers can view; admins manage via Admin → Categories.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {lms.categories.map((c) => (
          <div key={c.id} className="bg-card border rounded-2xl p-4">
            <h3 className="font-display font-bold">{c.name}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.subcategories.map((s) => (
                <Badge key={s.id} variant="secondary">{s.name}</Badge>
              ))}
              {c.subcategories.length === 0 && <span className="text-xs text-muted-foreground">No subcategories yet</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Enrollments ---------------- */

function EnrollmentsPanel() {
  const { data: courses = [] } = useCourses({ status: "published" });
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    if (courses.length && !courseId) setCourseId(courses[0].id);
  }, [courses, courseId]);

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["teacher-enrollments", courseId],
    queryFn: () => fetchCourseEnrollmentsForTeacher(courseId),
    enabled: !!courseId,
  });

  const stats = useMemo(() => {
    const total = enrollments.length;
    const completed = enrollments.filter((e) => e.status === "completed" || e.progressPercent >= 100).length;
    return { total, completed, active: total - completed };
  }, [enrollments]);

  return (
    <div className="space-y-5">
      <div className="max-w-md">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Course</Label>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Select course" /></SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard label="Total enrolments" value={String(stats.total)} icon={UsersIcon} />
        <StatCard label="In progress" value={String(stats.active)} icon={BookOpen} color="from-sky-400 to-indigo-600" />
        <StatCard label="Completed" value={String(stats.completed)} icon={Award} color="from-emerald-400 to-teal-600" />
      </div>
      <div className="bg-card border rounded-2xl p-5">
        <h2 className="font-display font-bold mb-3">Student enrolments</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && enrollments.length === 0 && (
          <p className="text-sm text-muted-foreground">No students enrolled in this course yet.</p>
        )}
        <ul className="space-y-3">
          {enrollments.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
              <div className="h-12 w-16 rounded-lg shrink-0 bg-gradient-primary" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{e.course?.title ?? "Course"}</p>
                <p className="text-xs text-muted-foreground">
                  {e.studentName ?? "Student"} · enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                </p>
                <Progress value={e.progressPercent} className="mt-2 h-1.5" />
              </div>
              <Badge variant={e.progressPercent >= 100 ? "default" : "secondary"}>{e.progressPercent}%</Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Assignments / Quizzes (lightweight) ---------------- */

function AssignmentsPanel() {
  return (
    <div className="bg-card border rounded-2xl p-6">
      <h2 className="font-display font-bold mb-3">Assignment</h2>
      <Input defaultValue="Build a chatbot with tool-calling" className="text-lg font-semibold mb-3" />
      <textarea
        className="w-full border rounded-lg p-3 text-sm min-h-[160px] bg-background"
        defaultValue="Create a chatbot that can search the web and summarize results. Submit your GitHub repo."
      />
      <div className="flex gap-3 mt-3">
        <Button variant="outline"><FileText className="h-4 w-4 mr-2" /> Attach brief</Button>
        <Button className="bg-gradient-primary">Save assignment</Button>
      </div>
    </div>
  );
}

function QuizzesPanel() {
  return (
    <div className="bg-card border rounded-2xl p-6">
      <h2 className="font-display font-bold mb-3">Quiz builder</h2>
      {[1, 2].map((q) => (
        <div key={q} className="border rounded-xl p-4 mb-3">
          <Input defaultValue={`Question ${q}: What does LLM stand for?`} className="font-semibold mb-3" />
          {["Large Language Model", "Linear Logic Machine", "Layered Learning Module", "None of the above"].map((opt, i) => (
            <label key={opt} className="flex items-center gap-2 text-sm py-1">
              <input type="radio" name={`q${q}`} defaultChecked={i === 0} />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <Button variant="outline"><Plus className="h-4 w-4 mr-1" /> Add question</Button>
    </div>
  );
}

/* ---------------- Certificates ---------------- */

function CertificatesPanel() {
  const { data: courses = [] } = useCourses({ status: "published" });
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    if (courses.length && !courseId) setCourseId(courses[0].id);
  }, [courses, courseId]);

  const { data: enrollments = [] } = useQuery({
    queryKey: ["teacher-enrollments", courseId],
    queryFn: () => fetchCourseEnrollmentsForTeacher(courseId),
    enabled: !!courseId,
  });

  const issued: Certificate[] = enrollments
    .filter((e) => e.certificate)
    .map((e) => ({
      id: e.certificate!.id,
      enrollmentId: e.id,
      courseId: e.courseId,
      studentName: e.certificate!.studentName,
      courseTitle: e.certificate!.courseTitle,
      instructor: e.certificate!.instructor,
      issuedAt: e.certificate!.issuedAt,
      serial: e.certificate!.serial,
    }));

  return (
    <div className="space-y-5">
      <div className="max-w-md">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Course</Label>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="bg-card border rounded-2xl p-5">
        <h2 className="font-display font-bold">Auto-generated certificates</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Certificates are created automatically when a student completes every lesson (100% progress).
        </p>
        {issued.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-4">No certificates issued for this course yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {issued.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="font-semibold text-sm">{c.studentName}</p>
                  <p className="text-xs text-muted-foreground">{c.courseTitle}</p>
                </div>
                <Badge>{c.serial}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
      {issued.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display font-bold">Certificate previews</h3>
          <div className="grid lg:grid-cols-1 gap-6">
            {issued.slice(0, 3).map((c) => (
              <CertificateCard key={c.id} cert={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LMS;
