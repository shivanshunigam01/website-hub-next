import { buildTutorProfileJsonLd } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/site-config";
import { fetchTutorForSeo } from "@/lib/seo-server";

export async function TutorJsonLd({ id }: { id: string }) {
  const tutor = await fetchTutorForSeo(id);
  if (!tutor?.name) return null;
  const url = `${SITE_URL}/tutors/${id}`;
  const jsonLd = buildTutorProfileJsonLd({
    id,
    name: tutor.name,
    description: tutor.teacherProfile?.bio,
    url,
  });
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
