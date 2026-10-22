import { apiPublic } from "@/lib/api";

export type ApiAccommodation = {
  id: string;
  name?: string;
  type?: string;
  city?: string;
  country?: string;
  address?: string;
  pricePerMonth?: number;
  currency?: string;
  amenities?: string[];
  gender?: string;
  rating?: number;
  imageUrl?: string;
  images?: string[];
  available?: boolean;
  description?: string;
  status?: string;
  contactPhone?: string;
  contactEmail?: string;
  distanceToCampus?: string;
};

export async function fetchPublicAccommodations(params?: { city?: string; limit?: number }) {
  const p = new URLSearchParams();
  p.set("limit", String(params?.limit ?? 50));
  if (params?.city?.trim()) p.set("city", params.city.trim());
  const data = await apiPublic<{ items: ApiAccommodation[] }>(`/accommodations?${p.toString()}`);
  return data.items ?? [];
}
