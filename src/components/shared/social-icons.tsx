import type { SVGProps } from "react";

/**
 * lucide-react dropped brand/logo icons — these are small hand-rolled
 * outline glyphs kept consistent with the lucide stroke style (24px
 * viewBox, round joins) so they sit naturally next to lucide icons.
 */
function BrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BrandIcon {...props}>
      <path d="M14 9v-2a1 1 0 0 1 1 -1h1v-3h-2a3 3 0 0 0 -3 3v3h-2v3h2v6h3v-6h2l1 -3h-3z" />
    </BrandIcon>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BrandIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </BrandIcon>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BrandIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="8" y1="11" x2="8" y2="16" />
      <line x1="8" y1="8" x2="8" y2="8" />
      <line x1="12" y1="16" x2="12" y2="11" />
      <path d="M12 13a2 2 0 0 1 4 0v3" />
    </BrandIcon>
  );
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BrandIcon {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="4" />
      <path d="M10 9.5v5l4.5 -2.5z" fill="currentColor" stroke="none" />
    </BrandIcon>
  );
}
