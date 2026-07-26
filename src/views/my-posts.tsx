"use client";

import { Link } from "@/lib/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, ExternalLink, Loader2, FileText } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LearnerSubNav } from "@/components/layout/LearnerSubNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyRequirements } from "@/hooks/use-requirements-api";
import { useCurrency } from "@/hooks/use-currency";
import {
  jobTypeLabel,
  requirementModeLabel,
  requirementStatusClass,
  requirementStatusLabel,
} from "@/lib/tutor-jobs-utils";
import type { Requirement } from "@/types/requirement";

function PostCard({ post }: { post: Requirement }) {
  const { t } = useTranslation("common");
  const { formatLocalizedPrice } = useCurrency();
  const isLive = post.status === "approved";

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold leading-snug">{post.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {post.subject}
            {post.level ? ` · ${post.level}` : ""}
            {" · "}
            {jobTypeLabel(post.jobType)}
            {" · "}
            {requirementModeLabel(post.mode)}
          </p>
          {(post.city || post.location) && (
            <p className="mt-1 text-xs text-muted-foreground">{post.city || post.location}</p>
          )}
        </div>
        <Badge className={requirementStatusClass(post.status)}>
          {requirementStatusLabel(post.status)}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{post.details}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {formatLocalizedPrice(post.budget, post.currency)}/hr
          <span className="ms-2 text-xs font-normal text-muted-foreground">
            {t("myPosts.postedOn", "Posted {{date}}", {
              date: new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" }),
            })}
          </span>
        </p>
        {isLive ? (
          <Button asChild size="sm" variant="outline">
            <Link to="/tutor-jobs/$id" params={{ id: post.id }}>
              {t("myPosts.viewLive", "View live job")}
              <ExternalLink className="ms-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function MyPostsContent() {
  const { t } = useTranslation("common");
  const { data: posts = [], isLoading, isError } = useMyRequirements(true);

  const approved = useMemo(() => posts.filter((p) => p.status === "approved"), [posts]);
  const other = useMemo(
    () => posts.filter((p) => p.status !== "approved"),
    [posts],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          {t("myPosts.loadError", "Could not load your posts. Please try again.")}
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center sm:py-24">
        <FileText className="h-12 w-12 text-muted-foreground/40" />
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {t("myPosts.empty", "You haven't posted any requirements yet.")}
        </p>
        <Button asChild size="lg" className="mt-6 min-w-[12rem]">
          <Link to="/post-requirement">{t("myPosts.postCta", "Post a requirement")}</Link>
        </Button>
        <p className="my-3 text-sm text-muted-foreground">{t("myPosts.or", "or")}</p>
        <Button asChild size="lg" variant="destructive" className="min-w-[12rem]">
          <Link to="/tutors">{t("myPosts.findTeachers", "Find teachers")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">
              {t("myPosts.title", "My Posts")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "myPosts.approvedHint",
                "Requirements approved by TeacherPoint appear on the tutor jobs board.",
              )}
            </p>
          </div>
          <Button asChild variant="gradient" size="sm">
            <Link to="/post-requirement">{t("myPosts.postCta", "Post a requirement")}</Link>
          </Button>
        </div>

        {approved.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t(
                "myPosts.noApproved",
                "No approved posts yet. Pending requests show below after you submit.",
              )}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {approved.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {other.length > 0 ? (
        <section>
          <h2 className="font-display text-lg font-bold">
            {t("myPosts.otherHeading", "Pending & other")}
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            {t(
              "myPosts.otherHint",
              "These posts are waiting for admin review or are no longer live.",
            )}
          </p>
          <div className="grid gap-4">
            {other.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function MyPostsPage() {
  return (
    <RequireAuth roles={["student", "parent"]}>
      <LearnerSubNav />
      <section className="container mx-auto px-4 py-8 sm:px-6 lg:py-10">
        <MyPostsContent />
      </section>
    </RequireAuth>
  );
}

export default MyPostsPage;
