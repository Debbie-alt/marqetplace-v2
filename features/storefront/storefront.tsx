"use client";

import Link from "next/link";
import { Check, ChevronDown, Heart, Box } from "lucide-react";
import { useMemo, useState } from "react";

import { Header } from "@/components/header";
import { useMarketplace } from "@/components/marketplace-provider";
import { CartButton, naira, StarRating } from "@/components/ui";
import { StorefrontHero } from "./storefront-hero";
import { getProducts } from "@/lib/api/products";
import { useQuery } from "@tanstack/react-query";
import type {Product, ProductCategory,} from "@/lib/domain/product";

const labels: Record<ProductCategory, string> = {
  food: "Food & Beverages",
  drug: "Pharmaceuticals",
  health: "Health",
  fashion: "Fashion",
  electronics: "Electronics",
  other: "Home & Living",
};

function Card({ product }: { product: Product }) {
  const {addToCart, wishlist, toggleWishlist,} = useMarketplace();
  const [added, setAdded] = useState(false);
  const wish = wishlist.has(product.id);

  const has3DModel =  Boolean(product.modelUrl);

  const isGenerating =
    product.modelStatus === "generating" ||
    product.modelStatus === "queued";

  return (
    <article className="group border border-neutral-200 bg-white p-2 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-neutral-100"
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <Box className="size-10 text-neutral-300" />
          </div>
        )}

        {product.isNafdacVerifiable && (
          <span className="absolute left-1 top-1 flex items-center gap-1 bg-white px-2 py-1 text-sm font-bold text-emerald-500">
            <Check className="size-2" />
            CHECK AUTHENTICITY
          </span>
        )}

        {has3DModel && (
          <span className="absolute right-1 top-1 rounded-full bg-neutral-900 px-2 py-1 text-sm font-bold text-white">
            3D AVAILABLE
          </span>
        )}

      </Link>

      <div className="pt-3">
        <p className="text-sm font-black uppercase">
          {labels[product.category]}
        </p>

        <Link
          href={`/products/${product.id}`}
          className="block min-h-9 text-xs font-bold"
        >
          {product.name}
        </Link>

        <p className="text-[9px] text-neutral-500">
          by Marqetplace Store
        </p>

        <StarRating />

        {product.price > 0 && (
          <p className="text-base font-black">
            {naira(product.price)}
          </p>
        )}

        {has3DModel && (
          <p className="mt-1 text-[9px] font-bold text-sky-600">
            ✦ 3D MODEL READY
          </p>
        )}

        <div className="mt-2 flex gap-2">
          <CartButton
            className="flex-1 !rounded-full !px-2 !py-2 text-[10px]"
            onClick={() => {
              addToCart(product.id);
              setAdded(true);

              setTimeout(() => {
                setAdded(false);
              }, 700);
            }}
          >
            {added ? "Added!" : "Add to Cart"}
          </CartButton>

          <button
            type="button"
            onClick={() =>
              toggleWishlist(product.id)
            }
            className={`transition ${wish ? "scale-110 text-red-500" : "text-neutral-400"}`}
          >
            <Heart
              className="size-4"
              fill={
                wish ? "currentColor" : "none"
              }
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export function Storefront() {
  const [category, setCategory] =
    useState<ProductCategory | "">("");

  const [nafdacVerifiable, setNafdacVerifiable] =
    useState(false);

  const [sort, setSort] =
    useState("trusted");

  const [page, setPage] =
    useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", category, nafdacVerifiable],
    queryFn: () =>
      getProducts({
        category,
        verified: nafdacVerifiable,
      }),
  });

  const result = useMemo(() => {
    return [...(data ?? [])].sort((a, b) => {
        if (sort === "new") {
          return b.id.localeCompare(a.id);
        }

        return 0;
      });
  }, [
    data,
    sort,
  ]);

  const clear = () => {
    setCategory("");
    setNafdacVerifiable(false);
    setPage(1);
  };

  const chips = [
    category && labels[category],
    nafdacVerifiable && "NAFDAC VERIFIABLE",
  ].filter(Boolean);

  return (
    <>
      <Header />

      <StorefrontHero />

      <main className="min-h-screen bg-neutral-100 md:flex">
        {/* FILTER SIDEBAR */}
        <aside className="w-full shrink-0 bg-neutral-900 p-5 text-white md:w-56">
          <button
            type="button"
            onClick={() => {
              setNafdacVerifiable(!nafdacVerifiable);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-[9px] ${
              nafdacVerifiable
                ? "bg-white text-neutral-900"
                : "border border-neutral-600"
            }`}
          >
            NAFDAC VERIFIABLE
          </button>

          <hr className="my-5 border-neutral-700" />

          <h2 className="mb-3 text-[9px] font-black uppercase text-neutral-500">
            Category
          </h2>

          {(
            Object.keys(labels) as ProductCategory[]
          ).map((categoryValue) => (
            <label
              key={categoryValue}
              className="mb-2 flex gap-2 text-[10px]"
            >
              <input
                checked={
                  category === categoryValue
                }
                onChange={() =>
                  setCategory(
                    category === categoryValue
                      ? ""
                      : categoryValue,
                  )
                }
                type="checkbox"
              />

              {labels[categoryValue]}
            </label>
          ))}

        </aside>

        {/* PRODUCTS */}
        <section className="flex-1 p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2 bg-white p-3 text-[10px]">
            <b>ACTIVE:</b>

            {chips.map((chip) => (
              <button
                type="button"
                key={String(chip)}
                onClick={clear}
                className="rounded-full bg-neutral-900 px-2 py-1 text-white"
              >
                {chip} ×
              </button>
            ))}

            <span className="ml-auto border px-3 py-1">
              {result.length} RESULTS
            </span>

            {/* REAL DROPDOWN */}
            <span className="relative">
              <select
                value={sort}
                onChange={(event) => {
                  setSort(
                    event.target.value,
                  );
                  setPage(1);
                }}
                className="appearance-none rounded-full bg-neutral-900 py-2 pl-3 pr-8 text-white outline-none"
              >
                <option value="trusted">
                  Sort: Most Trusted
                </option>

                <option value="rating">
                  Highest Rated
                </option>

                <option value="new">
                  Newest
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-white" />
            </span>
          </div>

          {/* LOADING */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {Array.from({
                length: 8,
              }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[.7] animate-pulse bg-neutral-200"
                />
              ))}
            </div>
          )}

          {/* ERROR */}
          {isError && (
            <div className="rounded-xl border bg-white p-10 text-center">
              <p className="text-sm text-neutral-500">
                Unable to load products.
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold text-white"
              >
                Try again
              </button>
            </div>
          )}

          {/* PRODUCTS */}
          {!isLoading &&
            !isError &&
            result.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {result
                    .slice(
                      (page - 1) * 8,
                      page * 8,
                    )
                    .map((product) => (
                      <Card
                        key={product.id}
                        product={product}
                      />
                    ))}
                </div>

                <div className="mt-6 flex justify-center gap-1">
                  {Array.from({
                    length: Math.ceil(
                      result.length / 8,
                    ),
                  }).map((_, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() =>
                        setPage(index + 1)
                      }
                      className={`size-7 rounded ${
                        page === index + 1
                          ? "bg-sky-200"
                          : "bg-neutral-900 text-white"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </>
            )}

          {/* EMPTY */}
          {!isLoading &&
            !isError &&
            result.length === 0 && (
              <div className="rounded-xl border border-dashed bg-white p-10 text-center">
                <Box className="mx-auto size-10 text-neutral-300" />

                <p className="mt-3 font-bold">
                  No products found
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Products uploaded by sellers
                  will appear here.
                </p>

                {(category || nafdacVerifiable) && (
                  <button
                    type="button"
                    onClick={clear}
                    className="mt-3 underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
        </section>
      </main>
    </>
  );
}