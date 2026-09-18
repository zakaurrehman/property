"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { formatEnumLabel } from "@/lib/format";
import { applicationStatusOptions } from "../schema";
import { setApplicationStatus } from "../server/actions";

export function ApplicationStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleChange(next: string) {
    setPending(true);
    const result = await setApplicationStatus(id, next);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="h-8 w-32 text-xs">
        <SelectValue>{formatEnumLabel(status)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {applicationStatusOptions.map((s) => (
          <SelectItem key={s} value={s}>
            {formatEnumLabel(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
