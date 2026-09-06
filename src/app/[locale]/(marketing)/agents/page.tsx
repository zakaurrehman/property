import type { Metadata } from "next";
import { getAgents } from "@/features/agent/server/queries";
import { AgentCard } from "@/features/agent/components/agent-card";

export const metadata: Metadata = {
  title: "Our Agents",
  description:
    "Meet the Estate Bureau team — verified property consultants across DHA Lahore.",
};

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          Our Agents
        </h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          Verified property consultants who know DHA Lahore, phase by phase.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
