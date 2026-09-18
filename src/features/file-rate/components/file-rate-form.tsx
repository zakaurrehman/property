"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { LocationPicker } from "@/features/property/components/location-picker";
import {
  fileRateFormSchema,
  fileTypeOptions,
  trendOptions,
  plotTypeOptions,
  sizePresets,
  type FileRateFormInput,
} from "../schema";

const emptyDefaults: FileRateFormInput = {
  locationId: "",
  locationLabel: "",
  plotType: "Residential",
  sizeLabel: "",
  fileType: "ALLOCATION",
  demandPkr: "" as unknown as number,
  callForPrice: false,
  contactName: "",
  contactPhone: "",
  effectiveDate: new Date().toISOString().slice(0, 10),
};

export function FileRateForm({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: FileRateFormInput;
  onSubmit: (values: FileRateFormInput) => Promise<ActionResult<{ id: string }>>;
}) {
  const router = useRouter();
  const form = useForm<FileRateFormInput>({
    resolver: zodResolver(fileRateFormSchema),
    defaultValues: defaultValues ?? emptyDefaults,
  });
  const callForPrice = useWatch({ control: form.control, name: "callForPrice" });
  const locationLabel = useWatch({ control: form.control, name: "locationLabel" });

  async function handleSubmit(values: FileRateFormInput) {
    const result = await onSubmit(values);
    if (!result.ok) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof FileRateFormInput, { message: messages[0] });
        }
      }
      return;
    }
    toast.success(mode === "create" ? "File rate added." : "File rate updated.");
    router.push("/admin/file-rates");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phase / society</FormLabel>
              <FormControl>
                <LocationPicker
                  value={field.value}
                  label={locationLabel}
                  onChange={(loc) => {
                    field.onChange(loc.id);
                    form.setValue("locationLabel", loc.label);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="plotType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plot type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {plotTypeOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
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
            name="sizeLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pick a size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sizePresets.map((p) => (
                      <SelectItem key={p.label} value={p.label}>
                        {p.label}
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
            name="fileType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fileTypeOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {formatEnumLabel(o)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <FormField
            control={form.control}
            name="demandPkr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Demand (PKR)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 12500000"
                    disabled={callForPrice}
                    {...field}
                    value={field.value === undefined ? "" : String(field.value)}
                  />
                </FormControl>
                <FormDescription>
                  Full amount in rupees, e.g. 1.25 Crore = 12500000.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="callForPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0 pt-7">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Call for price</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trend"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trend override</FormLabel>
                <Select
                  value={field.value ?? "auto"}
                  onValueChange={(v) => field.onChange(v === "auto" ? undefined : v)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="auto">Auto (from last price)</SelectItem>
                    {trendOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {formatEnumLabel(o)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact name</FormLabel>
                <FormControl>
                  <Input placeholder="Agent handling this rate" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="+92 300 1234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="effectiveDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Effective date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
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
            {mode === "create" ? "Add file rate" : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
