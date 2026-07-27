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
import { LocationProvider } from "@/hooks/use-user-location";
import { CurrencyProvider } from "@/hooks/use-currency";
import { I18nProvider } from "@/components/I18nProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/sonner";
import { buildEarlyLanguageCookieScript } from "@/lib/google-translate";
import {
  isDashboardPath,
  shouldHideSupportWidgets,
  shouldShowMarketingChrome,
} from "@/lib/site-chrome";

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

function DeferredWidgets({ hideSupportWidgets }: { hideSupportWidgets: boolean }) {
  const [ready, setReady] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  if (!ready || hideSupportWidgets) {
    return (
      <>
        <RegionalAdPopup />
        <GoogleTranslate />
        <VisitorTracker />
      </>
    );
  }

  return (
    <>
      <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />
      {!chatOpen && <WhatsAppButton />}
      <RegionalAdPopup />
      <GoogleTranslate />
      <VisitorTracker />
      {!chatOpen && <ScrollToTop />}
    </>
  );
}

function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const prevPath = useRef(pathname);
  const { role } = useApp();

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    if (typeof window === "undefined") return;
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  const isDashboard = isDashboardPath(pathname);
  const hideSupportWidgets = shouldHideSupportWidgets(pathname);
  const showMarketingChrome = shouldShowMarketingChrome(pathname);
  const showSiteHeader = !role || !isDashboard;

  return (
    <div className="flex min-h-dvh w-full max-w-full flex-col bg-background text-foreground">
      {showSiteHeader && <Header />}
      <main className="flex-1">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
      {showMarketingChrome && (
        <div className="pb-[calc(3.5rem+max(1rem,env(safe-area-inset-bottom)))] lg:pb-0">
          <Footer />
        </div>
      )}
      {showMarketingChrome && <MobileNav />}
      <DeferredWidgets hideSupportWidgets={hideSupportWidgets} />
      <Toaster />
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
                          <SiteChrome>{children}</SiteChrome>
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
