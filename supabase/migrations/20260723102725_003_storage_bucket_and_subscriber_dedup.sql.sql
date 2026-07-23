/*
# Storage bucket for site images + subscriber dedup

## Changes

1. Storage
   - Create a public bucket `site-images` for uploading home/estuaire images.
   - Policies: anyone can read; authenticated can upload/delete.

2. Subscribers
   - Add UNIQUE constraint on phone to prevent duplicate subscriptions.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_read_site_images_bucket" ON storage.objects;
CREATE POLICY "anon_read_site_images_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "auth_insert_site_images_bucket" ON storage.objects;
CREATE POLICY "auth_insert_site_images_bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images');

DROP POLICY IF EXISTS "auth_delete_site_images_bucket" ON storage.objects;
CREATE POLICY "auth_delete_site_images_bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-images');

-- Dedup subscribers by phone, keeping the earliest created row
DELETE FROM subscribers s
WHERE s.ctid NOT IN (
  SELECT min(s2.ctid) FROM subscribers s2 GROUP BY s2.phone
);

ALTER TABLE subscribers ADD CONSTRAINT subscribers_phone_unique UNIQUE (phone);
