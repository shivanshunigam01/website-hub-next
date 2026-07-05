"use client";

import { Link, useParams } from "@/lib/navigation";
import { useEffect, useState } from "react";
import {
  Star, Clock, BookOpen, Users, Award, PlayCircle, Globe,
  CheckCircle2, ShoppingCart, Heart, Circle, FileText, ClipboardList, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CourseCard } from "@/components/cards/CourseCard";
import { useApp } from "@/hooks/use-app";
import { useLmsStore, totalLessonCount, type LessonType } from "@/hooks/use-lms-store";
import { useCourse, useCourses } from "@/hooks/use-catalog";
import { useCourseLearning, useSubmitReview } from "@/hooks/use-learning";
import { formatApiErrorMessage } from "@/lib/api";
import { useCurrency } from "@/hooks/use-currency";
import { RatingStars } from "@/components/lms/RatingStars";
import { CertificateCard } from "@/components/lms/CertificateCard";
import { toast } from "sonner";

const LESSON_ICON: Record<LessonType, typeof PlayCircle> = {
  video: PlayCircle,
  reading: FileText,
  quiz: ClipboardList,
  assignment: FileText,
};

function CourseDetail() {
  const { id } = useParams();
  const { formatLocalizedPrice } = useCurrency();
  const { data: c, isLoading, error } = useCourse(id);
  const { data: allCourses = [] } = useCourses();
  const { user } = useApp();
  const lms = useLmsStore();
  const [curriculumReady, setCurriculumReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    setCurriculumReady(false);
    lms
      .loadCurriculum(id)
      .then(() => setCurriculumReady(true))
      .catch(() => setCurriculumReady(true));
  }, [id, lms]);

  const curriculum = lms.getCurriculum(id);
  const {
    enrollment,
    certificate: cert,
    progressPct: progress,
    isLessonDone,
    toggleLesson,
    enroll,
    reviews,
    summary: avg,
  } = useCourseLearning(id);
  const related = allCourses.filter((x) => x.id !== id && x.category === c?.category).slice(0, 4);

  if (isLoading || !curriculumReady) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !c) {
    return (
      <div className="container p-12 text-center">
        <p className="text-muted-foreground">Course not found.</p>
        <Button asChild className="mt-4">
          <Link to="/courses">Browse courses</Link>
        </Button>
      </div>
    );
  }

  const handleEnrol = async () => {
    if (!user) {
      toast.info("Please sign in to enrol.");
      return;
    }
    if (user.role !== "student") {
      toast.info("Switch to a student account to enrol in courses.");
      return;
    }
    const en = await enroll();
    if (en) toast.success(`Enrolled in ${c.title}`);
  };

  const displayRating = avg.count > 0 ? avg.rating : c!.rating;
  const displayReviewCount = avg.count > 0 ? avg.count : c!.reviews;

  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-12 grid lg:grid-cols-[1fr_380px] gap-10">
          <div>
            {c.bestseller && <Badge className="bg-amber-400 text-amber-950 mb-3">Bestseller</Badge>}
            <h1 className="font-display font-extrabold text-3xl md:text-5xl leading-tight">{c.title}</h1>
            <p className="mt-3 text-lg text-slate-200 max-w-2xl">{c.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1 text-amber-300">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <strong>{displayRating.toFixed(1)}</strong>
                ({displayReviewCount.toLocaleString()})
              </span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{c.students.toLocaleString()} students</span>
              <span className="flex items-center gap-1"><Globe className="h-4 w-4" />{c.language}</span>
              <span>Created by <strong className="text-amber-300">{c.instructor}</strong></span>
            </div>
          </div>
          <div className="lg:row-span-2"></div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 grid lg:grid-cols-[1fr_380px] gap-10">
        <div>
          {enrollment && (
            <div className="bg-card border rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Your progress</p>
                  <p className="font-display font-bold text-lg">{progress}% complete</p>
                  <p className="text-xs text-muted-foreground">
                    {enrollment.completedLessonIds?.length ?? 0} / {totalLessonCount(curriculum)} lessons
                  </p>
                </div>
                {progress === 100 && !cert && (
                  <p className="text-xs text-amber-600">Certificate generating… refresh in a moment.</p>
                )}
              </div>
              <Progress value={progress} className="mt-3 h-2" />
              {cert && (
                <div className="mt-5">
                  <CertificateCard cert={cert} />
                </div>
              )}
            </div>
          )}

          <div className="bg-card border rounded-2xl p-6 mb-6">
            <h2 className="font-display font-bold text-xl mb-4">What you'll learn</h2>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {["Production-ready skills", "Real-world projects", "Interview prep included", "Lifetime access", "Certificate of completion", "Mentor support"].map((x) => (
                <li key={x} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />{x}</li>
              ))}
            </ul>
          </div>

          <Tabs defaultValue="curriculum">
            <TabsList>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="mt-6">
              {curriculum.modules.length === 0 ? (
                <p className="text-sm text-muted-foreground">Curriculum is being prepared.</p>
              ) : (
                <Accordion type="single" collapsible defaultValue="m0" className="bg-card border rounded-2xl px-4">
                  {curriculum.modules.map((m, i) => (
                    <AccordionItem key={m.id} value={`m${i}`}>
                      <AccordionTrigger className="text-left">
                        <span>
                          <span className="font-bold mr-2">Module {i + 1}:</span>{m.title}
                          <span className="ms-2 text-xs text-muted-foreground">({m.lessons.length} lessons)</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {m.lessons.map((l) => {
                            const Icon = LESSON_ICON[l.type] ?? PlayCircle;
                          const done = isLessonDone(l.id);
                          return (
                            <li key={l.id} className="flex items-center gap-3 text-sm">
                              <button
                                type="button"
                                disabled={!enrollment}
                                onClick={() => toggleLesson(l.id, m.id)}
                                  className="shrink-0 disabled:cursor-not-allowed"
                                  aria-label={done ? "Mark incomplete" : "Mark complete"}
                                >
                                  {done
                                    ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    : <Circle className="h-5 w-5 text-muted-foreground/50" />}
                                </button>
                                <Icon className="h-4 w-4 text-primary" />
                                <span className={done ? "line-through text-muted-foreground" : ""}>{l.title}</span>
                                <span className="ms-auto text-xs text-muted-foreground">{l.duration}</span>
                                <Badge variant="outline" className="capitalize text-[10px]">{l.type}</Badge>
                              </li>
                            );
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
              {!enrollment && (
                <p className="text-xs text-muted-foreground mt-3">Enrol to start tracking your progress.</p>
              )}
            </TabsContent>

            <TabsContent value="instructor" className="mt-6">
              <div className="bg-card border rounded-2xl p-6 flex gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-primary text-white grid place-items-center font-display font-bold text-xl">{c.instructor[0]}</div>
                <div>
                  <h3 className="font-display font-bold text-lg">{c.instructor}</h3>
                  <p className="text-sm text-muted-foreground">Senior Engineer · 8+ years industry experience</p>
                  <p className="text-sm mt-3">Hands-on practitioner who has trained students worldwide. Loves making complex topics simple.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6 space-y-4">
              <ReviewSummary avg={avg} reviews={reviews} />
              <ReviewForm courseId={c.id} />
              {reviews.length === 0 && (
                <p className="text-sm text-muted-foreground">Be the first to leave a review.</p>
              )}
              {reviews.map((r) => (
                <div key={r.id} className="bg-card border rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary text-white grid place-items-center font-bold">{r.studentName[0]}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{r.studentName}</div>
                      <RatingStars value={r.rating} size={3} />
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="lg:-mt-48">
          <div className="bg-card border rounded-2xl shadow-card sticky top-24 overflow-hidden">
            <div
              className={`aspect-video relative ${c.gradient.startsWith("from-") ? `bg-gradient-to-br ${c.gradient}` : ""}`}
              style={c.gradient.startsWith("from-") ? undefined : { background: c.gradient }}
            >
              <div className="absolute inset-0 grid place-items-center"><PlayCircle className="h-16 w-16 text-white/90" /></div>
            </div>
            <div className="p-5">
              <div className="flex items-end gap-2">
                <span className="font-display font-extrabold text-3xl">{formatLocalizedPrice(c.price, c.currency || "USD")}</span>
                <span className="text-sm text-muted-foreground line-through">{formatLocalizedPrice(c.oldPrice, c.currency || "USD")}</span>
                <Badge className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {Math.round((1 - c.price / c.oldPrice) * 100)}% off
                </Badge>
              </div>

              {enrollment ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/30 p-3">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> You're enrolled
                  </p>
                  <Progress value={progress} className="mt-2 h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
                </div>
              ) : (
                <Button onClick={handleEnrol} size="lg" variant="gradient" className="mt-4 w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />Enrol now
                </Button>
              )}
              <Button variant="outline" size="lg" className="mt-2 w-full"><Heart className="h-4 w-4 mr-2" />Add to wishlist</Button>
              <ul className="mt-5 pt-5 border-t space-y-2 text-sm">
                <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{c.duration} on-demand</li>
                <li className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />{totalLessonCount(curriculum) || c.lessons} lessons</li>
                <li className="flex items-center gap-2"><Award className="h-4 w-4 text-primary" />Certificate included</li>
                <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />{c.language}</li>
              </ul>
            </div>
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <h2 className="font-display font-bold text-xl mb-6">Students also bought</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((r) => <CourseCard key={r.id} course={r} />)}
          </div>
        </section>
      )}
    </>
  );
}

function ReviewSummary({
  avg,
  reviews,
}: {
  avg: { rating: number; count: number };
  reviews: { id: string; studentName: string; rating: number; comment: string; createdAt: string }[];
}) {
  if (!reviews.length) return null;
  const buckets = [5, 4, 3, 2, 1].map((n) => ({
    n,
    pct: Math.round((reviews.filter((r) => r.rating === n).length / reviews.length) * 100),
  }));
  return (
    <div className="bg-card border rounded-2xl p-5 grid sm:grid-cols-[auto_1fr] gap-6">
      <div className="text-center">
        <p className="font-display font-extrabold text-4xl">{avg.rating.toFixed(1)}</p>
        <RatingStars value={avg.rating} />
        <p className="text-xs text-muted-foreground mt-1">{avg.count} review{avg.count === 1 ? "" : "s"}</p>
      </div>
      <div className="space-y-1.5">
        {buckets.map((b) => (
          <div key={b.n} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-muted-foreground">{b.n}★</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${b.pct}%` }} />
            </div>
            <span className="w-8 text-right text-muted-foreground">{b.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewForm({ courseId }: { courseId: string }) {
  const { user } = useApp();
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) {
      toast.info("Please sign in to leave a review.");
      return;
    }
    const trimmed = comment.trim();
    if (!trimmed || trimmed.length < 5) {
      toast.error("Please write at least a few words.");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({
        courseId,
        targetType: "course",
        rating,
        text: trimmed.slice(0, 600),
      });
      setComment("");
      toast.success("Thanks for your review!");
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Could not post review"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-5">
      <h3 className="font-display font-bold text-sm">Leave a review</h3>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Your rating:</span>
        <RatingStars value={rating} size={5} onChange={setRating} />
      </div>
      <Textarea
        className="mt-3"
        placeholder="Share what stood out about this course…"
        rows={3}
        maxLength={600}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <Button onClick={submit} disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Post review
        </Button>
      </div>
    </div>
  );
}

export default CourseDetail;
