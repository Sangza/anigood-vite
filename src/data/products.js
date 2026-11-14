const img = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=700`;

export const CATEGORIES = [
  "All products", "Solar batteries", "Inverters", "Charge controllers", "Solar accessories",
  "Fridges and freezers", "Televisions", "Sound systems", "Washing machines", "Electrical materials",
];

// Categories the owner can pick when adding a product (everything except "All products")
export const PRODUCT_CATEGORIES = CATEGORIES.slice(1);

const SOLAR = ["Solar batteries", "Inverters", "Charge controllers", "Solar accessories"];
export const groupOf = (category) => (SOLAR.includes(category) ? "Solar" : "Electronics");

// Fallback list, used only when Supabase is not configured or cannot be reached.
export const FALLBACK_PRODUCTS = [
  { id: "battery", name: "Solar battery", category: "Solar batteries", price: 185000, image: img(39057093) },
  { id: "inverter", name: "Inverter", category: "Inverters", price: 320000, image: img(37929911) },
  { id: "controller", name: "Charge controller", category: "Charge controllers", price: 45000, image: img(38171157) },
  { id: "accessories", name: "Solar accessories kit", category: "Solar accessories", price: 68000, image: img(38171148) },
  { id: "freezer", name: "Chest freezer", category: "Fridges and freezers", price: 275000, image: img(8032016) },
  { id: "tv", name: "Television", category: "Televisions", price: 210000, image: img(1827054) },
  { id: "sound", name: "Sound system", category: "Sound systems", price: 95000, image: img(5490300) },
  { id: "washer", name: "Washing machine", category: "Washing machines", price: 260000, image: img(9515294) },
].map((p) => ({ ...p, group: groupOf(p.category), inStock: true }));
