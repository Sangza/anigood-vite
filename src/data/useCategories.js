import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient.js";
import { categoriesFrom } from "./products.js";

// Loads the owner's category list from Supabase.
// If the categories table isn't set up yet, falls back to the built-in list
// plus any categories already used by products.
export function useCategories(products = []) {
  const [list, setList] = useState(null); // null = not loaded / unavailable
  const [ready, setReady] = useState(!supabase);
  const [missingTable, setMissingTable] = useState(false);

  const reload = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("categories")
      .select("name, sort")
      .order("sort", { ascending: true })
      .order("name", { ascending: true });
    if (error) {
      console.error("Could not load categories:", error.message);
      setMissingTable(true);
      setList(null);
    } else {
      setMissingTable(false);
      setList(data.map((c) => c.name));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const categories = list ?? categoriesFrom(products);
  return { categories, ready, missingTable, reload };
}
