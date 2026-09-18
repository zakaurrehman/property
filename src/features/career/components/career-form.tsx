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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatEnumLabel } from "@/lib/format";
import type { ActionResult } from "@/types/action-result";
import { careerFormSchema, careerTypeOptions, type CareerFormInput } from "../schema";

const emptyDefaults: CareerFormInput = {
  title: "",
  slug: "",
  department: "Sales",
  location: "DHA Phase 5, Lahore",
  type: "FULL_TIME",
  description: "",
  isActive: true,
};

export function CareerForm({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: CareerFormInput;
  onSubmit: (values: CareerFormInput) => Promise<ActionResult<{ id: string }>>;
}) {
  const router = useRouter();
  const form = useForm<CareerFormInput>({
    resolver: zodResolver(careerFormSchema),
    defaultValues: defaultValues ?? emptyDefaults,
  });

  async function handleSubmit(values: CareerFormInput) {
    const result = await onSubmit(values);
    if (!result.ok) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof CareerFormInput, { message: messages[0] });
        }
      }
      return;
    }
    toast.success(mode === "create" ? "Job posted." : "Job updated.");
    router.push("/admin/careers");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job title</FormLabel>
                <FormControl>
                  <Input placeholder="Property Consultant" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL slug</FormLabel>
                <FormControl>
                  <Input placeholder="Leave blank to generate" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto_auto]">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {careerTypeOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {formatEnumLabel(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 space-y-0 pt-7">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">
                  {field.value ? "Open" : "Closed"}
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={12} className="font-mono text-sm" {...field} />
              </FormControl>
              <FormDescription>
                Markdown supported — responsibilities, requirements, benefits.
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
            {mode === "create" ? "Post job" : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
