import { useCategories } from "../data/useCategories.js";

export default function Categories({ products = [], filter, onPick }) {
  const { categories } = useCategories(products);
  const CATEGORIES = ["All products", ...categories];
  const isActive = (c) =>
    c === "All products" ? filter.type === "all" : filter.type === "category" && filter.value === c;

  return (
    <section className="section cream" id="categories">
      <div className="container">
        <div className="section-head row">
          <h2>Shop by category</h2>
          <span className="muted small">Tap a category to browse</span>
        </div>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button key={c} className={`chip ${isActive(c) ? "active" : ""}`} onClick={() => onPick(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
