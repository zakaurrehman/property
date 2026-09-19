"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { importReferenceLocations } from "../server/mutations";

/** Loads the standard DHA Lahore phases + major societies; safe to press more than once. */
export function ImportReferenceButton({
  variant = "outline",
}: {
  variant?: "outline" | "default";
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleImport() {
    setPending(true);
    const result = await importReferenceLocations();
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    const { created, skipped } = result.data;
    toast.success(
      created === 0
        ? "All standard areas already exist — nothing to add."
        : `Added ${created} area${created === 1 ? "" : "s"}${skipped ? ` (${skipped} already existed)` : ""}.`,
    );
    router.refresh();
  }

  return (
    <Button variant={variant} onClick={handleImport} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      Import DHA phases &amp; societies
    </Button>
  );
}
