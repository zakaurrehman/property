"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { serviceIconMap, serviceIconNames, FallbackIcon } from "@/lib/lucide-icon";
import type { ActionResult } from "@/types/action-result";
import { ImageUploader } from "@/features/media/components/image-uploader";
import { serviceFormSchema, type ServiceFormInput } from "../schema";

const emptyDefaults: ServiceFormInput = {
  name: "",
  slug: "",
  summary: "",
  descriptionMdx: "",
  icon: "HardHat",
  gallery: [],
  sortOrder: 0,
};

export function ServiceForm({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: ServiceFormInput;
  onSubmit: (values: ServiceFormInput) => Promise<ActionResult<{ id: string }>>;
}) {
  const router = useRouter();
  const form = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: defaultValues ?? emptyDefaults,
  });
  const gallery = useWatch({ control: form.control, name: "gallery" }) ?? [];

  async function handleSubmit(values: ServiceFormInput) {
    const result = await onSubmit(values);
    if (!result.ok) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof ServiceFormInput, { message: messages[0] });
        }
      }
      return;
    }
    toast.success(mode === "create" ? "Service created." : "Service updated.");
    router.push("/admin/services");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_auto]">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Construction" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => {
              const Icon = serviceIconMap[field.value] ?? FallbackIcon;
              return (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <span className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <SelectValue />
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceIconNames.map((name) => {
                        const Option = serviceIconMap[name] ?? FallbackIcon;
                        return (
                          <SelectItem key={name} value={name}>
                            <span className="flex items-center gap-2">
                              <Option className="size-4" />
                              {name}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
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
        </div>

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL slug</FormLabel>
              <FormControl>
                <Input placeholder="Leave blank to generate from the name" {...field} />
              </FormControl>
              <FormDescription>
                Shown as /services/your-slug — the header menu links to these.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Input placeholder="One line shown on the services grid" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descriptionMdx"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={10} className="font-mono text-sm" {...field} />
              </FormControl>
              <FormDescription>Markdown supported.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gallery"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gallery</FormLabel>
              <FormControl>
                <ImageUploader images={gallery} onChange={field.onChange} />
              </FormControl>
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
            {mode === "create" ? "Create service" : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
