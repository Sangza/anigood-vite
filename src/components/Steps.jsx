const STEPS = [
  { n: "01", title: "Choose your products", text: "Browse the store and add items to your cart." },
  { n: "02", title: "Send your order on WhatsApp", text: "Share your cart with our team and ask any questions." },
  { n: "03", title: "Confirm with our team", text: "We confirm availability, price and delivery details with you." },
];

export default function Steps() {
  return (
    <section className="section cream" id="about">
      <div className="container">
        <span className="eyebrow dark">How to order</span>
        <h2>Order in three simple steps</h2>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <span>{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
