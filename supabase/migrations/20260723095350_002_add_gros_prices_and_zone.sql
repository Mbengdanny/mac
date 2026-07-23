/*
# Ajout rubrique "Prix de gros" + colonne prix de gros sur les produits

## Changements
1. Ajoute une colonne `price_gros_fcfa` (int, default 0) sur la table `products`
   pour stocker le prix de gros (wholesale) à côté du prix de détail.
2. Ajoute une nouvelle catégorie "Prix de gros" (slug: prix-de-gros) dans `categories`.
3. Met à jour quelques produits existants avec un prix de gros indicatif
   (généralement ~15% de remise sur le prix de détail).
4. Ajoute quelques produits spécifiques à la rubrique "Prix de gros".

## Sécurité
- Aucun changement de politique RLS — la nouvelle colonne est couverte
  par les politiques existantes sur `products`.
*/

-- 1. Colonne prix de gros
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_gros_fcfa int NOT NULL DEFAULT 0;

-- 2. Nouvelle catégorie "Prix de gros"
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Prix de gros', 'prix-de-gros', 'tags', 12)
ON CONFLICT (slug) DO NOTHING;

-- 3. Prix de gros indicatifs sur des produits existants (remise ~15%)
UPDATE products SET price_gros_fcfa = ROUND(price_fcfa * 0.85)
WHERE price_gros_fcfa = 0 AND price_fcfa > 1000;

-- 4. Quelques produits spécifiques à la rubrique Prix de gros
INSERT INTO products (category_id, name, unit, price_fcfa, price_gros_fcfa, sort_order, description)
SELECT c.id, p.name, p.unit, p.price, p.gros, p.sort_order, p.descr
FROM (VALUES
  ('prix-de-gros', 'Ciment 50kg — lot de 50 sacs', 'lot', 295000, 280000, 1, 'Prix de gros — 50 sacs de ciment 50kg'),
  ('prix-de-gros', 'Fer à béton 12mm — lot de 100 barres', 'lot', 680000, 640000, 2, 'Prix de gros — 100 barres de fer 12mm'),
  ('prix-de-gros', 'Brique creuse — lot de 500', 'lot', 135000, 125000, 3, 'Prix de gros — 500 briques creuses'),
  ('prix-de-gros', 'Tôle bac acier — lot de 50', 'lot', 540000, 510000, 4, 'Prix de gros — 50 tôles bac acier 3m'),
  ('prix-de-gros', 'Sable de rivière — 10 m³', 'lot', 250000, 235000, 5, 'Prix de gros — 10 m³ de sable de rivière'),
  ('prix-de-gros', 'Gravier 0/15 — 10 m³', 'lot', 270000, 255000, 6, 'Prix de gros — 10 m³ de gravier'),
  ('prix-de-gros', 'Pointes 3 pouces — sac de 50kg', 'sac', 65000, 60000, 7, 'Prix de gros — sac de 50kg de pointes')
) AS p(slug, name, unit, price, gros, sort_order, descr)
JOIN categories c ON c.slug = p.slug
ON CONFLICT DO NOTHING;
