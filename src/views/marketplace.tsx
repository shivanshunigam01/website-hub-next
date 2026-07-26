"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { canonicalUrl } from "@/lib/site-config";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Car,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Home as HomeIcon,
  Laptop,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  useMarketplace,
  CATEGORY_LABELS,
  type Listing,
  type ListingCategory,
} from "@/hooks/use-marketplace";
import { useCurrency } from "@/hooks/use-currency";
import { useApp } from "@/hooks/use-app";
import { afterAuthPath } from "@/lib/auth-redirect";
import { PostExchangeListingDialog } from "@/components/marketplace/PostExchangeListingDialog";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<ListingCategory, typeof BookOpen> = {
  books: BookOpen,
  notes: FileText,
  electronics: Laptop,
  services: Briefcase,
  rideshare: Car,
  accommodation: HomeIcon,
  tutoring: GraduationCap,
  other: Package,
};

const CATEGORY_KEY: Record<ListingCategory, string> = {
  books: "marketplace.cat.books",
  notes: "marketplace.cat.notes",
  electronics: "marketplace.cat.electronics",
  services: "marketplace.cat.services",
  rideshare: "marketplace.cat.rideshare",
  accommodation: "marketplace.cat.accommodation",
  tutoring: "marketplace.cat.tutoring",
  other: "marketplace.cat.other",
};

function Market() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { role, user } = useApp();
  const { listings, incrementViews } = useMarketplace();
  const { symbol, convertAmount } = useCurrency();
  const [cat, setCat] = useState<ListingCategory | "all">("all");
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [postOpen, setPostOpen] = useState(false);
  const [active, setActive] = useState<Listing | null>(null);

  const activeListings = useMemo(() => listings.filter((l) => l.status === "active"), [listings]);

  const cities = useMemo(
    () => Array.from(new Set(activeListings.map((l) => l.city))).sort(),
    [activeListings],
  );

  const filtered = useMemo(() => {
    return activeListings.filter((l) => {
      if (cat !== "all" && l.category !== cat) return false;
      if (city !== "all" && l.city !== city) return false;
      if (maxPrice && convertAmount(l.price, l.currency) > Number(maxPrice)) return false;
      if (q && !`${l.title} ${l.description} ${l.city}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [activeListings, cat, city, maxPrice, q, convertAmount]);

  const openPost = () => {
    if (role !== "student" || !user) {
      toast.info(t("marketplace.loginToPost", "Log in with your student account to post on Student Exchange"));
      navigate({ to: "/login" });
      return;
    }
    if (!user.profileComplete) {
      toast.info(t("marketplace.completeProfile", "Complete your profile registration before posting."));
      navigate({ to: afterAuthPath("student", false, user.isVerified !== false) });
      return;
    }
    setPostOpen(true);
  };

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-primary" aria-hidden />
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="container relative mx-auto px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <div className="max-w-3xl">
            <Badge className="mb-4 border-white/25 bg-white/15 text-white hover:bg-white/15">
              <Sparkles className="me-1 h-3 w-3" />
              {t("marketplace.badge")}
            </Badge>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("marketplace.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">
              {t("marketplace.subtitle")}
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {t("marketplace.trustSellers")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                {t("marketplace.trustApproved")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                {t("marketplace.livePosts", { count: activeListings.length })}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" variant="secondary" className="shadow-lg" onClick={openPost}>
                <Plus className="me-2 h-5 w-5" />
                {t("marketplace.postListing")}
              </Button>
              {role === "student" ? (
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  <Link to="/student">{t("marketplace.managePosts")}</Link>
                </Button>
              ) : (
                <span className="text-sm text-white/75">{t("marketplace.studentsOnly")}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-8 sm:px-6 lg:py-10">
        {/* Category chips */}
        <div className="mb-6 overflow-x-auto -mx-1">
          <div className="flex min-w-max gap-2 px-1 pb-1">
            <CategoryChip active={cat === "all"} onClick={() => setCat("all")} label={t("marketplace.all")} icon={Package} />
            {(Object.keys(CATEGORY_LABELS) as ListingCategory[]).map((c) => (
              <CategoryChip
                key={c}
                active={cat === c}
                onClick={() => setCat(c)}
                label={t(CATEGORY_KEY[c])}
                icon={CATEGORY_ICON[c]}
              />
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("marketplace.searchPlaceholder")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("marketplace.allCities")}</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="number" placeholder={t("marketplace.maxPrice", { symbol })} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>

        {/* Results header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              {t("marketplace.listingsCount", { count: filtered.length })}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <Filter className="me-1 inline h-3.5 w-3.5" />
              {t("marketplace.approvedOnly")}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={openPost}>
            <Plus className="me-2 h-4 w-4" />
            {t("marketplace.sellSomething")}
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 font-display text-lg font-bold">{t("marketplace.emptyTitle")}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {t("marketplace.emptyDesc")}
            </p>
            <Button size="lg" variant="gradient" className="mt-5" onClick={openPost}>
              <Plus className="me-2 h-4 w-4" />
              {t("marketplace.postListing")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                onOpen={() => {
                  incrementViews(l.id);
                  setActive(l);
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-fuchsia-500/5 p-6 text-center sm:p-8">
          <h3 className="font-display text-lg font-bold">{t("marketplace.ctaSellTitle")}</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            {t("marketplace.ctaSellDesc")}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button size="lg" variant="gradient" onClick={openPost}>
              {t("marketplace.postExchange")}
              <ArrowRight className="ms-1 h-4 w-4" />
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/student">{t("marketplace.studentDashboard")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <PostExchangeListingDialog open={postOpen} onOpenChange={setPostOpen} />
      <ListingDetailDialog listing={active} onClose={() => setActive(null)} />
    </>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: typeof BookOpen;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "bg-card hover:border-primary/40 hover:bg-muted/50",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ListingCard({ listing, onOpen }: { listing: Listing; onOpen: () => void }) {
  const { t } = useTranslation("common");
  const { formatLocalizedPrice } = useCurrency();
  const Icon = CATEGORY_ICON[listing.category];
  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-2xl border bg-card transition hover:shadow-lg"
      onClick={onOpen}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {listing.imageUrl ? (
          <AppImage
            src={listing.imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Icon className="h-10 w-10" />
          </div>
        )}
        <Badge className="absolute start-2 top-2 border bg-background/90 text-foreground">
          <Icon className="me-1 h-3 w-3" />
          {t(CATEGORY_KEY[listing.category])}
        </Badge>
        {listing.negotiable && (
          <Badge className="absolute end-2 top-2 bg-emerald-600 text-white">{t("marketplace.negotiable")}</Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-display font-bold leading-tight">{listing.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {listing.city}, {listing.country}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg font-extrabold">
            {formatLocalizedPrice(listing.price, listing.currency)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            {listing.views}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span>{t("marketplace.bySeller", { name: listing.sellerName })}</span>
          <Badge variant="outline" className="capitalize">
            {listing.sellerRole}
          </Badge>
        </div>
      </div>
    </article>
  );
}

function ListingDetailDialog({ listing, onClose }: { listing: Listing | null; onClose: () => void }) {
  const { t } = useTranslation("common");
  const { sendMessage } = useMarketplace();
  const { formatLocalizedPrice } = useCurrency();
  const [msg, setMsg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!listing) return null;
  const Icon = CATEGORY_ICON[listing.category];

  const send = () => {
    if (!name || !email || !msg.trim()) return toast.error(t("marketplace.fillAllFields", "Fill all fields"));
    sendMessage({ listingId: listing.id, fromName: name, fromEmail: email, message: msg.trim() });
    toast.success(t("marketplace.messageSent", "Message sent to {{name}}", { name: listing.sellerName }));
    setMsg("");
    setName("");
    setEmail("");
    onClose();
  };

  return (
    <Dialog open={!!listing} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{listing.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-[1.2fr_1fr]">
          <div>
            {listing.imageUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                <AppImage
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 768px) 90vw, 480px"
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
                <Icon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>
                <Icon className="me-1 h-3 w-3" />
                {t(CATEGORY_KEY[listing.category])}
              </Badge>
              {listing.condition && <Badge variant="outline" className="capitalize">{listing.condition}</Badge>}
              {listing.negotiable && <Badge className="bg-emerald-600 text-white">{t("marketplace.negotiable")}</Badge>}
              <Badge variant="outline">
                <MapPin className="me-1 h-3 w-3" />
                {listing.city}, {listing.country}
              </Badge>
              <Badge variant="outline">
                <Eye className="me-1 h-3 w-3" />
                {t("marketplace.viewsCount", "{{count}} views", { count: listing.views })}
              </Badge>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{listing.description}</p>
            {listing.category === "rideshare" && (
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border bg-muted/40 p-3 text-sm">
                <div><span className="text-muted-foreground">{t("marketplace.rideFrom", "From:")}</span> {listing.rideFrom}</div>
                <div><span className="text-muted-foreground">{t("marketplace.rideTo", "To:")}</span> {listing.rideTo}</div>
                <div><span className="text-muted-foreground">{t("marketplace.rideSchedule", "Schedule:")}</span> {listing.rideDate}</div>
                <div><span className="text-muted-foreground">{t("marketplace.rideSeats", "Seats:")}</span> {listing.rideSeats}</div>
              </div>
            )}
          </div>
          <div>
            <div className="sticky top-0 rounded-xl border p-4">
              <div className="flex items-baseline justify-between">
                <div className="font-display text-3xl font-extrabold">
                  {formatLocalizedPrice(listing.price, listing.currency)}
                </div>
                <Badge variant="outline" className="capitalize">{listing.sellerRole}</Badge>
              </div>
              <div className="mt-3 text-sm">
                <div className="font-medium">{listing.sellerName}</div>
                <div className="text-xs text-muted-foreground">
                  {t("marketplace.posted", "Posted {{date}}", {
                    date: new Date(listing.createdAt).toLocaleDateString(),
                  })}
                </div>
              </div>
              <div className="mt-4 space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageCircle className="h-4 w-4" />
                  {t("marketplace.contactSeller", "Contact seller")}
                </div>
                <Input
                  placeholder={t("marketplace.yourName", "Your name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder={t("marketplace.yourEmail", "Your email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Textarea
                  placeholder={t("marketplace.messagePlaceholder", "Hi, is this still available?")}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="min-h-[90px]"
                />
                <Button size="lg" variant="gradient" className="w-full" onClick={send}>
                  <Send className="me-2 h-4 w-4" />
                  {t("contact.send")}
                </Button>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  {t("marketplace.neverPayAdvance", "Never pay in advance for items you haven't seen.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Market;
