import { fmt } from "../config.js";

export default function CartDrawer({ open, onClose, cart }) {
  const { lines, total, inc, dec, remove, clear, checkout } = cart;
  return (
    <>
      <div className={`overlay ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-label="Shopping cart">
        <div className="drawer-head">
          <h3>Your cart</h3>
          <button onClick={onClose} aria-label="Close cart">✕</button>
        </div>
        <div className="drawer-body">
          {lines.length ? (
            lines.map(({ product: p, qty }) => (
              <div className="item" key={p.id}>
                <img src={p.image} alt="" />
                <div>
                  <h5>{p.name}</h5>
                  <div className="price">{fmt(p.price)}</div>
                  <div className="qty">
                    <button onClick={() => dec(p.id)}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => inc(p.id)}>+</button>
                  </div>
                </div>
                <button className="rm" onClick={() => remove(p.id)} aria-label="Remove">✕</button>
              </div>
            ))
          ) : (
            <p className="empty">Your cart is empty.</p>
          )}
        </div>
        <div className="drawer-foot">
          <div className="total">
            <span>Estimated total</span>
            <strong>{fmt(total)}</strong>
          </div>
          <button className="btn btn-wa block" onClick={checkout} disabled={!lines.length}>
            Send order on WhatsApp
          </button>
          <button className="link-btn" onClick={clear}>Clear cart</button>
        </div>
      </aside>
    </>
  );
}
