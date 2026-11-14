# ANIGOOD COMMUNICATION LTD store (Vite + React + Supabase)

The public site loads products from a Supabase database. The owner manages products at `/admin`
(add items, change prices, upload photos, mark out of stock, hide or delete).

Without Supabase keys the site still runs using the built-in sample products, so you can work on the design first.

## 1. Run the site
```bash
npm install
npm run dev      # http://localhost:5173   (admin: http://localhost:5173/admin)
```
Requires Node.js 18+.

## 2. Set up the backend (about 10 minutes)
1. Go to https://supabase.com, create a free account and a **New project**. Save the database password.
2. In the project, open **SQL Editor -> New query**, paste the whole of `supabase/schema.sql`, and click **Run**.
   This creates the products table, the photo storage, the security rules and 8 starter products.
3. Open **Project Settings -> API**. Copy the **Project URL** and the **anon public** key.
4. In this project, copy `.env.example` to `.env` and paste the two values in. Restart `npm run dev`.
5. Create the owner account: **Authentication -> Users -> Add user -> Create new user**. Enter his email and a strong
   password and tick "Auto Confirm User".
6. **Important:** go to **Authentication -> Sign In / Providers** (or Settings) and turn **off** "Allow new users to
   sign up". Otherwise anyone could register and edit your products.
7. Open `/admin`, log in, and manage products. Changes show on the website immediately.

Never put the `service_role` key in this project. Only the `anon` key belongs here.

## 3. Deploy
```bash
npm run build     # output in /dist
```
Upload `dist/` to Netlify, Vercel or Cloudflare Pages and add the same two environment variables
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the host's settings. `public/_redirects` makes `/admin` work on Netlify.
On Vercel, add a rewrite of all paths to `/index.html`.

## Where to edit
- `src/config.js`: WhatsApp number, phone, address, email
- `src/data/products.js`: category list and offline sample products
- `src/admin/Admin.jsx`: the owner's admin page
- `src/components/`: one file per page section
- `src/styles.css`: styling (brand colours are CSS variables at the top)
- `supabase/schema.sql`: database and security setup

## How ordering works
The cart is saved in the visitor's browser. "Send order on WhatsApp" opens a chat with the cart pre-filled.
There is no online payment yet; a natural next step is Paystack and an `orders` table.

## Brand
Forest green `#0F4D3A`, gold `#E0A800`, cream `#F7F5EE`, WhatsApp green `#1FA855`. Fonts: Poppins and Inter.
