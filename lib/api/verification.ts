export interface NafdacVerificationRecord {
  number: string;
  status: "valid" | "invalid" | "pending";
  productName: string;
  manufacturer: string;
  productionDate: string;
  activeIngredients: string;
  expiryDate: string;
}

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const NAFDAC_ENDPOINT =
  process.env.NEXT_PUBLIC_NAFDAC_VERIFICATION_ENDPOINT ??
  `${API_ORIGIN}/api/v1/nafdac/verify`;

export async function verifyNafdacNumber(
  number: string,
): Promise<NafdacVerificationRecord> {
  const normalizedNumber = number.trim().toUpperCase();

  if (!normalizedNumber) {
    throw new Error("Enter a NAFDAC registration number.");
  }

  const response = await fetch(NAFDAC_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number: normalizedNumber }),
  });

  const data: NafdacVerificationRecord & { error?: string; message?: string } =
    await response.json().catch(() => ({} as NafdacVerificationRecord));

  if (!response.ok) {
    throw new Error(
      data.error ?? data.message ?? "Unable to verify this NAFDAC number.",
    );
  }

  return data;
}
