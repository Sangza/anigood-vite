import { useEffect, useMemo, useState } from "react";
import { fmt, waLink } from "./config.js";

const KEY = "anigood-cart";

export function useCart(products) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch {
      /* storage unavailable */
    }
  }, [cart]);

  // Cart lines always use the latest product data (so price changes show up).
  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
        .filter((l) => l.product && l.product.inStock),
    [cart, products]
  );
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.product.price, 0);

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const inc = add;
  const dec = (id) =>
    setCart((c) => {
      const next = { ...c, [id]: (c[id] || 0) - 1 };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  const remove = (id) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  const clear = () => setCart({});

  const checkout = () => {
    if (!lines.length) return;
    const body = lines.map((l) => `• ${l.qty} x ${l.product.name} (${fmt(l.product.price)})`).join("\n");
    const msg = `Hello ANIGOOD COMMUNICATION LTD, I would like to order:\n\n${body}\n\nEstimated total: ${fmt(total)}\n\nPlease confirm availability and delivery.`;
    window.open(waLink(msg), "_blank", "noopener");
  };

  return { lines, count, total, add, inc, dec, remove, clear, checkout };
}
