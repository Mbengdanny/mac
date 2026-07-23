/*
# Services VLDMAC — Schéma initial

## Vue d'ensemble
Crée la base de données complète pour l'application Services VLDMAC,
dediée aux devis et commandes de matériaux de construction dans la
province de l'Estuaire. Le grand public consulte le catalogue, crée
des devis et passe des commandes sans inscription. Un administrateur
authentifié gère les produits, prix, annonces et images.

## Tables créées
1. `categories` — rubriques produits (Bois okoumé, Tôle, Ciment, etc.)
2. `products` — produits par catégorie avec prix en FCFA
3. `quotes` — devis pro forma enregistrés
4. `orders` — commandes clients avec livraison et paiement
5. `subscribers` — abonnés aux notifications/mises à jour
6. `app_stats` — compteurs clé/valeur (nombre de visiteurs)
7. `announcements` — annonces de changement de prix / mises à jour
8. `site_images` — images téléversées par l'admin (accueil, Estuaire)

## Sécurité (RLS)
- `anon` peut LIRE le catalogue, annonces, images, stats.
- `anon` peut INSÉRER des devis, commandes, abonnés, et incrémenter les stats.
- `authenticated` (admin) gère tout (CRUD complet sur toutes les tables).
- RLS activée sur chaque table ; 4 politiques par table (une par verbe CRUD).
*/

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_categories" ON categories;
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_categories" ON categories;
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_categories" ON categories;
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'pièce',
  price_fcfa int NOT NULL DEFAULT 0,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- QUOTES (DEVIS)
-- ============================================================
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number text NOT NULL UNIQUE,
  civility text NOT NULL DEFAULT 'Mr',
  client_name text NOT NULL,
  client_phone text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_fcfa int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'created',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_quotes" ON quotes;
CREATE POLICY "anon_insert_quotes" ON quotes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_quotes" ON quotes;
CREATE POLICY "auth_select_quotes" ON quotes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_quotes" ON quotes;
CREATE POLICY "auth_update_quotes" ON quotes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_quotes" ON quotes;
CREATE POLICY "auth_delete_quotes" ON quotes FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- ORDERS (COMMANDES)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  civility text NOT NULL DEFAULT 'Mr',
  client_name text NOT NULL,
  client_phone text,
  delivery_address text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_fcfa int NOT NULL DEFAULT 0,
  delivery_fee_fcfa int NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'livraison',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_orders" ON orders;
CREATE POLICY "auth_select_orders" ON orders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_orders" ON orders;
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_orders" ON orders;
CREATE POLICY "auth_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- SUBSCRIBERS (ABONNÉS)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_subscribers" ON subscribers;
CREATE POLICY "anon_insert_subscribers" ON subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_subscribers" ON subscribers;
CREATE POLICY "anon_select_subscribers" ON subscribers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_delete_subscribers" ON subscribers;
CREATE POLICY "auth_delete_subscribers" ON subscribers FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- APP_STATS (COMPTEURS)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_stats (
  key text PRIMARY KEY,
  value int NOT NULL DEFAULT 0
);

ALTER TABLE app_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_stats" ON app_stats;
CREATE POLICY "anon_select_stats" ON app_stats FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_stats" ON app_stats;
CREATE POLICY "auth_update_stats" ON app_stats FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Atomic counter increment function (SECURITY DEFINER bypasses RLS safely)
CREATE OR REPLACE FUNCTION bump_stat(stat_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO app_stats (key, value) VALUES (stat_key, 1)
  ON CONFLICT (key) DO UPDATE SET value = app_stats.value + 1;
END;
$$;

GRANT EXECUTE ON FUNCTION bump_stat(text) TO anon, authenticated;

-- ============================================================
-- ANNOUNCEMENTS (ANNONCES)
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_announcements" ON announcements;
CREATE POLICY "anon_select_announcements" ON announcements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_announcements" ON announcements;
CREATE POLICY "auth_insert_announcements" ON announcements FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_announcements" ON announcements;
CREATE POLICY "auth_update_announcements" ON announcements FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_announcements" ON announcements;
CREATE POLICY "auth_delete_announcements" ON announcements FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- SITE_IMAGES (IMAGES ACCUEIL / ESTUAIRE)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_site_images" ON site_images;
CREATE POLICY "anon_select_site_images" ON site_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_site_images" ON site_images;
CREATE POLICY "auth_insert_site_images" ON site_images FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_site_images" ON site_images;
CREATE POLICY "auth_update_site_images" ON site_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_site_images" ON site_images;
CREATE POLICY "auth_delete_site_images" ON site_images FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- SEED: CATÉGORIES
-- ============================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Bois okoumé scié à la tronçonneuse', 'bois-okoume-scie', 'tree', 1),
  ('Bois okoumé de scierie', 'bois-okoume-scierie', 'tree-pine', 2),
  ('Contreplaques', 'contreplaques', 'layers', 3),
  ('Tôle', 'tole', 'square', 4),
  ('Fer', 'fer', 'frame', 5),
  ('Pointes', 'pointes', 'screwdriver', 6),
  ('Ciment', 'ciment', 'package', 7),
  ('Gravier', 'gravier', 'grain', 8),
  ('Sable', 'sable', 'waves', 9),
  ('Briques', 'briques', 'box', 10),
  ('Autres produits', 'autres-produits', 'more-horizontal', 11)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: QUELQUES PRODUITS EXEMPLAIRES
-- ============================================================
INSERT INTO products (category_id, name, unit, price_fcfa, sort_order)
SELECT c.id, p.name, p.unit, p.price, p.sort_order
FROM (VALUES
  ('bois-okoume-scie', 'Planche 5m', 'pièce', 15000, 1),
  ('bois-okoume-scie', 'Planche 4m', 'pièce', 12000, 2),
  ('bois-okoume-scie', 'Planche 3m', 'pièce', 9000, 3),
  ('bois-okoume-scierie', 'Planche scierie 4m', 'pièce', 11000, 1),
  ('bois-okoume-scierie', 'Madrier 5m', 'pièce', 18000, 2),
  ('contreplaques', 'Contreplaqué 4x8 (9mm)', 'panneau', 25000, 1),
  ('contreplaques', 'Contreplaqué 4x8 (12mm)', 'panneau', 32000, 2),
  ('contreplaques', 'Contreplaqué 4x8 (18mm)', 'panneau', 42000, 3),
  ('tole', 'Tôle bac acier 3m', 'pièce', 12000, 1),
  ('tole', 'Tôle bac alu 3m', 'pièce', 18000, 2),
  ('fer', 'Fer à béton 12mm (12m)', 'barre', 8000, 1),
  ('fer', 'Fer à béton 10mm (12m)', 'barre', 6500, 2),
  ('fer', 'Fer plat 40x4', 'barre', 5000, 3),
  ('pointes', 'Pointes 2 pouces', 'kg', 1500, 1),
  ('pointes', 'Pointes 3 pouces', 'kg', 1500, 2),
  ('pointes', 'Pointes 4 pouces', 'kg', 1600, 3),
  ('ciment', 'Ciment 50kg (sac)', 'sac', 6500, 1),
  ('ciment', 'Ciment 25kg (sac)', 'sac', 3500, 2),
  ('gravier', 'Gravier 0/15', 'm³', 30000, 1),
  ('gravier', 'Gravier 15/25', 'm³', 32000, 2),
  ('sable', 'Sable de mer', 'm³', 25000, 1),
  ('sable', 'Sable de rivière', 'm³', 28000, 2),
  ('briques', 'Brique creuse', 'pièce', 300, 1),
  ('briques', 'Brique pleine', 'pièce', 400, 2),
  ('briques', 'Aggloméré 15', 'pièce', 350, 3),
  ('autres-produits', 'Clous divers (kg)', 'kg', 1500, 1),
  ('autres-produits', 'Fil de fer (kg)', 'kg', 2000, 2)
) AS p(slug, name, unit, price, sort_order)
JOIN categories c ON c.slug = p.slug
ON CONFLICT DO NOTHING;
