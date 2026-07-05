import { Suspense } from "react";
import MessagesPage from "@/views/messages";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const generateMetadata = createStaticPageMetadata("/messages");


export default function Page() {
  return (
    <Suspense fallback={null}>
      <MessagesPage />
    </Suspense>
  );
}
