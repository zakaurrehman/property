"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/lib/store/ui-store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { createChatLead } from "@/features/lead/server/actions";
import type { ChatLeadInput } from "@/features/lead/schema";
import type { AdvisorAgent } from "../server/queries";

type Intent = ChatLeadInput["intent"];
type Step = "intent" | "size" | "budget" | "contact" | "done";

const intentOptions: { value: Intent; label: string; purpose?: "SALE" | "RENT" }[] = [
  { value: "BUY", label: "Buy a property", purpose: "SALE" },
  { value: "RENT", label: "Rent a property", purpose: "RENT" },
  { value: "PLOT_FILE", label: "Buy a plot file", purpose: "SALE" },
  { value: "CONSTRUCTION", label: "Construction services" },
];

const sizeOptions = ["5 Marla", "10 Marla", "1 Kanal", "2+ Kanal", "Not sure yet"];
const budgetOptions = [
  "Under 50 Lac",
  "50 Lac – 1 Crore",
  "1 – 2 Crore",
  "2 Crore+",
  "Not sure yet",
];

export function AdvisorChatWidget({ agent }: { agent: AdvisorAgent | null }) {
  const mounted = useHasMounted();
  const storeIsOpen = useUiStore((s) => s.isChatOpen);
  const isOpen = mounted && storeIsOpen;
  const closeChat = useUiStore((s) => s.closeChat);
  const toggleChat = useUiStore((s) => s.toggleChat);

  const [step, setStep] = React.useState<Step>("intent");
  const [intent, setIntent] = React.useState<Intent | null>(null);
  const [size, setSize] = React.useState<string | null>(null);
  const [budget, setBudget] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setStep("intent");
    setIntent(null);
    setSize(null);
    setBudget(null);
    setName("");
    setPhone("");
    setError(null);
  }

  function goBack() {
    setError(null);
    if (step === "size") setStep("intent");
    else if (step === "budget") setStep("size");
    else if (step === "contact") setStep("budget");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!intent) return;
    setSubmitting(true);
    setError(null);

    const selectedIntent = intentOptions.find((o) => o.value === intent);
    const result = await createChatLead({
      name,
      phone,
      intent,
      purpose: selectedIntent?.purpose,
      size: size ?? undefined,
      budget: budget ?? undefined,
    } satisfies ChatLeadInput);

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStep("done");
  }

  const whatsappMessage = intent
    ? `Hi, I'm looking to ${intentOptions.find((o) => o.value === intent)?.label.toLowerCase()}${size ? ` (${size})` : ""}${budget ? `, budget ${budget}` : ""}. My name is ${name || "..."}.`
    : "Hi, I'd like to know more about a property on Estate Bureau.";

  return (
    <>
      <button
        type="button"
        onClick={toggleChat}
        aria-label="Open property advisor chat"
        id="advisor-chat"
        className="bg-accent-500 text-brand-900 fixed right-4 bottom-36 z-30 hidden size-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 lg:flex"
      >
        <MessageCircle className="size-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="border-line bg-surface fixed inset-x-4 bottom-20 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border shadow-xl sm:inset-x-auto sm:right-4 sm:bottom-24 sm:w-96"
          >
            <div className="border-line bg-brand-900 flex items-center gap-3 border-b p-4 text-white">
              <Avatar size="lg">
                <AvatarImage src={agent?.photo} alt={agent?.name ?? "Property Advisor"} />
                <AvatarFallback>EB</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{agent?.name ?? "Estate Bureau Advisor"}</p>
                <p className="text-xs text-white/70">Replies within minutes · 9am–9pm</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeChat();
                  reset();
                }}
                aria-label="Close chat"
                className="rounded-full p-1.5 hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {step !== "intent" && step !== "done" && (
                <button
                  type="button"
                  onClick={goBack}
                  className="text-ink-400 hover:text-ink-600 mb-3 flex items-center gap-1 text-xs"
                >
                  <ArrowLeft className="size-3.5" /> Back
                </button>
              )}

              {step === "intent" && (
                <ChatBubble question="Hi! What are you looking to do today?">
                  <ChipGrid>
                    {intentOptions.map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        onClick={() => {
                          setIntent(opt.value);
                          setStep("size");
                        }}
                      />
                    ))}
                  </ChipGrid>
                </ChatBubble>
              )}

              {step === "size" && (
                <ChatBubble question="What size are you interested in?">
                  <ChipGrid>
                    {sizeOptions.map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        onClick={() => {
                          setSize(opt);
                          setStep("budget");
                        }}
                      />
                    ))}
                  </ChipGrid>
                </ChatBubble>
              )}

              {step === "budget" && (
                <ChatBubble question="And roughly what's your budget?">
                  <ChipGrid>
                    {budgetOptions.map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        onClick={() => {
                          setBudget(opt);
                          setStep("contact");
                        }}
                      />
                    ))}
                  </ChipGrid>
                </ChatBubble>
              )}

              {step === "contact" && (
                <ChatBubble question="Great — where should we send matching options?">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={2}
                    />
                    <Input
                      placeholder="+92 300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      minLength={7}
                    />
                    {error && <p className="text-destructive text-xs">{error}</p>}
                    <Button
                      type="submit"
                      disabled={submitting}
                      size="sm"
                      className="mt-1"
                    >
                      {submitting && <Loader2 className="size-4 animate-spin" />}
                      Send
                    </Button>
                  </form>
                </ChatBubble>
              )}

              {step === "done" && (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <CheckCircle2 className="size-8 text-emerald-500" />
                  <p className="text-ink-900 text-sm font-medium">
                    Thanks, {name.split(" ")[0]}! An agent will reach out shortly.
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="w-full gap-1.5 bg-emerald-500 text-white hover:bg-emerald-500/90"
                  >
                    <a
                      href={buildWhatsAppLink(
                        agent?.whatsapp ?? siteConfig.whatsapp,
                        whatsappMessage,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon className="size-4" />
                      Continue on WhatsApp
                    </a>
                  </Button>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-ink-400 hover:text-ink-600 text-xs underline"
                  >
                    Start a new question
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatBubble({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-surface-2 text-ink-900 max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm">
        {question}
      </div>
      {children}
    </div>
  );
}

function ChipGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-line bg-surface text-ink-900 rounded-full border px-3 py-1.5 text-xs font-medium",
        "hover:border-accent-500 hover:bg-accent-500/10 hover:text-accent-600",
      )}
    >
      {label}
    </button>
  );
}
