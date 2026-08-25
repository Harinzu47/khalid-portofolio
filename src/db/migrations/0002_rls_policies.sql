-- ==============================================================================
-- Migration: 0002_rls_policies.sql
-- Description: Enable Row Level Security (RLS) and define fine-grained access policies
-- ==============================================================================

-- 1. Enable RLS on all 25 tables
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "career_experiences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "technologies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_technologies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "articles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "article_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "article_projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_technologies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "certificates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_goals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roadmap_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. PUBLIC READ POLICIES (Anonymous & Public Visitors)
-- ==============================================================================

-- Profiles & Socials
CREATE POLICY "Public Read Profiles" ON "profiles"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Social Links" ON "social_links"
    FOR SELECT TO anon, authenticated
    USING ("is_visible" = true);

-- Organizations & Career
CREATE POLICY "Public Read Organizations" ON "organizations"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Career Experiences" ON "career_experiences"
    FOR SELECT TO anon, authenticated
    USING ("deleted_at" IS NULL);

-- Projects & Taxonomy
CREATE POLICY "Public Read Projects" ON "projects"
    FOR SELECT TO anon, authenticated
    USING ("status" = 'completed' AND "published_at" IS NOT NULL AND "deleted_at" IS NULL);

CREATE POLICY "Public Read Technologies" ON "technologies"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Project Technologies" ON "project_technologies"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Skills" ON "skills"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Project Skills" ON "project_skills"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Project Links" ON "project_links"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Media" ON "media"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Project Media" ON "project_media"
    FOR SELECT TO anon, authenticated
    USING (true);

-- Articles
CREATE POLICY "Public Read Articles" ON "articles"
    FOR SELECT TO anon, authenticated
    USING ("status" = 'published' AND "published_at" IS NOT NULL AND "deleted_at" IS NULL);

-- Journal Entries (CRITICAL: Only public & published logs visible publicly)
CREATE POLICY "Public Read Journal" ON "journal_entries"
    FOR SELECT TO anon, authenticated
    USING ("status" = 'published' AND "visibility" = 'public' AND "published_at" IS NOT NULL AND "deleted_at" IS NULL);

-- Notes
CREATE POLICY "Public Read Notes" ON "notes"
    FOR SELECT TO anon, authenticated
    USING ("status" = 'published' AND "deleted_at" IS NULL);

-- Tags & Content Junctions
CREATE POLICY "Public Read Tags" ON "tags"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Article Tags" ON "article_tags"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Journal Tags" ON "journal_tags"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Article Projects" ON "article_projects"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Journal Projects" ON "journal_projects"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Journal Technologies" ON "journal_technologies"
    FOR SELECT TO anon, authenticated
    USING (true);

-- Learning & Credentials
CREATE POLICY "Public Read Certificates" ON "certificates"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Learning Goals" ON "learning_goals"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Roadmap Items" ON "roadmap_items"
    FOR SELECT TO anon, authenticated
    USING (true);

-- (Note: audit_logs intentionally has NO public read policy)

-- ==============================================================================
-- 3. AUTHENTICATED OPERATOR POLICIES (Full CRUD for Admin)
-- ==============================================================================

CREATE POLICY "Owner All Profiles" ON "profiles"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Social Links" ON "social_links"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Organizations" ON "organizations"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Career Experiences" ON "career_experiences"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Projects" ON "projects"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Technologies" ON "technologies"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Project Technologies" ON "project_technologies"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Skills" ON "skills"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Project Skills" ON "project_skills"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Project Links" ON "project_links"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Media" ON "media"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Project Media" ON "project_media"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Articles" ON "articles"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Journal" ON "journal_entries"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Notes" ON "notes"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Tags" ON "tags"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Article Tags" ON "article_tags"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Journal Tags" ON "journal_tags"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Article Projects" ON "article_projects"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Journal Projects" ON "journal_projects"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Journal Technologies" ON "journal_technologies"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Certificates" ON "certificates"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Learning Goals" ON "learning_goals"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Roadmap Items" ON "roadmap_items"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner All Audit Logs" ON "audit_logs"
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
