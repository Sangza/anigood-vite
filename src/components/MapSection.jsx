import { ADDRESS, MAP_COORDS, MAP_LINK } from "../config.js";

export default function MapSection() {
  const coords = MAP_COORDS.replace(/\s+/g, "");
  const q = encodeURIComponent(coords || (/nigeria/i.test(ADDRESS) ? ADDRESS : `${ADDRESS}, Nigeria`));
  return (
    <section className="section" id="map">
      <div className="container">
        <h2>Find our store</h2>
        <p className="muted">{ADDRESS}. Open the location in Google Maps for directions.</p>
        <div className="map">
          <iframe
            title="ANIGOOD COMMUNICATION LTD location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${q}&z=17&output=embed`}
          />
        </div>
        <div className="center">
          <a className="btn btn-dark" target="_blank" rel="noopener noreferrer" href={MAP_LINK || `https://www.google.com/maps/search/?api=1&query=${q}`}>
            Open in Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
