"use client";

import { useRef } from "react";
import { Award, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Certificate } from "@/types/learning";

export function CertificateCard({ cert }: { cert: Certificate }) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const node = ref.current;
    if (!node) return;
    const html = node.outerHTML;
    const w = window.open("", "_blank", "width=1000,height=700");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${cert.serial}</title>
      <style>
        body{font-family:ui-sans-serif,system-ui;padding:40px;background:#f8fafc;}
        .cert{background:linear-gradient(135deg,#fffbeb,#fef3c7);border:8px double #b45309;padding:60px;text-align:center;border-radius:18px;}
        h1{font-size:42px;margin:18px 0 4px;color:#78350f;letter-spacing:.04em;}
        .sub{color:#92400e;letter-spacing:.4em;font-size:11px;text-transform:uppercase;}
        .name{font-size:48px;font-weight:800;color:#0f172a;margin:24px 0 8px;}
        .course{font-size:24px;font-weight:700;color:#1e293b;margin:6px 0 18px;}
        .meta{display:flex;justify-content:space-between;margin-top:60px;color:#475569;font-size:12px;}
        .seal{display:inline-flex;align-items:center;gap:6px;color:#b45309;font-weight:700;margin-top:18px;}
      </style></head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 250);
  };

  const issued = new Date(cert.issuedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className="cert relative overflow-hidden rounded-2xl border-[6px] border-double border-amber-700/70 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/20 p-8 sm:p-12 text-center shadow-xl"
      >
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-orange-300/30 blur-3xl" />

        <Award className="mx-auto h-14 w-14 text-amber-600" />
        <p className="sub mt-3 text-[11px] uppercase tracking-[0.4em] text-amber-700 dark:text-amber-400">
          Certificate of Completion
        </p>
        <p className="mt-6 text-sm text-muted-foreground">This is to certify that</p>
        <h1 className="name font-display text-3xl sm:text-5xl font-extrabold text-foreground mt-2">
          {cert.studentName}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">has successfully completed</p>
        <p className="course mt-2 font-display text-xl sm:text-2xl font-bold text-foreground">
          {cert.courseTitle}
        </p>
        <p className="seal mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
          <ShieldCheck className="h-4 w-4" /> TeacherPoint Verified
        </p>
        <div className="meta mt-10 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="text-left">
            <p className="font-semibold text-foreground">{cert.instructor}</p>
            <p>Instructor</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{issued}</p>
            <p>Issued</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">{cert.serial}</p>
            <p>Certificate ID</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handlePrint} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" /> Download / Print
        </Button>
      </div>
    </div>
  );
}
