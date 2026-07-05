import { Suspense } from "react";
import PostPage from "@/views/post-requirement";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/post-requirement");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <PostPage />
    </Suspense>
  );
}
