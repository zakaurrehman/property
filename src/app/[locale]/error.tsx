"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Sentry-ready hook: wire a real reporter here once Sentry DSN lands.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">
        Something went wrong
      </h1>
      <p className="text-ink-600 text-sm">
        We hit an unexpected error loading this page. You can try again, or head back
        home.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
