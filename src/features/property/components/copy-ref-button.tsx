"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyRefButton({ refCode }: { refCode: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(refCode);
      setCopied(true);
      toast.success("Property ID copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — copy it manually.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="border-line text-ink-600 hover:border-accent-500 hover:text-accent-600 flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
    >
      {refCode}
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}
