"use client";

import Link from "next/link";
import { Box, ChevronDown, Heart } from "lucide-react";
import { memo, useState } from "react";

import { Header } from "@/components/header";
import { useMarketplace } from "@/components/marketplace-provider";
import { CartButton, naira } from "@/components/ui";
import { StorefrontHero } from "./storefront-hero";
import { getProductsPage } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { useQuery } from "@tanstack/react-query";
/* eslint-disable @next/next/no-img-element */

type CategoryFilter = { _id: string; name: string };

const Card = memo(function Card({
  id,
  name,
  price,
  image,
}: {
  id: string;
  name: string;
  price: number;
  image: string | null;
}) {
  const { addToCart, wishlist, toggleWishlist } = useMarketplace();
  const [added, setAdded] = useState(false);
  const wish = wishlist.has(id);

  return (
    <article className="group border border-neutral-200 bg-white p-2 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <Link
        href={`/products/${id}`}
        className="relative block aspect-square overflow-hidden bg-neutral-100"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <Box className="size-10 text-neutral-300" />
          </div>
        )}
      </Link>

      <div className="pt-3">
        <Link
          href={`/products/${id}`}
          className="block min-h-9 text-xs font-bold"
        >
          {name}
        </Link>

        <p className="text-[9px] text-neutral-500">by Marqetplace Store</p>

        {price > 0 && <p className="mt-1 text-base font-black">{naira(price)}</p>}

        <div className="mt-2 flex gap-2">
          <CartButton
            className="flex-1 !rounded-full !px-2 !py-2 text-[10px]"
            onClick={() => {
              addToCart(id);
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
            onClick={() => toggleWishlist(id)}
            className={`transition ${wish ? "scale-110 text-red-500" : "text-neutral-400"}`}
          >
            <Heart className="size-4" fill={wish ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </article>
  );
});

const PAGE_SIZE = 8;

export function Storefront() {
  const [category, setCategory] = useState("");
  const [nafdacVerifiable, setNafdacVerifiable] = useState(false);
  const [sort, setSort] = useState("trusted");
  const [page, setPage] = useState(1);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 60_000,
  });

  const productsQuery = useQuery({
    queryKey: ["products-page", category, nafdacVerifiable, page],
    queryFn: () =>
      getProductsPage({
        categoryId: category || undefined,
        nafdacVerified: nafdacVerifiable || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const data = productsQuery.data;
  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;

  const sorted = [...products].sort((a, b) =>
    sort === "new" ? b.id.localeCompare(a.id) : 0,
  );

  const clear = () => {
    setCategory("");
    setNafdacVerifiable(false);
    setPage(1);
  };

  const categories: CategoryFilter[] = (categoriesQuery.data ?? []).map(
    (categoryItem) => ({ _id: categoryItem._id, name: categoryItem.name }),
  );

  const activeCategory = categories.find((item) => item._id === category);

  const chips = [
    activeCategory?.name,
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

          {categories.length === 0 && (
            <p className="text-[10px] text-neutral-500">
              {categoriesQuery.isLoading ? "Loading…" : "No categories yet."}
            </p>
          )}

          {categories.map((categoryItem) => (
            <label
              key={categoryItem._id}
              className="mb-2 flex gap-2 text-[10px]"
            >
              <input
                checked={category === categoryItem._id}
                onChange={() =>
                  setCategory(
                    category === categoryItem._id ? "" : categoryItem._id,
                  )
                }
                type="checkbox"
              />
              {categoryItem.name}
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
              {productsQuery.data?.totalItems ?? 0} RESULTS
            </span>

            <span className="relative">
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-full bg-neutral-900 py-2 pl-3 pr-8 text-white outline-none"
              >
                <option value="trusted">Sort: Most Trusted</option>
                <option value="rating">Highest Rated</option>
                <option value="new">Newest</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-white" />
            </span>
          </div>

          {/* LOADING */}
          {productsQuery.isLoading && (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[.7] animate-pulse bg-neutral-200"
                />
              ))}
            </div>
          )}

          {/* ERROR */}
          {productsQuery.isError && (
            <div className="rounded-xl border bg-white p-10 text-center">
              <p className="text-sm text-neutral-500">
                Unable to load products.
              </p>

              <button
                type="button"
                onClick={() => productsQuery.refetch()}
                className="mt-3 rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold text-white"
              >
                Try again
              </button>
            </div>
          )}

          {/* PRODUCTS */}
          {!productsQuery.isLoading &&
            !productsQuery.isError &&
            sorted.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {sorted.map((product) => (
                    <Card
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      image={product.coverImage}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center gap-1">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setPage(index + 1)}
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
                )}
              </>
            )}

          {/* EMPTY */}
          {!productsQuery.isLoading &&
            !productsQuery.isError &&
            sorted.length === 0 && (
              <div className="rounded-xl border border-dashed bg-white p-10 text-center">
                <Box className="mx-auto size-10 text-neutral-300" />

                <p className="mt-3 font-bold">No products found</p>

                <p className="mt-1 text-sm text-neutral-500">
                  Products uploaded by sellers will appear here once they are
                  verified.
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