"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "@/i18n/navigation";
import { setReviewApproval } from "../server/actions";

export function ReviewApprovalToggle({
  reviewId,
  isApproved,
}: {
  reviewId: string;
  isApproved: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleChange(next: boolean) {
    setPending(true);
    const result = await setReviewApproval(reviewId, next);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(next ? "Review is now public." : "Review hidden.");
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <Switch checked={isApproved} onCheckedChange={handleChange} disabled={pending} />
      <span className={isApproved ? "text-ink-900" : "text-ink-500"}>
        {isApproved ? "Public" : "Hidden"}
      </span>
    </label>
  );
}
