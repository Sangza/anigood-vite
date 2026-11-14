import { fmt, waLink } from "../config.js";

export default function ProductCard({ product: p, onAdd }) {
  const msg = `Hello ANIGOOD, I am interested in the ${p.name} (${fmt(p.price)}). Is it available?`;
  return (
    <article className="product">
      <div className="p-img">
        {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <div className="p-noimg" />}
        {!p.inStock && <span className="badge-out">Out of stock</span>}
      </div>
      <div className="p-body">
        <span className="p-cat">{p.group}</span>
        <h3 className="p-name">{p.name}</h3>
        <div className="p-price">{fmt(p.price)}</div>
        <div className="p-actions">
          <button className="btn btn-dark add" onClick={() => onAdd(p.id)} disabled={!p.inStock}>
            {p.inStock ? "Add to cart" : "Unavailable"}
          </button>
          <a className="btn btn-wa wa" href={waLink(msg)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </div>
    </article>
  );
}
