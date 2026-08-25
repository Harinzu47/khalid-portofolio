CREATE INDEX "idx_career_start_date" ON "career_experiences" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_projects_feed" ON "projects" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "idx_projects_featured" ON "projects" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "idx_articles_feed" ON "articles" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "idx_journal_feed" ON "journal_entries" USING btree ("status","visibility","entry_date");--> statement-breakpoint
CREATE INDEX "idx_journal_date" ON "journal_entries" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "idx_notes_status" ON "notes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_certificates_issued" ON "certificates" USING btree ("issued_at");--> statement-breakpoint
CREATE INDEX "idx_learning_goals_status" ON "learning_goals" USING btree ("status","priority");--> statement-breakpoint
CREATE INDEX "idx_roadmap_items_status" ON "roadmap_items" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "idx_audit_entity" ON "audit_logs" USING btree ("entity_type","entity_id","created_at");