import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { ContactForm } from "@/features/lead/components/contact-form";
import { siteConfig } from "@/lib/site-config";
import { buildTelLink, buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  alternates: localizedAlternates("/contact"),
  title: "Contact Us",
  description:
    "Get in touch with Estate Bureau — DHA Lahore's property specialists. Call, WhatsApp, or send us a message.",
};

const officeAddress = "123 Main Boulevard, DHA Phase 5, Lahore, Pakistan";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          Get in Touch
        </h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          Questions about a listing, a plot file, or construction services? Our team
          replies fast — usually within a few hours during business hours.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-6">
          <div className="border-line bg-surface-2 rounded-2xl border p-6">
            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="text-accent-600 mt-0.5 size-5 shrink-0" />
                <div>
                  <dt className="text-ink-900 font-medium">Office</dt>
                  <dd className="text-ink-600">
                    {officeAddress}{" "}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-600 hover:text-accent-500 underline"
                    >
                      Get directions
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-accent-600 mt-0.5 size-5 shrink-0" />
                <div>
                  <dt className="text-ink-900 font-medium">Hours</dt>
                  <dd className="text-ink-600">Mon – Sat, 9:00 AM – 6:00 PM</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-accent-600 mt-0.5 size-5 shrink-0" />
                <div>
                  <dt className="text-ink-900 font-medium">Phone</dt>
                  <dd>
                    <a
                      href={buildTelLink(siteConfig.phone)}
                      className="text-ink-600 hover:text-accent-600"
                    >
                      {siteConfig.phone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="text-accent-600 mt-0.5 size-5 shrink-0" />
                <div>
                  <dt className="text-ink-900 font-medium">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="text-ink-600 hover:text-accent-600"
                    >
                      {siteConfig.email}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <a
            href={buildWhatsAppLink(
              siteConfig.whatsapp,
              "Hi, I have a question for Estate Bureau.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-medium text-white shadow-sm transition-transform hover:scale-[1.01]"
          >
            Chat on WhatsApp
          </a>

          <div>
            <p className="text-ink-400 mb-2 text-xs font-semibold tracking-wide uppercase">
              Departments
            </p>
            <ul className="text-ink-600 space-y-1 text-sm">
              <li>Buying / Selling — for sale enquiries and plot files</li>
              <li>Rentals — houses, portions, flats, commercial</li>
              <li>Construction & Interiors — grey structure to turnkey</li>
            </ul>
          </div>
        </div>

        <div className="border-line bg-surface rounded-2xl border p-6 shadow-sm sm:p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
