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
import { updateUserRole } from "../server/actions";

const roles = ["USER", "AGENT", "ADMIN"] as const;

export function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: string;
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState(role);
  const [pending, setPending] = React.useState(false);

  async function handleChange(next: string) {
    const previous = value;
    setValue(next);
    setPending(true);
    const result = await updateUserRole(userId, next);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      setValue(previous);
      return;
    }
    toast.success(`Role updated to ${formatEnumLabel(next)}.`);
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled || pending}>
      <SelectTrigger size="sm" className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((r) => (
          <SelectItem key={r} value={r}>
            {formatEnumLabel(r)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
