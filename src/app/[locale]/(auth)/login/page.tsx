import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Log In",
  description: "Log in to your Estate Bureau account.",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect({ href: "/", locale: await getLocale() });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-ink-900 text-2xl font-bold sm:text-3xl">
          Welcome back
        </h1>
        <p className="text-ink-600 mt-2 text-sm">
          Log in to manage your saved properties and enquiries.
        </p>
      </div>
      <div className="border-line bg-surface rounded-2xl border p-6 shadow-sm sm:p-8">
        <LoginForm />
      </div>
    </div>
  );
}
