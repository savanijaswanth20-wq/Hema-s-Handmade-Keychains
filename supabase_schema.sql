-- =========================================================================
-- SUPABASE BACKEND SCHEMA - HEMA'S HANDMADE KEYCHAINS & BUSINESS APP
-- Single shared backend for Web and Android App (Kotlin/Compose)
-- =========================================================================

-- Enable Extension for UUID generation
create extension if not exists "uuid-ossp";

-- 1. CATEGORIES TABLE
create table if not exists public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed Initial Categories
insert into public.categories (name, description) values
('Animal Series', 'Handcrafted clay animals, cute creatures and companions'),
('Food Series', 'Tiny miniature clay food items, donuts, fruits and sweets'),
('Cosmic Series', 'Dreamy resins, stars, clouds, galaxies and glitter charms'),
('Custom Series', 'Personalized names, custom-made shapes and keychains')
on conflict (name) do nothing;

-- 2. PRODUCTS TABLE
create table if not exists public.products (
    id text primary key, -- e.g. "prod-1", "prod-2" etc.
    name text not null,
    description text,
    category text not null,
    category_id uuid references public.categories(id) on delete set null,
    price numeric not null default 150,
    stock integer not null default 0,
    images text[] not null default '{}',
    rating numeric not null default 5.0,
    reviews_count integer not null default 0,
    tag text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for searching and categories
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_name on public.products(name);

-- 3. CUSTOMERS / PROFILES TABLE (linked to auth.users)
create table if not exists public.customers (
    id uuid references auth.users on delete cascade primary key,
    email text not null unique,
    name text,
    phone text,
    address text,
    role text not null default 'customer' check (role in ('customer', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to automatically create customer profile on Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.customers (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do update
  set email = excluded.email, name = excluded.name;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. ORDERS TABLE
create table if not exists public.orders (
    id text primary key, -- e.g. "HEMA-8273"
    customer_id uuid references public.customers(id) on delete set null,
    customer_name text not null,
    customer_phone text not null,
    address text not null,
    custom_message text,
    payment_method text not null default 'UPI' check (payment_method in ('UPI', 'WhatsApp')),
    payment_id text, -- transaction ref id
    payment_status text not null default 'Pending' check (payment_status in ('Pending', 'Verified', 'Refunded')),
    total numeric not null,
    status text not null default 'Pending' check (status in ('Pending', 'Baking', 'Glossing', 'Shipped', 'Delivered', 'Cancelled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);

-- 5. ORDER_ITEMS TABLE
create table if not exists public.order_items (
    id uuid default gen_random_uuid() primary key,
    order_id text references public.orders(id) on delete cascade not null,
    product_id text references public.products(id) on delete set null,
    product_name text not null,
    product_image text,
    quantity integer not null default 1,
    price numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PAYMENTS TABLE
create table if not exists public.payments (
    id uuid default gen_random_uuid() primary key,
    order_id text references public.orders(id) on delete cascade not null,
    amount numeric not null,
    upi_id text,
    transaction_id text not null unique,
    status text not null default 'Pending' check (status in ('Pending', 'Verified', 'Failed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. REVIEWS TABLE
create table if not exists public.reviews (
    id text primary key, -- e.g. "rev-1" or "rev-timestamp"
    product_id text references public.products(id) on delete cascade not null,
    product_name text not null,
    customer_name text not null,
    customer_id uuid references public.customers(id) on delete set null,
    rating integer not null check (rating >= 1 and rating <= 5),
    text text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to recalculate product reviews average & count
create or replace function public.recalculate_product_rating()
returns trigger as $$
declare
    avg_rating numeric;
    count_reviews integer;
    target_product_id text;
begin
    if (TG_OP = 'DELETE') then
        target_product_id := old.product_id;
    else
        target_product_id := new.product_id;
    end if;

    select coalesce(avg(rating), 5.0), count(*)
    into avg_rating, count_reviews
    from public.reviews
    where product_id = target_product_id;

    update public.products
    set rating = round(avg_rating, 1),
        reviews_count = count_reviews
    where id = target_product_id;

    return null;
end;
$$ language plpgsql security definer;

create or replace trigger on_review_changed
  after insert or update or delete on public.reviews
  for each row execute procedure public.recalculate_product_rating();

-- 8. WISHLIST TABLE
create table if not exists public.wishlist (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.customers(id) on delete cascade not null,
    product_id text references public.products(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, product_id)
);

-- 9. CART_ITEMS TABLE
create table if not exists public.cart_items (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.customers(id) on delete cascade not null,
    product_id text references public.products(id) on delete cascade not null,
    quantity integer not null default 1 check (quantity > 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, product_id)
);

-- 10. ADMIN_SETTINGS TABLE
create table if not exists public.admin_settings (
    id text primary key default 'global_settings',
    upi_id text not null default '9640653603@ybl',
    upi_name text not null default 'Hema''s Tiny Universe',
    banner_message text not null default '✨ EXTRA CUTE HANDMADE CLAY CHARMS & CUSTOMIZABLE CARTOON KEYCHAINS! ✨',
    business_name text not null default 'Hema''s Handmade Keychains',
    whatsapp_number text not null default '+91 9640653603',
    instagram_id text not null default 'hemas_tiny_universe',
    qr_image_url text,
    logo_url text,
    hero_title text,
    hero_description text,
    gallery_images jsonb default '[]'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed Settings
insert into public.admin_settings (id) values ('global_settings') on conflict do nothing;


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist enable row level security;
alter table public.cart_items enable row level security;
alter table public.admin_settings enable row level security;

-- Helper Function to check if current authenticated user is Admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return (
    select coalesce(role = 'admin', false)
    from public.customers
    where id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- --- CATEGORIES POLICY ---
create policy "Allow public read access on Categories" on public.categories
    for select using (true);

create policy "Allow Admins to modify Categories" on public.categories
    for all using (public.is_admin());

-- --- PRODUCTS POLICY ---
create policy "Allow public read access on Products" on public.products
    for select using (true);

create policy "Allow Admins to modify Products" on public.products
    for all using (public.is_admin());

-- --- CUSTOMERS POLICY ---
create policy "Allow users to view own profile" on public.customers
    for select using (auth.uid() = id or public.is_admin());

create policy "Allow users to update own profile" on public.customers
    for update using (auth.uid() = id or public.is_admin());

-- --- ORDERS POLICY ---
create policy "Allow users to view own orders" on public.orders
    for select using (auth.uid() = customer_id or public.is_admin());

create policy "Allow public/users to insert orders" on public.orders
    for insert with check (true);

create policy "Allow Admins or own user to update orders" on public.orders
    for update using (auth.uid() = customer_id or public.is_admin());

-- --- ORDER ITEMS POLICY ---
create policy "Allow users to view own order items" on public.order_items
    for select using (
        exists (
            select 1 from public.orders
            where orders.id = order_items.order_id
            and (orders.customer_id = auth.uid() or public.is_admin())
        )
    );

create policy "Allow anyone to create order items" on public.order_items
    for insert with check (true);

-- --- PAYMENTS POLICY ---
create policy "Allow users to view own payments" on public.payments
    for select using (
        exists (
            select 1 from public.orders
            where orders.id = payments.order_id
            and (orders.customer_id = auth.uid() or public.is_admin())
        )
    );

create policy "Allow anyone to insert payments" on public.payments
    for insert with check (true);

-- --- REVIEWS POLICY ---
create policy "Allow public read access on Reviews" on public.reviews
    for select using (true);

create policy "Allow authenticated users to insert reviews" on public.reviews
    for insert with check (auth.role() = 'authenticated');

create policy "Allow users or admins to delete/edit reviews" on public.reviews
    for all using (auth.uid() = customer_id or public.is_admin());

-- --- WISHLIST POLICY ---
create policy "Allow users to manage own wishlist" on public.wishlist
    for all using (auth.uid() = user_id);

-- --- CART ITEMS POLICY ---
create policy "Allow users to manage own cart" on public.cart_items
    for all using (auth.uid() = user_id);

-- --- ADMIN SETTINGS POLICY ---
create policy "Allow public read access on Settings" on public.admin_settings
    for select using (true);

create policy "Allow Admins to update Settings" on public.admin_settings
    for update using (public.is_admin());


-- =========================================================================
-- STORAGE BUCKETS CONFIGURATION (STORAGE SCHEMAS & POLICIES)
-- =========================================================================

-- Create buckets via SQL if not exists
insert into storage.buckets (id, name, public)
values 
('product-images', 'product-images', true),
('customer-uploads', 'customer-uploads', true),
('banners', 'banners', true)
on conflict (id) do nothing;

-- Storage RLS Policies
create policy "Allow public read access to product-images" on storage.objects
    for select using (bucket_id = 'product-images');

create policy "Allow Admins to upload to product-images" on storage.objects
    for insert with check (bucket_id = 'product-images' and public.is_admin());

create policy "Allow Admins to delete/update product-images" on storage.objects
    for all using (bucket_id = 'product-images' and public.is_admin());

create policy "Allow anyone to upload to customer-uploads" on storage.objects
    for insert with check (bucket_id = 'customer-uploads');

create policy "Allow users to view customer-uploads" on storage.objects
    for select using (bucket_id = 'customer-uploads');

create policy "Allow public read access to banners" on storage.objects
    for select using (bucket_id = 'banners');

create policy "Allow Admins to update banners" on storage.objects
    for all using (bucket_id = 'banners' and public.is_admin());


-- =========================================================================
-- SEED INITIAL PRODUCTS (Matching Hema's Seed Data)
-- =========================================================================
insert into public.products (id, name, description, category, price, stock, images, rating, reviews_count, tag)
values
('prod-1', 'Cute Heart Penguin Keychain', 'Super glossy clay penguin holding a tiny red heart. Features a custom metal heart-shaped ring hook. Handcrafted with love in Marathahalli, Bengaluru.', 'Animal Series', 150, 12, array['https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80'], 4.8, 3, '100% Glossy Clay'),
('prod-2', 'handmade bunny charm', 'A super cute chubby white bunny with tiny hand-painted cheeks and a shiny glaze sealer. Elegant pick for phone charms and backpacks.', 'Animal Series', 150, 10, array['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80'], 4.9, 2, '100% Glossy Clay'),
('prod-3', 'Penguin charm', 'Handmade glossy baby penguin holding a yellow flower. Perfectly polished, water-resistant clay art.', 'Animal Series', 150, 10, array['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=80'], 4.7, 1, '100% Glossy Clay'),
('prod-4', 'Miniature Clay Donut', 'Glazed pink chocolate donut with micro sprinkles. Looks delicious but do not eat! Water-resistant coating.', 'Food Series', 150, 15, array['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80'], 4.9, 4, '100% Glossy Clay'),
('prod-5', 'Dreamy Cloud charm', 'Soft blue clay cloud with golden dangling star charm. Glossy, dreamy and perfect for keys.', 'Cosmic Series', 150, 8, array['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80'], 5.0, 1, '100% Glossy Clay'),
('prod-6', 'Starry Night Resin Orb', 'Premium crystal resin dome with embedded glitters and dark night blue pigments.', 'Cosmic Series', 150, 7, array['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&auto=format&fit=crop&q=80'], 4.6, 2, 'Premium Resin'),
('prod-7', 'Strawberries Clay Bucket', 'A super cute tiny bucket filled with hand-sculpted red strawberries. Finished with glossy high-gloss varnish.', 'Food Series', 150, 6, array['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80'], 5.0, 1, '100% Glossy Clay')
on conflict (id) do nothing;
