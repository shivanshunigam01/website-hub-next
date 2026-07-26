"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "@/lib/navigation";
import { canonicalUrl } from "@/lib/site-config";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Monitor,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/hooks/use-app";
import {
  fetchWorkshopDetail,
  registerForWorkshop,
} from "@/services/workshops-api";
import { formatApiErrorMessage } from "@/lib/api";
import { useCurrency } from "@/hooks/use-currency";
import type { WorkshopDetail } from "@/types/workshop";
import { toast } from "sonner";

function WorkshopDetailPage() {
  const { t } = useTranslation("common");
  const { id } = useParams();
  const { formatLocalizedPrice } = useCurrency();
  const { role, user } = useApp();
  const [workshop, setWorkshop] = useState<WorkshopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWorkshopDetail(id, Boolean(user));
      setWorkshop(data);
      setRegistered(Boolean(data.registered));
    } catch (e) {
      toast.error(formatApiErrorMessage(e, t("workshopDetail.notFound", "Workshop not found")));
    } finally {
      setLoading(false);
    }
  }, [id, user, t]);

  useEffect(() => {
    load();
  }, [load]);

  const onRegister = async () => {
    if (role !== "student") {
      toast.error(t("workshopDetail.toastStudentLogin", "Please log in as a student to register"));
      return;
    }
    setRegistering(true);
    try {
      await registerForWorkshop(id);
      setRegistered(true);
      toast.success(t("workshopDetail.toastRegistered", "You're registered! Check your email for details."));
      load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, t("workshopDetail.toastRegistrationFailed", "Registration failed")));
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {t("workshopDetail.loading", "Loading workshop…")}
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">{t("workshopDetail.notFound", "Workshop not found")}</h1>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/workshops">{t("workshopDetail.backToWorkshops", "Back to workshops")}</Link>
        </Button>
      </div>
    );
  }

  const full = workshop.spotsLeft <= 0;
  const canRegister = role === "student" && !registered && !full;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6 text-muted-foreground">
        <Link to="/workshops">
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t("workshopDetail.allWorkshops", "All workshops")}
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border bg-muted aspect-video">
            {workshop.imageUrl ? (
              <img src={workshop.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center bg-gradient-to-br from-primary/20 to-indigo-500/10">
                <Calendar className="h-16 w-16 text-primary/40" />
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="secondary">{t(`category.${workshop.category}`, workshop.category)}</Badge>
            <Badge variant="outline" className="capitalize">
              {workshop.mode === "online" ? t("workshops.online") : t("workshops.offline")}
            </Badge>
            {workshop.isFree ? (
              <Badge className="bg-emerald-600">{t("workshops.free")}</Badge>
            ) : (
              <Badge>{formatLocalizedPrice(workshop.price, workshop.currency || "USD")}</Badge>
            )}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold">{workshop.title}</h1>
          <p className="mt-2 text-muted-foreground">{t("workshopDetail.hostedBy", "Hosted by {{name}}", { name: workshop.teacherName })}</p>
          <div className="prose prose-sm dark:prose-invert mt-6 max-w-none">
            <p className="whitespace-pre-wrap text-foreground/90">{workshop.description}</p>
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">{t("workshopDetail.scheduleRegistration", "Schedule & registration")}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {new Date(workshop.workshopDate).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {workshop.startTime} – {workshop.endTime}
              </li>
              <li className="flex items-start gap-3">
                {workshop.mode === "online" ? (
                  <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                )}
                {workshop.mode === "online" ? (
                  registered && workshop.meetingLink ? (
                    <a
                      href={workshop.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline break-all"
                    >
                      {t("workshopDetail.joinMeeting", "Join meeting link")}
                    </a>
                  ) : (
                    t("workshopDetail.linkAfterRegistration", "Link shared after registration")
                  )
                ) : (
                  workshop.location || t("workshopDetail.tba", "TBA")
                )}
              </li>
              <li className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {full ? (
                  <span className="text-destructive font-medium">{t("workshopDetail.workshopFull", "Workshop full")}</span>
                ) : (
                  <>
                    <span>
                      {workshop.spotsLeft === 1
                        ? t("workshopDetail.spotsLeftOne", "{{count}} spot left", { count: workshop.spotsLeft })
                        : t("workshopDetail.spotsLeft", "{{count}} spots left", { count: workshop.spotsLeft })}
                    </span>
                    <span className="text-muted-foreground">
                      {t("workshopDetail.enrolledCount", "({{enrolled}}/{{max}} enrolled)", {
                        enrolled: workshop.enrolledStudents,
                        max: workshop.maxStudents,
                      })}
                    </span>
                  </>
                )}
              </li>
            </ul>

            {registered ? (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                {t("workshopDetail.registeredBanner", "You're registered{{name}}! We'll send a reminder before the session.", {
                  name: user?.name ? `, ${user.name.split(" ")[0]}` : "",
                })}
              </div>
            ) : role && role !== "student" ? (
              <p className="mt-6 text-sm text-muted-foreground">
                {t("workshopDetail.studentsOnly", "Only student accounts can register for workshops.")}
              </p>
            ) : !role ? (
              <div className="mt-6 space-y-2">
                <Button asChild size="lg" variant="gradient" className="w-full">
                  <Link to="/login" search={{ redirect: `/workshops/${id}` }}>
                    {t("workshopDetail.loginToRegister", "Log in to register")}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link to="/role-select">{t("workshopDetail.createStudentAccount", "Create student account")}</Link>
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                variant="gradient"
                className="mt-6 w-full"
                disabled={registering || full}
                onClick={onRegister}
              >
                {registering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("workshopDetail.registering", "Registering…")}
                  </>
                ) : full ? (
                  t("workshopDetail.workshopFull", "Workshop full")
                ) : (
                  t("workshopDetail.register", "Register / Schedule workshop")
                )}
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default WorkshopDetailPage;
