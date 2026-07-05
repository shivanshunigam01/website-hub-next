"use client";

import { useNavigate, useRouterState } from "@/lib/navigation";
import { useEffect, useMemo, useState } from "react";
import { Info, Loader2, Skull, Sparkles, X } from "lucide-react";
import { ProfileAvatarUpload } from "@/components/ProfileAvatarUpload";
import { PhoneNumberField } from "@/components/PhoneNumberField";
import { ProfileCompletionProgress, scrollToTeacherProfileForm } from "@/components/teacher/ProfileCompletionProgress";
import {
  EducationFormSection,
  ExperienceFormSection,
} from "@/components/teacher/ProfileEntrySections";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectWithOther } from "@/components/ui/SelectWithOther";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/hooks/use-app";
import { useCurrency } from "@/hooks/use-currency";
import { afterAuthPath } from "@/lib/auth-redirect";
import type { EducationEntry, ExperienceEntry, TeacherType, TeachingSubject } from "@/lib/auth-types";
import { formatApiErrorMessage } from "@/lib/api";
import { CURRENCIES, getCurrencySymbol } from "@/lib/currencies";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone-from-country";
import { formatStoredPhone, parseStoredPhone } from "@/lib/phone-codes";
import { useDetectedPhoneCountryCode } from "@/hooks/use-detected-phone-country-code";
import {
  BIO_MAX,
  BIO_MIN_WORDS,
  TEACHER_TYPE_OPTIONS,
  computeTeacherProfileProgress,
  countBioWords,
  formatBirthDate,
  isBioValid,
} from "@/lib/teacher-profile-utils";
import {
  TEACHING_LEVELS,
  formatTeachingSubjectLabel,
  isValidLevelRange,
  normalizeTeachingSubjects,
} from "@/lib/teaching-subjects";
import { TeachingSubjectPicker } from "@/components/tutors/TeachingSubjectPicker";
import { saveTeacherProfile } from "@/services/teacher-profile-api";
import { toast } from "sonner";



type TeacherGender = "male" | "female" | "other";

function TeacherOnboardingProfile() {
  const { user, role, loading, refreshUser } = useApp();
  const { currency: detectedCurrency, setPreferredCurrency } = useCurrency();
  const nav = useNavigate();
  const locationHash = useRouterState({ select: (s) => s.location.hash });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [teacherType, setTeacherType] = useState<TeacherType | "">("");
  const [teacherTypeOther, setTeacherTypeOther] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState<TeacherGender | "">("");
  const [genderOther, setGenderOther] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [publicLocation, setPublicLocation] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_PHONE_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = useState("");
  const hasSavedPhone = Boolean(user?.phone?.trim() || user?.phoneCountryCode);
  const { phoneCountryCode: detectedDial } = useDetectedPhoneCountryCode(!hasSavedPhone);
  const [teachingSubjects, setTeachingSubjects] = useState<TeachingSubject[]>([]);
  const [subjectDraft, setSubjectDraft] = useState("");
  const [fromLevel, setFromLevel] = useState("");
  const [toLevel, setToLevel] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [currency, setCurrency] = useState(detectedCurrency);
  const [currencyTouched, setCurrencyTouched] = useState(false);
  const [languages, setLanguages] = useState("English");
  const [availability, setAvailability] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("");
  const [onlineTeaching, setOnlineTeaching] = useState(false);
  const [homeTuition, setHomeTuition] = useState(false);
  const [groupClasses, setGroupClasses] = useState(false);
  const [assignmentHelp, setAssignmentHelp] = useState(false);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>([]);

  useEffect(() => {
    if (!user?.teacherProfile) return;
    const p = user.teacherProfile;
    setName(user.name || "");
    setAvatarUrl(user.avatarUrl || p.profilePhoto || "");
    setTeacherType(p.teacherType || "");
    setTeacherTypeOther(p.teacherTypeOther || "");
    setSpeciality(p.speciality || "");
    setBio(p.bio || "");
    setGender(p.gender || "");
    setGenderOther(p.genderOther || "");
    setBirthDate(formatBirthDate(p.birthDate));
    setCountry(p.country || "");
    setState(p.state || "");
    setCity(p.city || "");
    setLocality(p.locality || "");
    setPublicLocation(p.publicLocation || "");
    setTeachingSubjects(normalizeTeachingSubjects(p.teachingSubjects, p.subjects));
    setYearsOfExperience(String(p.yearsOfExperience ?? p.experience ?? ""));
    setHourlyRate(p.hourlyRate != null ? String(p.hourlyRate) : "");
    setCurrency(p.currency || detectedCurrency);
    setLanguages(p.languages?.join(", ") || "English");
    setAvailability(p.availability || "");
    setTeachingStyle(p.teachingStyle || "");
    setOnlineTeaching(!!p.onlineTeaching);
    setHomeTuition(!!p.homeTuition);
    setGroupClasses(!!p.groupClasses);
    setAssignmentHelp(!!p.assignmentHelp);
    setEducation(p.education?.length ? p.education : []);
    setExperienceEntries(
      p.experiences?.length ? p.experiences : p.experienceEntries?.length ? p.experienceEntries : [],
    );
    const parsed = parseStoredPhone(user.phone, user.phoneCountryCode);
    if (user.phone?.trim() || user.phoneCountryCode) {
      setPhoneCountryCode(parsed.countryCode);
      setPhoneNumber(parsed.number);
    }
  }, [user]);

  useEffect(() => {
    if (hasSavedPhone || !detectedDial) return;
    setPhoneCountryCode(detectedDial);
  }, [hasSavedPhone, detectedDial]);

  useEffect(() => {
    if (currencyTouched) return;
    if (user?.teacherProfile?.currency) return;
    if (detectedCurrency) setCurrency(detectedCurrency);
  }, [detectedCurrency, currencyTouched, user?.teacherProfile?.currency]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav({ to: "/login", search: { redirect: "/teacher/onboarding/profile" } });
      return;
    }
    if (user.role !== "teacher") {
      nav({ to: "/profile" });
      return;
    }
    if (!user.isVerified) {
      nav({ to: "/verify-email" });
      return;
    }
    const savedProgress = computeTeacherProfileProgress(user);
    const editingProfile = locationHash === "teacher-profile-form";
    if (savedProgress.percent >= 100 && user.profileComplete && !editingProfile) {
      nav({ to: "/teacher" });
    }
  }, [loading, user, nav, locationHash]);

  useEffect(() => {
    if (loading || locationHash !== "teacher-profile-form") return;
    const timer = window.setTimeout(() => {
      scrollToTeacherProfileForm();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [loading, locationHash]);

  const draftUser = useMemo(
    () =>
      user
        ? {
            ...user,
            name,
            avatarUrl,
            teacherProfile: {
              ...user.teacherProfile,
              profilePhoto: avatarUrl,
              bio,
              teachingSubjects,
              subjects: teachingSubjects.map((s) => s.name),
              education,
              experiences: experienceEntries,
              experienceEntries,
              country,
              city,
              locality,
              publicLocation,
              hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
            },
          }
        : null,
    [
      user,
      name,
      avatarUrl,
      bio,
      teachingSubjects,
      education,
      experienceEntries,
      country,
      city,
      locality,
      publicLocation,
      hourlyRate,
    ],
  );

  const progress = useMemo(
    () => computeTeacherProfileProgress(draftUser),
    [draftUser],
  );

  const addSubject = (presetName?: string) => {
    const subjectName = (presetName ?? subjectDraft).trim();
    if (!subjectName) {
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
    if (teachingSubjects.some((s) => s.name.toLowerCase() === subjectName.toLowerCase())) {
      toast.error("Subject already added");
      return;
    }
    setTeachingSubjects((prev) => [...prev, { name: subjectName, fromLevel, toLevel }]);
    setSubjectDraft("");
    setFromLevel("");
    setToLevel("");
  };

  const validateForm = () => {
    if (!avatarUrl.trim()) {
      toast.error("Please upload a profile photo");
      return false;
    }
    if (!teacherType) {
      toast.error("Please select your teacher type");
      return false;
    }
    if (teacherType === "other" && !teacherTypeOther.trim()) {
      toast.error("Please specify your teacher type");
      return false;
    }
    if (!speciality.trim()) {
      toast.error("Please enter your specialty or current role");
      return false;
    }
    if (!isBioValid(bio)) {
      const words = countBioWords(bio);
      toast.error(`Bio must be at least ${BIO_MIN_WORDS} words (${words}/${BIO_MIN_WORDS} — about ${Math.max(0, BIO_MIN_WORDS - words)} more needed)`);
      return false;
    }
    if (bio.trim().length > BIO_MAX) {
      toast.error(`Bio cannot exceed ${BIO_MAX} characters`);
      return false;
    }
    if (!gender) {
      toast.error("Please select your gender");
      return false;
    }
    if (gender === "other" && !genderOther.trim()) {
      toast.error("Please specify your gender");
      return false;
    }
    if (!birthDate) {
      toast.error("Please enter your date of birth");
      return false;
    }
    if (!country.trim() || !city.trim()) {
      toast.error("Country and city are required");
      return false;
    }
    if (!formatStoredPhone(phoneCountryCode, phoneNumber)) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (teachingSubjects.length === 0) {
      toast.error("Please add at least one subject");
      return false;
    }
    if (education.length === 0 || education.some((e) => !e.degree.trim() || !e.institute.trim())) {
      toast.error("Please add at least one complete education entry");
      return false;
    }
    if (
      experienceEntries.length === 0 ||
      experienceEntries.some((e) => !e.title.trim() || !e.organization.trim())
    ) {
      toast.error("Please add at least one complete experience entry");
      return false;
    }
    if (!hourlyRate || Number(hourlyRate) <= 0) {
      toast.error("Please enter your hourly rate");
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const phone = formatStoredPhone(phoneCountryCode, phoneNumber);
      const payload = {
        name: name.trim(),
        avatarUrl,
        phone: phone || undefined,
        phoneCountryCode,
        teacherProfile: {
          profilePhoto: avatarUrl,
          teacherType,
          teacherTypeOther: teacherType === "other" ? teacherTypeOther.trim() : undefined,
          speciality: speciality.trim(),
          bio: bio.trim(),
          gender,
          genderOther: gender === "other" ? genderOther.trim() : undefined,
          birthDate,
          country: country.trim(),
          state: state.trim(),
          city: city.trim(),
          locality: locality.trim(),
          publicLocation: publicLocation.trim() || [locality, city, state, country].filter(Boolean).join(", "),
          teachingSubjects,
          subjects: teachingSubjects.map((s) => s.name),
          yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : 0,
          experience: yearsOfExperience ? Number(yearsOfExperience) : 0,
          hourlyRate: Number(hourlyRate),
          currency,
          languages: languages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          availability: availability.trim(),
          teachingStyle: teachingStyle.trim(),
          onlineTeaching,
          homeTuition,
          groupClasses,
          assignmentHelp,
          education,
          experiences: experienceEntries,
          experienceEntries,
        },
      };

      const result = await saveTeacherProfile(payload, user?.profileComplete ? "PUT" : "POST");
      await refreshUser();
      toast.success(result.profileComplete ? "Profile completed — welcome to your dashboard!" : "Progress saved");
      if (result.welcomeEmailSent) {
        toast.success("Welcome email sent to your inbox", { duration: 8000 });
      }
      nav({
        to: afterAuthPath(role!, result.profileComplete ?? false, result.isVerified !== false),
      });
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Could not save profile"));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }

  const bioWordCount = countBioWords(bio);
  const bioValid = isBioValid(bio);

  return (
    <section className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Mandatory tutor profile
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">Complete your tutor profile</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Students can only discover you after your profile is complete. Fill every required section below.
          </p>
        </div>

        <ProfileCompletionProgress progress={progress} className="mb-8" onSamePage />

        <form id="teacher-profile-form" onSubmit={onSubmit} className="scroll-mt-24 space-y-6">
          <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Basic information</h2>
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <ProfileAvatarUpload
              name={name}
              avatarUrl={avatarUrl}
              uploading={uploadingAvatar}
              onUploadingChange={setUploadingAvatar}
              onAvatarChange={setAvatarUrl}
              hint="Required — shown on the tutor directory and your public profile."
            />
            <div>
              <Label>Teacher type</Label>
              <SelectWithOther
                mode="enum-other"
                className="mt-1"
                options={TEACHER_TYPE_OPTIONS}
                value={teacherType}
                customValue={teacherTypeOther}
                onValueChange={(v) => setTeacherType(v as TeacherType)}
                onCustomValueChange={setTeacherTypeOther}
                placeholder="Select type"
                otherPlaceholder="Describe your teacher type"
                required
              />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Professional information</h2>
            <div>
              <Label htmlFor="speciality">Specialty / strength / current role</Label>
              <Input
                id="speciality"
                className="mt-1"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bio">Bio / about me</Label>
                <span
                  className={`text-xs ${!bioValid ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {bioWordCount} / {BIO_MIN_WORDS} words · {bio.trim().length} / {BIO_MAX} chars
                </span>
              </div>
              <Textarea
                id="bio"
                className="mt-1 min-h-40"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={BIO_MAX}
                placeholder="Describe your teaching experience, subjects, results, and approach. Minimum 150 words."
                required
              />
              {!bioValid && (
                <p className="mt-1 text-xs text-destructive">
                  Minimum {BIO_MIN_WORDS} words required ({Math.max(0, BIO_MIN_WORDS - bioWordCount)} more words needed)
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="yearsOfExperience">Years of experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min={0}
                  className="mt-1"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="languages">Languages spoken (comma-separated)</Label>
                <Input
                  id="languages"
                  className="mt-1"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Personal information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Gender</Label>
                <SelectWithOther
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
                  placeholder="Select gender"
                  otherPlaceholder="Please specify"
                  required
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Date of birth</Label>
                <Input
                  id="birthDate"
                  type="date"
                  className="mt-1"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <PhoneNumberField
              countryCode={phoneCountryCode}
              onCountryCodeChange={setPhoneCountryCode}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
              userHasSavedPhone={Boolean(user?.phone?.trim() || user?.phoneCountryCode)}
            />
          </section>

          <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Location</h2>
            <Alert className="border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100">
              <Info className="h-4 w-4" />
              <AlertDescription className="space-y-2 text-sm">
                <p>This location is publicly visible. Share your local area so students know where you teach.</p>
                <p className="flex items-start gap-2 text-destructive">
                  <Skull className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>For your safety, do not share your complete home address.</span>
                </p>
              </AlertDescription>
            </Alert>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" className="mt-1" value={country} onChange={(e) => setCountry(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" className="mt-1" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" className="mt-1" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="locality">Area / locality</Label>
                <Input id="locality" className="mt-1" value={locality} onChange={(e) => setLocality(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="publicLocation">Public location description</Label>
              <Input
                id="publicLocation"
                className="mt-1"
                value={publicLocation}
                onChange={(e) => setPublicLocation(e.target.value)}
                placeholder="e.g. Koramangala, Bangalore"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Subjects you teach</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => addSubject()}>
                Add subject
              </Button>
            </div>
            {teachingSubjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {teachingSubjects.map((entry) => (
                  <Badge key={entry.name} variant="secondary" className="gap-1 pr-1">
                    {formatTeachingSubjectLabel(entry)}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-muted"
                      onClick={() => setTeachingSubjects((prev) => prev.filter((s) => s.name !== entry.name))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <TeachingSubjectPicker
              value={subjectDraft}
              onChange={setSubjectDraft}
              exclude={teachingSubjects.map((s) => s.name)}
              label=""
              placeholder="Subject name"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectWithOther
                options={TEACHING_LEVELS}
                value={fromLevel}
                onValueChange={setFromLevel}
                placeholder="From level"
                otherPlaceholder="Enter lowest level"
              />
              <SelectWithOther
                options={TEACHING_LEVELS}
                value={toLevel}
                onValueChange={setToLevel}
                placeholder="To level"
                otherPlaceholder="Enter highest level"
              />
            </div>
          </section>

          <EducationFormSection entries={education} onChange={setEducation} />
          <ExperienceFormSection entries={experienceEntries} onChange={setExperienceEntries} />

          <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Teaching preferences</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: "onlineTeaching", label: "Online teaching", checked: onlineTeaching, set: setOnlineTeaching },
                { id: "homeTuition", label: "Home tuition", checked: homeTuition, set: setHomeTuition },
                { id: "groupClasses", label: "Group classes", checked: groupClasses, set: setGroupClasses },
                { id: "assignmentHelp", label: "Assignment help", checked: assignmentHelp, set: setAssignmentHelp },
              ].map(({ id, label, checked, set }) => (
                <label key={id} htmlFor={id} className="flex items-center gap-2 text-sm">
                  <Checkbox id={id} checked={checked} onCheckedChange={(v) => set(v === true)} />
                  {label}
                </label>
              ))}
            </div>
            <div>
              <Label htmlFor="availability">Availability</Label>
              <Input
                id="availability"
                className="mt-1"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="Weekdays evening · Weekends · Flexible"
              />
            </div>
            <div>
              <Label htmlFor="teachingStyle">Teaching style (optional)</Label>
              <Textarea
                id="teachingStyle"
                className="mt-1"
                value={teachingStyle}
                onChange={(e) => setTeachingStyle(e.target.value)}
                rows={3}
              />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Pricing</h2>
            <div className="flex flex-wrap gap-3">
              <Select
                value={currency}
                onValueChange={(v) => {
                  setCurrency(v);
                  setCurrencyTouched(true);
                  setPreferredCurrency(v);
                }}
              >
                <SelectTrigger className="w-32">
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
                type="number"
                min={1}
                className="max-w-xs flex-1"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="Hourly rate"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Currency: {getCurrencySymbol(currency)} {currency}
            </p>
          </section>

          <Button
            type="submit"
            className="w-full bg-gradient-primary"
            disabled={saving || !bioValid}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Submit profile"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}

export default TeacherOnboardingProfile;
