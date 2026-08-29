-- HZCODE Migration 0008: Add scheduled_publish_at to all 11 publishable entity tables
-- In accordance with HZCODE Publishing Model v1 & Phase 7 Canonical Publishing Engine

DO $$
BEGIN
    -- 1. articles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'scheduled_publish_at') THEN
        ALTER TABLE "articles" ADD COLUMN "scheduled_publish_at" timestamp with time zone;
        CREATE INDEX IF NOT EXISTS "idx_articles_scheduled" ON "articles" ("publication_status", "scheduled_publish_at");
    END IF;

    -- 2. notes (TechNote)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'scheduled_publish_at') THEN
        ALTER TABLE "notes" ADD COLUMN "scheduled_publish_at" timestamp with time zone;
        CREATE INDEX IF NOT EXISTS "idx_notes_scheduled" ON "notes" ("publication_status", "scheduled_publish_at");
    END IF;

    -- 3. adrs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adrs' AND column_name = 'scheduled_publish_at') THEN
        ALTER TABLE "adrs" ADD COLUMN "scheduled_publish_at" timestamp with time zone;
        CREATE INDEX IF NOT EXISTS "idx_adrs_scheduled" ON "adrs" ("publication_status", "scheduled_publish_at");
    END IF;

    -- 4. journal_entries
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'scheduled_publish_at') THEN
        ALTER TABLE "journal_entries" ADD COLUMN "scheduled_publish_at" timestamp with time zone;
        CREATE INDEX IF NOT EXISTS "idx_journal_scheduled" ON "journal_entries" ("publication_status", "scheduled_publish_at");
    END IF;

    -- 5. projects
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'scheduled_publish_at') THEN
        ALTER TABLE "projects" ADD COLUMN "scheduled_publish_at" timestamp with time zone;
        CREATE INDEX IF NOT EXISTS "idx_projects_scheduled" ON "projects" ("publication_status", "scheduled_publish_at");
    END IF;

    -- 6. project_case_studies
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_case_studies' AND column_name = 'scheduled_publish_at') THEN
        ALTER TABLE "project_case_studies" ADD COLUMN "scheduled_publish_at" timestamp with time zone;
        CREATE INDEX IF NOT EXISTS "idx_case_studies_scheduled" ON "project_case_studies" ("publication_status", "scheduled_publish_at");
    END IF;

    -- 7. career_experiences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'career_experiences' AND column_name = 'scheduled_publish_at') THEN
        ALTER TABLE "career_experiences" ADD COLUMN "scheduled_publish_at" timestamp with time zone;
        CREATE INDEX IF NOT EXISTS "idx_career_scheduled" ON "career_experiences" ("publication_status", "scheduled_publish_at");
    END IF;

    -- 8. learning_paths
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_paths' AND column_name = 'scheduled_publish_at') THEN
        ALTER TABLE "learning_paths" ADD COLUMN "scheduled_publish_at" timestamp with time zone;
        CREATE INDEX IF NOT EXISTS "idx_learning_paths_scheduled" ON "learning_paths" ("publication_status", "scheduled_publish_at");
    END IF;

    -- 9. roadmap_items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roadmap_items' AND column_name = 'scheduled_publish_at') THEN
        ALTER TABLE "roadmap_items" ADD COLUMN "scheduled_publish_at" timestamp with time zone;
        CREATE INDEX IF NOT EXISTS "idx_roadmap_items_scheduled" ON "roadmap_items" ("publication_status", "scheduled_publish_at");
    END IF;

    -- 10. certificates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'scheduled_publish_at') THEN
        ALTER TABLE "certificates" ADD COLUMN "scheduled_publish_at" timestamp with time zone;
        CREATE INDEX IF NOT EXISTS "idx_certificates_scheduled" ON "certificates" ("publication_status", "scheduled_publish_at");
    END IF;

    -- 11. now_entries
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'now_entries' AND column_name = 'scheduled_publish_at') THEN
        ALTER TABLE "now_entries" ADD COLUMN "scheduled_publish_at" timestamp with time zone;
        CREATE INDEX IF NOT EXISTS "idx_now_entries_scheduled" ON "now_entries" ("publication_status", "scheduled_publish_at");
    END IF;
END $$;
