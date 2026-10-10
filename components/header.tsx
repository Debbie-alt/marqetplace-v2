"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingCart, UserRound } from "lucide-react";
import { useMarketplace } from "./marketplace-provider";
import { useAuth } from "@/lib/auth/use-auth";
import { Brand } from "./ui";

const navigation = ["All Products", "Pharmaceuticals", "Cosmetics & Beauty", "Food & Beverages", "Electronics", "Fashion", "Home & Living", "Sports"];

export function Header() {
  const { cartCount } = useMarketplace();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-neutral-900 text-white shadow-sm">
      <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center gap-5 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/storefront" aria-label="Marqetplace home" className="shrink-0 transition-opacity hover:opacity-80">
          <Brand dark />
        </Link>

        <label className="hidden h-11 min-w-0 flex-1 items-center gap-3 rounded-full border border-neutral-500 bg-neutral-800/70 px-4 text-neutral-200 transition focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-300/20 md:flex">
          <Search className="size-[18px] shrink-0" />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400" placeholder="Search products..." aria-label="Search products" />
        </label>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
          <button type="button" className="grid size-9 place-items-center rounded-xl text-rose-300 transition hover:bg-white/10 hover:text-rose-200" aria-label="Wishlist">
            <Heart className="size-[17px]" />
          </button>
          <button type="button" className="relative grid size-9 place-items-center rounded-xl text-white transition hover:bg-white/10" aria-label={`Shopping cart, ${cartCount} items`}>
            <ShoppingCart className="size-[18px]" />
            <i className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-violet-300 px-1 text-[9px] font-bold not-italic leading-4 text-neutral-950">{cartCount}</i>
          </button>
          {isAuthenticated ? (
            <Link href="/seller/dashboard" className="ml-1 hidden rounded-full bg-violet-300 px-4 py-2.5 text-[10px] font-bold text-neutral-950 transition hover:bg-violet-200 active:scale-[.98] sm:inline-flex">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="hidden size-9 place-items-center rounded-xl text-neutral-200 transition hover:bg-white/10 hover:text-white sm:grid" aria-label="Sign in"><UserRound className="size-[17px]" /></Link>
              <Link href="/seller/listings/new" className="ml-1 hidden rounded-full bg-violet-300 px-4 py-2.5 text-[10px] font-bold text-neutral-950 transition hover:bg-violet-200 active:scale-[.98] sm:inline-flex">Sell on Marqetplace</Link>
            </>
          )}
          <button type="button" className="grid size-9 place-items-center rounded-xl transition hover:bg-white/10 md:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <nav aria-label="Product categories" className="hidden border-t border-neutral-700 md:block">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between overflow-x-auto px-4 sm:px-6 lg:px-10">
          {navigation.map((item, index) => (
            <Link key={item} href={index === 0 ? "/storefront" : `/?category=${encodeURIComponent(item)}`} className={`shrink-0 border-r border-neutral-700/80 px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:bg-neutral-800 hover:text-white lg:px-5 ${index === 0 ? "text-violet-300" : "text-neutral-300"}`}>
              {item}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
