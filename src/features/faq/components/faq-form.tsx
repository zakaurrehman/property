"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { faqFormSchema, type FaqFormInput } from "../schema";

const emptyDefaults: FaqFormInput = {
  question: "",
  answer: "",
  category: "General",
  sortOrder: 0,
  isPublished: true,
};

export function FaqForm({
  mode,
  defaultValues,
  categories,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: FaqFormInput;
  categories: string[];
  onSubmit: (values: FaqFormInput) => Promise<ActionResult<{ id: string }>>;
}) {
  const router = useRouter();
  const form = useForm<FaqFormInput>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: defaultValues ?? emptyDefaults,
  });

  async function handleSubmit(values: FaqFormInput) {
    const result = await onSubmit(values);
    if (!result.ok) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof FaqFormInput, { message: messages[0] });
        }
      }
      return;
    }
    toast.success(mode === "create" ? "FAQ added." : "FAQ updated.");
    router.push("/admin/faqs");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="How often are file rates updated?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl>
                <Textarea rows={6} {...field} />
              </FormControl>
              <FormDescription>Markdown supported.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input list="faq-categories" placeholder="Buying" {...field} />
                </FormControl>
                <datalist id="faq-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <FormDescription>
                  Questions are grouped under this heading.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    className="w-20"
                    {...field}
                    value={String(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 space-y-0 pt-7">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">
                  {field.value ? "Published" : "Hidden"}
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Add FAQ" : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
