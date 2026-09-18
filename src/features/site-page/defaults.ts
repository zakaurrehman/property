/**
 * Default copy for the fixed-slug SitePage rows (about, privacy, terms) and
 * the starter FAQ set. Imported by prisma/seed.ts and used as a runtime
 * fallback when a SitePage row is missing (e.g. a production DB that was
 * seeded before these existed) — the routes must never 404 or render blank.
 * Plain TS on purpose: no "server-only" so the seed script can import it.
 */

export const SITE_PAGE_SLUGS = ["about", "privacy", "terms"] as const;
export type SitePageSlug = (typeof SITE_PAGE_SLUGS)[number];

export interface SitePageDefault {
  title: string;
  contentMdx: string;
}

export const sitePageDefaults: Record<SitePageSlug, SitePageDefault> = {
  about: {
    title: "About Estate Bureau",
    contentMdx: `## Lahore's DHA specialists

Estate Bureau was founded on a simple idea: buying, selling or renting property in DHA Lahore should not depend on who you happen to know. We publish verified listings, real file rates and honest area guides so that a first-time buyer in Phase 9 and an overseas investor comparing Phase 6 with Phase 7 get the same clear picture.

## What we do

- **Buy & sell** — houses, plots, plot files and commercial property across every DHA phase and Lahore's leading societies.
- **Rent** — houses, portions, flats, shops and offices, with tenant sourcing and rent collection for landlords.
- **Build** — grey structure to turnkey construction, architecture and interior design, all handled by one team.
- **Advise** — phase-by-phase investment guidance backed by our own file-rate tracking.

## How we work

Every listing is checked by a consultant before it goes live. Every file rate on the site is tracked over time, not typed in once and forgotten. And every enquiry reaches a named person on WhatsApp — not a call centre.`,
  },
  privacy: {
    title: "Privacy Policy",
    contentMdx: `_Last updated: September 2026_

## What we collect

When you send an enquiry, request a valuation, apply for a job or create an account, we collect the details you give us — typically your name, phone number, email address and message. We also keep standard server logs (IP address, browser, pages visited) to keep the site secure and understand how it is used.

## How we use it

- To respond to your enquiry and connect you with the relevant consultant.
- To send you listings, file-rate updates or alerts you have asked for.
- To operate your account (saved properties, searches, dashboard access).
- To improve the site and prevent abuse.

We do not sell your personal data. We share it only with the consultant handling your request and with the service providers we use to run the site (hosting, email delivery, image storage), who may only use it on our behalf.

## Your choices

You can ask us to correct or delete your data, or to stop contacting you, at any time — email us at the address on the Contact page or message us on WhatsApp. Marketing emails include an unsubscribe link.

## Cookies

We use a small number of cookies for sign-in sessions and to remember preferences such as language and theme. We do not use third-party advertising cookies.

## Contact

Questions about this policy can be sent to the email address listed on our Contact page.`,
  },
  terms: {
    title: "Terms of Use",
    contentMdx: `_Last updated: September 2026_

## Using this site

Estate Bureau provides property listings, market information and related services for DHA Lahore and surrounding areas. By using the site you agree to these terms. You must not use the site to post false listings, scrape data, or interfere with its operation.

## Listings and market data

We verify listings before publishing them and update file rates regularly, but property details, prices and availability can change without notice. Information on this site is provided for general guidance and does not constitute legal, financial or investment advice. Always confirm details, inspect the property and complete your own due diligence — including verification with DHA — before entering into any transaction.

## Accounts

You are responsible for keeping your login details confidential and for all activity under your account. Agents must only list properties they are authorised to market, and we may remove listings or suspend accounts that breach these terms.

## Intellectual property

The site's text, design, photography and data are owned by Estate Bureau or its licensors and may not be reproduced without permission, other than for personal, non-commercial use.

## Liability

To the fullest extent permitted by law, Estate Bureau is not liable for any loss arising from reliance on information on this site or from any transaction between buyers, sellers, landlords, tenants and agents.

## Governing law

These terms are governed by the laws of Pakistan. Any dispute will be subject to the jurisdiction of the courts of Lahore.`,
  },
};

export interface FaqDefault {
  question: string;
  answer: string;
  category: string;
}

export const faqDefaults: FaqDefault[] = [
  {
    category: "Buying",
    question: "What is the difference between a plot and a plot file?",
    answer:
      "A plot is a specific, numbered piece of land with possession available. A plot file is an allocation or affidavit document for a plot that has not yet been balloted or handed over — you own the right to a plot in that phase, but its exact location is decided at balloting. Files are cheaper and more liquid; plots are ready to build on.",
  },
  {
    category: "Buying",
    question:
      "What do the file types — Allocation, Affidavit, Intimation, Transfer — mean?",
    answer:
      "They describe how far along a DHA file is. An **allocation** file is the earliest stage (rights allocated, no plot number yet). An **affidavit** file is one where the original allottee has signed an affidavit transferring their rights. An **intimation** letter means DHA has issued a plot number. A **transfer** file has been formally transferred into the current owner's name at DHA. Later stages carry less paperwork risk and usually a higher price.",
  },
  {
    category: "Buying",
    question: "Are your listings verified?",
    answer:
      "Every listing is checked by a consultant before it goes live, and listings marked **Verified** have had their documents inspected by us. We still recommend your own due diligence with DHA before any payment.",
  },
  {
    category: "File rates",
    question: "How often are file rates updated?",
    answer:
      "Our consultants update rates as the market moves — typically several times a week for active phases. Each rate shows when it was last updated, and the trend arrow compares it with the previous recorded price.",
  },
  {
    category: "File rates",
    question: "What does 'Call for price' mean?",
    answer:
      "The rate is moving too quickly to publish a reliable figure, or the seller has asked us not to advertise it. Message the listed consultant on WhatsApp for a same-day quote.",
  },
  {
    category: "Overseas buyers",
    question: "Can I buy property in DHA Lahore from abroad?",
    answer:
      "Yes. Overseas Pakistanis buy through us regularly. You can appoint a trusted person in Pakistan through a power of attorney attested at your nearest Pakistani consulate, and we handle site visits, document checks and DHA transfer on your behalf with video walkthroughs at each step.",
  },
  {
    category: "Selling & renting",
    question: "How do I list my property with you?",
    answer:
      "Use **List Your Property** at the top of the site to create an agent account, or simply WhatsApp us the details. A consultant will visit, photograph the property and publish the listing — usually within 48 hours.",
  },
  {
    category: "Selling & renting",
    question: "What are your fees?",
    answer:
      "For sales we charge the standard 1% commission from each side on completion. For rentals, the equivalent of half a month's rent from each side. Property management and construction services are quoted per project — see the Services pages.",
  },
];
