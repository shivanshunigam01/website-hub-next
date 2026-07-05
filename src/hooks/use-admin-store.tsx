"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { COMBOS, GRADIENTS } from "@/data/mock";
import type { Course, Tutor } from "@/types/catalog";
import { api } from "@/lib/api";
import { mapApiCourse, mapApiTutor, type ApiCourse, type ApiTutor } from "@/lib/catalog-map";

export type Combo = (typeof COMBOS)[number];

export type RegionalAdTarget = "global" | "country" | "city";
export type RegionalAdMedia = "image" | "video" | "banner";
export type RegionalAdPlacement = "popup" | "hero-strip" | "inline-banner";

export type RegionalAd = {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string;
  approvedImageUrl?: string;
  /** image/video/text-banner — controls how the ad renders. */
  mediaType: RegionalAdMedia;
  /** Direct video URL (mp4/webm) used when mediaType === "video". */
  videoUrl?: string;
  /** Where the ad shows up on the public site. */
  placement: RegionalAdPlacement;
  /** Optional language targeting (i18n code, e.g. "en", "ar", "hi"). Empty = all. */
  language?: string;
  /** Higher priority renders first within the same placement. */
  priority?: number;
  targetType: RegionalAdTarget;
  /** e.g. India, IN, Mumbai, Germany, DE */
  targetValue: string;
  active: boolean;
  createdAt: string;
};

export type AccommodationType = "PG" | "Hostel" | "Apartment" | "Shared Room" | "Other";
export type AccommodationGender = "boys" | "girls" | "co-ed" | "other";

export type Accommodation = {
  id: string;
  name: string;
  type: AccommodationType;
  typeOther?: string;
  city: string;
  country: string;
  address: string;
  pricePerMonth: number;
  currency: string; // e.g. "INR", "USD", "AED"
  amenities: string[]; // wifi, meals, ac, laundry, security
  gender: AccommodationGender;
  genderOther?: string;
  rating: number;
  imageUrl?: string;
  available: boolean;
  description: string;
  contactPhone?: string;
  contactEmail?: string;
  distanceToCampus?: string;
  createdAt: string;
};

export type AccommodationInquiry = {
  id: string;
  accommodationId?: string;
  accommodationName?: string;
  studentName: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  message: string;
  createdAt: string;
  status: "new" | "contacted" | "closed";
};

export type VisitorEntry = {
  id: string;
  ip?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  language?: string;
  path: string;
  referrer?: string;
  userAgent?: string;
  visitedAt: string;
};

type Store = {
  courses: Course[];
  tutors: Tutor[];
  combos: Combo[];
  regionalAds: RegionalAd[];
  accommodations: Accommodation[];
  inquiries: AccommodationInquiry[];
  visitors: VisitorEntry[];
};

type AdminStore = Store & {
  addCourse: (c: Partial<Course>) => void;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addTutor: (t: Partial<Tutor>) => void;
  updateTutor: (id: string, patch: Partial<Tutor>) => void;
  deleteTutor: (id: string) => void;
  addCombo: (k: Partial<Combo>) => void;
  updateCombo: (id: string, patch: Partial<Combo>) => void;
  deleteCombo: (id: string) => void;
  addRegionalAd: (ad: Partial<RegionalAd>) => void;
  updateRegionalAd: (id: string, patch: Partial<RegionalAd>) => void;
  deleteRegionalAd: (id: string) => void;
  addAccommodation: (a: Partial<Accommodation>) => void;
  updateAccommodation: (id: string, patch: Partial<Accommodation>) => void;
  deleteAccommodation: (id: string) => void;
  addInquiry: (i: Omit<AccommodationInquiry, "id" | "createdAt" | "status">) => void;
  updateInquiry: (id: string, patch: Partial<AccommodationInquiry>) => void;
  deleteInquiry: (id: string) => void;
  recordVisitor: (v: Omit<VisitorEntry, "id" | "visitedAt">) => void;
  clearVisitors: () => void;
  reset: () => void;
};

const KEY = "tp_admin_store_v4";
const LEGACY_KEYS = ["tp_admin_store_v3", "tp_admin_store_v2", "tp_admin_store_v1"];
const Ctx = createContext<AdminStore | null>(null);

const DEFAULT_REGIONAL_ADS: RegionalAd[] = [
  {
    id: "ad-india-spring",
    title: "India learners — Spring offers",
    description: "Up to 40% off NEET, JEE, and spoken English courses for students across India.",
    ctaText: "Browse Indian deals",
    ctaLink: "/courses",
    mediaType: "banner",
    placement: "hero-strip",
    language: "",
    priority: 10,
    targetType: "country",
    targetValue: "India",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ad-india-hindi-popup",
    title: "नमस्ते! भारत के लिए विशेष ऑफर",
    description: "हिंदी में लाइव कक्षाएँ और सत्यापित शिक्षक — पहले महीने 50% तक की छूट।",
    ctaText: "हिंदी कोर्स देखें",
    ctaLink: "/courses",
    mediaType: "image",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80&auto=format&fit=crop",
    placement: "popup",
    language: "hi",
    priority: 8,
    targetType: "country",
    targetValue: "India",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ad-germany-tech",
    title: "Tech upskilling week",
    description: "German learners save 25% on AI, data science, and web development programs this week.",
    ctaText: "See tech courses",
    ctaLink: "/courses",
    mediaType: "banner",
    placement: "inline-banner",
    language: "",
    priority: 5,
    targetType: "country",
    targetValue: "Germany",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ad-uae-dubai",
    title: "Dubai & UAE — Premium tutor access",
    description: "Book verified tutors in English or Arabic — exclusive offers for learners in the UAE.",
    ctaText: "Explore UAE tutors",
    ctaLink: "/tutors",
    mediaType: "image",
    imageUrl: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80&auto=format&fit=crop",
    placement: "popup",
    language: "",
    priority: 6,
    targetType: "country",
    targetValue: "United Arab Emirates",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ad-global-promo-video",
    title: "Meet your next mentor",
    description: "Watch how thousands of learners hit their goals with TeacherPoint.",
    ctaText: "Start learning",
    ctaLink: "/courses",
    mediaType: "video",
    videoUrl: "/videos/courses-hero.mp4",
    placement: "inline-banner",
    language: "",
    priority: 1,
    targetType: "global",
    targetValue: "",
    active: true,
    createdAt: new Date().toISOString(),
  },
];


const DEFAULT_ACCOMMODATIONS: Accommodation[] = [
  {
    id: "ac-india-1",
    name: "Scholars Den PG (Boys)",
    type: "PG",
    city: "New Delhi",
    country: "India",
    address: "Mukherjee Nagar, near Batra Cinema",
    pricePerMonth: 8500,
    currency: "INR",
    amenities: ["Wi-Fi", "3 Meals", "AC Rooms", "Laundry", "24×7 Security", "Study Room"],
    gender: "boys",
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80&auto=format&fit=crop",
    available: true,
    description: "Premium PG for serious students. Quiet study floors, 24×7 power backup, and high-speed internet across all rooms.",
    contactPhone: "+91 98100 12345",
    contactEmail: "stay@scholarsden.in",
    distanceToCampus: "0.5 km from main coaching hubs",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ac-india-2",
    name: "Lotus Girls Hostel",
    type: "Hostel",
    city: "Mumbai",
    country: "India",
    address: "Andheri West, near Lokhandwala",
    pricePerMonth: 12500,
    currency: "INR",
    amenities: ["Wi-Fi", "Meals", "AC", "Gym", "Common Lounge", "Female Warden"],
    gender: "girls",
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop",
    available: true,
    description: "Safe, supportive hostel for women learners with biometric entry and on-site warden.",
    contactPhone: "+91 99876 54321",
    contactEmail: "info@lotusgirlshostel.in",
    distanceToCampus: "1.2 km from coaching institutes",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ac-uae-1",
    name: "Dubai Student Residence",
    type: "Apartment",
    city: "Dubai",
    country: "United Arab Emirates",
    address: "Al Barsha, near Mall of the Emirates",
    pricePerMonth: 2400,
    currency: "AED",
    amenities: ["Wi-Fi", "AC", "Pool", "Gym", "Metro Access"],
    gender: "co-ed",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80&auto=format&fit=crop",
    available: true,
    description: "Furnished apartments for international students, walking distance to metro and shopping.",
    contactPhone: "+971 50 123 4567",
    contactEmail: "stay@dubairesidence.ae",
    distanceToCampus: "Metro: 5 min walk",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ac-uk-1",
    name: "London Bridge Hostel",
    type: "Hostel",
    city: "London",
    country: "United Kingdom",
    address: "Southwark, near London Bridge Station",
    pricePerMonth: 780,
    currency: "GBP",
    amenities: ["Wi-Fi", "Breakfast", "Heating", "Common Kitchen"],
    gender: "co-ed",
    rating: 4.4,
    imageUrl: "https://images.unsplash.com/photo-1551776245-d0e0bc1c0bd9?w=800&q=80&auto=format&fit=crop",
    available: true,
    description: "Central London hostel popular with international students. Tube access to major universities.",
    contactPhone: "+44 20 1234 5678",
    contactEmail: "book@londonbridgehostel.uk",
    distanceToCampus: "2 stops to UCL / King's",
    createdAt: new Date().toISOString(),
  },
];

const initial = (): Store => ({
  courses: [],
  tutors: [],
  combos: COMBOS.map((k) => ({ ...k })),
  regionalAds: DEFAULT_REGIONAL_ADS.map((a) => ({ ...a })),
  accommodations: DEFAULT_ACCOMMODATIONS.map((a) => ({ ...a })),
  inquiries: [],
  visitors: [],
});

async function fetchCatalogFromApi(): Promise<Pick<Store, "courses" | "tutors">> {
  const [coursesRes, tutorsRes] = await Promise.all([
    api<{ items: ApiCourse[] }>("/courses?status=published&limit=100"),
    api<{ items: ApiTutor[] }>("/users/tutors?limit=50"),
  ]);
  return {
    courses: (coursesRes.items ?? []).map((c, i) => mapApiCourse(c, i)),
    tutors: (tutorsRes.items ?? []).map((t, i) => mapApiTutor(t, i)),
  };
}

const rid = (p: string) => p + Math.random().toString(36).slice(2, 8);

function parseStore(raw: string): Store {
  const parsed = JSON.parse(raw) as Partial<Store>;
  const base = initial();
  return {
    courses: parsed.courses ?? base.courses,
    tutors: parsed.tutors ?? base.tutors,
    combos: parsed.combos ?? base.combos,
    regionalAds: parsed.regionalAds?.length ? parsed.regionalAds : base.regionalAds,
    accommodations: parsed.accommodations?.length ? parsed.accommodations : base.accommodations,
    inquiries: parsed.inquiries ?? [],
    visitors: parsed.visitors ?? [],
  };
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Store>(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raw = localStorage.getItem(KEY);
    if (!raw) {
      for (const k of LEGACY_KEYS) {
        const r = localStorage.getItem(k);
        if (r) { raw = r; break; }
      }
    }
    if (raw) {
      try {
        setState(parseStore(raw));
      } catch {
        /* ignore */
      }
    }
    fetchCatalogFromApi()
      .then(({ courses, tutors }) => {
        setState((s) => ({
          ...s,
          courses: courses.length ? courses : s.courses,
          tutors: tutors.length ? tutors : s.tutors,
        }));
      })
      .catch(() => {
        /* API offline — keep local/empty */
      });
  }, []);


  const persist = (next: Store) => {
    setState(next);
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  };

  const value: AdminStore = {
    ...state,
    addCourse: (c) =>
      persist({
        ...state,
        courses: [
          {
            id: rid("c"),
            title: "New course",
            instructor: "TBD",
            category: "Development",
            level: "Beginner",
            rating: 4.5,
            reviews: 0,
            price: 19,
            oldPrice: 49,
            duration: "10h",
            lessons: 20,
            students: 0,
            certificate: true,
            language: "English",
            gradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
            description: "Course description",
            ...c,
          } as Course,
          ...state.courses,
        ],
      }),
    updateCourse: (id, patch) =>
      persist({
        ...state,
        courses: state.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }),
    deleteCourse: (id) => persist({ ...state, courses: state.courses.filter((c) => c.id !== id) }),
    addTutor: (t) =>
      persist({
        ...state,
        tutors: [
          {
            id: rid("t"),
            name: "New Tutor",
            subject: "Mathematics",
            location: "Remote",
            rating: 4.5,
            reviews: 0,
            experience: 1,
            price: 20,
            verified: false,
            online: true,
            language: ["English"],
            gender: "female",
            bio: "Tutor bio",
            initials: "NT",
            gradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
            availability: "Flexible",
            ...t,
          } as Tutor,
          ...state.tutors,
        ],
      }),
    updateTutor: (id, patch) =>
      persist({
        ...state,
        tutors: state.tutors.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }),
    deleteTutor: (id) => persist({ ...state, tutors: state.tutors.filter((t) => t.id !== id) }),
    addCombo: (k) =>
      persist({
        ...state,
        combos: [
          {
            id: rid("k"),
            title: "New Combo",
            courses: 3,
            hours: 30,
            price: 29,
            oldPrice: 99,
            includes: ["Course A", "Course B"],
            gradient: GRADIENTS[0],
            ...k,
          } as Combo,
          ...state.combos,
        ],
      }),
    updateCombo: (id, patch) =>
      persist({
        ...state,
        combos: state.combos.map((k) => (k.id === id ? { ...k, ...patch } : k)),
      }),
    deleteCombo: (id) => persist({ ...state, combos: state.combos.filter((k) => k.id !== id) }),
    addRegionalAd: (ad) =>
      persist({
        ...state,
        regionalAds: [
          {
            id: rid("ad"),
            title: "New promotion",
            description: "Describe your offer for this region.",
            ctaText: "Learn more",
            ctaLink: "/courses",
            mediaType: "banner" as const,
            placement: "popup" as const,
            language: "",
            priority: 1,
            targetType: "country" as const,
            targetValue: "India",
            active: true,
            createdAt: new Date().toISOString(),
            ...ad,
          } satisfies RegionalAd,
          ...state.regionalAds,
        ],
      }),
    updateRegionalAd: (id, patch) =>
      persist({
        ...state,
        regionalAds: state.regionalAds.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }),
    deleteRegionalAd: (id) =>
      persist({ ...state, regionalAds: state.regionalAds.filter((a) => a.id !== id) }),
    addAccommodation: (a) =>
      persist({
        ...state,
        accommodations: [
          {
            id: rid("ac"),
            name: "New Accommodation",
            type: "PG",
            city: "New Delhi",
            country: "India",
            address: "",
            pricePerMonth: 8000,
            currency: "INR",
            amenities: ["Wi-Fi", "Meals"],
            gender: "co-ed",
            rating: 4.5,
            available: true,
            description: "Describe this accommodation.",
            createdAt: new Date().toISOString(),
            ...a,
          } as Accommodation,
          ...state.accommodations,
        ],
      }),
    updateAccommodation: (id, patch) =>
      persist({
        ...state,
        accommodations: state.accommodations.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }),
    deleteAccommodation: (id) =>
      persist({ ...state, accommodations: state.accommodations.filter((a) => a.id !== id) }),
    addInquiry: (i) =>
      persist({
        ...state,
        inquiries: [
          {
            id: rid("iq"),
            createdAt: new Date().toISOString(),
            status: "new" as const,
            ...i,
          },
          ...state.inquiries,
        ],
      }),
    updateInquiry: (id, patch) =>
      persist({
        ...state,
        inquiries: state.inquiries.map((q) => (q.id === id ? { ...q, ...patch } : q)),
      }),
    deleteInquiry: (id) =>
      persist({ ...state, inquiries: state.inquiries.filter((q) => q.id !== id) }),
    recordVisitor: (v) =>
      persist({
        ...state,
        visitors: [
          { id: rid("v"), visitedAt: new Date().toISOString(), ...v },
          ...state.visitors,
        ].slice(0, 500),
      }),
    clearVisitors: () => persist({ ...state, visitors: [] }),
    reset: () => persist(initial()),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminStore must be used inside AdminStoreProvider");
  return v;
}
