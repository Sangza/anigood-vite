import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If the keys are missing, the site still works using the built-in product list.
export const supabase = url && key ? createClient(url, key) : null;
export const BUCKET = "product-images";
