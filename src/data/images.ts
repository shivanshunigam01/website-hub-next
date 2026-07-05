// Curated Unsplash images. Stable photo IDs, served via Unsplash CDN.
const u = (id: string, w = 800, crop?: "faces") =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop${crop ? `&crop=${crop}` : ""}`;

// Course thumbnails keyed by course id (c1..c12)
export const COURSE_IMAGES: Record<string, string> = {
  c1: u("1677442136019-21780ecad995"), // AI / neural network
  c2: u("1454165804606-c3d57bc86b40"), // PMP / business meeting
  c3: u("1526374965328-7f61d4dc18c5"), // Python / code
  c4: u("1551288049-bebda4e38f71"), // Data science / charts
  c5: u("1432888622747-4eb9a8efeb07"), // Digital marketing
  c6: u("1517694712202-14dd9538aa97"), // Web dev
  c7: u("1521737711867-e3b97375f902"), // Spoken English
  c8: u("1635070041078-e363dbe005cb"), // Math
  c9: u("1454165804606-c3d57bc86b40"), // Excel
  c10: u("1561070791-2526d30994b8"), // UI/UX
  c11: u("1636466497217-26a8cbeaf0aa"), // Physics
  c12: u("1546410531-bb4caa6b424d"), // Spanish
};

// Tutor portraits keyed by tutor id (t1..t12)
export const TUTOR_IMAGES: Record<string, string> = {
  t1: u("1494790108377-be9c29b29330", 400, "faces"),
  t2: u("1438761681033-6461ffad8d80", 400, "faces"),
  t3: u("1500648767791-00dcc994a43e", 400, "faces"),
  t4: u("1487412720507-e7ab37603c6f", 400, "faces"),
  t5: u("1507003211169-0a1dd7228f2d", 400, "faces"),
  t6: u("1573497019940-1c28c88b4f3e", 400, "faces"),
  t7: u("1472099645785-5658abf4ff4e", 400, "faces"),
  t8: u("1534528741775-53994a69daeb", 400, "faces"),
  t9: u("1463453091185-61582044d556", 400, "faces"),
  t10: u("1517841905240-472988babdf9", 400, "faces"),
  t11: u("1519085360753-af0119f7cbe7", 400, "faces"),
  t12: u("1531123897727-8f129e1688ce", 400, "faces"),
};

export const courseImage = (id: string) =>
  COURSE_IMAGES[id] || u("1517694712202-14dd9538aa97");
export const tutorImage = (id: string) =>
  TUTOR_IMAGES[id] || u("1494790108377-be9c29b29330", 400, "faces");
