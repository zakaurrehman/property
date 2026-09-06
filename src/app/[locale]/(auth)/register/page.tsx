import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a free Estate Bureau account to save properties and track enquiries.",
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect({ href: "/", locale: await getLocale() });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-ink-900 text-2xl font-bold sm:text-3xl">
          Create your account
        </h1>
        <p className="text-ink-600 mt-2 text-sm">
          Save properties, track enquiries, and get personalised alerts.
        </p>
      </div>
      <div className="border-line bg-surface rounded-2xl border p-6 shadow-sm sm:p-8">
        <RegisterForm />
      </div>
    </div>
  );
}
