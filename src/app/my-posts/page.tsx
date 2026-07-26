import { Suspense } from "react";
import MyPostsPage from "@/views/my-posts";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/my-posts");

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MyPostsPage />
    </Suspense>
  );
}
