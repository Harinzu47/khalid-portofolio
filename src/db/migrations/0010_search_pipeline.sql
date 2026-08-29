-- Phase 9: Canonical Search Engine & Discovery Pipeline Migration
-- Sets up search_documents projection table, pg_trgm extension, GIN indexes, and RLS policies.

-- 1. Ensure pg_trgm extension exists for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create search_documents projection table
CREATE TABLE IF NOT EXISTS public.search_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  entity_type varchar(50) NOT NULL,
  entity_id uuid NOT NULL,
  title text NOT NULL,
  slug text,
  summary text,
  body_text text,
  visibility varchar(30) NOT NULL,
  publication_status varchar(30),
  published_at timestamp with time zone,
  archived_at timestamp with time zone,
  source_updated_at timestamp with time zone NOT NULL,
  indexed_at timestamp with time zone NOT NULL DEFAULT now(),
  projection_version integer NOT NULL DEFAULT 1,
  taxonomy jsonb,
  exact_terms text[] NOT NULL DEFAULT '{}'::text[],
  search_vector tsvector,
  CONSTRAINT uq_search_doc_entity UNIQUE (owner_id, entity_type, entity_id)
);

-- 3. GIN and B-Tree Indexes
CREATE INDEX IF NOT EXISTS search_documents_vector_idx 
ON public.search_documents USING gin (search_vector);

CREATE INDEX IF NOT EXISTS search_documents_title_trgm_idx 
ON public.search_documents USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS search_documents_owner_vis_pub_idx 
ON public.search_documents (owner_id, visibility, publication_status);

CREATE INDEX IF NOT EXISTS search_documents_type_vis_idx 
ON public.search_documents (entity_type, visibility);

-- 4. Row Level Security on search_documents
ALTER TABLE public.search_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_documents FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "search_documents_public_select" ON public.search_documents;
DROP POLICY IF EXISTS "search_documents_owner_all" ON public.search_documents;

-- Public can SELECT ONLY published, public, non-archived documents whose published_at is past or current
CREATE POLICY "search_documents_public_select"
ON public.search_documents FOR SELECT
TO anon, authenticated
USING (
  visibility = 'public' 
  AND publication_status = 'published' 
  AND published_at <= now() 
  AND archived_at IS NULL
);

-- Owner has full access to their own search documents
CREATE POLICY "search_documents_owner_all"
ON public.search_documents FOR ALL
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);
