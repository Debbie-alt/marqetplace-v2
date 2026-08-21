"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Brand, FieldLabel, PrimaryButton,} from "@/components/ui";
import {
  createProduct,
  getProductGenerationStatus,
} from "@/lib/api/products";
import type { ListingDraft } from "@/lib/api/seller";
import type { ProductCategory } from "@/lib/domain/product";

const categories: {
  label: string;
  icon: string;
  value: ProductCategory;
}[] = [
  {
    label: "Health & Pharma",
    icon: "💊",
    value: "health",
  },
  {
    label: "Skincare & Beauty",
    icon: "🧴",
    value: "other",
  },
  {
    label: "Fashion & Apparel",
    icon: "👗",
    value: "fashion",
  },
  {
    label: "Electronics",
    icon: "📱",
    value: "electronics",
  },
  {
    label: "Food & Consumables",
    icon: "🍎",
    value: "food",
  },
  {
    label: "Other",
    icon: "📦",
    value: "other",
  },
];

function Topbar() {
  return (
    <header className="border-b bg-white px-6 py-3">
      <div className="mx-auto flex max-w-5xl items-center gap-4">
        <Brand />

        <span className="text-[10px] text-neutral-500">
          Seller Dashboard → New Listing
        </span>

        <div className="ml-auto flex gap-3 text-[10px]">
          <button
            type="button"
            className="rounded-full border px-3 py-1"
          >
            Save Draft
          </button>

          <Link href="/">← Exit</Link>
        </div>
      </div>
    </header>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-8 flex gap-8 text-xs">
      {[
        "Product Info",
        "Verification",
        "Review & Publish",
      ].map((name, i) => {
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
              {n < step ? (
                <Check className="size-4" />
              ) : (
                n
              )}
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
            <span className="text-neutral-500">
              {key}
            </span>

            <span className="max-w-md text-right">
              {value || "—"}
            </span>
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
    images: [],
  });

  const [confirmations, setConfirmations] = useState([
    false,
    false,
    false,
  ]);

  const [generationStatus, setGenerationStatus] =
    useState<
      "idle" | "uploading" | "success" | "failed"
    >("idle");

  const [generationProgress, setGenerationProgress] = useState(0);

  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof ListingDraft>(
    key: K,
    value: ListingDraft[K],
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const pollGeneration = async (productId: string) => {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const status = await getProductGenerationStatus(productId);
      setGenerationProgress(status.modelProgress);

      if (status.modelStatus === "ready") {
        setGenerationProgress(100);
        setGenerationStatus("success");
        window.setTimeout(() => router.push(`/products/${productId}`), 1500);
        return;
      }

      if (status.modelStatus === "failed") {
        throw new Error("3D model generation failed.");
      }

      await new Promise((resolve) => window.setTimeout(resolve, 3000));
    }

    throw new Error("Model generation is taking longer than expected.");
  };



  const createProductMutation = useMutation({
    mutationFn: createProduct,

    onMutate: () => {
      setError(null);
      setGenerationStatus("uploading");
    },

    onSuccess: async (result) => {
      try {
        if (!result.productId) {
          throw new Error("The server did not return a product ID.");
        }

        setGenerationProgress(0);
        await pollGeneration(result.productId);
      } catch (pollError) {
        setGenerationStatus("failed");
        setError(
          pollError instanceof Error
            ? pollError.message
            : "Unable to generate the 3D model.",
        );
      }
    },

    onError: (error) => {
      setGenerationStatus("failed");

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create product.",
      );
    },
  });

   const handlePublish = () => {
    setError(null);

    if (!draft.name?.trim()) {
      setError("Please enter a product name.");
      setStep(1);
      return;
    }

    if (!draft.images.length) {
      setError(
        "Please upload at least one product image.",
      );
      setStep(1);
      return;
    }

    if (!confirmations.every(Boolean)) {
      setError(
        "Please confirm all seller declarations before publishing.",
      );
      return;
    }

    createProductMutation.mutate({
      name: draft.name.trim(),
      photos: draft.images,
      category: draft.category ?? "other",
      description: draft.description ?? "",
      price: draft.price ?? 0,
      size: draft.size ?? "",
    });
  };

  const isPublishing = createProductMutation.isPending || generationStatus === "uploading";

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
              Start with the basics. Fill in your product
              details accurately — buyers rely on this
              information to make purchase decisions.
            </p>

            <div className="mt-8">
              <FieldLabel>
                Product Category
              </FieldLabel>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {categories.map((category) => (
                  <button
                    key={category.label}
                    type="button"
                    onClick={() =>
                      update(
                        "category",
                        category.value,
                      )
                    }
                    className={`rounded-xl border p-4 text-xs font-bold ${
                      draft.category ===
                      category.value
                        ? "border-sky-300 bg-sky-50"
                        : ""
                    }`}>
                    <span className="mb-2 block text-xl">{category.icon} </span>

                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <FieldLabel>
                Product Name
              </FieldLabel>

              <input
                value={draft.name ?? ""}
                onChange={(event) =>
                  update(
                    "name",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border p-3 text-sm"
                placeholder="e.g. Vitamin C Complex 1000mg"
              />
            </div>

            <div className="mt-5">
              <FieldLabel>
                Product Description
              </FieldLabel>

              <textarea
                value={draft.description ?? ""}
                onChange={(event) =>
                  update(
                    "description",
                    event.target.value,
                  )
                }
                className="h-32 w-full rounded-xl border p-3 text-sm"
              />
            </div>

            <div className="mt-5 max-w-xs">
              <FieldLabel>Price</FieldLabel>

              <div className="flex rounded-xl border">
                <span className="p-3">₦</span>

                <input
                  type="number"
                  value={draft.price ?? ""}
                  onChange={(event) =>
                    update(
                      "price",
                      Number(event.target.value),
                    )
                  }
                  className="w-full p-3 text-sm outline-none"
                  placeholder="0.00"
                />
              </div>

              <p className="mt-1 text-[10px] text-neutral-500">
                Be specific and honest. Buyers make
                decisions based on this.
              </p>
            </div>

            <div className="mt-5 max-w-xs">
              <FieldLabel>Size</FieldLabel>
              <input
                value={draft.size ?? ""}
                onChange={(event) => update("size", event.target.value)}
                className="w-full rounded-xl border p-3 text-sm"
                placeholder="e.g. 10 x 20 cm"
              />
            </div>

            <div className="mt-5">
              <FieldLabel>
                Product Images
              </FieldLabel>

              {draft.images.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {draft.images.map((image, index) => (
                    <div
                      key={`${image.name}-${index}`}
                      className="relative overflow-hidden rounded-xl border"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="size-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "images",
                            draft.images.filter(
                              (_, i) => i !== index,
                            ),
                          )
                        }
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="grid h-48 cursor-pointer place-items-center rounded-xl border border-dashed text-center">
                <div>
                  <ImagePlus className="mx-auto size-7 text-emerald-600" />

                  <b className="mt-3 block text-sm">
                    Drag & drop product photos here
                  </b>

                  <small className="text-neutral-500">
                    Upload{" "}
                    <b>real photos</b> of your
                    actual product only.
                  </small>

                  {draft.images.length > 0 && (
                    <p className="mt-2 text-xs font-bold text-emerald-600">
                      {draft.images.length} image
                      {draft.images.length !== 1
                        ? "s"
                        : ""}{" "}
                      selected
                    </p>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const newFiles = Array.from(
                      event.target.files ?? [],
                    );

                    // Append new files to existing ones
                    const combined = [
                      ...draft.images,
                      ...newFiles,
                    ].slice(0, 6);

                    update("images", combined);

                    // Reset the input so user can select same file again
                    event.target.value = "";
                  }}
                />
              </label>

              <p className="mt-2 text-[10px] text-neutral-500">
                Max 6 images. Click or drag to add
                more. Click the ✕ to remove.
              </p>
            </div>

            <PrimaryButton
              className="mt-8"
              onClick={() => {
                setError(null);

                if (!draft.name?.trim()) {
                  setError(
                    "Please enter a product name.",
                  );
                  return;
                }

                if (!draft.images.length) {
                  setError(
                    "Please upload at least one product image.",
                  );
                  return;
                }

                setStep(2);
              }}
            >
              Next: Verification →
            </PrimaryButton>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-black">
              VERIFICATION.
            </h1>

            <p className="mt-4 text-sm text-neutral-500">
              Choose how you want to verify your
              listing. This step will be connected
              when the verification service is
              available.
            </p>

            <div className="mt-8 rounded-xl border p-5">
              <FieldLabel>
                Verification method
              </FieldLabel>

              <select className="w-full rounded border p-3">
                <option>Not set</option>
                <option>
                  NAFDAC verification
                </option>
              </select>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border px-5 py-3"
              >
                ← Back
              </button>

              <PrimaryButton
                onClick={() => setStep(3)}
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
              Check everything before your listing
              goes live. Once published, buyers can
              see, verify, and purchase your product.
            </p>

            <div className="mt-8 space-y-4">
              <Summary
                title="Product Information"
                onEdit={() => setStep(1)}
                rows={[
                  [
                    "Product Name",
                    draft.name ?? "",
                  ],
                  [
                    "Price",
                    draft.price
                      ? `₦${draft.price}`
                      : "",
                  ],
                  [
                    "Description",
                    draft.description ?? "",
                  ],
                  [
                    "Images",
                    draft.images.length
                      ? `${draft.images.length} uploaded`
                      : "None uploaded",
                  ],
                ]}
              />

              <Summary
                title="Verification"
                onEdit={() => setStep(2)}
                rows={[
                  ["Method", "Not set"],
                  ["Status", "Pending"],
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
                    checked={
                      confirmations[index]
                    }
                    onChange={() =>
                      setConfirmations(
                        (current) =>
                          current.map(
                            (value, i) =>
                              i === index
                                ? !value
                                : value,
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
                    <p className="text-sm font-bold">Generating 3D model...</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      This may take several minutes. Progress: {generationProgress}%
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
                  <h2 className="mt-4 text-lg font-black">Listing successful</h2>
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
                  <p className="font-bold text-red-800">
                    ⚠ Generation Failed
                  </p>

                  <p className="mt-2 text-sm text-red-700">
                    {error}
                  </p>

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
                className="rounded-full border px-5 py-3 disabled:opacity-50">
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