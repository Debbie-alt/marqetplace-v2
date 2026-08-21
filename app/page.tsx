"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/use-products";

const sectionReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 22 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.08,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

function ProductCard({
  name,
  price,
  image,
  category,
  index,
}: {
  name: string;
  price: number;
  image?: string;
  category?: string;
  index: number;
}) {
  return (
    <motion.div
      className="group flex min-w-0 flex-col overflow-hidden border border-black/10 bg-white"
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={cardReveal}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      {/* Image */}
      <div className="relative flex h-[230px] items-center justify-center overflow-hidden bg-white p-6">
        {/* Verification badge */}
        <div className="absolute left-3 top-3 z-10 rounded-sm border border-emerald-300 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-500">
          ✓ Check authenticity
        </div>

        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50 text-xs text-gray-400">
            No image
          </div>
        )}

        {/* 3D badge */}
        <div className="absolute right-3 top-3 rounded bg-white px-2 py-1 text-[10px] font-bold uppercase shadow-sm">
          View 3D
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="mb-1 mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
          {category || "Product"}
        </div>

        <h3 className="line-clamp-2 min-h-[34px] text-[12px] font-bold leading-4 text-black">
          {name}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-xs text-orange-400">
          ★★★★★
        </div>

        <div className="mt-1 text-sm font-black text-black">
          {formatPrice(price)}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <button
            type="button"
            className="flex-1 rounded-sm bg-[#f59a23] px-2 py-2 text-xs font-bold text-white transition hover:bg-[#df8411]"
          >
            Add to Cart 🛒
          </button>

          <button
            type="button"
            className="text-lg leading-none text-red-500 transition hover:scale-110"
            aria-label="Add to wishlist"
          >
            ♥
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { data: products = [], isLoading, isError } = useProducts();

  const featuredProducts = products.slice(0, 4);

  return (
    <main className="min-h-screen bg-white text-black">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between px-5 md:px-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-[11px] font-semibold text-[#8fa9d3]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#8fa9d3] text-[10px]">
              ◇
            </span>
            marqetplace
          </Link>

          <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-wide text-gray-500 md:flex">
            <Link href="/storefront" className="transition hover:text-black">
              Store
            </Link>
            <Link href="#support" className="transition hover:text-black">
              Support
            </Link>
            <Link href="#tech" className="transition hover:text-black">
              Tech
            </Link>
            <Link href="#about" className="transition hover:text-black">
              About Us
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/seller/listings/new" className="px-4 py-1.5 text-sm  font-medium text-gray-700">
              Sell on marqetplace
            </Link>
           

            <Link href="/login" className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto flex min-h-[510px] max-w-[1400px] flex-col items-center px-6 pt-20 text-center md:pt-24">
          <div className="landing-reveal select-none bg-gradient-to-r from-[#9bc5df] via-[#9297d2] to-[#a68dca] bg-clip-text text-[52px] font-medium leading-none tracking-[0.16em] text-transparent sm:text-[76px] md:text-[96px]">
            marqetplace
          </div>

          <p className="landing-reveal landing-reveal-delay-1 mt-4 text-sm font-medium uppercase tracking-[0.4em] text-black md:text-base">
            Spin it. Verify it. Buy it.
          </p>

          <div className="landing-reveal landing-reveal-delay-2 mt-10 flex gap-8">
            <Link
              href="/storefront"
              className="rounded-full bg-[#f59a23] px-8 py-3 text-xs font-semibold uppercase text-white shadow-sm transition hover:bg-[#df8411]"
            >
              Shop Now
            </Link>

            <Link
              href="#store"
              className="rounded-full border border-black/10 bg-gray-100 px-8 py-3 text-xs font-semibold uppercase text-gray-600 shadow-sm transition hover:bg-gray-200"
            >
              View All
            </Link>
          </div>

          <div className="mt-auto grid w-full grid-cols-1 gap-8 border-b border-black/40 pb-5 pt-20 text-left sm:grid-cols-2">
            <p className="landing-reveal landing-reveal-delay-3 max-w-[310px] text-sm leading-5 text-gray-700">
              Glint combines interactive 3D product viewing and live
              regulatory verification to eliminate counterfeits from
              Nigeria&apos;s e-commerce permanently.
            </p>

            <div className="flex items-end justify-end">
              <p className="text-right text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                Nigeria&apos;s most trusted marketplace — 3D · Verified · Real
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PROBLEM SECTION
      ========================================================= */}
      <motion.section
        className="bg-white px-6 py-10 md:px-12 md:py-14"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionReveal}
      >
        <div className="mx-auto max-w-[1180px] rounded-2xl bg-[#f3f3f3] p-7 md:p-10">
          <h2 className="font-condensed text-3xl font-black uppercase tracking-tight md:text-4xl">
            Nigerian online shopping is broken
          </h2>

          <div className="mt-1 text-xs font-bold uppercase text-red-500">
            The Crisis
          </div>

          <div className="mt-4 grid overflow-hidden rounded-md sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Fake Products",
                text: "Fake drugs, cosmetics and electronics flood the market, posing real health risks and devastating trust across every category.",
              },
              {
                title: "Misleading Listings",
                text: "Sellers use stock photos or stolen images that don't match exactly what ships to the buyer's door.",
              },
              {
                title: "Quality Betrayal",
                text: "Products arrive damaged, undersized or completely different. Buyers have no reliable way to verify quality.",
              },
              {
                title: "Unverified Related Goods",
                text: "Buyers have no reliable way to verify product authenticity.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="min-h-[125px] border-r border-white/50 bg-[#c4b9d8] p-5 last:border-r-0"
              >
                <h3 className="text-xs font-black uppercase">
                  {item.title}
                </h3>

                <p className="mt-3 text-xs leading-5 text-gray-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* =========================================================
          3D SECTION
      ========================================================= */}
      <motion.section
        id="tech"
        className="overflow-hidden bg-[#0d0d0f] px-6 py-14 text-white md:px-14 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionReveal}
      >
        <div className="mx-auto max-w-[1150px]">
          <div className="mb-8 text-sm uppercase tracking-[0.2em] text-gray-500">
            3D Virtual Viewer
          </div>

          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Fake 3D viewer */}
            <div className="landing-float relative mx-auto aspect-square w-full max-w-[500px] rounded-xl border border-white/10 bg-[#151519] p-8 shadow-[0_0_40px_rgba(255,255,255,0.03)]">
              <div className="absolute left-4 top-4 h-4 w-4 border-l border-t border-[#8ba7c5]" />
              <div className="absolute right-4 top-4 h-4 w-4 border-r border-t border-[#8ba7c5]" />
              <div className="absolute bottom-4 left-4 h-4 w-4 border-b border-l border-[#8ba7c5]" />
              <div className="absolute bottom-4 right-4 h-4 w-4 border-b border-r border-[#8ba7c5]" />

              <div className="flex h-full items-center justify-center">
                <div className="relative h-64 w-44">
                  {/* Abstract product / jacket representation */}
                  <div className="absolute left-1/2 top-10 h-40 w-32 -translate-x-1/2 rounded-[35%_35%_15%_15%] bg-gradient-to-br from-gray-300 via-gray-800 to-black shadow-2xl" />

                  <div className="absolute left-1/2 top-8 h-12 w-14 -translate-x-1/2 rounded-t-full border-4 border-gray-700 bg-gray-900" />

                  <div className="absolute left-2 top-16 h-28 w-10 -rotate-[22deg] rounded-full bg-gradient-to-r from-gray-700 to-gray-300" />

                  <div className="absolute right-2 top-16 h-28 w-10 rotate-[22deg] rounded-full bg-gradient-to-l from-gray-700 to-gray-300" />

                  <div className="absolute left-1/2 top-16 h-32 w-[3px] -translate-x-1/2 bg-gray-400/50" />
                </div>
              </div>

              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
                {["Rotate", "Zoom", "Reset", "Inspect"].map((button) => (
                  <button
                    key={button}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs text-gray-400 transition hover:border-white/50 hover:text-white"
                  >
                    {button}
                  </button>
                ))}
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.25em] text-[#9ab2ca]">
                3D Product View
              </div>

              <h2 className="mt-3 max-w-[450px] text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-5xl">
                The actual product.
                <br />
                Not a photo of it.
              </h2>

              <p className="mt-7 max-w-[390px] text-sm leading-6 text-gray-400">
                Sellers can ship their actual products with a smartphone. Our
                photogrammetry engine converts them into interactive 3D models
                buyers can inspect from every angle.
              </p>

              <button className="mt-7 rounded-sm bg-[#f59a23] px-7 py-2.5 text-xs font-bold text-white transition hover:bg-[#df8411]">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* =========================================================
          VERIFICATION SECTION
      ========================================================= */}
      <motion.section
        className="overflow-hidden bg-gradient-to-br from-[#e6f4fa] to-[#eee8f5] px-6 py-16 md:px-14 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionReveal}
      >
        <div className="mx-auto max-w-[1150px]">
          <div className="mb-10 text-sm font-medium text-gray-500">
            Real Time Product Authenticity Verification System
          </div>

          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.25em] text-[#8c9fba]">
                Authenticity Engine
              </div>

              <h2 className="mt-2 text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-5xl">
                Enter a number.
                <br />
                Get the{" "}
                <span className="text-[#9d82bc]">truth.</span>
              </h2>

              <p className="mt-6 max-w-[430px] text-sm leading-6 text-gray-600">
                Sellers enter their product&apos;s regulatory number. Our
                system checks it in real-time, returns full certified details
                before any buyer sees the listing.
              </p>

              <p className="mt-10 text-lg font-semibold uppercase tracking-wide">
                Enter a{" "}
                <span className="text-[#8d7db8]">NAFDAC</span> number to
                <br />
                check the authenticity of
                <br />
                any product
              </p>
            </div>

            {/* Verification card */}
            <div className="rounded-lg bg-[#211e1e] p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                  Product Verification Engine
                </span>

                <span className="rounded bg-emerald-950 px-2 py-1 text-[10px] text-emerald-400">
                  ● Live Check
                </span>
              </div>

              <div className="mt-5 flex gap-2">
                <div className="flex-1 rounded border border-white/10 bg-black/20 px-4 py-3 text-xs text-gray-500">
                  Enter NAFDAC No. e.g. A1-0243
                </div>

                <button className="bg-[#b9a5d0] px-5 text-xs font-black uppercase text-black transition hover:bg-[#cdbde0]">
                  Verify →
                </button>
              </div>

                <div className="mt-5 space-y-3 text-xs">
                {[
                  ["NAFDAC Number", "A1-0243"],
                  ["Registration Status", "✓ Active & Valid"],
                  ["Product Name", "Paracetamol 500mg Tablets"],
                  ["Manufacturer", "Emzor Pharmaceuticals Ltd."],
                  ["Production Date", "January 2025"],
                  ["Active Ingredients", "Paracetamol 500mg"],
                  ["Expiry Date", "December 2027"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between border-b border-white/5 pb-2"
                  >
                    <span className="uppercase text-gray-500">{label}</span>
                    <span className="text-right text-gray-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <motion.section
        className="bg-white px-6 py-16 md:px-14 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionReveal}
      >
        <div className="mx-auto max-w-[1150px]">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.25em] text-gray-400">
                How Glint Works
              </div>

              <h2 className="mt-4 max-w-[280px] text-2xl font-black uppercase leading-tight">
                Verification happens before you pay.
              </h2>
            </div>

            <p className="max-w-[420px] text-sm leading-6 text-gray-500">
              Every step is designed to eliminate doubt. By the time you hit
              checkout, you already know exactly what you&apos;re getting.
            </p>
          </div>

          <div className="mt-10 grid overflow-hidden rounded-md sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "List",
                heading: "Browse Verified Listings",
                text: "Every product on Glint has passed our seller verification layer. You won't find unverified listings here.",
              },
              {
                title: "Verify",
                heading: "Confirm Authenticity",
                text: "Hit verify on any product. Our system checks NAFDAC registration in real-time.",
              },
              {
                title: "View 3D",
                heading: "See It In 3D",
                text: "Rotate, zoom, and examine an exact 3D scan of the actual physical product.",
              },
              {
                title: "Buy",
                heading: "Buy with Confidence",
                text: "Every product you purchase is verified before payment, so you're getting exactly what you ordered.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="min-h-[180px] border-r border-white bg-[#c6dceb] p-6 last:border-r-0"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-gray-600">
                  {item.title}
                </div>

                <h3 className="mt-5 text-sm font-black uppercase">
                  {item.heading}
                </h3>

                <p className="mt-3 text-xs leading-5 text-gray-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================= */}
      <section id="store" className="bg-white px-6 pb-20 md:px-14">
        <div className="mx-auto max-w-[1150px]">
          <div className="mb-8 text-sm font-medium text-gray-500">
            Featured Products
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[400px] animate-pulse border border-black/10 bg-gray-100"
                />
              ))}
            </div>
          )}

          {isError && (
            <div className="border border-red-100 bg-red-50 p-6 text-sm text-red-600">
              Unable to load products right now.
            </div>
          )}

          {!isLoading && !isError && featuredProducts.length === 0 && (
            <div className="border border-black/10 p-10 text-center text-sm text-gray-500">
              No products available yet.
            </div>
          )}

          {!isLoading && !isError && featuredProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  index={index}
                  name={product.name}
                  price={product.price}
                  image={product.images?.[0]}
                  category={product.category}
                />
              ))}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Link
              href="/products"
              className="rounded-full border border-black/40 px-7 py-2.5 text-xs font-medium text-gray-700 transition hover:bg-black hover:text-white"
            >
              Explore More Products
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer
        id="about"
        className="relative overflow-hidden bg-gradient-to-br from-[#a9d0e7] to-[#d7c9e5] px-8 pb-8 pt-14"
      >
        <div className="mx-auto max-w-[1150px]">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2 text-[10px] text-[#829bc3]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#829bc3]">
                  ◇
                </span>
                marketplace
              </div>

              <p className="mt-6 max-w-[220px] text-sm leading-5 text-gray-600">
                Nigeria&apos;s first marketplace combining interactive 3D
                product viewing with live regulatory authenticity
                verification. No fakes. No excuses.
              </p>

              <div className="mt-7 flex gap-2">
                {["X", "in", "f", "◎"].map((social) => (
                  <button
                    key={social}
                    className="flex h-7 w-7 items-center justify-center rounded-sm bg-white text-xs font-bold text-gray-500 transition hover:-translate-y-1"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>

            {[
              {
                title: "Company",
                links: ["About", "Features", "Blog", "Contact"],
              },
              {
                title: "Help",
                links: ["Account", "Verification", "Orders", "Payments"],
              },
              {
                title: "FAQ",
                links: ["Account", "Deliveries", "Orders", "Payments"],
              },
              {
                title: "Resources",
                links: ["E-book", "Blog", "Support", "Trust & Safety"],
              },
            ].map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-bold">{column.title}</h3>

                <div className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <Link
                      key={link}
                      href="#"
                      className="block text-xs text-gray-600 transition hover:text-black"
                    >
                      {link}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-black/10 pt-5 text-xs text-gray-600">
            Glint Limited 2026. The Team — Zero tolerance for fakes.
          </div>
        </div>
      </footer>
    </main>
  );
}