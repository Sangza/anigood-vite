import { useState } from "react";
import { waLink, DEFAULT_WA_TEXT } from "../config.js";

export default function Header({ cartCount, onOpenCart, onGroup }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="header">
      <div className="container header-inner">
        <a className="logo" href="#top" aria-label="ANIGOOD home">
          <img src="/logo.svg" width="46" height="46" alt="" />
          <span className="logo-text">
            <strong>ANIGOOD</strong>
            <small>COMMUNICATION LTD</small>
          </span>
        </a>
        <nav className={`nav ${open ? "open" : ""}`} onClick={close}>
          <a href="#top">Home</a>
          <a href="#shop">Shop</a>
          <a href="#shop" onClick={() => onGroup("Solar")}>Solar</a>
          <a href="#shop" onClick={() => onGroup("Electronics")}>Electronics</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-actions">
          <button className="cart-btn" onClick={onOpenCart} aria-label="Open cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
            </svg>
            Cart ({cartCount})
          </button>
          <a className="btn btn-wa hide-sm" href={waLink(DEFAULT_WA_TEXT)} target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </a>
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        </div>
      </div>
    </header>
  );
}
