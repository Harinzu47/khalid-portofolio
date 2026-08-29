-- Phase 8: Canonical Media & Storage Security Migration
-- Target: Reconciliation of portfolio storage bucket, storage.objects RLS, and public.media RLS

-- 1. Create or Reconcile Canonical Storage Bucket 'portfolio' (Private by default)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  false,
  26214400, -- 25 MB max document limit (application policy enforces 10 MB for images, 25 MB for docs)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  updated_at = now();

-- Clean up empty legacy bucket 'portfolio-media' if it contains 0 objects
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'portfolio-media') THEN
    IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'portfolio-media') THEN
      PERFORM set_config('storage.allow_delete_query', 'true', true);
      DELETE FROM storage.buckets WHERE id = 'portfolio-media';
    END IF;
  END IF;
END $$;

-- 2. Clean up existing storage.objects policies for portfolio bucket to ensure clean state
DROP POLICY IF EXISTS "portfolio_owner_select_objects" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_owner_insert_objects" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_owner_update_objects" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_owner_delete_objects" ON storage.objects;
DROP POLICY IF EXISTS "owner_select_portfolio_objects" ON storage.objects;
DROP POLICY IF EXISTS "owner_insert_portfolio_objects" ON storage.objects;
DROP POLICY IF EXISTS "owner_update_portfolio_objects" ON storage.objects;
DROP POLICY IF EXISTS "owner_delete_portfolio_objects" ON storage.objects;

-- 3. Apply Storage Object Owner-Isolated Policies
-- SELECT Policy: Authenticated owner can read objects in their ownerId path segment
CREATE POLICY "portfolio_owner_select_objects"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portfolio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- INSERT Policy: Authenticated owner can insert objects only into their ownerId path segment
CREATE POLICY "portfolio_owner_insert_objects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE Policy: Authenticated owner can update objects only in their ownerId path segment
CREATE POLICY "portfolio_owner_update_objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'portfolio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE Policy: Authenticated owner can delete objects only in their ownerId path segment
CREATE POLICY "portfolio_owner_delete_objects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Reconcile public.media RLS Policies
-- Remove all legacy and insecure policies
DROP POLICY IF EXISTS "Public Read Media" ON public.media;
DROP POLICY IF EXISTS "Owner All Media" ON public.media;
DROP POLICY IF EXISTS "Read Media" ON public.media;
DROP POLICY IF EXISTS "Owner Insert Media" ON public.media;
DROP POLICY IF EXISTS "Owner Update Media" ON public.media;
DROP POLICY IF EXISTS "Owner Delete Media" ON public.media;
DROP POLICY IF EXISTS "media_select_policy" ON public.media;
DROP POLICY IF EXISTS "media_insert_policy" ON public.media;
DROP POLICY IF EXISTS "media_update_policy" ON public.media;
DROP POLICY IF EXISTS "media_delete_policy" ON public.media;

-- Ensure RLS and FORCE RLS are active on public.media
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media FORCE ROW LEVEL SECURITY;

-- Canonical SELECT Policy:
-- Public can read ONLY public, non-archived media. Owner can read all their own media.
CREATE POLICY "media_select_policy"
ON public.media FOR SELECT
TO anon, authenticated
USING (
  (visibility = 'public' AND archived_at IS NULL)
  OR (auth.uid() = owner_id)
);

-- Canonical INSERT Policy:
-- Owner can insert media only with their own owner_id.
CREATE POLICY "media_insert_policy"
ON public.media FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Canonical UPDATE Policy:
-- Owner can update media only with their own owner_id.
CREATE POLICY "media_update_policy"
ON public.media FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Canonical DELETE Policy:
-- Owner can delete media only with their own owner_id.
CREATE POLICY "media_delete_policy"
ON public.media FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);
