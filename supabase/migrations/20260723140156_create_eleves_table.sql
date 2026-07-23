/*
# Create eleves table (single-tenant, no auth)

1. New Tables
- `eleves`
  - `id` (uuid, primary key, auto-generated)
  - `nom` (text, not null) — last name
  - `prenom` (text, not null) — first name
  - `classe` (text, not null) — class/grade
  - `matricule` (text, not null, unique) — student ID number
  - `created_at` (timestamptz, defaults to now())

2. Security
- Enable RLS on `eleves`.
- Allow anon + authenticated full CRUD because the data is intentionally shared/public (no sign-in screen).

3. Notes
- `matricule` has a UNIQUE constraint so duplicate student IDs are rejected at the database level.
- No `user_id` column — this is a single-tenant app with no authentication.
*/

CREATE TABLE IF NOT EXISTS eleves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  classe text NOT NULL,
  matricule text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE eleves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_eleves" ON eleves;
CREATE POLICY "anon_select_eleves" ON eleves FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_eleves" ON eleves;
CREATE POLICY "anon_insert_eleves" ON eleves FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_eleves" ON eleves;
CREATE POLICY "anon_update_eleves" ON eleves FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_eleves" ON eleves;
CREATE POLICY "anon_delete_eleves" ON eleves FOR DELETE
  TO anon, authenticated USING (true);
