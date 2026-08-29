-- ==============================================================================
-- Migration: 0005_tightened_owner_rls.sql
-- Description: Tighten Row Level Security policies to enforce strict auth.uid() = owner_id
-- ==============================================================================

-- 1. Drop existing broad operator policies on owned tables
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND (policyname LIKE 'Operator All %' OR policyname LIKE 'Authenticated %')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 2. Drop existing public read policies to redefine with strict matrix
DROP POLICY IF EXISTS "Public Read Projects" ON "projects";
DROP POLICY IF EXISTS "Public Read Articles" ON "articles";
DROP POLICY IF EXISTS "Public Read Journal Entries" ON "journal_entries";
DROP POLICY IF EXISTS "Public Read Notes" ON "notes";
DROP POLICY IF EXISTS "Public Read Domains" ON "domains";
DROP POLICY IF EXISTS "Public Read Skills" ON "skills";
DROP POLICY IF EXISTS "Public Read Technologies" ON "technologies";
DROP POLICY IF EXISTS "Public Read Tags" ON "tags";
DROP POLICY IF EXISTS "Public Read Case Studies" ON "project_case_studies";
DROP POLICY IF EXISTS "Public Read ADRs" ON "adrs";
DROP POLICY IF EXISTS "Public Read Now Entries" ON "now_entries";
DROP POLICY IF EXISTS "Public Read Learning Paths" ON "learning_paths";
DROP POLICY IF EXISTS "Public Read Roadmap Items" ON "roadmap_items";
DROP POLICY IF EXISTS "Public Read Certificates" ON "certificates";
DROP POLICY IF EXISTS "Public Read Organizations" ON "organizations";
DROP POLICY IF EXISTS "Public Read Career Experiences" ON "career_experiences";
DROP POLICY IF EXISTS "Public Read Profiles" ON "profiles";
DROP POLICY IF EXISTS "Public Read Knowledge Relationships" ON "knowledge_relationships";

-- ==============================================================================
-- 3. PROFILES & ORGANIZATIONS
-- ==============================================================================

CREATE POLICY "Read Profiles" ON "profiles"
    FOR SELECT TO anon, authenticated
    USING ("visibility" = 'public' OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Profiles" ON "profiles"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Profiles" ON "profiles"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Profiles" ON "profiles"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

CREATE POLICY "Read Organizations" ON "organizations"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Organizations" ON "organizations"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Organizations" ON "organizations"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Organizations" ON "organizations"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

CREATE POLICY "Read Career Experiences" ON "career_experiences"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "publication_status" = 'published' AND "deleted_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Career Experiences" ON "career_experiences"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Career Experiences" ON "career_experiences"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Career Experiences" ON "career_experiences"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- ==============================================================================
-- 4. PUBLISHABLE ENTITIES (Matrix: PUBLIC+PUBLISHED OR OWNER)
-- ==============================================================================

-- Projects
CREATE POLICY "Read Projects" ON "projects"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "publication_status" = 'published' AND "deleted_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Projects" ON "projects"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Projects" ON "projects"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Projects" ON "projects"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Project Case Studies
CREATE POLICY "Read Project Case Studies" ON "project_case_studies"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "publication_status" = 'published' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Project Case Studies" ON "project_case_studies"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Project Case Studies" ON "project_case_studies"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Project Case Studies" ON "project_case_studies"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Articles
CREATE POLICY "Read Articles" ON "articles"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "publication_status" = 'published' AND "deleted_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Articles" ON "articles"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Articles" ON "articles"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Articles" ON "articles"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Journal Entries
CREATE POLICY "Read Journal Entries" ON "journal_entries"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "publication_status" = 'published' AND "deleted_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Journal Entries" ON "journal_entries"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Journal Entries" ON "journal_entries"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Journal Entries" ON "journal_entries"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Tech Notes
CREATE POLICY "Read Notes" ON "notes"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "publication_status" = 'published' AND "deleted_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Notes" ON "notes"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Notes" ON "notes"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Notes" ON "notes"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- ADRs
CREATE POLICY "Read ADRs" ON "adrs"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "publication_status" = 'published' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert ADRs" ON "adrs"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update ADRs" ON "adrs"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete ADRs" ON "adrs"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Learning Paths
CREATE POLICY "Read Learning Paths" ON "learning_paths"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "publication_status" = 'published' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Learning Paths" ON "learning_paths"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Learning Paths" ON "learning_paths"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Learning Paths" ON "learning_paths"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Roadmap Items
CREATE POLICY "Read Roadmap Items" ON "roadmap_items"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "publication_status" = 'published' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Roadmap Items" ON "roadmap_items"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Roadmap Items" ON "roadmap_items"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Roadmap Items" ON "roadmap_items"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Certificates
CREATE POLICY "Read Certificates" ON "certificates"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "publication_status" = 'published' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Certificates" ON "certificates"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Certificates" ON "certificates"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Certificates" ON "certificates"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Now Entries
CREATE POLICY "Read Now Entries" ON "now_entries"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "publication_status" = 'published' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Now Entries" ON "now_entries"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Now Entries" ON "now_entries"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Now Entries" ON "now_entries"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- ==============================================================================
-- 5. PUBLIC TAXONOMY ENTITIES (Matrix: PUBLIC+ACTIVE OR OWNER)
-- ==============================================================================

-- Domains
CREATE POLICY "Read Domains" ON "domains"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Domains" ON "domains"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Domains" ON "domains"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Domains" ON "domains"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Skills
CREATE POLICY "Read Skills" ON "skills"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Skills" ON "skills"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Skills" ON "skills"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Skills" ON "skills"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Technologies
CREATE POLICY "Read Technologies" ON "technologies"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Technologies" ON "technologies"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Technologies" ON "technologies"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Technologies" ON "technologies"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Tags
CREATE POLICY "Read Tags" ON "tags"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Tags" ON "tags"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Tags" ON "tags"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Tags" ON "tags"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Media
CREATE POLICY "Read Media" ON "media"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Media" ON "media"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Media" ON "media"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Media" ON "media"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");

-- Knowledge Relationships
CREATE POLICY "Read Knowledge Relationships" ON "knowledge_relationships"
    FOR SELECT TO anon, authenticated
    USING (("visibility" = 'public' AND "status" = 'active' AND "archived_at" IS NULL) OR auth.uid() = "owner_id");

CREATE POLICY "Owner Insert Knowledge Relationships" ON "knowledge_relationships"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Update Knowledge Relationships" ON "knowledge_relationships"
    FOR UPDATE TO authenticated
    USING (auth.uid() = "owner_id")
    WITH CHECK (auth.uid() = "owner_id");

CREATE POLICY "Owner Delete Knowledge Relationships" ON "knowledge_relationships"
    FOR DELETE TO authenticated
    USING (auth.uid() = "owner_id");
