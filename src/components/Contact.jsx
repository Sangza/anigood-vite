import { useState } from "react";
import { ADDRESS, EMAIL, PHONE_DISPLAY, WHATSAPP_NUMBER, waLink, DEFAULT_WA_TEXT } from "../config.js";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", msg: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const text = `Hello ANIGOOD, my name is ${form.name} (${form.phone}).\n\n${form.msg}`;
    window.open(waLink(text), "_blank", "noopener");
  };

  return (
    <section className="section cream" id="contact">
      <div className="container contact-grid">
        <div>
          <span className="eyebrow dark">Contact</span>
          <h2>Visit us or get in touch</h2>
          <dl className="details">
            <div><dt>Phone</dt><dd><a href={`tel:+${WHATSAPP_NUMBER}`}>{PHONE_DISPLAY}</a></dd></div>
            <div>
              <dt>WhatsApp</dt>
              <dd><a href={waLink(DEFAULT_WA_TEXT)} target="_blank" rel="noopener noreferrer">{PHONE_DISPLAY}</a></dd>
            </div>
            <div><dt>Address</dt><dd>{ADDRESS}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${EMAIL}`} style={{ textDecoration: "underline" }}>{EMAIL}</a></dd></div>
          </dl>
          <a className="btn btn-wa" href={waLink(DEFAULT_WA_TEXT)} target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </a>
        </div>
        <form className="card form" onSubmit={submit}>
          <h3>Send an enquiry</h3>
          <label>Full name
            <input required placeholder="Type here" value={form.name} onChange={set("name")} />
          </label>
          <label>Phone number
            <input required type="tel" placeholder="Type here" value={form.phone} onChange={set("phone")} />
          </label>
          <label>What are you looking for?
            <textarea required rows="4" placeholder="Type here" value={form.msg} onChange={set("msg")} />
          </label>
          <button className="btn btn-dark" type="submit">Send Enquiry</button>
          <p className="muted small">Your enquiry opens in WhatsApp so our team can reply quickly.</p>
        </form>
      </div>
    </section>
  );
}
