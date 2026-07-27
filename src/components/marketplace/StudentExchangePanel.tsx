"use client";

import { useState } from "react";
import { Link } from "@/lib/navigation";
import { Clock, ExternalLink, Loader2, Package, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/hooks/use-app";
import { useMyListings } from "@/hooks/use-listings-api";
import { CATEGORY_LABELS, displayListingStatus } from "@/services/listings-api";
import { useCurrency } from "@/hooks/use-currency";
import { PostExchangeListingDialog } from "@/components/marketplace/PostExchangeListingDialog";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  sold: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
};

export function StudentExchangePanel() {
  const { user } = useApp();
  const { data: myListings = [], isLoading } = useMyListings(!!user);
  const { formatLocalizedPrice } = useCurrency();
  const [postOpen, setPostOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5">
          <div>
            <h3 className="font-display font-bold">Student Exchange</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sell books, notes, devices and more. Posts are reviewed before going live.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setPostOpen(true)}>
              <Plus className="me-2 h-4 w-4" />
              Post a listing
            </Button>
            <Button asChild variant="outline">
              <Link to="/marketplace">
                Browse exchange
                <ExternalLink className="ms-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : myListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">No listings yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Post your first item — it will show here while waiting for admin approval.
            </p>
            <Button className="mt-4" size="sm" onClick={() => setPostOpen(true)}>
              <Plus className="me-2 h-4 w-4" />
              Create listing
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="border-b px-4 py-3 text-sm font-semibold">Your listings ({myListings.length})</div>
            <ul className="divide-y">
              {myListings.map((l) => {
                const status = displayListingStatus(l.status);
                return (
                  <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{l.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[l.category || "materials"] || l.category} ·{" "}
                        {formatLocalizedPrice(Number(l.price || 0), l.currency || "INR")}
                        {l.city ? ` · ${l.city}` : ""}
                      </p>
                    </div>
                    <Badge className={cn("shrink-0 capitalize", STATUS_STYLE[status] || STATUS_STYLE.pending)}>
                      {status === "pending" && <Clock className="me-1 h-3 w-3" />}
                      {status}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <PostExchangeListingDialog open={postOpen} onOpenChange={setPostOpen} />
    </>
  );
}
