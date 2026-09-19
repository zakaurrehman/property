import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { amenityCatalog } from "../src/lib/amenity-catalog";
import { faqDefaults, sitePageDefaults } from "../src/features/site-page/defaults";

// This script deletes every table before re-filling it with demo data. It
// exists for local development; refuse anything that is not a local
// database unless the operator says so explicitly.
const url = process.env.DATABASE_URL ?? "";
const host = (() => {
  try {
    return new URL(url.replace(/^postgres(ql)?:/, "http:")).hostname;
  } catch {
    return "";
  }
})();
const isLocal = ["localhost", "127.0.0.1", "::1"].includes(host);
if (!isLocal && process.env.ALLOW_REMOTE_SEED !== "1") {
  console.error(
    `Refusing to seed "${host || "unknown host"}": it is not a local database and ` +
      "this script wipes every table first. If you really mean it, run with " +
      "ALLOW_REMOTE_SEED=1.",
  );
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: url });
const db = new PrismaClient({ adapter });

// Deterministic PRNG so re-seeding is reproducible.
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1042);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const round = (value: number, nearest: number) => Math.round(value / nearest) * nearest;

const SQFT_PER_MARLA = 225;
const SQFT_PER_KANAL = SQFT_PER_MARLA * 20;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function image(seed: string, w = 1200, h = 800) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

async function main() {
  console.log("Seeding Estate Bureau…");

  // Clean in FK-safe order so the script is idempotent.
  await db.$transaction([
    db.faq.deleteMany(),
    db.sitePage.deleteMany(),
    db.careerApplication.deleteMany(),
    db.career.deleteMany(),
    db.leadNote.deleteMany(),
    db.lead.deleteMany(),
    db.savedSearch.deleteMany(),
    db.savedProperty.deleteMany(),
    db.review.deleteMany(),
    db.fileRateHistory.deleteMany(),
    db.fileRate.deleteMany(),
    db.media.deleteMany(),
    db.property.deleteMany(),
    db.post.deleteMany(),
    db.project.deleteMany(),
    db.service.deleteMany(),
    db.valuation.deleteMany(),
    db.auditLog.deleteMany(),
    db.amenity.deleteMany(),
    db.agent.deleteMany(),
    db.location.deleteMany(),
    db.user.deleteMany(),
  ]);

  // ── Locations ────────────────────────────────────────────────────────
  const lahore = await db.location.create({
    data: { slug: "lahore", name: "Lahore", type: "CITY", lat: 31.5204, lng: 74.3587 },
  });

  const dha = await db.location.create({
    data: {
      slug: "dha-lahore",
      name: "DHA Lahore",
      nameUr: "ڈی ایچ اے لاہور",
      type: "SOCIETY",
      parentId: lahore.id,
      lat: 31.4697,
      lng: 74.4,
      description:
        "Defence Housing Authority Lahore — the city's largest and most established planned community, spanning Phases 1 through 12 with a mix of residential, commercial and farmhouse plots.",
    },
  });

  interface PhaseSeed {
    slug: string;
    name: string;
    lat: number;
    lng: number;
    pricePerMarla: number;
    tag?: string;
  }

  const phases: PhaseSeed[] = [
    {
      slug: "dha-phase-1",
      name: "DHA Phase 1",
      lat: 31.4787,
      lng: 74.4152,
      pricePerMarla: 4_500_000,
    },
    {
      slug: "dha-phase-2",
      name: "DHA Phase 2",
      lat: 31.4675,
      lng: 74.423,
      pricePerMarla: 4_000_000,
    },
    {
      slug: "dha-phase-3",
      name: "DHA Phase 3",
      lat: 31.4751,
      lng: 74.3855,
      pricePerMarla: 3_800_000,
    },
    {
      slug: "dha-phase-4",
      name: "DHA Phase 4",
      lat: 31.4675,
      lng: 74.3985,
      pricePerMarla: 3_600_000,
    },
    {
      slug: "dha-phase-5",
      name: "DHA Phase 5",
      lat: 31.4611,
      lng: 74.4144,
      pricePerMarla: 3_900_000,
    },
    {
      slug: "dha-phase-6",
      name: "DHA Phase 6",
      lat: 31.4491,
      lng: 74.409,
      pricePerMarla: 4_200_000,
      tag: "Premium",
    },
    {
      slug: "dha-phase-7",
      name: "DHA Phase 7",
      lat: 31.4373,
      lng: 74.4133,
      pricePerMarla: 2_800_000,
      tag: "Best Value",
    },
    {
      slug: "dha-phase-8",
      name: "DHA Phase 8",
      lat: 31.4675,
      lng: 74.3512,
      pricePerMarla: 3_200_000,
    },
    {
      slug: "dha-phase-9-prism",
      name: "DHA Phase 9 Prism",
      lat: 31.4028,
      lng: 74.3405,
      pricePerMarla: 1_800_000,
      tag: "Hot",
    },
    {
      slug: "dha-phase-10",
      name: "DHA Phase 10",
      lat: 31.385,
      lng: 74.32,
      pricePerMarla: 1_500_000,
    },
    {
      slug: "dha-phase-11-rahbar",
      name: "DHA Phase 11 Rahbar",
      lat: 31.37,
      lng: 74.3,
      pricePerMarla: 1_100_000,
    },
    {
      slug: "dha-phase-12",
      name: "DHA Phase 12",
      lat: 31.355,
      lng: 74.28,
      pricePerMarla: 1_000_000,
    },
  ];

  const phaseLocations = new Map<
    string,
    Awaited<ReturnType<typeof db.location.create>> & { pricePerMarla: number }
  >();
  for (const phase of phases) {
    const loc = await db.location.create({
      data: {
        slug: phase.slug,
        name: phase.name,
        type: "PHASE",
        parentId: dha.id,
        lat: phase.lat,
        lng: phase.lng,
        avgPricePerMarla: BigInt(phase.pricePerMarla),
        heroImage: image(phase.slug, 1600, 900),
        mapImageUrl: image(`${phase.slug}-map`, 1200, 1200),
        description: `${phase.name} is one of DHA Lahore's ${phase.tag ? phase.tag.toLowerCase() + " " : ""}sectors, offering residential plots, built houses and plot files close to DHA's parks, mosques and commercial markets.`,
        popularityRank: phases.indexOf(phase) + 1,
      },
    });
    phaseLocations.set(phase.slug, { ...loc, pricePerMarla: phase.pricePerMarla });
  }

  interface SocietySeed {
    slug: string;
    name: string;
    lat: number;
    lng: number;
    pricePerMarla: number;
  }

  const societies: SocietySeed[] = [
    {
      slug: "eme-society",
      name: "EME Society",
      lat: 31.4589,
      lng: 74.3379,
      pricePerMarla: 3_000_000,
    },
    { slug: "raya", name: "Raya", lat: 31.35, lng: 74.28, pricePerMarla: 2_200_000 },
    {
      slug: "bahria-town",
      name: "Bahria Town Lahore",
      lat: 31.3688,
      lng: 74.1758,
      pricePerMarla: 2_500_000,
    },
    {
      slug: "model-town",
      name: "Model Town",
      lat: 31.4805,
      lng: 74.3229,
      pricePerMarla: 5_500_000,
    },
    {
      slug: "askari-10",
      name: "Askari 10",
      lat: 31.42,
      lng: 74.27,
      pricePerMarla: 2_600_000,
    },
    {
      slug: "paragon-city",
      name: "Paragon City",
      lat: 31.4453,
      lng: 74.2879,
      pricePerMarla: 2_000_000,
    },
    {
      slug: "valencia-town",
      name: "Valencia Town",
      lat: 31.4405,
      lng: 74.247,
      pricePerMarla: 2_300_000,
    },
    {
      slug: "johar-town",
      name: "Johar Town",
      lat: 31.4697,
      lng: 74.2728,
      pricePerMarla: 3_300_000,
    },
    {
      slug: "cavalry-ground",
      name: "Cavalry Ground",
      lat: 31.5277,
      lng: 74.36,
      pricePerMarla: 5_000_000,
    },
  ];

  const societyLocations = new Map<
    string,
    Awaited<ReturnType<typeof db.location.create>> & { pricePerMarla: number }
  >();
  for (const society of societies) {
    const loc = await db.location.create({
      data: {
        slug: society.slug,
        name: society.name,
        type: "SOCIETY",
        parentId: lahore.id,
        lat: society.lat,
        lng: society.lng,
        avgPricePerMarla: BigInt(society.pricePerMarla),
        heroImage: image(society.slug, 1600, 900),
        description: `${society.name} is a well-established planned community in Lahore popular with families and investors.`,
      },
    });
    societyLocations.set(society.slug, { ...loc, pricePerMarla: society.pricePerMarla });
  }

  type SellableLocation = Awaited<ReturnType<typeof db.location.create>> & {
    pricePerMarla: number;
  };

  // ── Amenities ────────────────────────────────────────────────────────
  // Kept in sync with src/lib/amenity-catalog.ts (client-safe display lookup
  // for Property.amenities[] slugs).
  const amenityEntries = Object.entries(amenityCatalog);
  await db.amenity.createMany({
    data: amenityEntries.map(([slug, a], i) => ({
      slug,
      label: a.label,
      icon: a.icon,
      sortOrder: i,
    })),
  });
  const amenitySlugs = amenityEntries.map(([slug]) => slug);

  // ── Agents ───────────────────────────────────────────────────────────
  const agentSeeds = [
    { name: "Bilal Ahmed", spec: ["PLOTS", "INVESTMENT"] as const, years: 12 },
    { name: "Ayesha Khan", spec: ["HOMES", "RENTALS"] as const, years: 8 },
    { name: "Usman Tariq", spec: ["COMMERCIAL", "INVESTMENT"] as const, years: 15 },
    { name: "Sana Malik", spec: ["HOMES", "CONSTRUCTION"] as const, years: 6 },
    { name: "Hamza Raza", spec: ["PLOTS", "RENTALS"] as const, years: 9 },
    { name: "Fatima Sheikh", spec: ["HOMES", "INVESTMENT"] as const, years: 11 },
    { name: "Ali Hassan", spec: ["COMMERCIAL", "PLOTS"] as const, years: 7 },
    { name: "Zara Iqbal", spec: ["RENTALS", "HOMES"] as const, years: 5 },
  ] as const;

  const passwordHash = await bcrypt.hash("password123", 10);

  const agents: Awaited<ReturnType<typeof db.agent.create>>[] = [];
  for (const [i, seed] of agentSeeds.entries()) {
    const email = `${slugify(seed.name)}@estatebureau.pk`;
    const user = await db.user.create({
      data: {
        name: seed.name,
        email,
        phone: `+92300${1000000 + i * 1111}`,
        role: "AGENT",
        passwordHash,
        image: image(`agent-${i}`, 400, 400),
      },
    });
    const agent = await db.agent.create({
      data: {
        userId: user.id,
        slug: slugify(seed.name),
        title: "Senior Property Consultant",
        bio: `${seed.name} has spent ${seed.years} years helping buyers, sellers and investors navigate DHA Lahore — from plot files to turnkey construction.`,
        photo: image(`agent-${i}`, 400, 400),
        phone: `+92300${1000000 + i * 1111}`,
        whatsapp: `+92300${1000000 + i * 1111}`,
        email,
        specialisations: [...seed.spec],
        languages: ["English", "Urdu"],
        yearsExperience: seed.years,
        areasServed: [pick(phases).name, pick(phases).name, pick(societies).name],
        rating: (4 + rand() * 0.9).toFixed(1),
        reviewCount: randInt(8, 60),
        isFeatured: i < 4,
      },
    });
    agents.push(agent);
  }

  // ── Demo accounts ────────────────────────────────────────────────────
  const admin = await db.user.create({
    data: {
      name: "Estate Bureau Admin",
      email: "admin@estatebureau.pk",
      phone: "+923000000001",
      role: "ADMIN",
      passwordHash,
    },
  });
  const demoUser = await db.user.create({
    data: {
      name: "Demo Buyer",
      email: "buyer@estatebureau.pk",
      phone: "+923000000002",
      role: "USER",
      passwordHash,
    },
  });

  // ── Properties ───────────────────────────────────────────────────────
  const saleHouseSizesMarla = [5, 7, 8, 10, 12, 14, 20, 40];
  const plotSizesMarla = [5, 8, 10, 20, 40];
  const rentSizesMarla = [5, 8, 10, 12];

  type PropCreateData = Parameters<typeof db.property.create>[0]["data"];

  let refCounter = 1001;
  const propertyRecords: Awaited<ReturnType<typeof db.property.create>>[] = [];

  async function createProperty(input: {
    location: SellableLocation;
    purpose: "SALE" | "RENT";
    type:
      | "HOUSE"
      | "FLAT"
      | "UPPER_PORTION"
      | "PLOT"
      | "PLOT_FILE"
      | "COMMERCIAL_PLOT"
      | "SHOP"
      | "OFFICE"
      | "FARMHOUSE"
      | "PENTHOUSE";
    sizeMarla: number;
  }) {
    const { location, purpose, type, sizeMarla } = input;
    const areaSqft = Math.round(sizeMarla * SQFT_PER_MARLA);
    const isPlot = type === "PLOT" || type === "PLOT_FILE" || type === "COMMERCIAL_PLOT";
    const category: "RESIDENTIAL" | "COMMERCIAL" =
      type === "SHOP" || type === "OFFICE" || type === "COMMERCIAL_PLOT"
        ? "COMMERCIAL"
        : "RESIDENTIAL";

    const basePrice = location.pricePerMarla * sizeMarla * (isPlot ? 1 : 1.35);
    const variance = 0.85 + rand() * 0.3;
    let price = Math.round((basePrice * variance) / 50_000) * 50_000;

    let rentPeriod: "MONTHLY" | "YEARLY" | undefined;
    if (purpose === "RENT") {
      rentPeriod = "MONTHLY";
      price = round((price * 0.0038) / 1, 5_000);
    }

    const agent = pick(agents);
    const refCode = `EB-${refCounter++}`;
    const sizeLabel = sizeMarla >= 20 ? `${sizeMarla / 20} Kanal` : `${sizeMarla} Marla`;
    const typeLabel = type.replace(/_/g, " ").toLowerCase();
    const title = `${sizeLabel} ${typeLabel[0].toUpperCase()}${typeLabel.slice(1)} for ${purpose === "SALE" ? "Sale" : "Rent"} in ${location.name}`;
    const slug = `${slugify(title)}-${refCode.toLowerCase()}`;

    const bedrooms = isPlot || category === "COMMERCIAL" ? null : randInt(2, 6);
    const bathrooms = bedrooms ? randInt(2, bedrooms + 1) : null;

    const status = pick([
      "ACTIVE",
      "ACTIVE",
      "ACTIVE",
      "ACTIVE",
      "UNDER_OFFER",
      "PENDING",
    ] as const);
    const publishedDaysAgo = randInt(0, 200);

    const data: PropCreateData = {
      refCode,
      slug,
      title,
      description: `A well-located ${sizeLabel.toLowerCase()} ${typeLabel} in ${location.name}, ${dha.name.includes("DHA") ? "DHA Lahore" : "Lahore"}. ${
        isPlot
          ? "Ready for construction with clear title and on-ground possession."
          : "Thoughtfully laid out with quality fittings, good natural light and space for a growing family."
      } Close to parks, mosques and main boulevard markets, with easy access to the rest of the city.`,
      purpose,
      type,
      category,
      status,
      price: BigInt(Math.max(price, 500_000)),
      priceOnRequest: rand() < 0.05,
      rentPeriod,
      areaSqft,
      areaUnitDisplay: sizeMarla >= 20 ? "KANAL" : "MARLA",
      bedrooms: bedrooms ?? undefined,
      bathrooms: bathrooms ?? undefined,
      kitchens: bedrooms ? 1 : undefined,
      floors: bedrooms ? randInt(1, 3) : undefined,
      parking: category === "RESIDENTIAL" ? randInt(1, 3) : randInt(0, 6),
      yearBuilt: isPlot ? undefined : randInt(2008, 2025),
      furnishing: isPlot
        ? undefined
        : pick(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"] as const),
      facing: pick([
        "NORTH",
        "SOUTH",
        "EAST",
        "WEST",
        "NORTH_EAST",
        "SOUTH_WEST",
      ] as const),
      plotNo: `${randInt(1, 900)}`,
      streetNo: `${randInt(1, 40)}`,
      possession: type === "PLOT_FILE" ? pick(["BALLOTED", "FILE"] as const) : "READY",
      fileType:
        type === "PLOT_FILE"
          ? pick(["ALLOCATION", "AFFIDAVIT", "TRANSFER"] as const)
          : undefined,
      locationId: location.id,
      lat: location.lat! + (rand() - 0.5) * 0.01,
      lng: location.lng! + (rand() - 0.5) * 0.01,
      address: `Street ${randInt(1, 40)}, ${location.name}, Lahore`,
      amenities: Array.from({ length: randInt(3, 7) }, () => pick(amenitySlugs)).filter(
        (v, i, arr) => arr.indexOf(v) === i,
      ),
      agentId: agent.id,
      isFeatured: rand() < 0.15,
      isHot: rand() < 0.12,
      isVerified: rand() < 0.7,
      viewCount: randInt(20, 4000),
      saveCount: randInt(0, 120),
      leadCount: randInt(0, 25),
      publishedAt: new Date(Date.now() - publishedDaysAgo * 24 * 60 * 60 * 1000),
      seoTitle: title,
      seoDescription: `${title} — verified listing on Estate Bureau with real file rates and a responsive agent.`,
    };

    const property = await db.property.create({ data });
    propertyRecords.push(property);

    const photoCount = randInt(4, 6);
    await db.media.createMany({
      data: Array.from({ length: photoCount }, (_, i) => ({
        propertyId: property.id,
        url: image(`${refCode}-${i}`),
        width: 1200,
        height: 800,
        alt: `${title} — photo ${i + 1}`,
        kind: "IMAGE" as const,
        sortOrder: i,
        isCover: i === 0,
      })),
    });

    return property;
  }

  // DHA phases: 4 listings each, cycling through a realistic type mix
  const phaseTypeCycle: Array<{
    type: Parameters<typeof createProperty>[0]["type"];
    purpose: "SALE" | "RENT";
  }> = [
    { type: "HOUSE", purpose: "SALE" },
    { type: "PLOT", purpose: "SALE" },
    { type: "PLOT_FILE", purpose: "SALE" },
    { type: "HOUSE", purpose: "RENT" },
  ];

  for (const loc of phaseLocations.values()) {
    for (let i = 0; i < phaseTypeCycle.length; i++) {
      const cycle = phaseTypeCycle[i];
      const sizes =
        cycle.type === "PLOT_FILE"
          ? plotSizesMarla
          : cycle.type === "PLOT"
            ? plotSizesMarla
            : cycle.purpose === "RENT"
              ? rentSizesMarla
              : saleHouseSizesMarla;
      await createProperty({
        location: loc,
        purpose: cycle.purpose,
        type: cycle.type,
        sizeMarla: pick(sizes),
      });
    }
  }

  // A few commercial + special-type listings in select phases
  await createProperty({
    location: phaseLocations.get("dha-phase-8")!,
    purpose: "SALE",
    type: "SHOP",
    sizeMarla: 3,
  });
  await createProperty({
    location: phaseLocations.get("dha-phase-6")!,
    purpose: "RENT",
    type: "OFFICE",
    sizeMarla: 5,
  });
  await createProperty({
    location: phaseLocations.get("dha-phase-7")!,
    purpose: "SALE",
    type: "FARMHOUSE",
    sizeMarla: 80,
  });
  await createProperty({
    location: phaseLocations.get("dha-phase-6")!,
    purpose: "SALE",
    type: "PENTHOUSE",
    sizeMarla: 10,
  });
  await createProperty({
    location: phaseLocations.get("dha-phase-2")!,
    purpose: "RENT",
    type: "UPPER_PORTION",
    sizeMarla: 10,
  });
  await createProperty({
    location: phaseLocations.get("dha-phase-4")!,
    purpose: "RENT",
    type: "FLAT",
    sizeMarla: 6,
  });

  // Other societies: 2-3 listings each
  const societyTypeCycle: Array<{
    type: Parameters<typeof createProperty>[0]["type"];
    purpose: "SALE" | "RENT";
  }> = [
    { type: "HOUSE", purpose: "SALE" },
    { type: "PLOT", purpose: "SALE" },
    { type: "HOUSE", purpose: "RENT" },
  ];
  for (const loc of societyLocations.values()) {
    for (const cycle of societyTypeCycle) {
      const sizes =
        cycle.type === "PLOT"
          ? plotSizesMarla
          : cycle.purpose === "RENT"
            ? rentSizesMarla
            : saleHouseSizesMarla;
      await createProperty({
        location: loc,
        purpose: cycle.purpose,
        type: cycle.type,
        sizeMarla: pick(sizes),
      });
    }
  }

  console.log(`Created ${propertyRecords.length} properties.`);

  // ── File rates ───────────────────────────────────────────────────────
  const fileRateSizeCombos = [
    {
      sizeLabel: "5 Marla",
      areaSqft: 5 * SQFT_PER_MARLA,
      fileType: "ALLOCATION" as const,
    },
    {
      sizeLabel: "10 Marla",
      areaSqft: 10 * SQFT_PER_MARLA,
      fileType: "ALLOCATION" as const,
    },
    { sizeLabel: "1 Kanal", areaSqft: SQFT_PER_KANAL, fileType: "AFFIDAVIT" as const },
  ];

  let fileRateCount = 0;
  for (const phase of phases) {
    const loc = phaseLocations.get(phase.slug)!;
    for (const combo of fileRateSizeCombos) {
      const sizeMarla = combo.areaSqft / SQFT_PER_MARLA;
      const currentDemand =
        Math.round((phase.pricePerMarla * sizeMarla * (0.9 + rand() * 0.2)) / 25_000) *
        25_000;
      const trend = pick(["UP", "DOWN", "FLAT"] as const);

      const fileRate = await db.fileRate.create({
        data: {
          city: "Lahore",
          locationId: loc.id,
          phase: phase.name,
          plotType: "Residential",
          sizeLabel: combo.sizeLabel,
          areaSqft: combo.areaSqft,
          fileType: combo.fileType,
          demandPkr: BigInt(currentDemand),
          callForPrice: false,
          trend,
          contactName: pick(agentSeeds).name,
          contactPhone: `+92300${randInt(1000000, 9999999)}`,
          effectiveDate: new Date(),
        },
      });
      fileRateCount++;

      const monthlyDrift = trend === "UP" ? 0.985 : trend === "DOWN" ? 1.015 : 1;
      let runningValue = currentDemand;
      const history: { fileRateId: string; demandPkr: bigint; effectiveDate: Date }[] =
        [];
      for (let m = 5; m >= 0; m--) {
        const noise = 0.97 + rand() * 0.06;
        const value =
          m === 0
            ? currentDemand
            : Math.round((runningValue * monthlyDrift * noise) / 25_000) * 25_000;
        history.push({
          fileRateId: fileRate.id,
          demandPkr: BigInt(value),
          effectiveDate: new Date(Date.now() - m * 30 * 24 * 60 * 60 * 1000),
        });
        runningValue = value;
      }
      await db.fileRateHistory.createMany({ data: history });
    }
  }

  // A couple of "call for price" commercial file rows for realism
  await db.fileRate.create({
    data: {
      city: "Lahore",
      locationId: phaseLocations.get("dha-phase-8")!.id,
      phase: "DHA Phase 8",
      plotType: "Commercial",
      sizeLabel: "4 Marla",
      areaSqft: 4 * SQFT_PER_MARLA,
      fileType: "INTIMATION",
      callForPrice: true,
      trend: "UP",
      contactName: "Usman Tariq",
      contactPhone: "+923001112222",
      effectiveDate: new Date(),
    },
  });
  fileRateCount++;

  console.log(`Created ${fileRateCount} file rates with 6-month history.`);

  // ── Reviews ──────────────────────────────────────────────────────────
  const reviewNames = [
    "Ahmad R.",
    "Sarah M.",
    "Kamran S.",
    "Nida F.",
    "Omar J.",
    "Hina A.",
    "Faisal K.",
    "Mahnoor Q.",
    "Tariq I.",
    "Rabia N.",
    "Zeeshan A.",
    "Amna W.",
    "Adeel H.",
    "Sadia B.",
    "Naveed L.",
    "Iqra Y.",
    "Shahzad M.",
    "Farah D.",
    "Bilawal T.",
    "Mehak S.",
  ];
  const reviewBodies = [
    "Sold our plot in DHA Phase 5 within three weeks — clear communication throughout.",
    "Very responsive on WhatsApp, showed us exactly what we asked for without wasting time.",
    "Helped us verify a plot file before transfer — saved us from a bad deal.",
    "Professional team, the file rates page alone is more accurate than most dealers in the market.",
    "Found a 10 Marla house within budget in under two weeks.",
    "Great experience renting out our portion — tenant screened properly.",
    "Honest advice on which phase gives better rental yield, no pressure to buy.",
    "The agent met us on-site twice before we committed. Appreciated the patience.",
  ];
  await db.review.createMany({
    data: Array.from({ length: 20 }, (_, i) => ({
      source: rand() < 0.6 ? ("GOOGLE" as const) : ("SITE" as const),
      authorName: reviewNames[i],
      authorImage: image(`review-${i}`, 200, 200),
      rating: pick([4, 4, 5, 5, 5]),
      body: pick(reviewBodies),
      isApproved: true,
      agentId: rand() < 0.6 ? pick(agents).id : null,
      createdAt: new Date(Date.now() - randInt(1, 300) * 24 * 60 * 60 * 1000),
    })),
  });
  console.log("Created 20 reviews.");

  // ── Services ─────────────────────────────────────────────────────────
  const serviceSeeds = [
    {
      slug: "construction",
      name: "Construction",
      summary: "Grey structure, turnkey and renovation projects across DHA Lahore.",
      icon: "HardHat",
    },
    {
      slug: "architecture",
      name: "Architecture",
      summary: "Custom home design, structural drawings and DHA approval support.",
      icon: "PencilRuler",
    },
    {
      slug: "interior-design",
      name: "Interior Design",
      summary: "Full interior fit-outs, from concept to furnishing.",
      icon: "Sofa",
    },
    {
      slug: "investment-consulting",
      name: "Investment Consulting",
      summary: "Phase-by-phase ROI guidance for local and overseas investors.",
      icon: "TrendingUp",
    },
    {
      slug: "property-management",
      name: "Property Management",
      summary: "Tenant sourcing, rent collection and maintenance for landlords.",
      icon: "KeyRound",
    },
    {
      slug: "valuation",
      name: "Valuation",
      summary: "Independent property valuation backed by live file rate data.",
      icon: "Calculator",
    },
  ];
  await db.service.createMany({
    data: serviceSeeds.map((s, i) => ({
      slug: s.slug,
      name: s.name,
      summary: s.summary,
      descriptionMdx: `## ${s.name}\n\n${s.summary} Our team handles the process end-to-end, from the first site visit to handover, with transparent pricing and weekly progress updates.`,
      icon: s.icon,
      gallery: [image(`${s.slug}-1`), image(`${s.slug}-2`)],
      sortOrder: i,
    })),
  });

  // ── Projects ─────────────────────────────────────────────────────────
  const projectSeeds = [
    {
      slug: "eb-heights-phase-6",
      name: "EB Heights, Phase 6",
      status: "Under Construction",
      loc: "DHA Phase 6",
    },
    {
      slug: "the-boulevard-residences",
      name: "The Boulevard Residences",
      status: "Selling",
      loc: "DHA Phase 8",
    },
    {
      slug: "prism-gardens",
      name: "Prism Gardens",
      status: "Balloted",
      loc: "DHA Phase 9 Prism",
    },
    {
      slug: "rahbar-square",
      name: "Rahbar Square",
      status: "Completed",
      loc: "DHA Phase 11 Rahbar",
    },
  ];
  await db.project.createMany({
    data: projectSeeds.map((p) => ({
      slug: p.slug,
      name: p.name,
      description: `${p.name} is a master-planned development in ${p.loc} offering residential plots and built units with dedicated parks, mosque and commercial strip.`,
      locationText: p.loc,
      status: p.status,
      coverImage: image(p.slug, 1600, 900),
      gallery: [image(`${p.slug}-1`), image(`${p.slug}-2`), image(`${p.slug}-3`)],
    })),
  });

  // ── Blog posts ───────────────────────────────────────────────────────
  const postSeeds = [
    {
      slug: "dha-phase-9-prism-buyers-guide",
      title: "DHA Phase 9 Prism: A Buyer's Guide for 2026",
      excerpt:
        "What to check before buying a plot or file in Lahore's fastest-growing DHA sector.",
    },
    {
      slug: "understanding-plot-files-in-dha",
      title: "Understanding Plot Files in DHA Lahore",
      excerpt:
        "Allocation, affidavit, intimation and transfer — what each file type actually means.",
    },
    {
      slug: "dha-phase-6-vs-phase-7",
      title: "DHA Phase 6 vs Phase 7: Where Should You Buy?",
      excerpt: "A side-by-side comparison of price trends, amenities and rental yield.",
    },
    {
      slug: "rental-yields-across-dha-phases",
      title: "Rental Yields Across DHA Phases, Compared",
      excerpt: "Which phases give the best return for buy-to-let investors right now.",
    },
    {
      slug: "construction-cost-guide-lahore-2026",
      title: "Construction Cost Guide: Lahore, 2026",
      excerpt:
        "Grey structure vs turnkey pricing per square foot, and how to budget realistically.",
    },
    {
      slug: "overseas-buyers-guide-to-dha-lahore",
      title: "An Overseas Buyer's Guide to DHA Lahore",
      excerpt:
        "Power of attorney, remote verification and safe payment practices for expats.",
    },
  ];
  for (const post of postSeeds) {
    await db.post.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        contentMdx: `## ${post.title}\n\n${post.excerpt}\n\nThis is a living guide maintained by the Estate Bureau research team, cross-checked against current file rates and recent transactions in DHA Lahore.`,
        coverImage: image(post.slug, 1600, 900),
        tags: ["DHA Lahore", "Buying Guide"],
        authorId: admin.id,
        readingMinutes: randInt(4, 9),
        publishedAt: new Date(Date.now() - randInt(2, 180) * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ── Careers ──────────────────────────────────────────────────────────
  const careerSeeds = [
    {
      slug: "property-consultant",
      title: "Property Consultant",
      department: "Sales",
      location: "DHA Phase 5, Lahore",
    },
    {
      slug: "digital-marketing-executive",
      title: "Digital Marketing Executive",
      department: "Marketing",
      location: "DHA Phase 5, Lahore",
    },
    {
      slug: "site-supervisor",
      title: "Site Supervisor",
      department: "Construction",
      location: "Various DHA sites",
    },
    {
      slug: "front-desk-executive",
      title: "Front Desk Executive",
      department: "Operations",
      location: "DHA Phase 5, Lahore",
    },
  ];
  await db.career.createMany({
    data: careerSeeds.map((c) => ({
      slug: c.slug,
      title: c.title,
      department: c.department,
      location: c.location,
      type: "FULL_TIME" as const,
      description: `We're hiring a ${c.title} to join our ${c.department} team in Lahore. Prior DHA-market experience preferred but not required.`,
      isActive: true,
    })),
  });

  // ── Site pages + FAQs ────────────────────────────────────────────────
  await db.sitePage.createMany({
    data: Object.entries(sitePageDefaults).map(([slug, page]) => ({
      slug,
      title: page.title,
      contentMdx: page.contentMdx,
    })),
  });
  await db.faq.createMany({
    data: faqDefaults.map((f, i) => ({
      question: f.question,
      answer: f.answer,
      category: f.category,
      sortOrder: i,
      isPublished: true,
    })),
  });

  console.log("Seed complete.");
  console.log("Demo accounts (password: password123):");
  console.log(`  Admin: ${admin.email}`);
  console.log(`  Agent: ${agents[0].email}`);
  console.log(`  User:  ${demoUser.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
