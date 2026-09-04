export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className="border-line border-t-accent-500 size-8 animate-spin rounded-full border-2"
      />
    </div>
  );
}
