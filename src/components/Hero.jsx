import { waLink, DEFAULT_WA_TEXT } from "../config.js";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-text">
          <span className="eyebrow">Solar power &amp; electronics</span>
          <h1>Dependable power and electronics for homes and businesses</h1>
          <p>
            Solar batteries, inverters and charge controllers, together with freezers, televisions,
            sound systems, washing machines and electrical materials, supplied from one place.
          </p>
          <div className="hero-buttons">
            <a className="btn btn-gold" href="#shop">Shop now</a>
            <a className="btn btn-outline" href={waLink(DEFAULT_WA_TEXT)} target="_blank" rel="noopener noreferrer">
              Order on WhatsApp
            </a>
          </div>
        </div>
        <div className="hero-photo">
          <img
            src="https://images.pexels.com/photos/11645008/pexels-photo-11645008.jpeg?auto=compress&cs=tinysrgb&w=1000"
            alt="Technicians installing solar panels on a roof"
          />
        </div>
      </div>
    </section>
  );
}
