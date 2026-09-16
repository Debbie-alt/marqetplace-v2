"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Loader2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Brand, FieldLabel, PrimaryButton } from "@/components/ui";
/* eslint-disable @next/next/no-img-element */
import {
  createProduct,
  getProduct3dStatus,
  uploadProductImages,
  PRODUCT_VIEWS,
  type ProductView,
} from "@/lib/api/products";
import { createVendor, getVendorMe } from "@/lib/api/vendors";
import { getCategories } from "@/lib/api/categories";
import { verifyNafdacNumber } from "@/lib/api/verification";
import { getSessionUser } from "@/lib/auth/token";
import type { ListingDraft } from "@/lib/api/seller";
import type { LengthUnit } from "@/lib/domain/product";

const VIEW_LABELS: Record<ProductView, string> = {
  FRONT: "FRONT",
  BACK: "BACK",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  TOP: "TOP",
  BOTTOM: "BOTTOM",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function Topbar() {
  return (
    <header className="border-b bg-white px-6 py-3">
      <div className="mx-auto flex max-w-5xl items-center gap-4">
        <Brand />

        <span className="text-[10px] text-neutral-500">
          Seller Dashboard → New Listing
        </span>

        <div className="ml-auto flex gap-3 text-[10px]">
          <Link href="/seller/orders" className="rounded-full border px-3 py-1">
            Orders
          </Link>
          <Link href="/" className="rounded-full border px-3 py-1">
            ← Exit
          </Link>
        </div>
      </div>
    </header>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-8 flex gap-8 text-xs">
      {["Product Info", "Verification", "Review & Publish"].map((name, i) => {
        const n = i + 1;

        return (
          <div
            key={name}
            className={`flex items-center gap-2 ${
              n === step
                ? "text-sky-600"
                : n < step
                  ? "text-neutral-800"
                  : "text-neutral-400"
            }`}
          >
            <span
              className={`grid size-9 place-items-center rounded-full border ${
                n < step
                  ? "border-sky-200 bg-sky-200 text-white"
                  : n === step
                    ? "border-sky-300"
                    : "border-neutral-300"
              }`}
            >
              {n < step ? <Check className="size-4" /> : n}
            </span>

            <b>{name}</b>
          </div>
        );
      })}
    </div>
  );
}

function Summary({
  title,
  rows,
  onEdit,
}: {
  title: string;
  rows: [string, string][];
  onEdit: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border">
      <div className="flex justify-between bg-neutral-100 px-5 py-3">
        <b className="text-sm">{title}</b>

        <button
          type="button"
          onClick={onEdit}
          className="text-sm text-emerald-700"
        >
          Edit →
        </button>
      </div>

      <div className="p-4">
        {rows.map(([key, value]) => (
          <div
            key={key}
            className="flex justify-between gap-6 py-1 text-sm"
          >
            <span className="text-neutral-500">{key}</span>

            <span className="max-w-md text-right">{value || "—"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NewListing() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [draft, setDraft] = useState<ListingDraft>({
    images: {},
  });

  const [confirmations, setConfirmations] = useState([false, false, false]);

  const [generationStatus, setGenerationStatus] = useState<
    "idle" | "uploading" | "success" | "failed"
  >("idle");

  const [generationProgress, setGenerationProgress] = useState(0);

  const [error, setError] = useState<string | null>(null);

  // NAFDAC pre-check state (step 2)
  const [checkingNafdac, setCheckingNafdac] = useState(false);
  const [nafdacResult, setNafdacResult] = useState<string | null>(null);
  const [nafdacError, setNafdacError] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categories = categoriesQuery.data ?? [];
  const selectedCategory = categories.find(
    (item) => item._id === draft.categoryId,
  );
  const requiresNafdac = Boolean(selectedCategory?.requiresNafdac);

  useEffect(() => {
    if (!getSessionUser()) {
      router.replace("/login?next=/seller/listings/new");
    }
  }, [router]);

  const update = <K extends keyof ListingDraft>(
    key: K,
    value: ListingDraft[K],
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const setViewImage = (view: ProductView, file: File | null) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`${VIEW_LABELS[view]}: images must be JPEG, PNG or WebP.`);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`${VIEW_LABELS[view]}: image exceeds the 5MB limit.`);
      return;
    }

    setError(null);
    setDraft((current) => ({
      ...current,
      images: {
        ...current.images,
        [view]: file,
      },
    }));
  };

  const removeViewImage = (view: ProductView) => {
    setDraft((current) => {
      const next = { ...current.images };
      delete next[view];
      return { ...current, images: next };
    });
  };

  const completedViews = PRODUCT_VIEWS.filter((view) => draft.images[view]);

  const pollGeneration = async (productId: string) => {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const status = await getProduct3dStatus(productId);

      setGenerationProgress(
        status.model3dStatus === "COMPLETE" ? 100 : attempt < 5 ? 25 : 60,
      );

      if (status.model3dStatus === "COMPLETE") {
        setGenerationProgress(100);
        setGenerationStatus("success");
        window.setTimeout(() => router.push(`/products/${productId}`), 1500);
        return;
      }

      if (status.model3dStatus === "FAILED") {
        throw new Error("3D model generation failed.");
      }

      await new Promise((resolve) => window.setTimeout(resolve, 4000));
    }

    throw new Error("Model generation is taking longer than expected.");
  };

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!draft.categoryId || !draft.name || hasInvalidBasics()) {
        throw new Error("Please complete all required product details.");
      }

      const views = PRODUCT_VIEWS.filter((view) => draft.images[view]);
      if (views.length !== PRODUCT_VIEWS.length) {
        throw new Error("Please upload all 6 product views.");
      }

      // 1. Ensure the seller has a store profile (one per account).
      let vendor = await getVendorMe();
      if (!vendor) {
        const user = getSessionUser();
        vendor = await createVendor({
          storeName: user?.fullName?.trim() || "My Store",
          description: "",
        });
      }

      // 2. Create the draft product (JSON).
      const product = await createProduct({
        categoryId: draft.categoryId,
        productName: draft.name.trim(),
        description: draft.description?.trim() || "",
        price: Number(draft.price ?? 0),
        widthValue: Number(draft.width ?? 0),
        heightValue: Number(draft.height ?? 0),
        sizeUnit: (draft.sizeUnit ?? "CM") as LengthUnit,
        nafdacNumber: requiresNafdac ? draft.nafdacNumber?.trim() : undefined,
      });

      const productId = product._id;
      if (!productId) {
        throw new Error("The server did not return a product ID.");
      }

      // 3. Attach the six view images — this queues the Tripo 3D job.
      await uploadProductImages(productId, draft.images as Record<ProductView, File>);

      // 4. Poll 3D status until the scaled model is ready.
      await pollGeneration(productId);
    },

    onMutate: () => {
      setError(null);
      setGenerationStatus("uploading");
      setGenerationProgress(0);
    },

    onSuccess: () => {
      setGenerationStatus("success");
    },

    onError: (error: Error) => {
      setGenerationStatus("failed");
      setError(error.message);
    },
  });

  const handlePublish = () => {
    setError(null);

    if (!draft.name?.trim()) {
      setError("Please enter a product name.");
      setStep(1);
      return;
    }

    if (completedViews.length !== PRODUCT_VIEWS.length) {
      setError("Please upload all 6 product views.");
      setStep(1);
      return;
    }

    if (requiresNafdac && !draft.nafdacNumber?.trim()) {
      setError("This category requires a NAFDAC registration number.");
      setStep(2);
      return;
    }

    if (!confirmations.every(Boolean)) {
      setError(
        "Please confirm all seller declarations before publishing.",
      );
      return;
    }

    publishMutation.mutate();
  };

  function hasInvalidBasics(): boolean {
    return (
      !draft.categoryId ||
      !(draft.name ?? "").trim() ||
      !(draft.description ?? "").trim() ||
      !(Number(draft.price) >= 0) ||
      !(Number(draft.width) > 0) ||
      !(Number(draft.height) > 0)
    );
  }

  const isPublishing =
    publishMutation.isPending || generationStatus === "uploading";

  const goNextFromBasics = () => {
    setError(null);

    if (!draft.categoryId) {
      setError("Please select a product category.");
      return;
    }
    if (!draft.name?.trim()) {
      setError("Please enter a product name.");
      return;
    }
    if (!(draft.description ?? "").trim()) {
      setError("Please enter a product description.");
      return;
    }
    if (!(Number(draft.width) > 0) || !(Number(draft.height) > 0)) {
      setError("Please enter the real-world width and height of the product.");
      return;
    }
    if (completedViews.length !== PRODUCT_VIEWS.length) {
      setError("Please upload all 6 product views before continuing.");
      return;
    }

    setStep(2);
  };

  const runNafdacCheck = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const number = draft.nafdacNumber?.trim() ?? "";
    if (!number) {
      setNafdacError("Enter a NAFDAC registration number.");
      return;
    }

    setCheckingNafdac(true);
    setNafdacError(null);
    setNafdacResult(null);

    try {
      const result = await verifyNafdacNumber(number);
      setNafdacResult(
        result.found &&
          (result.isValid === undefined || result.isValid) &&
          (result.productName || result.manufacturer)
          ? `${result.productName ?? "Product"} — registration found & valid.`
          : "No matching registration found for this number.",
      );
    } catch (checkError) {
      setNafdacError(
        checkError instanceof Error
          ? checkError.message
          : "Unable to verify this NAFDAC number.",
      );
    } finally {
      setCheckingNafdac(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-100">
      <Topbar />

      <section className="mx-auto my-6 max-w-5xl rounded-xl border bg-white p-6 shadow-sm sm:p-10">
        <Stepper step={step} />

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === 1 && (
          <>
            <h1 className="text-3xl font-black leading-none">
              TELL US ABOUT
              <br />
              YOUR PRODUCT.
            </h1>

            <p className="mt-4 max-w-xl text-sm text-neutral-500">
              Start with the basics. Fill in your product details accurately —
              buyers rely on this information to make purchase decisions.
            </p>

            <div className="mt-8">
              <FieldLabel>Product Category</FieldLabel>

              {categoriesQuery.isLoading && (
                <p className="text-sm text-neutral-400">Loading categories…</p>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {categories.map((category, index) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() =>
                      update("categoryId", category._id)
                    }
                    className={`rounded-xl border p-4 text-left text-xs font-bold ${
                      draft.categoryId === category._id
                        ? "border-sky-300 bg-sky-50"
                        : ""
                    }`}
                  >
                    <span className="mb-2 block text-xl">
                      {["💊", "🍎", "🧴", "📱", "👗", "🏠"][index % 6]}
                    </span>

                    {category.name}

                    {category.requiresNafdac && (
                      <span className="mt-1 block text-[9px] font-semibold text-emerald-600">
                        Requires NAFDAC number
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <FieldLabel>Product Name</FieldLabel>

              <input
                value={draft.name ?? ""}
                onChange={(event) => update("name", event.target.value)}
                className="w-full rounded-xl border p-3 text-sm"
                placeholder="e.g. Vitamin C Complex 1000mg"
              />
            </div>

            <div className="mt-5">
              <FieldLabel>Product Description</FieldLabel>

              <textarea
                value={draft.description ?? ""}
                onChange={(event) => update("description", event.target.value)}
                className="h-32 w-full rounded-xl border p-3 text-sm"
                placeholder="Describe what you are selling (at least 10 characters)."
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <div>
                <FieldLabel>Price (₦)</FieldLabel>

                <input
                  type="number"
                  min={0}
                  value={draft.price ?? ""}
                  onChange={(event) =>
                    update("price", Number(event.target.value))
                  }
                  className="w-full rounded-xl border p-3 text-sm"
                  placeholder="0.00"
                />
              </div>

              <div>
                <FieldLabel>Real Width / Height</FieldLabel>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={draft.width ?? ""}
                    onChange={(event) =>
                      update("width", Number(event.target.value))
                    }
                    className="w-full rounded-xl border p-3 text-sm"
                    placeholder="Width"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={draft.height ?? ""}
                    onChange={(event) =>
                      update("height", Number(event.target.value))
                    }
                    className="w-full rounded-xl border p-3 text-sm"
                    placeholder="Height"
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Unit</FieldLabel>

                <select
                  value={draft.sizeUnit ?? "CM"}
                  onChange={(event) =>
                    update("sizeUnit", event.target.value as LengthUnit)
                  }
                  className="w-full rounded-xl border p-3 text-sm"
                >
                  <option value="CM">Centimetres (cm)</option>
                  <option value="INCH">Inches</option>
                  <option value="FEET">Feet</option>
                </select>
              </div>
            </div>

            <p className="mt-2 text-[10px] text-neutral-500">
              Dimensions are used to scale the generated 3D model to real-world
              size.
            </p>

            <div className="mt-5">
              <FieldLabel>Product Views (6 required)</FieldLabel>

              <p className="mb-4 text-[10px] text-neutral-500">
                Upload six real photos of the product — one per angle. JPEG,
                PNG or WebP, max 5MB each.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {PRODUCT_VIEWS.map((view) => {
                  const file = draft.images[view as ProductView];

                  return (
                    <div
                      key={view}
                      className="rounded-xl border"
                    >
                      <label
                        className={`relative block aspect-square cursor-pointer overflow-hidden ${
                          file ? "" : "border border-dashed"
                        }`}
                      >
                        {file ? (
                          <>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`${VIEW_LABELS[view]} view`}
                              className="size-full object-cover"
                            />

                            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-2 py-1 text-[9px] font-bold text-white">
                              {VIEW_LABELS[view]}
                            </span>
                          </>
                        ) : (
                          <span className="flex size-full flex-col items-center justify-center gap-1 text-[9px] text-neutral-400">
                            <ImagePlus className="size-5 text-emerald-600" />
                            {VIEW_LABELS[view]}
                          </span>
                        )}

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(event) => {
                            const value = event.target.files?.[0] ?? null;
                            setViewImage(view as ProductView, value);
                            event.target.value = "";
                          }}
                        />
                      </label>

                      {file && (
                        <button
                          type="button"
                          onClick={() => removeViewImage(view as ProductView)}
                          className="flex w-full items-center justify-center gap-1 border-t p-1.5 text-[9px] text-red-600 hover:bg-red-50"
                        >
                          <X className="size-3" /> Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-2 text-[10px] text-neutral-500">
                {completedViews.length}/6 views uploaded
                {completedViews.length < 6
                  ? " — all six are required."
                  : " — ready."}
              </p>
            </div>

            <PrimaryButton
              className="mt-8"
              onClick={goNextFromBasics}
            >
              Next: Verification →
            </PrimaryButton>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-black">VERIFICATION.</h1>

            <p className="mt-4 text-sm text-neutral-500">
              Regulated categories are checked against the official NAFDAC
              registry before listing.
            </p>

            {requiresNafdac ? (
              <div className="mt-8 rounded-xl border p-5">
                <FieldLabel>
                  NAFDAC registration number
                </FieldLabel>

                <form
                  className="flex flex-col gap-2 sm:flex-row"
                  onSubmit={runNafdacCheck}
                >
                  <input
                    value={draft.nafdacNumber ?? ""}
                    onChange={(event) =>
                      update("nafdacNumber", event.target.value)
                    }
                    className="min-w-0 flex-1 rounded border p-3 text-sm"
                    placeholder="e.g. A1-12345"
                  />

                  <button
                    type="submit"
                    disabled={checkingNafdac}
                    className="rounded bg-neutral-900 px-5 py-3 text-xs font-black text-white disabled:opacity-50"
                  >
                    {checkingNafdac ? "CHECKING…" : "VERIFY NUMBER"}
                  </button>
                </form>

                {nafdacResult && (
                  <p className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    ✓ {nafdacResult}
                  </p>
                )}

                {nafdacError && (
                  <p className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {nafdacError}
                  </p>
                )}

                <p className="mt-2 text-[10px] text-neutral-500">
                  The number you enter is validated when the listing is
                  published. Pre-checking is optional.
                </p>
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
                ✓ No regulatory verification required for this category.
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border px-5 py-3"
              >
                ← Back
              </button>

              <PrimaryButton
                onClick={() => {
                  setError(null);
                  if (
                    requiresNafdac &&
                    !(draft.nafdacNumber ?? "").trim()
                  ) {
                    setError(
                      "This category requires a NAFDAC registration number.",
                    );
                    return;
                  }
                  setStep(3);
                }}
              >
                Continue to Review →
              </PrimaryButton>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-3xl font-black leading-none">
              REVIEW &
              <br />
              PUBLISH.
            </h1>

            <p className="mt-4 max-w-xl text-sm text-neutral-500">
              Check everything before your listing goes live. Once published,
              buyers can see, verify, and purchase your product.
            </p>

            <div className="mt-8 space-y-4">
              <Summary
                title="Product Information"
                onEdit={() => setStep(1)}
                rows={[
                  ["Category", selectedCategory?.name ?? "—"],
                  ["Product Name", draft.name ?? ""],
                  ["Price", draft.price ? `₦${draft.price}` : ""],
                  ["Dimensions", `${draft.width ?? ""} × ${draft.height ?? ""} ${draft.sizeUnit ?? "CM"}`],
                  ["Description", draft.description ?? ""],
                  [
                    "Images",
                    completedViews.length === PRODUCT_VIEWS.length
                      ? `${completedViews.length}/6 views uploaded`
                      : `${completedViews.length}/6 views uploaded`,
                  ],
                ]}
              />

              <Summary
                title="Verification"
                onEdit={() => setStep(2)}
                rows={[
                  [
                    "Method",
                    requiresNafdac ? "NAFDAC registration" : "None required",
                  ],
                  [
                    "NAFDAC Number",
                    requiresNafdac ? (draft.nafdacNumber ?? "") || "Not set" : "—",
                  ],
                  ["Status", requiresNafdac ? "Pending publish validation" : "Not applicable"],
                ]}
              />

              {[
                "I confirm that all product information is accurate and the product is genuine. I understand that listing fake or misrepresented products results in permanent account suspension.",
                "I agree to Marqetplace's Seller Terms of Service and Anti-Counterfeit Policy.",
                "I confirm that the uploaded images are real photos of my actual product — not stock images, AI-generated, or belonging to another seller.",
              ].map((text, index) => (
                <label
                  key={text}
                  className="flex gap-3 rounded-xl border p-5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={confirmations[index]}
                    onChange={() =>
                      setConfirmations((current) =>
                        current.map((value, i) =>
                          i === index ? !value : value,
                        ),
                      )
                    }
                  />

                  {text}
                </label>
              ))}
            </div>

            {isPublishing && (
              <div className="mt-8 rounded-xl border bg-neutral-950 p-6 text-white">
                <div className="flex items-center gap-3">
                  <Loader2 className="size-5 animate-spin" />
                  <div>
                    <p className="text-sm font-bold">
                      {generationProgress < 100
                        ? "Generating 3D model..."
                        : "3D model ready!"}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      This may take several minutes. Progress:{" "}
                      {generationProgress}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {generationStatus === "success" && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6">
                <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-xl">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500 text-white">
                    <Check className="size-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-black">
                    Listing successful
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500">
                    Your product is now being prepared for the storefront.
                  </p>
                </div>
              </div>
            )}

            {!isPublishing &&
              generationStatus === "failed" &&
              error && (
                <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
                  <p className="font-bold text-red-800">⚠ Generation Failed</p>

                  <p className="mt-2 text-sm text-red-700">{error}</p>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setGenerationStatus("idle");
                      setStep(3);
                    }}
                    className="mt-4 rounded-full border border-red-300 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                  >
                    Try Again
                  </button>
                </div>
              )}

            <div className="mt-8 flex justify-between border-t pt-8">
              <button
                type="button"
                disabled={isPublishing}
                onClick={() => setStep(2)}
                className="rounded-full border px-5 py-3 disabled:opacity-50"
              >
                ← Back
              </button>

              <PrimaryButton
                disabled={
                  !confirmations.every(Boolean) ||
                  isPublishing ||
                  generationStatus === "success"
                }
                onClick={handlePublish}
              >
                {isPublishing
                  ? "GENERATING 3D MODEL..."
                  : generationStatus === "success"
                    ? "PUBLISHED"
                    : "PUBLISH LISTING"}
              </PrimaryButton>
            </div>
          </>
        )}
      </section>
    </main>
  );
}