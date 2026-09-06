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
import { formatEnumLabel } from "@/lib/format";
import { updateLeadStatus } from "../server/mutations";

const statuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "VIEWING",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [value, setValue] = React.useState(status);
  const [pending, setPending] = React.useState(false);

  async function handleChange(next: string) {
    setValue(next);
    setPending(true);
    const result = await updateLeadStatus(leadId, next);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      setValue(status);
      return;
    }
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s}>
            {formatEnumLabel(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
