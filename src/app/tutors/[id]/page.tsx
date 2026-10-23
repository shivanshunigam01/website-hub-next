import { Suspense } from "react";
import TutorDetailPage from "@/views/tutors.$id";
import { TutorJsonLd } from "@/components/seo/TutorJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { metadataForTutorId } from "@/lib/seo-metadata-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return metadataForTutorId(id);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Tutors", path: "/tutors" },
          { name: "Tutor profile", path: `/tutors/${id}` },
        ]}
      />
      <TutorJsonLd id={id} />
      <Suspense fallback={null}>
        <TutorDetailPage />
      </Suspense>
    </>
  );
}
