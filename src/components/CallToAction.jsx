import { waLink, DEFAULT_WA_TEXT } from "../config.js";

export default function CallToAction() {
  return (
    <section className="cta">
      <div className="container cta-inner">
        <h2>Need help choosing the right equipment?</h2>
        <a className="btn btn-wa" href={waLink(DEFAULT_WA_TEXT)} target="_blank" rel="noopener noreferrer">
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}
