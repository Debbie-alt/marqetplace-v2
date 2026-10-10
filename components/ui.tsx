"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

export const naira = (value: number) => `₦${new Intl.NumberFormat("en-NG").format(value)}`;

export function Brand({ dark = false }: { dark?: boolean }) {
  return <span className={`flex items-center gap-2 font-semibold tracking-wide ${dark ? "text-white" : "text-sky-700"}`}><span className="grid size-7 place-items-center rounded-full border border-current text-sm">◔</span><span>marqetplace</span></span>;
}

export function PrimaryButton({ className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`rounded-xl bg-violet-300 px-5 py-3 text-sm font-semibold text-neutral-950 shadow-sm transition duration-200 hover:bg-violet-200 active:scale-[.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300/30 disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100 ${className}`} {...props}>{children}</button>;
}

export function StarRating({ rating = 5 }: { rating?: number }) {
  return <span className="inline-flex text-amber-400">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-3" fill={i < rating ? "currentColor" : "none"} />)}</span>;
}

export function DarkInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:ring-4 focus:ring-violet-300/20 ${className}`} {...props} />;
}

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return <div className="relative"><DarkInput {...props} type={visible ? "text" : "password"} className="pr-11" /><button type="button" aria-label="Toggle password visibility" onClick={() => setVisible(!visible)} className="absolute right-3 top-3 rounded-md p-0.5 text-neutral-400 transition hover:bg-white/10 hover:text-white">{visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></div>;
}

export function CartButton({ children = "Add to Cart", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <PrimaryButton className={`flex items-center justify-center gap-2 ${className}`} {...props}>{children}<ShoppingCart className="size-4" /></PrimaryButton>;
}

export function FieldLabel({ children }: { children: ReactNode }) { return <label className="mb-1.5 block text-xs font-medium text-neutral-600">{children}</label>; }
