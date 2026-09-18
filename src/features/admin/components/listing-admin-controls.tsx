"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { formatEnumLabel } from "@/lib/format";
import { setListingFlag, setListingStatus, type ListingFlag } from "../server/actions";

const statusOptions = [
  "ACTIVE",
  "PENDING",
  "UNDER_OFFER",
  "SOLD",
  "RENTED",
  "EXPIRED",
  "REJECTED",
  "DRAFT",
];

export function ListingStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleChange(next: string) {
    setPending(true);
    const result = await setListingStatus(id, next);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Status set to ${formatEnumLabel(next)}.`);
    router.refresh();
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="h-8 w-32 text-xs">
        {/* Explicit children so SSR renders the label — Radix's SelectValue
            only knows item text once SelectContent has mounted on the client. */}
        <SelectValue>{formatEnumLabel(status)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((s) => (
          <SelectItem key={s} value={s}>
            {formatEnumLabel(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ListingFlagToggle({
  id,
  flag,
  value,
  label,
}: {
  id: string;
  flag: ListingFlag;
  value: boolean;
  label: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleChange(next: boolean) {
    setPending(true);
    const result = await setListingFlag(id, flag, next);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <label className="flex items-center gap-1.5 text-xs" title={label}>
      <Switch
        checked={value}
        onCheckedChange={handleChange}
        disabled={pending}
        className="scale-75"
        aria-label={label}
      />
    </label>
  );
}
