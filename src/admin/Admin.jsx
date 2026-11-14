import { useEffect, useMemo, useState } from "react";
import { supabase, BUCKET } from "../supabaseClient.js";
import { useCategories } from "../data/useCategories.js";
import { fmt } from "../config.js";

// Make sure a category exists in the categories table (used when a product gets a brand-new one).
async function ensureCategory(name, existing) {
  if (!name || existing.includes(name)) return;
  await supabase.from("categories").upsert({ name, sort: existing.length + 1 }, { onConflict: "name", ignoreDuplicates: true });
}

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

const ALL = "All";

function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState(ALL);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all"); // all | out | hidden

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

  const cat = useCategories(rows);
  // Managed categories first, then any category a product still uses that isn't in the list
  const categories = useMemo(() => {
    const extra = [...new Set(rows.map((r) => r.category))].filter((c) => c && !cat.categories.includes(c));
    return [...cat.categories, ...extra];
  }, [rows, cat.categories]);
  const refresh = () => { load(); cat.reload(); };
  const countIn = (c) => rows.filter((r) => r.category === c).length;

  const q = search.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      (tab === ALL || r.category === tab) &&
      (!q || r.name.toLowerCase().includes(q)) &&
      (status === "all" || (status === "out" && !r.in_stock) || (status === "hidden" && !r.visible))
  );
  // Group by category, in category order
  const groups = categories
    .map((c) => ({ category: c, items: filtered.filter((r) => r.category === c) }))
    .filter((g) => g.items.length);

  return (
    <>
      {msg && <div className="toast">{msg}</div>}
      <AddProduct
        categories={categories}
        defaultCategory={tab !== ALL ? tab : categories[0]}
        onDone={(c) => { flash("Product added"); refresh(); if (tab !== ALL && c !== tab) setTab(c); }}
        onError={(m) => flash("Error: " + m)}
      />

      <CategoryManager
        categories={categories}
        managed={cat.categories}
        missingTable={cat.missingTable}
        countIn={countIn}
        onChanged={(m, renamedTo) => {
          flash(m);
          refresh();
          if (renamedTo !== undefined && tab !== ALL) setTab(renamedTo || ALL);
        }}
        onError={(m) => flash("Error: " + m)}
      />

      <div className="admin-head">
        <h2>Products ({rows.length})</h2>
        <div className="admin-tools">
          <input type="search" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="out">Out of stock</option>
            <option value="hidden">Hidden from website</option>
          </select>
        </div>
      </div>

      <div className="admin-tabs" role="tablist">
        <button className={`chip ${tab === ALL ? "active" : ""}`} onClick={() => setTab(ALL)}>
          All <span className="count">{rows.length}</span>
        </button>
        {categories.map((c) => (
          <button key={c} className={`chip ${tab === c ? "active" : ""}`} onClick={() => setTab(c)}>
            {c} <span className="count">{countIn(c)}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : !rows.length ? (
        <p className="muted">No products yet. Add your first one above.</p>
      ) : !groups.length ? (
        <p className="muted">No products match this filter.</p>
      ) : (
        groups.map((g) => (
          <section key={g.category} className="admin-group">
            <h3>{g.category} <span className="muted">({g.items.length})</span></h3>
            <div className="admin-table">
              <div className="admin-row admin-row-head" aria-hidden="true">
                <span>Photo</span><span>Name</span><span>Category</span><span>Price (₦)</span><span>Status</span><span></span>
              </div>
              {g.items.map((r) => (
                <Row key={r.id} row={r} categories={categories} onSaved={() => { flash("Saved"); refresh(); }} onError={(m) => flash("Error: " + m)} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}

function CategoryManager({ categories, managed, missingTable, countIn, onChanged, onError }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      onError(err.message);
    }
    setBusy(false);
  };
  const check = ({ error }) => {
    if (error) throw error;
  };

  const add = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) return onError(`"${name}" already exists`);
    run(async () => {
      check(await supabase.from("categories").insert({ name, sort: categories.length + 1 }));
      setNewName("");
      onChanged(`Category "${name}" added`);
    });
  };

  // Save the current order (index = sort) for every category, including unlisted ones
  const saveOrder = (list) =>
    supabase.from("categories").upsert(list.map((name, i) => ({ name, sort: i + 1 })), { onConflict: "name" });

  const move = (i, dir) =>
    run(async () => {
      const list = [...categories];
      [list[i], list[i + dir]] = [list[i + dir], list[i]];
      check(await saveOrder(list));
      onChanged("Order saved");
    });

  const rename = (oldName, input) =>
    run(async () => {
      const name = input.trim();
      if (!name || name === oldName) return;
      const merge = categories.find((c) => c !== oldName && c.toLowerCase() === name.toLowerCase());
      const target = merge || name;
      if (merge && !window.confirm(`"${merge}" already exists. Move all products from "${oldName}" into it?`)) return;
      if (!merge) check(await supabase.from("categories").upsert({ name: target, sort: categories.indexOf(oldName) + 1 }, { onConflict: "name" }));
      check(await supabase.from("products").update({ category: target }).eq("category", oldName));
      check(await supabase.from("categories").delete().eq("name", oldName));
      onChanged(merge ? `Merged into "${target}"` : `Renamed to "${target}"`, target);
    });

  const remove = (name, moveTo) =>
    run(async () => {
      const n = countIn(name);
      if (n > 0) {
        if (!moveTo) return onError("Choose where to move its products first");
        check(await supabase.from("products").update({ category: moveTo }).eq("category", name));
      } else if (!window.confirm(`Remove the category "${name}"?`)) return;
      check(await supabase.from("categories").delete().eq("name", name));
      onChanged(n ? `Removed "${name}" and moved ${n} product(s) to "${moveTo}"` : `Removed "${name}"`, "");
    });

  return (
    <div className="card admin-card cat-manager">
      <button type="button" className="cat-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <h2>Manage categories <span className="muted">({categories.length})</span></h2>
        <span>{open ? "Hide" : "Show"}</span>
      </button>

      {open && missingTable && (
        <p className="error">
          The categories table isn't set up yet. Run the "Categories" part of <code>supabase/schema.sql</code> in the
          Supabase SQL Editor, then refresh this page.
        </p>
      )}

      {open && !missingTable && (
        <div className={busy ? "busy" : ""}>
          <form className="cat-add" onSubmit={add}>
            <input placeholder="New category name, e.g. Generators" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="btn btn-dark sm" disabled={busy || !newName.trim()}>Add category</button>
          </form>
          <ul className="cat-list">
            {categories.map((c, i) => (
              <CategoryItem
                key={c}
                name={c}
                count={countIn(c)}
                unlisted={!managed.includes(c)}
                others={categories.filter((x) => x !== c)}
                first={i === 0}
                last={i === categories.length - 1}
                busy={busy}
                onUp={() => move(i, -1)}
                onDown={() => move(i, 1)}
                onRename={(v) => rename(c, v)}
                onRemove={(to) => remove(c, to)}
              />
            ))}
          </ul>
          <p className="muted small">
            Removing a category that still has products moves those products to the category you choose. No products are deleted.
          </p>
        </div>
      )}
    </div>
  );
}

function CategoryItem({ name, count, unlisted, others, first, last, busy, onUp, onDown, onRename, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [removing, setRemoving] = useState(false);
  const [moveTo, setMoveTo] = useState(others[0] || "");

  return (
    <li className="cat-item">
      <div className="cat-order">
        <button type="button" disabled={first || busy} onClick={onUp} aria-label={`Move ${name} up`}>▲</button>
        <button type="button" disabled={last || busy} onClick={onDown} aria-label={`Move ${name} down`}>▼</button>
      </div>

      {editing ? (
        <form className="cat-edit" onSubmit={(e) => { e.preventDefault(); onRename(value); setEditing(false); }}>
          <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} aria-label="Category name" />
          <button className="btn btn-dark sm" disabled={busy}>Save</button>
          <button type="button" className="link-btn" onClick={() => { setValue(name); setEditing(false); }}>Cancel</button>
        </form>
      ) : (
        <span className="cat-name">
          {name} <span className="count">{count}</span>
          {unlisted && <em className="muted small"> (only used by products)</em>}
        </span>
      )}

      {!editing && !removing && (
        <div className="admin-btns">
          <button type="button" className="btn sm" disabled={busy} onClick={() => setEditing(true)}>Rename</button>
          <button type="button" className="btn sm danger" disabled={busy}
            onClick={() => (count > 0 ? setRemoving(true) : onRemove())}>
            Remove
          </button>
        </div>
      )}

      {removing && (
        <div className="cat-remove">
          <span className="small">Move {count} product{count === 1 ? "" : "s"} to</span>
          <select value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
            {others.map((o) => <option key={o}>{o}</option>)}
          </select>
          <button type="button" className="btn sm danger" disabled={busy || !moveTo} onClick={() => { onRemove(moveTo); setRemoving(false); }}>
            Move & remove
          </button>
          <button type="button" className="link-btn" onClick={() => setRemoving(false)}>Cancel</button>
        </div>
      )}
    </li>
  );
}

async function uploadImage(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600" });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

const NEW = "__new__";

// Dropdown of existing categories, with a "+ New category" option that reveals a text box.
function CategoryPicker({ value, onChange, categories, ...rest }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [initial] = useState(value || categories[0]);

  if (adding) {
    return (
      <div className="cat-new">
        <input
          autoFocus
          placeholder="New category name"
          value={draft}
          onChange={(e) => { setDraft(e.target.value); onChange(e.target.value); }}
          {...rest}
        />
        <button type="button" className="link-btn" onClick={() => { setAdding(false); setDraft(""); onChange(initial); }}>
          Cancel
        </button>
      </div>
    );
  }
  const list = categories.includes(value) || !value ? categories : [...categories, value];
  return (
    <select
      value={value}
      onChange={(e) => (e.target.value === NEW ? (setAdding(true), onChange("")) : onChange(e.target.value))}
      {...rest}
    >
      {list.map((c) => <option key={c} value={c}>{c}</option>)}
      <option value={NEW}>+ New category...</option>
    </select>
  );
}

function AddProduct({ categories, defaultCategory, onDone, onError }) {
  const [form, setForm] = useState({ name: "", category: defaultCategory, price: "" });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [fileKey, setFileKey] = useState(0);
  const [pickerKey, setPickerKey] = useState(0);

  // Follow the selected tab so new products land in the category being viewed
  useEffect(() => {
    setForm((f) => ({ ...f, category: defaultCategory }));
    setPickerKey((k) => k + 1);
  }, [defaultCategory]);

  const submit = async (e) => {
    e.preventDefault();
    const category = form.category.trim();
    if (!category) return onError("Please choose or type a category");
    setBusy(true);
    try {
      const image_url = file ? await uploadImage(file) : null;
      await ensureCategory(category, categories);
      const { error } = await supabase.from("products").insert({
        name: form.name.trim(),
        category,
        price: Number(form.price),
        image_url,
        sort: Math.floor(Date.now() / 1000),
      });
      if (error) throw error;
      setForm({ name: "", category, price: "" });
      setFile(null);
      setFileKey((k) => k + 1);
      setPickerKey((k) => k + 1);
      onDone(category);
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
          <CategoryPicker key={pickerKey} value={form.category} categories={categories} onChange={(v) => setForm((f) => ({ ...f, category: v }))} />
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

function Row({ row, categories, onSaved, onError }) {
  const [name, setName] = useState(row.name);
  const [category, setCategory] = useState(row.category);
  const [price, setPrice] = useState(String(row.price));
  const [busy, setBusy] = useState(false);

  const dirty = name !== row.name || category.trim() !== row.category || Number(price) !== Number(row.price);

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

  const save = async () => {
    const c = category.trim();
    if (!c) return onError("Category cannot be empty");
    await ensureCategory(c, categories);
    patch({ name: name.trim(), category: c, price: Number(price) });
  };

  return (
    <div className={`admin-row ${busy ? "busy" : ""} ${!row.visible ? "is-hidden" : ""}`}>
      <label className="admin-thumb" title="Change photo">
        {row.image_url ? <img src={row.image_url} alt="" /> : <span>No photo</span>}
        <input type="file" accept="image/*" hidden onChange={changePhoto} />
      </label>
      <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" />
      <CategoryPicker value={category} categories={categories} onChange={setCategory} aria-label="Category" />
      <div className="price-input">
        <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price" />
        <small className="muted">{fmt(Number(price) || 0)}</small>
      </div>
      <div className="admin-status">
        <label className="check">
          <input type="checkbox" checked={row.in_stock} onChange={(e) => patch({ in_stock: e.target.checked })} /> In stock
        </label>
        <label className="check">
          <input type="checkbox" checked={row.visible} onChange={(e) => patch({ visible: e.target.checked })} /> On website
        </label>
      </div>
      <div className="admin-btns">
        <button className="btn btn-dark sm" disabled={!dirty || busy} onClick={save}>Save</button>
        <button className="btn sm danger" disabled={busy} onClick={remove} aria-label={`Delete ${row.name}`}>Delete</button>
      </div>
    </div>
  );
}
