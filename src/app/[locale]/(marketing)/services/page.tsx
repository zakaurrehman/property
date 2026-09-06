import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getServices } from "@/features/service/server/queries";
import { serviceIconMap, FallbackIcon } from "@/lib/lucide-icon";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Construction, architecture, interior design, investment consulting, property management and valuation services in DHA Lahore.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          Our Services
        </h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          Beyond buying and selling — we build, design and manage property across DHA
          Lahore.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = serviceIconMap[service.icon] ?? FallbackIcon;
          return (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="border-line bg-surface hover:border-accent-500/50 group flex flex-col gap-3 rounded-2xl border p-6 transition-colors hover:shadow-sm"
            >
              <span className="bg-accent-500/15 text-accent-700 flex size-11 items-center justify-center rounded-xl">
                <Icon className="size-5" />
              </span>
              <p className="text-ink-900 font-heading text-lg font-semibold">
                {service.name}
              </p>
              <p className="text-ink-600 text-sm">{service.summary}</p>
              <span className="text-accent-600 mt-auto flex items-center gap-1 text-sm font-medium">
                Learn more
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
