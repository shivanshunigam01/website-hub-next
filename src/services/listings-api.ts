import { api } from "@/lib/api";

/** Backend Listing.category enum */
export type ApiListingCategory = "materials" | "services" | "accommodation";

export type ApiListingStatus = "draft" | "pending" | "approved" | "rejected" | "sold";

export type ApiListing = {
  id: string;
  sellerId?: string;
  category?: ApiListingCategory | string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  approvedImage?: string;
  images?: string[];
  city?: string;
  country?: string;
  status?: ApiListingStatus | string;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
  /** frontend-friendly aliases after map */
  sellerName?: string;
};

export const CATEGORY_LABELS: Record<string, string> = {
  materials: "Materials",
  services: "Services",
  accommodation: "Accommodation",
  books: "Books",
  notes: "Notes",
  electronics: "Electronics",
  tutoring: "Tutoring",
  rideshare: "Ride share",
  other: "Other",
};

/** Map UI categories → backend enum */
export function toApiCategory(ui: string): ApiListingCategory {
  if (ui === "accommodation") return "accommodation";
  if (ui === "services" || ui === "tutoring" || ui === "rideshare") return "services";
  return "materials";
}

export function displayListingStatus(status?: string) {
  if (status === "approved") return "active";
  return status || "pending";
}

export async function fetchMyListings() {
  const data = await api<{ items: ApiListing[] }>("/listings?mine=true&limit=50");
  return data.items ?? [];
}

export async function fetchListings(params?: { status?: string; q?: string }) {
  const p = new URLSearchParams();
  if (params?.status) p.set("status", params.status);
  if (params?.q) p.set("q", params.q);
  p.set("limit", "50");
  const data = await api<{ items: ApiListing[] }>(`/listings?${p.toString()}`);
  return data.items ?? [];
}

export async function createListing(body: {
  title: string;
  description: string;
  category: ApiListingCategory;
  price: number;
  currency: string;
  city?: string;
  country?: string;
  imageUrl?: string;
  status?: string;
}) {
  return api<ApiListing>("/listings", {
    method: "POST",
    body: JSON.stringify({
      ...body,
      status: body.status || "pending",
    }),
  });
}

export async function deleteListing(id: string) {
  return api(`/listings/${id}`, { method: "DELETE" });
}
