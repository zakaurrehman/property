"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { propertyEnquirySchema, type PropertyEnquiryInput } from "../schema";
import { createPropertyEnquiry } from "../server/actions";

export function PropertyEnquiryForm({
  propertyId,
  propertyTitle,
}: {
  propertyId: string;
  propertyTitle: string;
}) {
  const [submitted, setSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<PropertyEnquiryInput>({
    resolver: zodResolver(propertyEnquirySchema),
    defaultValues: {
      propertyId,
      name: "",
      phone: "",
      email: "",
      message: `Hi, I'm interested in "${propertyTitle}". Please share more details.`,
      consent: false,
    },
  });

  async function onSubmit(values: PropertyEnquiryInput) {
    setServerError(null);
    const result = await createPropertyEnquiry(values);
    if (!result.ok) {
      setServerError(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof PropertyEnquiryInput, { message: messages[0] });
        }
      }
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-100 p-6 text-center dark:bg-emerald-500/10">
        <CheckCircle2 className="size-8 text-emerald-500" />
        <p className="text-ink-900 font-medium">Thanks — your enquiry was sent.</p>
        <p className="text-ink-600 text-sm">The agent will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+92 300 1234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="grid gap-0.5 leading-tight">
                <FormLabel className="text-ink-600 text-xs font-normal">
                  I agree to be contacted by Estate Bureau and this agent about this
                  property.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {serverError && <p className="text-destructive text-sm">{serverError}</p>}

        <Button type="submit" disabled={form.formState.isSubmitting} className="mt-1">
          {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Send Enquiry
        </Button>
      </form>
    </Form>
  );
}
