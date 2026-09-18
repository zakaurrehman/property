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
import { SingleImageInput } from "@/features/media/components/single-image-input";
import { postFormSchema, type PostFormInput } from "../schema";

const emptyDefaults: PostFormInput = {
  title: "",
  slug: "",
  excerpt: "",
  contentMdx: "",
  coverImage: "",
  tags: "DHA Lahore",
  readingMinutes: 5,
  published: false,
};

export function PostForm({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: PostFormInput;
  onSubmit: (values: PostFormInput) => Promise<ActionResult<{ id: string }>>;
}) {
  const router = useRouter();
  const form = useForm<PostFormInput>({
    resolver: zodResolver(postFormSchema),
    defaultValues: defaultValues ?? emptyDefaults,
  });

  async function handleSubmit(values: PostFormInput) {
    const result = await onSubmit(values);
    if (!result.ok) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof PostFormInput, { message: messages[0] });
        }
      }
      return;
    }
    toast.success(mode === "create" ? "Post created." : "Post updated.");
    router.push("/admin/posts");
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
                <Input placeholder="DHA Phase 9 Prism: A Buyer's Guide" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Leave blank to generate from the title"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Shown as /blog/your-slug</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="readingMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reading time (min)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={String(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="One or two sentences shown on the blog index."
                  {...field}
                />
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
                <Textarea rows={16} className="font-mono text-sm" {...field} />
              </FormControl>
              <FormDescription>
                Markdown supported — ## headings, **bold**, lists, links.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover image</FormLabel>
              <FormControl>
                <SingleImageInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input placeholder="DHA Lahore, Buying Guide" {...field} />
                </FormControl>
                <FormDescription>Comma-separated.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 space-y-0 pt-7">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">
                  {field.value ? "Published" : "Draft"}
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
            {mode === "create" ? "Create post" : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
