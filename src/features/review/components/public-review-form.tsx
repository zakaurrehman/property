"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Star } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { publicReviewSchema, type PublicReviewInput } from "../schema";
import { submitPublicReview } from "../server/actions";
import type { AgentOption } from "../server/queries";

const NONE = "__none__";

export function PublicReviewForm({ agentOptions }: { agentOptions: AgentOption[] }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<PublicReviewInput>({
    resolver: zodResolver(publicReviewSchema),
    defaultValues: {
      authorName: "",
      rating: 0,
      body: "",
      agentId: "",
      consent: false,
      company: "",
    },
  });
  const rating = Number(useWatch({ control: form.control, name: "rating" }) ?? 0);

  async function onSubmit(values: PublicReviewInput) {
    setServerError(null);
    const result = await submitPublicReview(values);
    if (!result.ok) {
      setServerError(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof PublicReviewInput, { message: messages[0] });
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
        <p className="text-ink-900 font-medium">Thank you for your review.</p>
        <p className="text-ink-600 text-sm">
          It will appear here once our team has checked it.
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
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your rating</FormLabel>
              <FormControl>
                <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} star${n === 1 ? "" : "s"}`}
                      onClick={() => field.onChange(n)}
                      className="rounded p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "size-7",
                          n <= rating ? "fill-amber-400 text-amber-400" : "text-ink-300",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your name</FormLabel>
                <FormControl>
                  <Input placeholder="As you'd like it shown" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Who helped you?</FormLabel>
                <Select
                  value={field.value || NONE}
                  onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>The Estate Bureau team</SelectItem>
                    {agentOptions.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
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
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your review</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="What was the experience like?"
                  {...field}
                />
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
                  I agree that Estate Bureau may publish this review with my first name.
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
          Submit review
        </Button>
      </form>
    </Form>
  );
}
