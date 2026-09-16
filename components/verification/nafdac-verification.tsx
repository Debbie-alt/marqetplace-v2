"use client";

import { useState } from "react";

import { useNafdacVerification } from "@/hooks/use-nafdac-verification";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[.8fr_1.2fr] gap-4 border-b border-neutral-700 py-3 text-xs last:border-0">
      <span className="font-bold uppercase tracking-wide text-neutral-500">{label}</span>
      <span className="text-right font-semibold">{value || "Not provided"}</span>
    </div>
  );
}

export function NafdacVerification({
  initialNumber = "",
}: {
  initialNumber?: string;
}) {
  const [number, setNumber] = useState(initialNumber ?? "");
  const verification = useNafdacVerification();
  const record = verification.data;

  const verify = () => verification.mutate(number.trim());

  const active =
    verification.data?.found &&
    (verification.data.isValid === undefined || verification.data.isValid);

  return (
    <section className="mt-10 rounded-xl bg-neutral-900 text-white">
      <div className="border-b border-neutral-700 p-5">
        <h2 className="text-xs font-black uppercase tracking-wide">Verify NAFDAC registration</h2>
        <p className="mt-2 text-xs text-neutral-400">
          Check the product registration details from the official Greenbook registry.
        </p>
      </div>

      <div className="p-5">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            verify();
          }}
        >
          <input
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            className="min-w-0 flex-1 bg-neutral-950 p-4 text-sm outline-none"
            placeholder="Enter NAFDAC number"
            aria-label="NAFDAC registration number"
          />
          <button
            type="submit"
            disabled={verification.isPending || !number.trim()}
            className="rounded-full bg-sky-200 px-5 py-3 text-xs font-black text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verification.isPending ? "CHECKING..." : "VERIFY"}
          </button>
        </form>

        {verification.isError && (
          <p className="mt-4 border border-red-900 bg-red-950/40 p-3 text-sm text-red-200" role="alert">
            {verification.error.message}
          </p>
        )}

        {record && (
          <div className="mt-5">
            <p className={`mb-3 text-sm font-bold ${active ? "text-emerald-400" : "text-amber-300"}`}>
              {active
                ? "Registration found and valid"
                : record.found
                  ? "Registration found but flagged"
                  : "No matching registration found"}
            </p>
            <Detail label="NAFDAC Number" value={record.nafdacNumber} />
            <Detail label="Product Name" value={record.productName ?? ""} />
            <Detail label="Manufacturer" value={record.manufacturer ?? ""} />
            {record.expiryDate && (
              <Detail label="Expiry Date" value={String(record.expiryDate).slice(0, 10)} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}