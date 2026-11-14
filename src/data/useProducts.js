import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.js";
import { FALLBACK_PRODUCTS, groupOf } from "./products.js";

export const fromRow = (r) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  group: groupOf(r.category),
  price: Number(r.price),
  image: r.image_url,
  inStock: r.in_stock,
});

export function useProducts() {
  const [products, setProducts] = useState(supabase ? [] : FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("products")
      .select("*")
      .eq("visible", true)
      .order("sort", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Could not load products:", error.message);
          setProducts(FALLBACK_PRODUCTS);
        } else {
          setProducts(data.map(fromRow));
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading };
}
