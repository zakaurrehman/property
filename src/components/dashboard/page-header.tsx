import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-heading text-ink-900 text-2xl font-bold">{title}</h1>
        {description && <p className="text-ink-600 mt-1 text-sm">{description}</p>}
      </div>
      {action && (
        <Button asChild>
          <Link href={action.href}>
            <Plus className="size-4" />
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
