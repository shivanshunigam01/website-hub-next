"use client";

import { useMemo, useState } from "react";
import { Link } from "@/lib/navigation";
import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/SectionHeading";
import { useAdminStore, type Accommodation } from "@/hooks/use-admin-store";
import { useLocationContext } from "@/hooks/use-user-location";
import { getAccommodationsForUser } from "@/lib/accommodation-location";
import { AccommodationCard } from "@/components/accommodation/AccommodationCard";
import { AccommodationEnquiryDialog } from "@/components/accommodation/AccommodationEnquiryDialog";

export function AccommodationSection() {
  const { accommodations } = useAdminStore();
  const { location, hasLocationAccess } = useLocationContext();
  const [selected, setSelected] = useState<Accommodation | null>(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const featured = useMemo(() => {
    return getAccommodationsForUser(accommodations, location, hasLocationAccess).slice(0, 3);
  }, [accommodations, location, hasLocationAccess]);

  if (featured.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <SectionHeading
        eyebrow="Student stays"
        title="PGs & hostels for students"
        subtitle="Verified accommodation options handpicked for our students — book a viewing or send an enquiry directly."
        action={
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link to="/accommodation">
              View all <ArrowRight className="ms-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((a) => (
          <AccommodationCard
            key={a.id}
            accommodation={a}
            onInquire={(item) => {
              setSelected(item);
              setEnquiryOpen(true);
            }}
          />
        ))}
      </div>

      <AccommodationEnquiryDialog
        accommodation={selected}
        open={enquiryOpen && !!selected}
        onOpenChange={(open) => {
          setEnquiryOpen(open);
          if (!open) setSelected(null);
        }}
      />
    </section>
  );
}
