"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppProvider, useApp } from "@/hooks/use-app";
import { GoogleAuthProvider } from "@/components/auth/GoogleAuthProvider";
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
import { cn } from "@/lib/utils";

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
    const markReady = () => setReady(true);
    const onEngage = () => markReady();
    window.addEventListener("scroll", onEngage, { once: true, passive: true });
    window.addEventListener("pointerdown", onEngage, { once: true, passive: true });
    let idleId: number | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(markReady, { timeout: 6000 });
    } else {
      idleId = window.setTimeout(markReady, 4000) as unknown as number;
    }
    return () => {
      window.removeEventListener("scroll", onEngage);
      window.removeEventListener("pointerdown", onEngage);
      if (typeof window.cancelIdleCallback === "function" && idleId != null) {
        window.cancelIdleCallback(idleId);
      } else if (idleId != null) {
        window.clearTimeout(idleId);
      }
    };
  }, []);

  if (!ready || hideSupportWidgets) {
    return null;
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
      <main
        className={cn(
          "flex-1",
          showMarketingChrome &&
            "pb-[calc(3.5rem+max(1rem,env(safe-area-inset-bottom)))] lg:pb-0",
        )}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </main>
      {showMarketingChrome && <Footer />}
      {showMarketingChrome && <MobileNav />}
      <DeferredWidgets hideSupportWidgets={hideSupportWidgets} />
      <Toaster />
    </div>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <CurrencyProvider>
          <I18nProvider>
            <GoogleAuthProvider>
              <AppProvider>
                <SiteChrome>{children}</SiteChrome>
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
