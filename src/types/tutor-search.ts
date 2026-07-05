export type TutorMode = "all" | "online" | "in-person";

export type TutorSearchFilters = {
  q?: string;
  subject?: string;
  location?: string;
  country?: string;
  city?: string;
  mode?: TutorMode;
  homeTuition?: boolean;
  minExperience?: number;
  verified?: boolean;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "rating" | "reviews" | "price_asc" | "price_desc" | "experience";
};

export type TutorFacets = {
  subjects: string[];
  locations: string[];
  countriesWithTutors?: string[];
  citiesWithTutors?: string[];
  languages: string[];
  totalTutors: number;
};
