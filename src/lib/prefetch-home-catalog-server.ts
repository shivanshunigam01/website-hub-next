import type { QueryClient } from "@tanstack/react-query";
import { fetchHomeCoursesServer, fetchHomeTutorsServer } from "@/lib/catalog-server";

const HOME_COURSES_KEY = ["courses", "published", 24] as const;
const HOME_TUTORS_KEY = ["tutors", 50] as const;

/** SSR/ISR: load published catalog on the server and seed the client React Query cache. */
export async function prefetchHomeCatalogOnServer(queryClient: QueryClient) {
  const [courses, tutors] = await Promise.all([
    fetchHomeCoursesServer(24),
    fetchHomeTutorsServer(50),
  ]);

  queryClient.setQueryData(HOME_COURSES_KEY, courses);
  queryClient.setQueryData(HOME_TUTORS_KEY, tutors);
}
