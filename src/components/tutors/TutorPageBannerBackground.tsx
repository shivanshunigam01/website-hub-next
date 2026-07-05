"use client";

const TUTOR_BANNER_VIDEO = "/tutor-hero-video.mp4";

export function TutorPageBannerBackground() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <video
          src={TUTOR_BANNER_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/55 to-indigo-950/65" />
        <div className="absolute inset-0 bg-black/15" />
      </div>
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
    </>
  );
}
