"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "@/i18n/navigation";
import type { ActionResult } from "@/types/action-result";

/**
 * Confirm-then-delete for admin tables. `action` is a Server Action reference
 * — the one kind of function a Server Component *can* hand to a Client
 * Component, so each admin page passes its own delete action in.
 */
export function DeleteButton({
  id,
  action,
  label,
  description = "This can't be undone.",
  successMessage = "Deleted.",
}: {
  id: string;
  action: (id: string) => Promise<ActionResult<null>>;
  label: string;
  description?: string;
  successMessage?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleDelete() {
    setPending(true);
    const result = await action(id);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(successMessage);
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-ink-500 hover:text-destructive"
          aria-label={`Delete ${label}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleDelete();
            }}
            disabled={pending}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
