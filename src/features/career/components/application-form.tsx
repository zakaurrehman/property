"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { applicationSchema, type ApplicationInput } from "../schema";
import { submitApplication } from "../server/actions";

export function ApplicationForm({
  careerId,
  jobTitle,
}: {
  careerId: string;
  jobTitle: string;
}) {
  const [submitted, setSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      careerId,
      name: "",
      email: "",
      phone: "",
      cvUrl: "",
      coverLetter: "",
      consent: false,
      company: "",
    },
  });

  async function onSubmit(values: ApplicationInput) {
    setServerError(null);
    const result = await submitApplication(values);
    if (!result.ok) {
      setServerError(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof ApplicationInput, { message: messages[0] });
        }
      }
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-100 p-8 text-center dark:bg-emerald-500/10">
        <CheckCircle2 className="size-8 text-emerald-500" />
        <p className="text-ink-900 font-medium">Application received.</p>
        <p className="text-ink-600 text-sm">
          Thanks for applying for {jobTitle}. We&apos;ll be in touch if there&apos;s a
          fit.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
          {...form.register("company")}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
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
        </div>
        <FormField
          control={form.control}
          name="cvUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link to your CV</FormLabel>
              <FormControl>
                <Input placeholder="https://drive.google.com/…" {...field} />
              </FormControl>
              <FormDescription>
                A shareable Google Drive / Dropbox link, or your LinkedIn profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coverLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Why you? (optional)</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
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
                  I agree to Estate Bureau contacting me about this application.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {serverError && <p className="text-destructive text-sm">{serverError}</p>}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          size="lg"
          className="mt-1"
        >
          {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Submit application
        </Button>
      </form>
    </Form>
  );
}
