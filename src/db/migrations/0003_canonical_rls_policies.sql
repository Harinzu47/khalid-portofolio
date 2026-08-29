-- ==============================================================================
-- Migration: 0003_canonical_rls_policies.sql
-- Description: Enable Row Level Security (RLS) on canonical tables and seed relationship types
-- ==============================================================================

-- 1. Enable RLS on all new canonical tables
ALTER TABLE "domains" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "domain_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_case_studies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_domains" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "adrs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "now_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "now_projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "now_domains" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "now_technologies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_paths" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_path_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_path_domains" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_path_technologies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "certificate_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "certificate_domains" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "certificate_technologies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "experience_projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "experience_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "experience_domains" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "experience_technologies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "article_domains" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "article_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "article_technologies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_domains" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "note_projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "note_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "note_domains" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "note_technologies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "note_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "relationship_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "relationship_type_compatibility" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_relationships" ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. PUBLIC READ POLICIES FOR CANONICAL TABLES
-- ==============================================================================

-- Domains
CREATE POLICY "Public Read Domains" ON "domains"
    FOR SELECT TO anon, authenticated
    USING ("visibility" = 'public' AND "archived_at" IS NULL);

CREATE POLICY "Public Read Domain Skills" ON "domain_skills"
    FOR SELECT TO anon, authenticated
    USING (true);

-- Project Case Studies
CREATE POLICY "Public Read Case Studies" ON "project_case_studies"
    FOR SELECT TO anon, authenticated
    USING ("visibility" = 'public' AND "publication_status" = 'published');

-- ADRs
CREATE POLICY "Public Read ADRs" ON "adrs"
    FOR SELECT TO anon, authenticated
    USING ("visibility" = 'public' AND "publication_status" = 'published');

-- Now Entries
CREATE POLICY "Public Read Now Entries" ON "now_entries"
    FOR SELECT TO anon, authenticated
    USING ("visibility" = 'public' AND "publication_status" = 'published');

-- Learning Paths
CREATE POLICY "Public Read Learning Paths" ON "learning_paths"
    FOR SELECT TO anon, authenticated
    USING ("visibility" = 'public' AND "publication_status" = 'published');

-- Semantic Graph Infrastructure
CREATE POLICY "Public Read Relationship Types" ON "relationship_types"
    FOR SELECT TO anon, authenticated
    USING ("is_public_eligible" = true AND "is_active" = true);

CREATE POLICY "Public Read Relationship Compatibility" ON "relationship_type_compatibility"
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public Read Knowledge Relationships" ON "knowledge_relationships"
    FOR SELECT TO anon, authenticated
    USING ("visibility" = 'public' AND "status" = 'active');

-- Structural Junctions Public Read
CREATE POLICY "Public Read Project Domains" ON "project_domains" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Project Tags" ON "project_tags" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Experience Projects" ON "experience_projects" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Experience Skills" ON "experience_skills" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Experience Domains" ON "experience_domains" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Experience Technologies" ON "experience_technologies" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Article Domains" ON "article_domains" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Article Skills" ON "article_skills" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Article Technologies" ON "article_technologies" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Journal Domains" ON "journal_domains" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Journal Skills" ON "journal_skills" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Note Projects" ON "note_projects" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Note Skills" ON "note_skills" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Note Domains" ON "note_domains" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Note Technologies" ON "note_technologies" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Note Tags" ON "note_tags" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Learning Path Skills" ON "learning_path_skills" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Learning Path Domains" ON "learning_path_domains" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Learning Path Technologies" ON "learning_path_technologies" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Certificate Skills" ON "certificate_skills" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Certificate Domains" ON "certificate_domains" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Certificate Technologies" ON "certificate_technologies" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Now Projects" ON "now_projects" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Now Domains" ON "now_domains" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Now Technologies" ON "now_technologies" FOR SELECT TO anon, authenticated USING (true);

-- ==============================================================================
-- 3. AUTHENTICATED OPERATOR WRITE POLICIES
-- ==============================================================================

CREATE POLICY "Operator All Domains" ON "domains" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Domain Skills" ON "domain_skills" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Case Studies" ON "project_case_studies" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All ADRs" ON "adrs" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Now Entries" ON "now_entries" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Learning Paths" ON "learning_paths" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Knowledge Relationships" ON "knowledge_relationships" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Relationship Types" ON "relationship_types" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Relationship Compatibility" ON "relationship_type_compatibility" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Junctions Operator All
CREATE POLICY "Operator All Project Domains" ON "project_domains" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Project Tags" ON "project_tags" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Experience Projects" ON "experience_projects" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Experience Skills" ON "experience_skills" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Experience Domains" ON "experience_domains" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Experience Technologies" ON "experience_technologies" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Article Domains" ON "article_domains" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Article Skills" ON "article_skills" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Article Technologies" ON "article_technologies" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Journal Domains" ON "journal_domains" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Journal Skills" ON "journal_skills" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Note Projects" ON "note_projects" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Note Skills" ON "note_skills" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Note Domains" ON "note_domains" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Note Technologies" ON "note_technologies" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Note Tags" ON "note_tags" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Learning Path Skills" ON "learning_path_skills" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Learning Path Domains" ON "learning_path_domains" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Learning Path Technologies" ON "learning_path_technologies" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Certificate Skills" ON "certificate_skills" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Certificate Domains" ON "certificate_domains" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Certificate Technologies" ON "certificate_technologies" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Now Projects" ON "now_projects" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Now Domains" ON "now_domains" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Now Technologies" ON "now_technologies" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ==============================================================================
-- 4. CANONICAL V1 SEMANTIC RELATIONSHIP TYPES SEED
-- ==============================================================================

INSERT INTO "relationship_types" ("id", "code", "name", "category", "inverse_label", "description", "directionality", "is_public_eligible", "is_active")
VALUES
    (gen_random_uuid(), 'DERIVED_INTO', 'Derived Into', 'EVOLUTION', 'Derived From', 'Source content evolved or was condensed into target artifact', 'DIRECTED', true, true),
    (gen_random_uuid(), 'BUILDS_ON', 'Builds On', 'EVOLUTION', 'Built Upon By', 'Target expands upon or extends concepts from source', 'DIRECTED', true, true),
    (gen_random_uuid(), 'EXPLAINS', 'Explains', 'NARRATIVE', 'Explained By', 'Source provides narrative explanation of target system/project', 'DIRECTED', true, true),
    (gen_random_uuid(), 'SUPPORTS', 'Supports', 'EVIDENCE', 'Supported By', 'Source provides architectural or factual evidence for target decision', 'DIRECTED', true, true),
    (gen_random_uuid(), 'REFERENCES', 'References', 'CITATION', 'Referenced By', 'Source directly cites or links to target knowledge', 'DIRECTED', true, true),
    (gen_random_uuid(), 'APPLIES_TO', 'Applies To', 'APPLICATION', 'Applied From', 'Technical guidance or note directly applies to target entity', 'DIRECTED', true, true),
    (gen_random_uuid(), 'LEARNS_THROUGH', 'Learns Through', 'GROWTH', 'Teaches In', 'Learning path or skill development achieved via target work', 'DIRECTED', true, true),
    (gen_random_uuid(), 'ORIGINATED_FROM', 'Originated From', 'PROVENANCE', 'Originated', 'Historical origin and inception context', 'DIRECTED', true, true)
ON CONFLICT ("code") DO NOTHING;
