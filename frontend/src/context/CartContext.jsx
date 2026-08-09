import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "pp_cart";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (listing, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.listingId === listing._id);
      if (existing) {
        return prev.map((i) =>
          i.listingId === listing._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          listingId: listing._id,
          title: listing.title,
          price: listing.price,
          priceType: listing.priceType,
          image: listing.images?.[0] || null,
          listingType: listing.listingType,
          sellerId: listing.seller?._id,
          sellerName: listing.seller?.businessName || `${listing.seller?.firstName || ""} ${listing.seller?.lastName || ""}`,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (listingId) => {
    setItems((prev) => prev.filter((i) => i.listingId !== listingId));
  };

  const updateQuantity = (listingId, quantity) => {
    setItems((prev) => prev.map((i) => (i.listingId === listingId ? { ...i, quantity: Math.max(1, quantity) } : i)));
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
