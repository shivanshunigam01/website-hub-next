"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectWithOther } from "@/components/ui/SelectWithOther";
import { toast } from "sonner";
import { useApp } from "@/hooks/use-app";
import { useLocationContext } from "@/hooks/use-user-location";
import { useCurrency } from "@/hooks/use-currency";
import { useCreateListing } from "@/hooks/use-listings-api";
import { CATEGORY_LABELS, toApiCategory } from "@/services/listings-api";
import { formatApiErrorMessage } from "@/lib/api";

type ListingCategory = "books" | "notes" | "electronics" | "services" | "rideshare" | "accommodation" | "tutoring" | "other";
type ListingCondition = "new" | "like-new" | "good" | "used" | "other";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
};

export function PostExchangeListingDialog({ open, onOpenChange, onSubmitted }: Props) {
  const { user, role } = useApp();
  const createMut = useCreateListing();
  const { location, hasLocationAccess } = useLocationContext();
  const { currency: detectedCurrency } = useCurrency();
  const isStudent = role === "student" && !!user;

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "books" as ListingCategory,
    categoryOther: "",
    condition: "good" as ListingCondition,
    conditionOther: "",
    price: 0,
    currency: detectedCurrency,
    negotiable: true,
    city: "",
    country: "",
    imageUrl: "",
    sellerPhone: "",
    rideFrom: "",
    rideTo: "",
    rideDate: "",
    rideSeats: 1,
  });

  useEffect(() => {
    if (!open || !isStudent) return;
    setForm((prev) => ({
      ...prev,
      city: hasLocationAccess ? (location?.city ?? prev.city) : prev.city,
      country: hasLocationAccess ? (location?.country ?? prev.country) : prev.country,
      currency: detectedCurrency,
    }));
  }, [open, isStudent, hasLocationAccess, location?.city, location?.country, detectedCurrency]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "books",
      categoryOther: "",
      condition: "good",
      conditionOther: "",
      price: 0,
      currency: detectedCurrency,
      negotiable: true,
      city: hasLocationAccess ? (location?.city ?? "") : "",
      country: hasLocationAccess ? (location?.country ?? "") : "",
      imageUrl: "",
      sellerPhone: "",
      rideFrom: "",
      rideTo: "",
      rideDate: "",
      rideSeats: 1,
    });
  };

  const submit = async () => {
    if (!isStudent || !user) return;
    if (!form.title.trim() || !form.description.trim() || !form.price || !form.city.trim()) {
      toast.error("Fill in title, description, price and city");
      return;
    }
    if (form.category === "other" && !form.categoryOther.trim()) {
      toast.error("Please specify the category");
      return;
    }
    try {
      const descParts = [form.description.trim()];
      if (form.condition) descParts.push(`Condition: ${form.condition}`);
      if (form.category === "other" && form.categoryOther.trim()) {
        descParts.push(`Category: ${form.categoryOther.trim()}`);
      }
      if (form.negotiable) descParts.push("Price negotiable.");
      if (form.sellerPhone.trim()) descParts.push(`Contact: ${form.sellerPhone.trim()}`);
      if (form.category === "rideshare") {
        descParts.push(
          `Ride: ${form.rideFrom} → ${form.rideTo} (${form.rideDate}, ${form.rideSeats} seats)`,
        );
      }

      await createMut.mutateAsync({
        title: form.title.trim(),
        description: descParts.join("\n"),
        category: toApiCategory(form.category),
        price: form.price,
        currency: form.currency,
        city: form.city.trim(),
        country: form.country.trim() || "India",
        imageUrl: form.imageUrl.trim() || undefined,
        status: "pending",
      });
      toast.success("Listing submitted! It will appear after admin approval.");
      resetForm();
      onOpenChange(false);
      onSubmitted?.();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Could not submit listing"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post on Student Exchange</DialogTitle>
          <DialogDescription>
            {isStudent
              ? "Your listing goes live after an admin reviews and approves it."
              : "Sign in with your student account to post books, notes, devices and more."}
          </DialogDescription>
        </DialogHeader>

        {!isStudent ? (
          <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Only verified student accounts can post on Student Exchange.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/register">Create student account</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Listings are reviewed by our team before they appear publicly.
            </div>

            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm">
              Posting as <span className="font-semibold">{user?.name}</span> · {user?.email}
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. NEET Biology Notes — Class 11 & 12"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5 min-h-[100px]"
                placeholder="Condition, what's included, pickup or delivery options…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <SelectWithOther
                  mode="enum-other"
                  className="mt-1.5"
                  options={(["books", "notes", "electronics", "services", "rideshare", "accommodation", "tutoring"] as ListingCategory[])
                    .map((c) => ({ value: c, label: CATEGORY_LABELS[c] || c }))}
                  value={form.category}
                  customValue={form.categoryOther}
                  onValueChange={(v) => setForm({ ...form, category: v as ListingCategory })}
                  onCustomValueChange={(v) => setForm({ ...form, categoryOther: v })}
                  otherPlaceholder="Specify category"
                />
              </div>
              <div>
                <Label>Condition</Label>
                <SelectWithOther
                  mode="enum-other"
                  className="mt-1.5"
                  options={[
                    { value: "new", label: "New" },
                    { value: "like-new", label: "Like new" },
                    { value: "good", label: "Good" },
                    { value: "used", label: "Used" },
                  ]}
                  value={form.condition}
                  customValue={form.conditionOther}
                  onValueChange={(v) => setForm({ ...form, condition: v as ListingCondition })}
                  onCustomValueChange={(v) => setForm({ ...form, conditionOther: v })}
                  otherPlaceholder="Specify condition"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="mt-1.5"
                  min={0}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["INR", "USD", "AED", "GBP", "EUR"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch checked={form.negotiable} onCheckedChange={(v) => setForm({ ...form, negotiable: v })} />
                <span className="text-xs">Negotiable</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Image URL (optional)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input
                value={form.sellerPhone}
                onChange={(e) => setForm({ ...form, sellerPhone: e.target.value })}
                placeholder="+91 …"
                className="mt-1.5"
              />
            </div>

            {form.category === "rideshare" && (
              <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/40 p-3">
                <div><Label>From</Label><Input value={form.rideFrom} onChange={(e) => setForm({ ...form, rideFrom: e.target.value })} className="mt-1.5" /></div>
                <div><Label>To</Label><Input value={form.rideTo} onChange={(e) => setForm({ ...form, rideTo: e.target.value })} className="mt-1.5" /></div>
                <div><Label>Date / schedule</Label><Input value={form.rideDate} onChange={(e) => setForm({ ...form, rideDate: e.target.value })} className="mt-1.5" /></div>
                <div><Label>Seats</Label><Input type="number" value={form.rideSeats} onChange={(e) => setForm({ ...form, rideSeats: Number(e.target.value) })} className="mt-1.5" /></div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="default" onClick={() => onOpenChange(false)}>Cancel</Button>
          {isStudent && (
            <Button size="default" variant="gradient" onClick={() => void submit()} disabled={createMut.isPending}>
              <Plus className="me-2 h-4 w-4" />
              {createMut.isPending ? "Submitting…" : "Submit for approval"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
