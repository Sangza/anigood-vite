-- Run this whole file once in Supabase: SQL Editor -> New query -> paste -> Run.

-- 1. Products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric not null default 0,
  image_url text,
  in_stock boolean not null default true,
  visible boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Security: anyone can read visible products; only logged-in admin can change anything
alter table public.products enable row level security;

drop policy if exists "Public can read visible products" on public.products;
create policy "Public can read visible products"
  on public.products for select
  using (visible = true or auth.role() = 'authenticated');

drop policy if exists "Admin can insert products" on public.products;
create policy "Admin can insert products"
  on public.products for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update products" on public.products;
create policy "Admin can update products"
  on public.products for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can delete products" on public.products;
create policy "Admin can delete products"
  on public.products for delete
  using (auth.role() = 'authenticated');

-- 3. Image storage bucket (public so the website can show the photos)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admin can upload product images" on storage.objects;
create policy "Admin can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Admin can update product images" on storage.objects;
create policy "Admin can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Admin can delete product images" on storage.objects;
create policy "Admin can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- 4. Starter products (dummy prices and stock photos; the owner can edit them in /admin)
insert into public.products (name, category, price, image_url, sort)
select * from (values
  ('Solar battery',         'Solar batteries',      185000, 'https://images.pexels.com/photos/39057093/pexels-photo-39057093.jpeg?auto=compress&cs=tinysrgb&w=700', 1),
  ('Inverter',              'Inverters',            320000, 'https://images.pexels.com/photos/37929911/pexels-photo-37929911.jpeg?auto=compress&cs=tinysrgb&w=700', 2),
  ('Charge controller',     'Charge controllers',    45000, 'https://images.pexels.com/photos/38171157/pexels-photo-38171157.jpeg?auto=compress&cs=tinysrgb&w=700', 3),
  ('Solar accessories kit', 'Solar accessories',     68000, 'https://images.pexels.com/photos/38171148/pexels-photo-38171148.jpeg?auto=compress&cs=tinysrgb&w=700', 4),
  ('Chest freezer',         'Fridges and freezers', 275000, 'https://images.pexels.com/photos/8032016/pexels-photo-8032016.jpeg?auto=compress&cs=tinysrgb&w=700', 5),
  ('Television',            'Televisions',          210000, 'https://images.pexels.com/photos/1827054/pexels-photo-1827054.jpeg?auto=compress&cs=tinysrgb&w=700', 6),
  ('Sound system',          'Sound systems',         95000, 'https://images.pexels.com/photos/5490300/pexels-photo-5490300.jpeg?auto=compress&cs=tinysrgb&w=700', 7),
  ('Washing machine',       'Washing machines',     260000, 'https://images.pexels.com/photos/9515294/pexels-photo-9515294.jpeg?auto=compress&cs=tinysrgb&w=700', 8)
) as v(name, category, price, image_url, sort)
where not exists (select 1 from public.products);
