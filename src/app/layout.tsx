import { Inter, Noto_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { AppProviders, ThemeScript } from "@/components/providers/AppProviders";
import { buildMetadata } from "@/lib/page-metadata";
import { buildGlobalJsonLd } from "@/lib/json-ld";
import { keywordsForPage } from "@/lib/seo-keywords";
import {
  DEFAULT_PAGE_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  API_ORIGIN,
} from "@/lib/site-config";
import "../styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display-app",
  display: "swap",
  preload: true,
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic-app",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  ...buildMetadata({
    title: DEFAULT_PAGE_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
    keywords: keywordsForPage("/"),
  }),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "512x512" }],
    shortcut: ["/favicon.png"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "512x512" }],
  },
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  other: {
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1e3a8a",
};

const jsonLd = buildGlobalJsonLd();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable} ${notoArabic.variable}`}
    >
      <head>
        <link rel="preconnect" href={API_ORIGIN} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={API_ORIGIN} />
        <ThemeScript />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
