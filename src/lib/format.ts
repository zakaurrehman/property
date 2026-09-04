const DAY_MS = 24 * 60 * 60 * 1000;

/** "Today", "Yesterday", "6 days ago", "3 weeks ago", or a plain date past ~2 months. */
export function formatRelativeDate(date: Date | string, now: Date = new Date()): string {
  const target = typeof date === "string" ? new Date(date) : date;
  const diffDays = Math.floor(
    (startOfDay(now).getTime() - startOfDay(target).getTime()) / DAY_MS,
  );

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  if (diffDays < 60) return "1 month ago";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(target);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
