import { useEffect, useState } from "react";
import { supabase, BUCKET } from "../supabaseClient.js";
import { PRODUCT_CATEGORIES } from "../data/products.js";
import { fmt } from "../config.js";

export default function Admin() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="admin">
      <div className="admin-bar">
        <a href="/" className="admin-brand">
          <img src="/logo.svg" width="34" height="34" alt="" />
          <strong>ANIGOOD admin</strong>
        </a>
        <div className="admin-bar-right">
          <a href="/" className="link-btn">View website</a>
          {session && (
            <button className="btn btn-dark sm" onClick={() => supabase.auth.signOut()}>
              Log out
            </button>
          )}
        </div>
      </div>
      <div className="admin-body">
        {!ready ? (
          <p className="muted">Loading...</p>
        ) : !supabase ? (
          <div className="card admin-card">
            <h2>Backend not connected</h2>
            <p>
              Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a <code>.env</code> file
              (see <code>.env.example</code> and the README), then restart <code>npm run dev</code>.
            </p>
          </div>
        ) : !session ? (
          <Login />
        ) : (
          <Dashboard />
        )}
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  };

  return (
    <form className="card admin-card form" onSubmit={submit}>
      <h2>Owner login</h2>
      <label>Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>Password
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn btn-dark" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button>
    </form>
  );
}

function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const flash = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  };

  const load = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) flash("Error: " + error.message);
    else setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      {msg && <div className="toast">{msg}</div>}
      <AddProduct onDone={() => { flash("Product added"); load(); }} onError={(m) => flash("Error: " + m)} />
      <h2 style={{ margin: "40px 0 16px" }}>Products ({rows.length})</h2>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <div className="admin-list">
          {rows.map((r) => (
            <Row key={r.id} row={r} onSaved={() => { flash("Saved"); load(); }} onError={(m) => flash("Error: " + m)} />
          ))}
          {!rows.length && <p className="muted">No products yet. Add your first one above.</p>}
        </div>
      )}
    </>
  );
}

async function uploadImage(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600" });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function AddProduct({ onDone, onError }) {
  const empty = { name: "", category: PRODUCT_CATEGORIES[0], price: "" };
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [fileKey, setFileKey] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const image_url = file ? await uploadImage(file) : null;
      const { error } = await supabase.from("products").insert({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        image_url,
        sort: Math.floor(Date.now() / 1000),
      });
      if (error) throw error;
      setForm(empty);
      setFile(null);
      setFileKey((k) => k + 1);
      onDone();
    } catch (err) {
      onError(err.message);
    }
    setBusy(false);
  };

  return (
    <form className="card admin-card form" onSubmit={submit}>
      <h2>Add a new product</h2>
      <div className="admin-grid">
        <label>Name
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 5kVA Inverter" />
        </label>
        <label>Category
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Price (₦)
          <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="250000" />
        </label>
        <label>Photo
          <input key={fileKey} type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
        </label>
      </div>
      <button className="btn btn-dark" disabled={busy}>{busy ? "Adding..." : "Add product"}</button>
    </form>
  );
}

function Row({ row, onSaved, onError }) {
  const [name, setName] = useState(row.name);
  const [category, setCategory] = useState(row.category);
  const [price, setPrice] = useState(String(row.price));
  const [busy, setBusy] = useState(false);

  const dirty = name !== row.name || category !== row.category || Number(price) !== Number(row.price);

  const patch = async (values) => {
    setBusy(true);
    const { error } = await supabase.from("products").update(values).eq("id", row.id);
    setBusy(false);
    if (error) onError(error.message);
    else onSaved();
  };

  const changePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const image_url = await uploadImage(file);
      await patch({ image_url });
    } catch (err) {
      onError(err.message);
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    setBusy(true);
    const { error } = await supabase.from("products").delete().eq("id", row.id);
    setBusy(false);
    if (error) onError(error.message);
    else onSaved();
  };

  return (
    <div className={`admin-row ${busy ? "busy" : ""}`}>
      <div className="admin-thumb">
        {row.image_url ? <img src={row.image_url} alt="" /> : <span>No photo</span>}
        <label className="link-btn">
          Change photo
          <input type="file" accept="image/*" hidden onChange={changePhoto} />
        </label>
      </div>
      <div className="admin-fields">
        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="price-input">
          <span>₦</span>
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price" />
          <small className="muted">{fmt(Number(price) || 0)}</small>
        </div>
      </div>
      <div className="admin-actions">
        <label className="check">
          <input type="checkbox" checked={row.in_stock} onChange={(e) => patch({ in_stock: e.target.checked })} /> In stock
        </label>
        <label className="check">
          <input type="checkbox" checked={row.visible} onChange={(e) => patch({ visible: e.target.checked })} /> Show on website
        </label>
        <div className="admin-btns">
          <button className="btn btn-dark sm" disabled={!dirty || busy} onClick={() => patch({ name: name.trim(), category, price: Number(price) })}>
            Save
          </button>
          <button className="btn sm danger" disabled={busy} onClick={remove}>Delete</button>
        </div>
      </div>
    </div>
  );
}
