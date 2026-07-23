"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppProvider, useApp } from "@/hooks/use-app";
import { GoogleAuthProvider } from "@/components/auth/GoogleAuthProvider";
import { AdminStoreProvider } from "@/hooks/use-admin-store";
import { LmsStoreProvider } from "@/hooks/use-lms-store";
import { LearningProvider } from "@/hooks/use-learning";
import { PlatformStoreProvider } from "@/hooks/use-platform-store";
import { MarketplaceProvider } from "@/hooks/use-marketplace";
import { RequirementsStoreProvider } from "@/hooks/use-requirements-store";
import { LocationProvider } from "@/hooks/use-user-location";
import { CurrencyProvider } from "@/hooks/use-currency";
import { I18nProvider } from "@/components/I18nProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/sonner";
import { buildEarlyLanguageCookieScript } from "@/lib/google-translate";

const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget").then((m) => m.ChatWidget), {
  ssr: false,
});
const WhatsAppButton = dynamic(
  () => import("@/components/chat/WhatsAppButton").then((m) => m.WhatsAppButton),
  { ssr: false },
);
const RegionalAdPopup = dynamic(
  () => import("@/components/ads/RegionalAdPopup").then((m) => m.RegionalAdPopup),
  { ssr: false },
);
const GoogleTranslate = dynamic(
  () => import("@/components/GoogleTranslate").then((m) => m.GoogleTranslate),
  { ssr: false },
);
const VisitorTracker = dynamic(
  () => import("@/components/admin/VisitorTracker").then((m) => m.VisitorTracker),
  { ssr: false },
);

function DeferredWidgets({ isDashboard }: { isDashboard: boolean }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  if (!ready) return null;

  return (
    <>
      {!isDashboard && <ChatWidget />}
      {!isDashboard && <WhatsAppButton />}
      <RegionalAdPopup />
      <GoogleTranslate />
      <VisitorTracker />
    </>
  );
}

function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const prevPath = useRef(pathname);
  const { role } = useApp();

  useEffect(() => {
    prevPath.current = pathname;
  }, [pathname]);

  const isDashboard =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/parent") ||
    pathname.startsWith("/lms") ||
    pathname === "/profile";
  const showSiteHeader = !role || !isDashboard;

  return (
    <div className="flex min-h-dvh w-full max-w-full flex-col bg-background text-foreground">
      {showSiteHeader && <Header />}
      <main className={`flex-1 ${isDashboard ? "" : "pb-[calc(3.5rem+max(1rem,env(safe-area-inset-bottom)))] lg:pb-0"}`}>
        <Suspense fallback={null}>{children}</Suspense>
      </main>
      {!isDashboard && <Footer />}
      {!isDashboard && <MobileNav />}
      <DeferredWidgets isDashboard={isDashboard} />
      <Toaster />
      <ScrollToTop />
    </div>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <CurrencyProvider>
          <I18nProvider>
            <GoogleAuthProvider>
              <AppProvider>
                <LearningProvider>
                  <AdminStoreProvider>
                    <LmsStoreProvider>
                      <PlatformStoreProvider>
                        <MarketplaceProvider>
                          <RequirementsStoreProvider>
                            <SiteChrome>{children}</SiteChrome>
                          </RequirementsStoreProvider>
                        </MarketplaceProvider>
                      </PlatformStoreProvider>
                    </LmsStoreProvider>
                  </AdminStoreProvider>
                </LearningProvider>
              </AppProvider>
            </GoogleAuthProvider>
          </I18nProvider>
        </CurrencyProvider>
      </LocationProvider>
    </QueryClientProvider>
  );
}

export function ThemeScript() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{document.documentElement.setAttribute('dir','ltr');var t=localStorage.getItem('tp_theme')||'light';document.documentElement.dataset.theme=t;if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}document.documentElement.style.colorScheme=t;}catch(e){}})();`,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: buildEarlyLanguageCookieScript(),
        }}
      />
    </>
  );
}
