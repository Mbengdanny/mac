/*
# Create eleves table (single-tenant, no auth)

1. New Tables
- `eleves`
- `id` (uuid, primary key, auto-generated)
- `nom` (text, not null) — last name of the student
- `prenom` (text, not null) — first name of the student
- `classe` (text, not null) — class/grade of the student
- `matricule` (text, unique, not null) — unique student registration number
- `created_at` (timestamptz, defaults to now())

2. Security
- Enable RLS on `eleves`.
- Allow anon + authenticated full CRUD because this is a single-tenant app with no sign-in.
- Four separate policies: SELECT, INSERT, UPDATE, DELETE.

3. Notes
- `matricule` has a UNIQUE constraint to prevent duplicate registration numbers.
- No user_id column — the app has no authentication flow.
*/

CREATE TABLE IF NOT EXISTS eleves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  classe text NOT NULL,
  matricule text UNIQUE NOT NULL,
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
