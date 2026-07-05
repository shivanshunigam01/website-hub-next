"use client";

import { useNavigate } from "@/lib/navigation";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Info, Skull, X, Sparkles, GraduationCap, Rocket, Target, BookOpen, Trophy, Users, Loader2 } from "lucide-react";
import { ProfileAvatarUpload } from "@/components/ProfileAvatarUpload";
import { useApp } from "@/hooks/use-app";
import { useCurrency } from "@/hooks/use-currency";
import { afterAuthPath, TEACHER_ONBOARDING_PATH } from "@/lib/auth-redirect";
import { useDetectedPhoneCountryCode } from "@/hooks/use-detected-phone-country-code";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone-from-country";
import { formatStoredPhone, parseStoredPhone } from "@/lib/phone-codes";
import { CURRENCIES, getCurrencySymbol } from "@/lib/currencies";
import type { TeacherType, TeachingSubject } from "@/lib/auth-types";
import {
  TEACHING_LEVELS,
  formatTeachingSubjectLabel,
  isValidLevelRange,
  normalizeTeachingSubjects,
} from "@/lib/teaching-subjects";
import { TeachingSubjectPicker } from "@/components/tutors/TeachingSubjectPicker";
import { BIO_MIN_WORDS, BIO_MAX, countBioWords, isBioValid } from "@/lib/teacher-profile-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectWithOther } from "@/components/ui/SelectWithOther";
import { TEACHER_TYPE_OPTIONS } from "@/lib/teacher-profile-utils";
import { PhoneNumberField } from "@/components/PhoneNumberField";
import { formatApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

type TeacherGender = "male" | "female" | "other";

function formatBirthDate(value?: string | Date | null) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function ProfileSetup() {
  const { user, role, updateProfile, loading } = useApp();
  const { currency: detectedCurrency, setPreferredCurrency } = useCurrency();
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [grade, setGrade] = useState(user?.studentProfile?.grade || "");
  const [teacherType, setTeacherType] = useState<TeacherType | "">("");
  const [teacherTypeOther, setTeacherTypeOther] = useState(user?.teacherProfile?.teacherTypeOther || "");
  const [gender, setGender] = useState<TeacherGender | "">("");
  const [genderOther, setGenderOther] = useState(user?.teacherProfile?.genderOther || "");
  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_PHONE_COUNTRY_CODE);
  const hasSavedPhone = Boolean(user?.phone?.trim() || user?.phoneCountryCode);
  const { phoneCountryCode: detectedDial } = useDetectedPhoneCountryCode(!hasSavedPhone);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [teachingSubjects, setTeachingSubjects] = useState<TeachingSubject[]>([]);
  const [subjectDraft, setSubjectDraft] = useState("");
  const [fromLevel, setFromLevel] = useState("");
  const [toLevel, setToLevel] = useState("");
  const [currency, setCurrency] = useState<string>(
    user?.teacherProfile?.currency || detectedCurrency,
  );
  const [currencyTouched, setCurrencyTouched] = useState(false);

  useEffect(() => {
    if (currencyTouched) return;
    if (user?.teacherProfile?.currency) {
      setCurrency(user.teacherProfile.currency);
      return;
    }
    if (!detectedCurrency) return;
    setCurrency(detectedCurrency);
  }, [user?.teacherProfile?.currency, currencyTouched, detectedCurrency]);

  const addSubject = (presetName?: string) => {
    const name = (presetName ?? subjectDraft).trim();
    if (!name) {
      toast.error("Enter a subject name");
      return;
    }
    if (!fromLevel || !toLevel) {
      toast.error("Select both lowest and highest level");
      return;
    }
    if (!isValidLevelRange(fromLevel, toLevel)) {
      toast.error("Highest level must be the same as or above the lowest level");
      return;
    }
    if (teachingSubjects.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Subject already added");
      return;
    }
    setTeachingSubjects((prev) => [...prev, { name, fromLevel, toLevel }]);
    setSubjectDraft("");
    setFromLevel("");
    setToLevel("");
    toast.success("Subject added");
  };

  const removeSubject = (name: string) => {
    setTeachingSubjects((prev) => prev.filter((s) => s.name !== name));
  };

  useEffect(() => {
    if (user?.studentProfile?.grade) {
      setGrade(user.studentProfile.grade);
    }
    if (user?.teacherProfile?.teacherType) {
      setTeacherType(user.teacherProfile.teacherType);
    }
    setTeacherTypeOther(user?.teacherProfile?.teacherTypeOther || "");
    if (user?.teacherProfile?.gender) {
      setGender(user.teacherProfile.gender);
    }
    setGenderOther(user?.teacherProfile?.genderOther || "");
    if (user?.teacherProfile) {
      setTeachingSubjects(
        normalizeTeachingSubjects(user.teacherProfile.teachingSubjects, user.teacherProfile.subjects),
      );
    }
    if (user) {
      setAvatarUrl(user.avatarUrl || "");
      if (user.phone?.trim() || user.phoneCountryCode) {
        const parsed = parseStoredPhone(user.phone, user.phoneCountryCode);
        setPhoneCountryCode(parsed.countryCode);
        setPhoneNumber(parsed.number);
      }
    }
  }, [
    user?.teacherProfile?.teacherType,
    user?.teacherProfile?.gender,
    user?.teacherProfile?.teachingSubjects,
    user?.teacherProfile?.subjects,
    user?.teacherProfile,
    user?.phone,
    user?.phoneCountryCode,
    user,
  ]);

  useEffect(() => {
    if (hasSavedPhone || !detectedDial) return;
    setPhoneCountryCode(detectedDial);
  }, [hasSavedPhone, detectedDial]);

  useEffect(() => {
    if (loading || !user) return;
    if ((user.role === "teacher" || user.role === "student") && !user.isVerified) {
      nav({ to: "/verify-email" });
      return;
    }
    if (user.role === "teacher") {
      nav({ to: TEACHER_ONBOARDING_PATH });
    }
  }, [loading, user, nav]);

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;
  }

  if (!user || !role || (role !== "student" && role !== "teacher")) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Sign in as a student or tutor to complete your profile.</p>
        <Button className="mt-4" onClick={() => nav({ to: "/role-select" })}>
          Get started
        </Button>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      let result;
      if (role === "student") {
        const phone = formatStoredPhone(phoneCountryCode, phoneNumber);
        if (!phone) {
          toast.error("Please enter your phone number");
          setSaving(false);
          return;
        }
        result = await updateProfile({
          name: String(fd.get("name") || user.name),
          avatarUrl,
          phone,
          phoneCountryCode,
          studentProfile: {
            grade: grade.trim(),
            goals: String(fd.get("goals") || ""),
          },
        });
      } else {
        if (!teacherType) {
          toast.error("Please select your teacher type");
          setSaving(false);
          return;
        }
        if (teacherType === "other" && !teacherTypeOther.trim()) {
          toast.error("Please specify your teacher type");
          setSaving(false);
          return;
        }
        if (!gender) {
          toast.error("Please select your gender");
          setSaving(false);
          return;
        }
        if (gender === "other" && !genderOther.trim()) {
          toast.error("Please specify your gender");
          setSaving(false);
          return;
        }
        const birthDate = String(fd.get("birthDate") || "");
        if (!birthDate) {
          toast.error("Please enter your birth date");
          setSaving(false);
          return;
        }
        const phone = formatStoredPhone(phoneCountryCode, phoneNumber);
        if (!phone) {
          toast.error("Please enter your phone number");
          setSaving(false);
          return;
        }
        if (teachingSubjects.length === 0) {
          toast.error("Please add at least one subject you teach");
          setSaving(false);
          return;
        }
        if (teachingSubjects.some((entry) => !entry.fromLevel || !entry.toLevel)) {
          toast.error("Each subject needs a from level and to level");
          setSaving(false);
          return;
        }
        const bio = String(fd.get("bio") || "").trim();
        if (!isBioValid(bio)) {
          const words = countBioWords(bio);
          toast.error(`Bio must be at least ${BIO_MIN_WORDS} words (${words}/${BIO_MIN_WORDS})`);
          setSaving(false);
          return;
        }
        result = await updateProfile({
          name: String(fd.get("name") || user.name),
          avatarUrl,
          phone,
          phoneCountryCode,
          teacherProfile: {
            teacherType,
            teacherTypeOther: teacherType === "other" ? teacherTypeOther.trim() : undefined,
            speciality: String(fd.get("speciality") || ""),
            gender,
            genderOther: gender === "other" ? genderOther.trim() : undefined,
            birthDate,
            teachingSubjects,
            subjects: teachingSubjects.map((entry) => entry.name),
            bio,
            hourlyRate: Number(fd.get("hourlyRate") || 0),
            currency,
            location: String(fd.get("location") || ""),
            experience: Number(fd.get("experience") || 0),
            availability: String(fd.get("availability") || ""),
            languages: String(fd.get("languages") || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
        });
      }
      toast.success("Personal details updated");
      if (result?.welcomeEmailSent) {
        toast.success(
          `Welcome email with courses sent to ${user.email}. Check your inbox!`,
          { duration: 8000 },
        );
      }
      nav({
        to: afterAuthPath(role, result?.profileComplete ?? true, result?.isVerified !== false),
      });
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not save profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative animated blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/30 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute top-1/3 left-1/2 h-72 w-72 rounded-full bg-secondary/30 blur-3xl"
          animate={{ x: [-40, 40, -40], y: [20, -20, 20] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container relative mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-16">
        {/* LEFT — visual / video panel */}
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative hidden overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/90 via-primary to-primary/70 p-8 text-primary-foreground shadow-2xl lg:flex lg:flex-col lg:justify-between"
        >
          {/* Looping background video */}
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=60"
          >
            <source src="/videos/profile-hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/25 to-transparent" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {role === "teacher" ? "Tutor onboarding" : "Welcome aboard"}
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold leading-tight">
              {role === "teacher"
                ? "Build a profile students trust."
                : "Your learning journey, personalised."}
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/85">
              {role === "teacher"
                ? "A complete profile unlocks discovery — show off your subjects, levels and style."
                : "Tell us a little about you so we can match the right tutors, classes and resources."}
            </p>
          </div>

          {/* Floating stat cards */}
          <div className="relative mt-10 grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: "Active learners", value: "120k+" },
              { icon: GraduationCap, label: "Verified tutors", value: "8.4k" },
              { icon: Trophy, label: "Sessions / mo", value: "45k" },
              { icon: Rocket, label: "Avg. rating", value: "4.9★" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"
              >
                <s.icon className="h-5 w-5" />
                <div className="mt-2 text-xl font-bold">{s.value}</div>
                <div className="text-[11px] uppercase tracking-wide text-white/75">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.aside>

        {/* RIGHT — form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Target className="h-3.5 w-3.5 text-primary" />
              Step 1 of 1 · takes ~60 seconds
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Complete your profile
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {role === "teacher"
                ? "Tutors need a public profile before students can find you."
                : "Help us personalize your learning experience."}
            </p>
          </div>

          <form
            className="space-y-4 rounded-3xl border bg-card/80 p-6 shadow-xl backdrop-blur-xl sm:p-8"
            onSubmit={onSubmit}
          >
            <div className="pointer-events-none absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-xl" />
            <div>
          <Label htmlFor="name" className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-primary" /> Full name</Label>
          <Input id="name" name="name" required defaultValue={user.name} className="mt-1" />
        </div>
        <ProfileAvatarUpload
          name={user.name}
          avatarUrl={avatarUrl}
          uploading={uploadingAvatar}
          onUploadingChange={setUploadingAvatar}
          onAvatarChange={setAvatarUrl}
          hint={
            role === "teacher"
              ? "Shown on the tutor directory and your public tutor profile."
              : "Shown on your student profile and when you message tutors."
          }
        />
        {role === "student" && (
          <PhoneNumberField
            countryCode={phoneCountryCode}
            onCountryCodeChange={setPhoneCountryCode}
            phoneNumber={phoneNumber}
            onPhoneNumberChange={setPhoneNumber}
            userHasSavedPhone={Boolean(user?.phone?.trim() || user?.phoneCountryCode)}
          />
        )}

        {role === "student" ? (
          <>
            <div>
              <Label htmlFor="grade">Grade / level</Label>
              <SelectWithOther
                id="grade"
                className="mt-1"
                options={TEACHING_LEVELS}
                value={grade}
                onValueChange={setGrade}
                placeholder="-- Select your grade / level --"
                otherPlaceholder="Enter your grade or level"
                required
              />
            </div>
            <div>
              <Label htmlFor="goals">Learning goals (optional)</Label>
              <Textarea id="goals" name="goals" className="mt-1" defaultValue={user.studentProfile?.goals || ""} />
            </div>
          </>
        ) : (
          <>
            <div>
              <Label htmlFor="teacherType">I am</Label>
              <SelectWithOther
                id="teacherType"
                mode="enum-other"
                className="mt-1"
                options={TEACHER_TYPE_OPTIONS}
                value={teacherType}
                customValue={teacherTypeOther}
                onValueChange={(v) => setTeacherType(v as TeacherType)}
                onCustomValueChange={setTeacherTypeOther}
                placeholder="Please select"
                otherPlaceholder="Describe your teacher type"
                required
              />
            </div>

            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <h2 className="font-semibold text-sm text-foreground">Basic Details</h2>
              <div>
                <Label htmlFor="speciality">Speciality, Strength or Current role</Label>
                <Input
                  id="speciality"
                  name="speciality"
                  required
                  className="mt-1"
                  defaultValue={user.teacherProfile?.speciality || ""}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <SelectWithOther
                  id="gender"
                  mode="enum-other"
                  className="mt-1"
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                  value={gender}
                  customValue={genderOther}
                  onValueChange={(v) => setGender(v as TeacherGender)}
                  onCustomValueChange={setGenderOther}
                  placeholder="Please select"
                  otherPlaceholder="Please specify"
                  required
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  required
                  className="mt-1"
                  defaultValue={formatBirthDate(user.teacherProfile?.birthDate)}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <h2 className="font-semibold text-sm text-foreground">
                Address <span className="font-normal text-muted-foreground">(Publicly visible)</span>
              </h2>
              <Alert className="border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100">
                <Info className="h-4 w-4" />
                <AlertDescription className="space-y-2 text-sm leading-relaxed">
                  <p>
                    This address is publicly visible. Please give your local area/society so students know your
                    approximate location.
                  </p>
                  <p className="flex items-start gap-2 text-destructive">
                    <Skull className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>For your safety, do not give the complete address.</span>
                  </p>
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  required
                  placeholder="e.g. Koramangala, Bangalore"
                  className="mt-1"
                  defaultValue={user.teacherProfile?.location || ""}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">Tip: Be as local as you can.</p>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <h2 className="font-semibold text-sm text-foreground">Phone Numbers</h2>
              <PhoneNumberField
                id="phoneNumber"
                label="Add Phone"
                countryCode={phoneCountryCode}
                onCountryCodeChange={setPhoneCountryCode}
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
                userHasSavedPhone={Boolean(user?.phone?.trim() || user?.phoneCountryCode)}
              />
            </div>

            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-sm text-foreground">Subjects you Teach</h2>
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => addSubject()}
                >
                  Add a subject
                </button>
              </div>

              {teachingSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {teachingSubjects.map((entry) => (
                    <Badge key={entry.name} variant="secondary" className="gap-1 pr-1">
                      {formatTeachingSubjectLabel(entry)}
                      <button
                        type="button"
                        className="rounded-full p-0.5 hover:bg-muted"
                        aria-label={`Remove ${entry.name}`}
                        onClick={() => removeSubject(entry.name)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <TeachingSubjectPicker
                inputId="subjectDraft"
                value={subjectDraft}
                onChange={setSubjectDraft}
                exclude={teachingSubjects.map((s) => s.name)}
              />
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => addSubject()}
              >
                Add subject with levels below
              </button>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromLevel">From level</Label>
                  <SelectWithOther
                    id="fromLevel"
                    className="mt-1"
                    options={TEACHING_LEVELS}
                    value={fromLevel}
                    onValueChange={setFromLevel}
                    placeholder="-- Select Lowest Level --"
                    otherPlaceholder="Enter lowest level"
                  />
                </div>
                <div>
                  <Label htmlFor="toLevel">To level</Label>
                  <SelectWithOther
                    id="toLevel"
                    className="mt-1"
                    options={TEACHING_LEVELS}
                    value={toLevel}
                    onValueChange={setToLevel}
                    placeholder="-- Select Highest Level --"
                    otherPlaceholder="Enter highest level"
                  />
                </div>
              </div>

              <Button type="button" className="bg-gradient-primary" onClick={() => addSubject()}>
                Save
              </Button>
            </div>

            <div>
              <Label htmlFor="bio">Bio (minimum {BIO_MIN_WORDS} words)</Label>
              <Textarea
                id="bio"
                name="bio"
                required
                maxLength={BIO_MAX}
                className="mt-1 min-h-40"
                defaultValue={user.teacherProfile?.bio || ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourlyRate">Hourly rate ({currency})</Label>
                <div className="mt-1 flex gap-2">
                  <Select
                    value={currency}
                    onValueChange={(v) => {
                      setCurrency(v);
                      setCurrencyTouched(true);
                      setPreferredCurrency(v);
                    }}
                  >
                    <SelectTrigger className="w-28 shrink-0" aria-label="Currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    required
                    min={1}
                    className="flex-1"
                    defaultValue={user.teacherProfile?.hourlyRate ?? ""}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Default currency for new listings. You can change it.
                </p>
              </div>
              <div>
                <Label htmlFor="experience">Years of experience</Label>
                <Input id="experience" name="experience" type="number" min={0} className="mt-1" defaultValue={user.teacherProfile?.experience ?? ""} />
              </div>
            </div>
            <div>
              <Label htmlFor="languages">Languages (comma-separated)</Label>
              <Input id="languages" name="languages" className="mt-1" defaultValue={user.teacherProfile?.languages?.join(", ") || "English"} />
            </div>
            <div>
              <Label htmlFor="availability">Availability</Label>
              <Input id="availability" name="availability" className="mt-1" defaultValue={user.teacherProfile?.availability || ""} placeholder="Weekdays · Evenings" />
            </div>
          </>
        )}

        <Button type="submit" className="w-full bg-gradient-primary" disabled={saving}>
          {saving ? "Saving…" : "Submit"}
        </Button>
      </form>
        </motion.div>
      </div>
    </section>
  );
}

export default ProfileSetup;
