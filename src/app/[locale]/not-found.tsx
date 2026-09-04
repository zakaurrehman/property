import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function LocaleNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-heading text-brand-900 dark:text-accent-500 text-6xl font-bold">
        404
      </p>
      <h1 className="text-ink-900 text-xl font-semibold">Page not found</h1>
      <p className="text-ink-600 text-sm">
        This page doesn&apos;t exist yet, or has moved. Try the homepage or search DHA
        listings directly.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/properties">Search properties</Link>
        </Button>
      </div>
    </div>
  );
}
