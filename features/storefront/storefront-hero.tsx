"use client";

import { useState } from "react";
import { verifyNafdacNumber } from "@/lib/api/verification";

export function StorefrontHero() {
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  async function verify() {
    setChecking(true);
    const result = await verifyNafdacNumber(number);
    setMessage(
      result.status === "valid"
        ? `${result.productName} is Active & Valid.`
        : "No valid NAFDAC record found."
    );
    setChecking(false);
  }

  return (
    <section className="relative overflow-hidden bg-white px-6 py-16 md:px-16">
      <div className="absolute -left-16 -top-10 size-64 rounded-full bg-sky-50" />
      <div className="absolute right-16 top-12 size-40 rounded-full bg-violet-50" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
        <div>
          <p className="font-museo text-sm font-black tracking-[.25em] text-violet-400">
            — MARQETPLACE —
          </p>
          <h1 className="font-museo mt-2 max-w-md text-6xl font-black uppercase leading-[.88] tracking-tight sm:text-7xl">
            <span className="text-sky-200">All</span>{" "}
            <span className="text-violet-400">Verified</span>
            <br />
            <span className="text-sky-200">Products</span>
          </h1>
          <p className="mt-5 text-xl font-medium text-neutral-900">
            No surprises. Only genuine products
          </p>
        </div>

        <div>
          <div className="rounded-xl bg-neutral-900 p-5 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-600 pb-4">
              <b className="text-[11px] uppercase tracking-wide">
                Product verification engine
              </b>
              <span className="rounded border border-emerald-700 px-3 py-1 text-[9px] font-black text-emerald-400">
                ● LIVE CHECK
              </span>
            </div>

            <div className="mt-5 flex">
              <input
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") verify();
                }}
                className="min-w-0 flex-1 rounded-l-lg bg-neutral-800 px-4 py-3 text-sm outline-none"
                placeholder="Enter NAFDAC No. e.g. A1-0243"
              />
              <button
                disabled={checking}
                onClick={verify}
                className="rounded-r-lg bg-violet-300 px-5 text-xs font-black text-neutral-950 transition hover:bg-violet-200 active:scale-95"
              >
                {checking ? "CHECKING…" : "VERIFY →"}
              </button>
            </div>
          </div>

          <p
            aria-live="polite"
            className="mt-5 min-h-6 text-lg text-neutral-700"
          >
            {message ||
              "Not sure if a product is genuine? Use Live Check to instantly verify it through NAFDAC."}
          </p>
        </div>
      </div>
    </section>
  );
}