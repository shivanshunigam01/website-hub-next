"use client";

import { useEffect } from "react";
import { disableGoogleTranslateHoverUi, GT_SUPPRESS_HOVER_CSS } from "@/lib/google-translate";

const GT_OVERLAY_CSS = `
  .goog-te-banner-frame,
  .goog-te-banner-frame.skiptranslate,
  iframe.goog-te-banner-frame,
  iframe.skiptranslate,
  .goog-te-gadget-icon,
  .goog-te-spinner-pos,
  div.skiptranslate,
  div.skiptranslate > iframe {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
    width: 0 !important;
    height: 0 !important;
    max-height: 0 !important;
    overflow: hidden !important;
    z-index: -1 !important;
  }
  body {
    top: 0 !important;
    position: static !important;
    min-height: auto !important;
  }
  html {
    margin-top: 0 !important;
  }
  html,
  html[dir="rtl"],
  html.translated-rtl,
  body,
  body[dir="rtl"],
  body.translated-rtl {
    direction: ltr !important;
  }
  ${GT_SUPPRESS_HOVER_CSS}
`;

function ensureGoogleTranslateStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("google-translate-style")) return;

  const style = document.createElement("style");
  style.id = "google-translate-style";
  style.textContent = GT_OVERLAY_CSS;
  document.head.appendChild(style);
}

/**
 * CSS-only guard for legacy Google Translate DOM markers.
 * Do NOT load translate.google.com after React hydrates — it mutates the DOM and breaks all buttons.
 */
export function GoogleTranslate() {
  useEffect(() => {
    ensureGoogleTranslateStyles();
    disableGoogleTranslateHoverUi();
  }, []);

  return null;
}
