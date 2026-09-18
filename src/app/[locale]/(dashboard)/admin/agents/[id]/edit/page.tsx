import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getAgentForEdit } from "@/features/agent/server/queries";
import { AgentForm } from "@/features/agent/components/agent-form";
import { updateAgent } from "@/features/agent/server/actions";

export const metadata: Metadata = { title: "Edit Agent" };

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();

  const agent = await getAgentForEdit(id);
  if (!agent) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-ink-900 text-2xl font-bold">
          Edit — {agent.name}
        </h1>
        <p className="text-ink-600 mt-1 text-sm">
          Rating and review count update automatically as reviews are approved.
        </p>
      </div>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <AgentForm
          defaultValues={{
            title: agent.title,
            bio: agent.bio,
            photo: agent.photo,
            phone: agent.phone,
            whatsapp: agent.whatsapp,
            email: agent.email,
            specialisations: agent.specialisations,
            languages: agent.languages.join(", "),
            yearsExperience: agent.yearsExperience,
            areasServed: agent.areasServed.join(", "),
            isFeatured: agent.isFeatured,
          }}
          onSubmit={updateAgent.bind(null, id)}
        />
      </div>
    </div>
  );
}
