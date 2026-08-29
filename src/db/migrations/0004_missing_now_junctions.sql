-- ==============================================================================
-- Migration: 0004_missing_now_junctions.sql
-- Description: Add missing canonical now_learning_paths and now_roadmaps junction tables
-- ==============================================================================

CREATE TABLE IF NOT EXISTS "now_learning_paths" (
	"now_id" uuid NOT NULL REFERENCES "now_entries"("id") ON DELETE CASCADE,
	"learning_path_id" uuid NOT NULL REFERENCES "learning_paths"("id") ON DELETE CASCADE,
	CONSTRAINT "now_learning_paths_now_id_learning_path_id_pk" PRIMARY KEY("now_id", "learning_path_id")
);

CREATE TABLE IF NOT EXISTS "now_roadmaps" (
	"now_id" uuid NOT NULL REFERENCES "now_entries"("id") ON DELETE CASCADE,
	"roadmap_id" uuid NOT NULL REFERENCES "roadmap_items"("id") ON DELETE CASCADE,
	CONSTRAINT "now_roadmaps_now_id_roadmap_id_pk" PRIMARY KEY("now_id", "roadmap_id")
);

ALTER TABLE "now_learning_paths" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "now_roadmaps" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Now Learning Paths" ON "now_learning_paths" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Now Roadmaps" ON "now_roadmaps" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Operator All Now Learning Paths" ON "now_learning_paths" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Operator All Now Roadmaps" ON "now_roadmaps" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
