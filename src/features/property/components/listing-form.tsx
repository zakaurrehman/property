"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useRouter } from "@/i18n/navigation";
import { formatEnumLabel } from "@/lib/format";
import { amenityCatalog } from "@/lib/amenity-catalog";
import type { ActionResult } from "@/types/action-result";
import {
  propertyFormSchema,
  type PropertyFormInput,
  purposeOptions,
  typeOptions,
  categoryOptions,
  furnishingOptions,
  facingOptions,
  possessionOptions,
  fileTypeOptions,
  rentPeriodOptions,
  sizeUnitOptions,
} from "../listing-schema";
import { LocationPicker } from "./location-picker";
import { ImageUploader } from "@/features/media/components/image-uploader";

const emptyDefaults: PropertyFormInput = {
  title: "",
  description: "",
  purpose: "SALE",
  type: "HOUSE",
  category: "RESIDENTIAL",
  price: "" as unknown as number,
  priceOnRequest: false,
  sizeValue: "" as unknown as number,
  sizeUnit: "MARLA",
  possession: "READY",
  locationId: "",
  locationLabel: "",
  address: "",
  amenities: [],
  images: [],
};

type TabValue = "basics" | "location" | "details" | "photos";

export function ListingForm({
  mode,
  defaultValues,
  defaultLocationLabel,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: PropertyFormInput;
  defaultLocationLabel?: string;
  onSubmit: (values: PropertyFormInput) => Promise<ActionResult<{ slug: string }>>;
}) {
  const router = useRouter();
  const [tab, setTab] = React.useState<TabValue>("basics");
  const [locationLabel, setLocationLabel] = React.useState(defaultLocationLabel ?? "");

  const form = useForm<PropertyFormInput>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: defaultValues ?? emptyDefaults,
  });

  const purpose = useWatch({ control: form.control, name: "purpose" });
  const amenities = useWatch({ control: form.control, name: "amenities" }) ?? [];
  const images = useWatch({ control: form.control, name: "images" }) ?? [];

  async function handleSubmit(values: PropertyFormInput) {
    const result = await onSubmit(values);
    if (!result.ok) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof PropertyFormInput, { message: messages[0] });
        }
        const firstField = Object.keys(result.fieldErrors)[0];
        if (
          ["title", "description", "purpose", "type", "category", "price"].includes(
            firstField,
          )
        ) {
          setTab("basics");
        } else if (["locationId", "address"].includes(firstField)) {
          setTab("location");
        } else if (firstField === "images") {
          setTab("photos");
        } else {
          setTab("details");
        }
      }
      return;
    }
    toast.success(
      mode === "create" ? "Listing submitted for review." : "Listing updated.",
    );
    router.push("/dashboard/listings");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="photos">Photos ({images.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="flex flex-col gap-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="10 Marla House in DHA Phase 6" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={6} placeholder="Describe the property…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purposeOptions.map((v) => (
                          <SelectItem key={v} value={v}>
                            {formatEnumLabel(v)}
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((v) => (
                          <SelectItem key={v} value={v}>
                            {formatEnumLabel(v)}
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((v) => (
                          <SelectItem key={v} value={v}>
                            {formatEnumLabel(v)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (PKR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25000000"
                        {...field}
                        value={String(field.value ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {purpose === "RENT" && (
                <FormField
                  control={form.control}
                  name="rentPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent period</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rentPeriodOptions.map((v) => (
                            <SelectItem key={v} value={v}>
                              {formatEnumLabel(v)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormField
              control={form.control}
              name="priceOnRequest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Show as &quot;Price on request&quot;
                  </FormLabel>
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="location" className="flex flex-col gap-4 pt-4">
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <LocationPicker
                    value={field.value}
                    label={locationLabel}
                    onChange={(loc) => {
                      field.onChange(loc.id);
                      setLocationLabel(loc.label);
                      if (loc.lat && loc.lng) {
                        form.setValue("lat", loc.lat);
                        form.setValue("lng", loc.lng);
                      }
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street 12, Block C" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="plotNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plot no. (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="streetNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street no. (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="flex flex-col gap-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="sizeValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        value={String(field.value ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sizeUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sizeUnitOptions.map((v) => (
                          <SelectItem key={v} value={v}>
                            {formatEnumLabel(v)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value === undefined ? "" : String(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value === undefined ? "" : String(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="floors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floors</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value === undefined ? "" : String(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parking</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value === undefined ? "" : String(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="furnishing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Furnishing</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {furnishingOptions.map((v) => (
                          <SelectItem key={v} value={v}>
                            {formatEnumLabel(v)}
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
                name="facing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facing</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {facingOptions.map((v) => (
                          <SelectItem key={v} value={v}>
                            {formatEnumLabel(v)}
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
                name="yearBuilt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year built</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value === undefined ? "" : String(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="possession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Possession</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {possessionOptions.map((v) => (
                          <SelectItem key={v} value={v}>
                            {formatEnumLabel(v)}
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
                    <FormLabel>File type (plot files only)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="N/A" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fileTypeOptions.map((v) => (
                          <SelectItem key={v} value={v}>
                            {formatEnumLabel(v)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Amenities</FormLabel>
              <FormDescription className="mt-1 mb-2">
                Select everything that applies to this property.
              </FormDescription>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(amenityCatalog).map(([slug, { label }]) => (
                  <label key={slug} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={amenities.includes(slug)}
                      onCheckedChange={(checked) => {
                        form.setValue(
                          "amenities",
                          checked
                            ? [...amenities, slug]
                            : amenities.filter((a) => a !== slug),
                        );
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="photos" className="flex flex-col gap-4 pt-4">
            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>Photos</FormLabel>
                  <ImageUploader
                    images={images}
                    onChange={(imgs) => form.setValue("images", imgs)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="border-line flex items-center justify-end gap-3 border-t pt-4">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Submit for review" : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
