import { NextResponse, type NextRequest } from "next/server";
import { getPropertyCardsByIds } from "@/features/property/server/queries";

function withoutBigInts<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => (typeof v === "bigint" ? v.toString() : v)),
  );
}

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const items = await getPropertyCardsByIds(ids);
  return NextResponse.json(withoutBigInts({ items }), {
    headers: { "Cache-Control": "no-store" },
  });
}
