"use client";

import { Link } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { POPULAR_SUBJECT_LINKS } from "@/lib/seo-keywords";
import { SectionHeading } from "@/components/SectionHeading";

/** Visible, crawlable subject links — supports SEO without keyword stuffing. */
export function PopularSubjectsSeo() {
  const { t } = useTranslation("common");
  return (
    <section
      className="border-t bg-muted/20 py-12 md:py-16"
      aria-labelledby="popular-subjects-heading"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading
          id="popular-subjects-heading"
          title={t("popularSubjects.title")}
          subtitle={t("popularSubjects.subtitle")}
        />
        <nav aria-label={t("popularSubjects.aria")}>
          <ul className="mt-8 columns-2 gap-x-8 gap-y-0 sm:columns-3 lg:columns-4">
            {POPULAR_SUBJECT_LINKS.map(({ label, subject }) => (
              <li key={subject} className="mb-2 break-inside-avoid">
                <Link
                  to="/tutors"
                  search={{ subject }}
                  className="inline-flex text-sm font-medium text-primary/90 transition hover:text-primary hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t("popularSubjects.blurb")}
        </p>
      </div>
    </section>
  );
}
