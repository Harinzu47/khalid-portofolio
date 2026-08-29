CREATE TYPE "public"."adr_status" AS ENUM('proposed', 'accepted', 'superseded', 'rejected', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."learning_status" AS ENUM('planned', 'active', 'paused', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."now_entry_status" AS ENUM('active', 'idle', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."now_entry_type" AS ENUM('building', 'learning', 'managing', 'researching', 'reading', 'watching', 'exploring', 'using');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('idea', 'planning', 'active', 'maintained', 'completed', 'archived', 'experimental');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'review', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."visibility_status" AS ENUM('private', 'unlisted', 'public');--> statement-breakpoint
CREATE TABLE "experience_domains" (
	"experience_id" uuid NOT NULL,
	"domain_id" uuid NOT NULL,
	CONSTRAINT "experience_domains_experience_id_domain_id_pk" PRIMARY KEY("experience_id","domain_id")
);
--> statement-breakpoint
CREATE TABLE "experience_projects" (
	"experience_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	CONSTRAINT "experience_projects_experience_id_project_id_pk" PRIMARY KEY("experience_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "experience_skills" (
	"experience_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "experience_skills_experience_id_skill_id_pk" PRIMARY KEY("experience_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "experience_technologies" (
	"experience_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "experience_technologies_experience_id_technology_id_pk" PRIMARY KEY("experience_id","technology_id")
);
--> statement-breakpoint
CREATE TABLE "domain_skills" (
	"domain_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "domain_skills_domain_id_skill_id_pk" PRIMARY KEY("domain_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visibility" varchar(30) DEFAULT 'private' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "domains_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "project_domains" (
	"project_id" uuid NOT NULL,
	"domain_id" uuid NOT NULL,
	CONSTRAINT "project_domains_project_id_domain_id_pk" PRIMARY KEY("project_id","domain_id")
);
--> statement-breakpoint
CREATE TABLE "project_case_studies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"project_id" uuid NOT NULL,
	"title" varchar(255),
	"subtitle" varchar(255),
	"executive_summary" text,
	"problem_statement" text,
	"objectives" jsonb,
	"constraints" jsonb,
	"architecture" jsonb,
	"implementation" jsonb,
	"tradeoffs" jsonb,
	"challenges" jsonb,
	"results" jsonb,
	"reflection" jsonb,
	"content_blocks" jsonb,
	"visibility" varchar(30) DEFAULT 'private' NOT NULL,
	"publication_status" varchar(30) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_case_studies_project_id_unique" UNIQUE("project_id"),
	CONSTRAINT "chk_case_study_visibility" CHECK ("project_case_studies"."visibility" IN ('private', 'unlisted', 'public')),
	CONSTRAINT "chk_case_study_pub_status" CHECK ("project_case_studies"."publication_status" IN ('draft', 'review', 'scheduled', 'published', 'archived'))
);
--> statement-breakpoint
CREATE TABLE "article_domains" (
	"article_id" uuid NOT NULL,
	"domain_id" uuid NOT NULL,
	CONSTRAINT "article_domains_article_id_domain_id_pk" PRIMARY KEY("article_id","domain_id")
);
--> statement-breakpoint
CREATE TABLE "article_skills" (
	"article_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "article_skills_article_id_skill_id_pk" PRIMARY KEY("article_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "article_technologies" (
	"article_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "article_technologies_article_id_technology_id_pk" PRIMARY KEY("article_id","technology_id")
);
--> statement-breakpoint
CREATE TABLE "journal_domains" (
	"journal_id" uuid NOT NULL,
	"domain_id" uuid NOT NULL,
	CONSTRAINT "journal_domains_journal_id_domain_id_pk" PRIMARY KEY("journal_id","domain_id")
);
--> statement-breakpoint
CREATE TABLE "journal_skills" (
	"journal_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "journal_skills_journal_id_skill_id_pk" PRIMARY KEY("journal_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "note_domains" (
	"note_id" uuid NOT NULL,
	"domain_id" uuid NOT NULL,
	CONSTRAINT "note_domains_note_id_domain_id_pk" PRIMARY KEY("note_id","domain_id")
);
--> statement-breakpoint
CREATE TABLE "note_projects" (
	"note_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	CONSTRAINT "note_projects_note_id_project_id_pk" PRIMARY KEY("note_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "note_skills" (
	"note_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "note_skills_note_id_skill_id_pk" PRIMARY KEY("note_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "note_tags" (
	"note_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "note_tags_note_id_tag_id_pk" PRIMARY KEY("note_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "note_technologies" (
	"note_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "note_technologies_note_id_technology_id_pk" PRIMARY KEY("note_id","technology_id")
);
--> statement-breakpoint
CREATE TABLE "project_tags" (
	"project_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "project_tags_project_id_tag_id_pk" PRIMARY KEY("project_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "adrs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"project_id" uuid,
	"number" integer,
	"title" varchar(255) NOT NULL,
	"slug" varchar(280) NOT NULL,
	"status" varchar(30) DEFAULT 'proposed' NOT NULL,
	"context" text,
	"decision" text,
	"alternatives" jsonb,
	"consequences" jsonb,
	"superseded_by_id" uuid,
	"visibility" varchar(30) DEFAULT 'private' NOT NULL,
	"publication_status" varchar(30) DEFAULT 'draft' NOT NULL,
	"decided_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "adrs_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_adr_status" CHECK ("adrs"."status" IN ('proposed', 'accepted', 'superseded', 'rejected', 'deprecated')),
	CONSTRAINT "chk_adr_visibility" CHECK ("adrs"."visibility" IN ('private', 'unlisted', 'public')),
	CONSTRAINT "chk_adr_pub_status" CHECK ("adrs"."publication_status" IN ('draft', 'review', 'scheduled', 'published', 'archived'))
);
--> statement-breakpoint
CREATE TABLE "certificate_domains" (
	"certificate_id" uuid NOT NULL,
	"domain_id" uuid NOT NULL,
	CONSTRAINT "certificate_domains_certificate_id_domain_id_pk" PRIMARY KEY("certificate_id","domain_id")
);
--> statement-breakpoint
CREATE TABLE "certificate_skills" (
	"certificate_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "certificate_skills_certificate_id_skill_id_pk" PRIMARY KEY("certificate_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "certificate_technologies" (
	"certificate_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "certificate_technologies_certificate_id_technology_id_pk" PRIMARY KEY("certificate_id","technology_id")
);
--> statement-breakpoint
CREATE TABLE "learning_path_domains" (
	"learning_path_id" uuid NOT NULL,
	"domain_id" uuid NOT NULL,
	CONSTRAINT "learning_path_domains_learning_path_id_domain_id_pk" PRIMARY KEY("learning_path_id","domain_id")
);
--> statement-breakpoint
CREATE TABLE "learning_path_skills" (
	"learning_path_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "learning_path_skills_learning_path_id_skill_id_pk" PRIMARY KEY("learning_path_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "learning_path_technologies" (
	"learning_path_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "learning_path_technologies_learning_path_id_technology_id_pk" PRIMARY KEY("learning_path_id","technology_id")
);
--> statement-breakpoint
CREATE TABLE "learning_paths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"title" varchar(255) NOT NULL,
	"slug" varchar(280) NOT NULL,
	"summary" text,
	"status" varchar(30) DEFAULT 'planned' NOT NULL,
	"started_at" date,
	"completed_at" date,
	"progress_mode" varchar(30),
	"progress_value" integer,
	"current_focus" text,
	"content" jsonb,
	"visibility" varchar(30) DEFAULT 'private' NOT NULL,
	"publication_status" varchar(30) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learning_paths_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_learning_path_status" CHECK ("learning_paths"."status" IN ('planned', 'active', 'paused', 'completed', 'archived')),
	CONSTRAINT "chk_learning_path_visibility" CHECK ("learning_paths"."visibility" IN ('private', 'unlisted', 'public')),
	CONSTRAINT "chk_learning_path_pub_status" CHECK ("learning_paths"."publication_status" IN ('draft', 'review', 'scheduled', 'published', 'archived')),
	CONSTRAINT "chk_learning_path_dates" CHECK ("learning_paths"."completed_at" IS NULL OR "learning_paths"."started_at" IS NULL OR "learning_paths"."completed_at" >= "learning_paths"."started_at")
);
--> statement-breakpoint
CREATE TABLE "now_domains" (
	"now_id" uuid NOT NULL,
	"domain_id" uuid NOT NULL,
	CONSTRAINT "now_domains_now_id_domain_id_pk" PRIMARY KEY("now_id","domain_id")
);
--> statement-breakpoint
CREATE TABLE "now_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"entry_type" varchar(40) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"started_at" date,
	"ended_at" date,
	"is_current" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visibility" varchar(30) DEFAULT 'private' NOT NULL,
	"publication_status" varchar(30) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_now_entry_type" CHECK ("now_entries"."entry_type" IN ('building', 'learning', 'managing', 'researching', 'reading', 'watching', 'exploring', 'using')),
	CONSTRAINT "chk_now_status" CHECK ("now_entries"."status" IN ('active', 'idle', 'completed', 'archived')),
	CONSTRAINT "chk_now_visibility" CHECK ("now_entries"."visibility" IN ('private', 'unlisted', 'public')),
	CONSTRAINT "chk_now_pub_status" CHECK ("now_entries"."publication_status" IN ('draft', 'review', 'scheduled', 'published', 'archived')),
	CONSTRAINT "chk_now_dates" CHECK ("now_entries"."ended_at" IS NULL OR "now_entries"."started_at" IS NULL OR "now_entries"."ended_at" >= "now_entries"."started_at")
);
--> statement-breakpoint
CREATE TABLE "now_projects" (
	"now_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	CONSTRAINT "now_projects_now_id_project_id_pk" PRIMARY KEY("now_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "now_technologies" (
	"now_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "now_technologies_now_id_technology_id_pk" PRIMARY KEY("now_id","technology_id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"relationship_type_id" uuid NOT NULL,
	"source_type" varchar(60) NOT NULL,
	"source_id" uuid NOT NULL,
	"target_type" varchar(60) NOT NULL,
	"target_id" uuid NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visibility" varchar(30) DEFAULT 'private' NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_knowledge_edge" UNIQUE("relationship_type_id","source_type","source_id","target_type","target_id"),
	CONSTRAINT "chk_no_self_edge" CHECK ("knowledge_relationships"."source_id" <> "knowledge_relationships"."target_id" OR "knowledge_relationships"."source_type" <> "knowledge_relationships"."target_type"),
	CONSTRAINT "chk_rel_visibility" CHECK ("knowledge_relationships"."visibility" IN ('private', 'unlisted', 'public')),
	CONSTRAINT "chk_rel_status" CHECK ("knowledge_relationships"."status" IN ('active', 'archived'))
);
--> statement-breakpoint
CREATE TABLE "relationship_type_compatibility" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"relationship_type_id" uuid NOT NULL,
	"source_type" varchar(60) NOT NULL,
	"target_type" varchar(60) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_rel_type_compat" UNIQUE("relationship_type_id","source_type","target_type")
);
--> statement-breakpoint
CREATE TABLE "relationship_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(60) NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"inverse_label" varchar(100) NOT NULL,
	"description" text,
	"directionality" varchar(30) DEFAULT 'DIRECTED' NOT NULL,
	"is_public_eligible" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "relationship_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "chk_project_status";--> statement-breakpoint
DROP INDEX "idx_projects_feed";--> statement-breakpoint
DROP INDEX "idx_articles_feed";--> statement-breakpoint
DROP INDEX "idx_journal_feed";--> statement-breakpoint
DROP INDEX "idx_notes_status";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "timezone" varchar(100);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "availability_status" varchar(100);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email_public" varchar(150);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "github_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "linkedin_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "contact_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "principles" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "working_modes" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "curiosities" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "manifest_lines" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "visibility" varchar(30) DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "career_experiences" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "career_experiences" ADD COLUMN "responsibilities" jsonb;--> statement-breakpoint
ALTER TABLE "career_experiences" ADD COLUMN "visibility" varchar(30) DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "career_experiences" ADD COLUMN "publication_status" varchar(30) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "career_experiences" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "career_experiences" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "organization_type" varchar(50);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "location" varchar(150);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "visibility" varchar(30) DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "storage_bucket" varchar(100) DEFAULT 'portfolio' NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "caption" text;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "visibility" varchar(30) DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_type" varchar(50);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "role_summary" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "visibility" varchar(30) DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "publication_status" varchar(30) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "visibility" varchar(30) DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "technologies" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "technologies" ADD COLUMN "technology_type" varchar(50);--> statement-breakpoint
ALTER TABLE "technologies" ADD COLUMN "visibility" varchar(30) DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "technologies" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "subtitle" varchar(255);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "visibility" varchar(30) DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "publication_status" varchar(30) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "reading_time_minutes" integer;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "last_reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "publication_status" varchar(30) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "ended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "session_number" integer;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "work_state" varchar(50);--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "difficulty" varchar(30);--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "verification_status" varchar(30);--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "last_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "tested_versions" jsonb;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "visibility" varchar(30) DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "publication_status" varchar(30) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "visibility" varchar(30) DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "verification_status" varchar(50);--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "visibility" varchar(30) DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "publication_status" varchar(30) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "learning_goals" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD COLUMN "slug" varchar(280);--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD COLUMN "roadmap_type" varchar(50);--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD COLUMN "start_date" date;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD COLUMN "content" jsonb;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD COLUMN "visibility" varchar(30) DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD COLUMN "publication_status" varchar(30) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "experience_domains" ADD CONSTRAINT "experience_domains_experience_id_career_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."career_experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_domains" ADD CONSTRAINT "experience_domains_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_projects" ADD CONSTRAINT "experience_projects_experience_id_career_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."career_experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_projects" ADD CONSTRAINT "experience_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_skills" ADD CONSTRAINT "experience_skills_experience_id_career_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."career_experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_skills" ADD CONSTRAINT "experience_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_experience_id_career_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."career_experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_skills" ADD CONSTRAINT "domain_skills_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_skills" ADD CONSTRAINT "domain_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_domains" ADD CONSTRAINT "project_domains_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_domains" ADD CONSTRAINT "project_domains_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_case_studies" ADD CONSTRAINT "project_case_studies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_domains" ADD CONSTRAINT "article_domains_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_domains" ADD CONSTRAINT "article_domains_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_skills" ADD CONSTRAINT "article_skills_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_skills" ADD CONSTRAINT "article_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_technologies" ADD CONSTRAINT "article_technologies_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_technologies" ADD CONSTRAINT "article_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_domains" ADD CONSTRAINT "journal_domains_journal_id_journal_entries_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_domains" ADD CONSTRAINT "journal_domains_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_skills" ADD CONSTRAINT "journal_skills_journal_id_journal_entries_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_skills" ADD CONSTRAINT "journal_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_domains" ADD CONSTRAINT "note_domains_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_domains" ADD CONSTRAINT "note_domains_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_projects" ADD CONSTRAINT "note_projects_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_projects" ADD CONSTRAINT "note_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_skills" ADD CONSTRAINT "note_skills_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_skills" ADD CONSTRAINT "note_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_tags" ADD CONSTRAINT "note_tags_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_tags" ADD CONSTRAINT "note_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_technologies" ADD CONSTRAINT "note_technologies_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_technologies" ADD CONSTRAINT "note_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adrs" ADD CONSTRAINT "adrs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adrs" ADD CONSTRAINT "adrs_superseded_by_id_adrs_id_fk" FOREIGN KEY ("superseded_by_id") REFERENCES "public"."adrs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_domains" ADD CONSTRAINT "certificate_domains_certificate_id_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_domains" ADD CONSTRAINT "certificate_domains_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_skills" ADD CONSTRAINT "certificate_skills_certificate_id_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_skills" ADD CONSTRAINT "certificate_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_technologies" ADD CONSTRAINT "certificate_technologies_certificate_id_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_technologies" ADD CONSTRAINT "certificate_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_domains" ADD CONSTRAINT "learning_path_domains_learning_path_id_learning_paths_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_domains" ADD CONSTRAINT "learning_path_domains_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_skills" ADD CONSTRAINT "learning_path_skills_learning_path_id_learning_paths_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_skills" ADD CONSTRAINT "learning_path_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_technologies" ADD CONSTRAINT "learning_path_technologies_learning_path_id_learning_paths_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_technologies" ADD CONSTRAINT "learning_path_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "now_domains" ADD CONSTRAINT "now_domains_now_id_now_entries_id_fk" FOREIGN KEY ("now_id") REFERENCES "public"."now_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "now_domains" ADD CONSTRAINT "now_domains_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "now_projects" ADD CONSTRAINT "now_projects_now_id_now_entries_id_fk" FOREIGN KEY ("now_id") REFERENCES "public"."now_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "now_projects" ADD CONSTRAINT "now_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "now_technologies" ADD CONSTRAINT "now_technologies_now_id_now_entries_id_fk" FOREIGN KEY ("now_id") REFERENCES "public"."now_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "now_technologies" ADD CONSTRAINT "now_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_relationships" ADD CONSTRAINT "knowledge_relationships_relationship_type_id_relationship_types_id_fk" FOREIGN KEY ("relationship_type_id") REFERENCES "public"."relationship_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_type_compatibility" ADD CONSTRAINT "relationship_type_compatibility_relationship_type_id_relationship_types_id_fk" FOREIGN KEY ("relationship_type_id") REFERENCES "public"."relationship_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_domains_slug" ON "domains" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_domains_visibility" ON "domains" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "idx_case_studies_project" ON "project_case_studies" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_case_studies_feed" ON "project_case_studies" USING btree ("visibility","publication_status","published_at");--> statement-breakpoint
CREATE INDEX "idx_adrs_project" ON "adrs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_adrs_slug" ON "adrs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_adrs_status" ON "adrs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_adrs_feed" ON "adrs" USING btree ("visibility","publication_status","published_at");--> statement-breakpoint
CREATE INDEX "idx_learning_paths_feed" ON "learning_paths" USING btree ("status","visibility","publication_status");--> statement-breakpoint
CREATE INDEX "idx_now_feed" ON "now_entries" USING btree ("is_current","visibility","publication_status","sort_order");--> statement-breakpoint
CREATE INDEX "idx_knowledge_rel_src" ON "knowledge_relationships" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_rel_tgt" ON "knowledge_relationships" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_rel_type_src" ON "knowledge_relationships" USING btree ("relationship_type_id","source_type","source_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_rel_type_tgt" ON "knowledge_relationships" USING btree ("relationship_type_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_rel_feed" ON "knowledge_relationships" USING btree ("visibility","status");--> statement-breakpoint
CREATE INDEX "idx_rel_type_compat_src" ON "relationship_type_compatibility" USING btree ("source_type","target_type");--> statement-breakpoint
CREATE INDEX "idx_career_feed" ON "career_experiences" USING btree ("visibility","publication_status","start_date");--> statement-breakpoint
CREATE INDEX "idx_projects_slug" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_certificates_feed" ON "certificates" USING btree ("visibility","publication_status","issued_at");--> statement-breakpoint
CREATE INDEX "idx_roadmap_feed" ON "roadmap_items" USING btree ("visibility","publication_status","sort_order");--> statement-breakpoint
CREATE INDEX "idx_projects_feed" ON "projects" USING btree ("status","visibility","publication_status","published_at");--> statement-breakpoint
CREATE INDEX "idx_articles_feed" ON "articles" USING btree ("status","visibility","publication_status","published_at");--> statement-breakpoint
CREATE INDEX "idx_journal_feed" ON "journal_entries" USING btree ("status","visibility","publication_status","entry_date");--> statement-breakpoint
CREATE INDEX "idx_notes_status" ON "notes" USING btree ("status","visibility","publication_status");--> statement-breakpoint
ALTER TABLE "career_experiences" ADD CONSTRAINT "chk_career_visibility" CHECK ("career_experiences"."visibility" IN ('private', 'unlisted', 'public'));--> statement-breakpoint
ALTER TABLE "career_experiences" ADD CONSTRAINT "chk_career_pub_status" CHECK ("career_experiences"."publication_status" IN ('draft', 'review', 'scheduled', 'published', 'archived'));--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "chk_project_visibility" CHECK ("projects"."visibility" IN ('private', 'unlisted', 'public'));--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "chk_project_pub_status" CHECK ("projects"."publication_status" IN ('draft', 'review', 'scheduled', 'published', 'archived'));--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "chk_project_status" CHECK ("projects"."status" IN ('idea', 'planning', 'active', 'maintained', 'completed', 'archived', 'experimental'));--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "chk_article_visibility" CHECK ("articles"."visibility" IN ('private', 'unlisted', 'public'));--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "chk_article_pub_status" CHECK ("articles"."publication_status" IN ('draft', 'review', 'scheduled', 'published', 'archived'));--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "chk_journal_pub_status" CHECK ("journal_entries"."publication_status" IN ('draft', 'review', 'scheduled', 'published', 'archived'));--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "chk_note_visibility" CHECK ("notes"."visibility" IN ('private', 'unlisted', 'public'));--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "chk_note_pub_status" CHECK ("notes"."publication_status" IN ('draft', 'review', 'scheduled', 'published', 'archived'));--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "chk_cert_visibility" CHECK ("certificates"."visibility" IN ('private', 'unlisted', 'public'));--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "chk_cert_pub_status" CHECK ("certificates"."publication_status" IN ('draft', 'review', 'scheduled', 'published', 'archived'));--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD CONSTRAINT "chk_roadmap_visibility" CHECK ("roadmap_items"."visibility" IN ('private', 'unlisted', 'public'));--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD CONSTRAINT "chk_roadmap_pub_status" CHECK ("roadmap_items"."publication_status" IN ('draft', 'review', 'scheduled', 'published', 'archived'));