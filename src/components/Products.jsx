import ProductCard from "./ProductCard.jsx";
import { waLink } from "../config.js";

export default function Products({ products, loading, filter, onAdd }) {
  let list = products;
  if (filter.type === "category") list = products.filter((p) => p.category === filter.value);
  if (filter.type === "group") list = products.filter((p) => p.group === filter.value);

  return (
    <section className="section" id="shop">
      <div className="container">
        <span className="eyebrow dark">The store</span>
        <h2>Featured products</h2>
        <div className="grid">
          {loading ? (
            <p className="muted">Loading products...</p>
          ) : list.length ? (
            list.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)
          ) : (
            <p className="muted">
              We do not have this item listed yet. Please{" "}
              <a style={{ textDecoration: "underline" }} href={waLink("Hello ANIGOOD, do you have this item?")} target="_blank" rel="noopener noreferrer">
                ask us on WhatsApp
              </a>.
            </p>
          )}
        </div>
        <p className="muted small note">
          Prices are subject to confirmation by our team when you send your order.
        </p>
      </div>
    </section>
  );
}
