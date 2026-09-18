"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "@/i18n/navigation";
import type { ActionResult } from "@/types/action-result";
import { sitePageFormSchema, type SitePageFormInput } from "../schema";

export function SitePageForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues: SitePageFormInput;
  onSubmit: (values: SitePageFormInput) => Promise<ActionResult<{ slug: string }>>;
}) {
  const router = useRouter();
  const form = useForm<SitePageFormInput>({
    resolver: zodResolver(sitePageFormSchema),
    defaultValues,
  });

  async function handleSubmit(values: SitePageFormInput) {
    const result = await onSubmit(values);
    if (!result.ok) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof SitePageFormInput, { message: messages[0] });
        }
      }
      return;
    }
    toast.success("Page saved.");
    router.push("/admin/pages");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contentMdx"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea rows={24} className="font-mono text-sm" {...field} />
              </FormControl>
              <FormDescription>
                Markdown supported — ## headings, **bold**, lists, links.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Save page
          </Button>
        </div>
      </form>
    </Form>
  );
}
