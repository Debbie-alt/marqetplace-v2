import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { number } = body;

  if (!number) {
    return NextResponse.json(
      { error: "NAFDAC registration number is required" },
      { status: 400 },
    );
  }

  // TODO: Implement actual NAFDAC verification (e.g., call external API)
  return NextResponse.json({
    number,
    status: "pending",
    productName: "Placeholder Product",
    manufacturer: "Placeholder Manufacturer",
    productionDate: new Date().toISOString(),
    activeIngredients: "N/A",
    expiryDate: new Date().toISOString(),
  });
}
