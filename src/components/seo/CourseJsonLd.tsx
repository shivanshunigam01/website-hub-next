import { buildCourseJsonLd } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/site-config";
import { fetchCourseForSeo } from "@/lib/seo-server";

export async function CourseJsonLd({ id }: { id: string }) {
  const course = await fetchCourseForSeo(id);
  if (!course?.title) return null;
  const url = `${SITE_URL}/courses/${id}`;
  const jsonLd = buildCourseJsonLd({
    id,
    title: course.title,
    description: course.description,
    url,
    price: course.price,
  });
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
