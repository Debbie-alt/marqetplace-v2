"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Construction, LayoutDashboard, Loader2, LogOut, PackagePlus } from "lucide-react";
import { Brand } from "@/components/ui";
import { useAuth } from "@/lib/auth/use-auth";

export function SellerDashboard() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login?next=/seller/dashboard");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f5fa]" aria-label="Loading dashboard"><Loader2 className="size-5 animate-spin text-violet-400" /></main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f5fa] text-neutral-900">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/storefront" aria-label="Marqetplace storefront"><Brand /></Link>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm text-neutral-500 sm:block">{user?.fullName || user?.email}</span>
            <button type="button" onClick={() => { logout(); router.replace("/"); }} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3.5 py-2 text-xs font-medium text-neutral-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-neutral-900">
              <LogOut className="size-3.5" /> Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-9">
        <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-3 lg:sticky lg:top-24">
          <p className="px-3 pb-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Seller workspace</p>
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-violet-50 px-3 py-3 text-sm font-semibold text-neutral-900">
            <LayoutDashboard className="size-4 text-violet-500" /> Dashboard
            <span className="ml-auto rounded-full bg-white px-2 py-1 text-[9px] font-medium text-neutral-400">Preview</span>
          </div>
          <Link href="/seller/listings/new" className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-neutral-600 transition hover:bg-violet-50 hover:text-neutral-900">
            <PackagePlus className="size-4 text-violet-400 transition group-hover:text-violet-500" />
            Upload a product
            <ArrowUpRight className="ml-auto size-3.5 text-neutral-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <div className="mx-3 my-3 border-t border-neutral-100" />
          <p className="px-3 pb-2 text-xs leading-5 text-neutral-400">Product upload is available. More dashboard tools are on the way.</p>
        </aside>

        <section className="flex min-h-[520px] items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center shadow-[0_12px_40px_rgba(38,29,52,.04)] sm:px-10">
          <div className="max-w-lg">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-50 text-violet-400">
              <Construction className="size-7" strokeWidth={1.6} />
            </div>
            <p className="mt-6 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-500">Under construction</p>
            <h1 className="font-museo mt-4 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Your dashboard is taking shape</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-500">We’re building the seller dashboard in stages. You can still upload a product from the sidebar and manage the publishing flow.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
