"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ListingCategory = "books" | "notes" | "electronics" | "services" | "rideshare" | "accommodation" | "tutoring" | "other";
export type ListingCondition = "new" | "like-new" | "good" | "used" | "other";
export type ListingStatus = "active" | "sold" | "expired" | "pending" | "rejected";

export type Listing = {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  categoryOther?: string;
  condition?: ListingCondition;
  conditionOther?: string;
  price: number;
  currency: string;
  negotiable: boolean;
  city: string;
  country: string;
  imageUrl?: string;
  approvedImageUrl?: string;
  sellerId?: string;
  sellerName: string;
  sellerRole: "student" | "teacher" | "parent";
  sellerEmail: string;
  sellerPhone?: string;
  status: ListingStatus;
  views: number;
  /** rideshare-only */
  rideFrom?: string;
  rideTo?: string;
  rideDate?: string;
  rideSeats?: number;
  createdAt: string;
};

export type ListingMessage = {
  id: string;
  listingId: string;
  fromName: string;
  fromEmail: string;
  message: string;
  createdAt: string;
};

type State = { listings: Listing[]; messages: ListingMessage[] };

type Store = State & {
  createListing: (l: Omit<Listing, "id" | "createdAt" | "status" | "views">) => Listing;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  incrementViews: (id: string) => void;
  sendMessage: (m: Omit<ListingMessage, "id" | "createdAt">) => void;
  getMyListings: (sellerId: string, email?: string) => Listing[];
  reset: () => void;
};

const KEY = "tp_marketplace_v1";
const Ctx = createContext<Store | null>(null);
const rid = (p: string) => p + Math.random().toString(36).slice(2, 8);
const now = () => new Date().toISOString();

const SEED: Listing[] = [
  {
    id: "lst-1", title: "NEET Biology — Complete Notes (Class 11 & 12)",
    description: "Hand-written, color-coded NEET Biology notes covering NCERT + previous year analysis. Lightly used, excellent condition.",
    category: "notes", condition: "like-new", price: 1200, currency: "INR", negotiable: true,
    city: "New Delhi", country: "India",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop",
    sellerName: "Aditi Rao", sellerRole: "student", sellerEmail: "aditi@example.com",
    sellerPhone: "+91 98xxxxxx12", status: "active", views: 142, createdAt: now(),
  },
  {
    id: "lst-2", title: "MacBook Air M2 (2023) — perfect for college",
    description: "8GB / 256GB, 96% battery health, includes original charger. Used for one semester only.",
    category: "electronics", condition: "good", price: 850, currency: "USD", negotiable: true,
    city: "London", country: "United Kingdom",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80&auto=format&fit=crop",
    sellerName: "James O'Connor", sellerRole: "student", sellerEmail: "james@example.com",
    status: "active", views: 318, createdAt: now(),
  },
  {
    id: "lst-3", title: "IELTS 1:1 coaching — 8.0 band tutor",
    description: "Verified IELTS trainer offering personalized 1:1 sessions online. Money-back guarantee for 7+ band.",
    category: "tutoring", price: 25, currency: "USD", negotiable: false,
    city: "Dubai", country: "United Arab Emirates",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80&auto=format&fit=crop",
    sellerName: "Sara Ahmed", sellerRole: "teacher", sellerEmail: "sara@example.com",
    status: "active", views: 96, createdAt: now(),
  },
  {
    id: "lst-4", title: "Daily ride share — South Delhi → DU North Campus",
    description: "Shared cab from Saket to DU North Campus. Mon–Sat, 7:30 AM. Verified student drivers.",
    category: "rideshare", price: 1500, currency: "INR", negotiable: false,
    city: "New Delhi", country: "India",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop",
    sellerName: "Rahul Yadav", sellerRole: "student", sellerEmail: "rahul@example.com",
    rideFrom: "Saket", rideTo: "DU North Campus", rideDate: "Mon–Sat", rideSeats: 3,
    status: "active", views: 64, createdAt: now(),
  },
  {
    id: "lst-5", title: "Shared room near Andheri tutoring hub",
    description: "Furnished, AC, Wi-Fi, female only. 5 min walk to coaching centers.",
    category: "accommodation", price: 8500, currency: "INR", negotiable: true,
    city: "Mumbai", country: "India",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop",
    sellerName: "Priya Shah", sellerRole: "parent", sellerEmail: "priya@example.com",
    status: "active", views: 207, createdAt: now(),
  },
  {
    id: "lst-6", title: "JEE Advanced books bundle (Resnick, HC Verma, Cengage)",
    description: "Full physics+chem+maths set, minimal markings, near-new.",
    category: "books", condition: "like-new", price: 3800, currency: "INR", negotiable: true,
    city: "Bengaluru", country: "India",
    imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80&auto=format&fit=crop",
    sellerName: "Vihaan Mehta", sellerRole: "student", sellerEmail: "vihaan@example.com",
    status: "active", views: 89, createdAt: now(),
  },
];

const initial = (): State => ({ listings: SEED, messages: [] });

function parse(raw: string): State {
  try {
    const p = JSON.parse(raw) as Partial<State>;
    return { listings: p.listings?.length ? p.listings : SEED, messages: p.messages ?? [] };
  } catch { return initial(); }
}

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEY);
    if (raw) setState(parse(raw));
  }, []);

  const persist = (next: State) => {
    setState(next);
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  };

  const value: Store = {
    ...state,
    createListing: (l) => {
      const listing: Listing = {
        id: rid("lst-"),
        createdAt: now(),
        status: "pending",
        views: 0,
        ...l,
        sellerRole: l.sellerRole ?? "student",
      };
      persist({ ...state, listings: [listing, ...state.listings] });
      return listing;
    },
    updateListing: (id, patch) =>
      persist({ ...state, listings: state.listings.map((x) => (x.id === id ? { ...x, ...patch } : x)) }),
    deleteListing: (id) =>
      persist({ ...state, listings: state.listings.filter((x) => x.id !== id) }),
    incrementViews: (id) =>
      persist({ ...state, listings: state.listings.map((x) => (x.id === id ? { ...x, views: x.views + 1 } : x)) }),
    sendMessage: (m) =>
      persist({ ...state, messages: [{ id: rid("msg-"), createdAt: now(), ...m }, ...state.messages] }),
    getMyListings: (sellerId, email) =>
      state.listings.filter((l) => {
        if (sellerId && l.sellerId === sellerId) return true;
        const listingEmail = l.sellerEmail?.trim().toLowerCase();
        const userEmail = email?.trim().toLowerCase();
        return Boolean(listingEmail && userEmail && listingEmail === userEmail);
      }),
    reset: () => persist(initial()),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMarketplace() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMarketplace must be used within MarketplaceProvider");
  return v;
}

export const CATEGORY_LABELS: Record<ListingCategory, string> = {
  books: "Books & Textbooks",
  notes: "Notes & Study Material",
  electronics: "Electronics & Devices",
  services: "Services",
  rideshare: "Ride Share",
  accommodation: "Accommodation",
  tutoring: "Tutoring Gigs",
  other: "Other",
};
