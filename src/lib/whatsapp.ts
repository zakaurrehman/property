/** Normalises a Pakistani phone number to E.164 (+92…). */
export function normalizePakPhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+92")) return digits;
  if (digits.startsWith("0092")) return `+92${digits.slice(4)}`;
  if (digits.startsWith("92")) return `+${digits}`;
  if (digits.startsWith("0")) return `+92${digits.slice(1)}`;
  return `+92${digits}`;
}

export function buildWhatsAppLink(phone: string, message?: string): string {
  const normalized = normalizePakPhone(phone).replace("+", "");
  const url = new URL(`https://wa.me/${normalized}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
}

export function buildTelLink(phone: string): string {
  return `tel:${normalizePakPhone(phone)}`;
}

export function propertyWhatsAppMessage(refCode: string, title: string): string {
  return `Hi, I'm interested in ${title} (Ref: ${refCode}) on Estate Bureau. Is it still available?`;
}
