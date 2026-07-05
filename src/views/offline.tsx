"use client";

import { Link } from "@/lib/navigation";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";



function OfflinePage() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="login" />
        </div>
        <div className="mx-auto h-20 w-20 rounded-3xl bg-muted grid place-items-center mb-6">
          <WifiOff className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-display text-3xl font-extrabold">You're offline</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn't reach the network. Cached pages still work — try again when you're back online.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button size="lg" variant="gradient" onClick={() => typeof window !== "undefined" && window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
          </Button>
          <Button asChild size="lg" variant="outline"><Link to="/">Home</Link></Button>
        </div>
      </div>
    </div>
  );
}

export default OfflinePage;
