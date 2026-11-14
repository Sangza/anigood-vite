import { ADDRESS, PHONE_DISPLAY } from "../config.js";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <strong className="footer-brand">ANIGOOD</strong>
          <span className="eyebrow">Communication Ltd</span>
          <p>Solar components, home and office electronics, and electrical materials.</p>
        </div>
        <div>
          <h4>Solar</h4>
          <a href="#shop">Solar Batteries</a>
          <a href="#shop">Inverters</a>
          <a href="#shop">Charge Controllers</a>
          <a href="#shop">Solar Accessories</a>
        </div>
        <div>
          <h4>Electronics</h4>
          <a href="#shop">Fridges and Freezers</a>
          <a href="#shop">Televisions</a>
          <a href="#shop">Sound Systems</a>
          <a href="#shop">Washing Machines</a>
          <a href="#shop">Electrical Materials</a>
        </div>
        <div>
          <h4>Order</h4>
          <span>WhatsApp: {PHONE_DISPLAY}</span>
          <span>Phone: {PHONE_DISPLAY}</span>
          <span>Address: {ADDRESS}</span>
        </div>
      </div>
      <div className="container copy">
        © {new Date().getFullYear()} ANIGOOD COMMUNICATION LTD. All rights reserved.
      </div>
    </footer>
  );
}
