"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { moderateProperty } from "../server/actions";

export function ModerationActions({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState<"approve" | "reject" | null>(null);

  async function handle(decision: "approve" | "reject") {
    setPending(decision);
    const result = await moderateProperty(propertyId, decision);
    setPending(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      decision === "approve" ? "Listing approved and published." : "Listing rejected.",
    );
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => handle("approve")} disabled={pending !== null}>
        {pending === "approve" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Check className="size-4" />
        )}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handle("reject")}
        disabled={pending !== null}
        className="text-destructive hover:text-destructive"
      >
        {pending === "reject" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <X className="size-4" />
        )}
        Reject
      </Button>
    </div>
  );
}
