"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface MarketplaceState {
  cartCount: number;
  addToCart: (productId: string) => void;
  wishlist: Set<string>;
  toggleWishlist: (productId: string) => void;
}

const MarketplaceContext = createContext<MarketplaceState | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("marqetplace-cart") ?? "[]"));
    setWishlistIds(JSON.parse(localStorage.getItem("marqetplace-wishlist") ?? "[]"));
  }, []);
  useEffect(() => { localStorage.setItem("marqetplace-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("marqetplace-wishlist", JSON.stringify(wishlistIds)); }, [wishlistIds]);

  const value = useMemo(() => ({
    cartCount: cart.length,
    addToCart: (productId: string) => setCart((items) => [...items, productId]),
    wishlist: new Set(wishlistIds),
    toggleWishlist: (productId: string) => setWishlistIds((items) => items.includes(productId) ? items.filter((id) => id !== productId) : [...items, productId]),
  }), [cart, wishlistIds]);
  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const state = useContext(MarketplaceContext);
  if (!state) throw new Error("useMarketplace must be used inside MarketplaceProvider");
  return state;
}
