-- ==============================================================================
-- Migration: 0007_canonical_relationship_compatibility.sql
-- Description: Seed full canonical semantic relationship compatibility matrix
-- per HZCODE Relationship Model v1 (Section 10) & Phase 6
-- ==============================================================================

DO $$
DECLARE
    derived_into_id UUID;
    builds_on_id UUID;
    explains_id UUID;
    supports_id UUID;
    references_id UUID;
    applies_to_id UUID;
    learns_through_id UUID;
    originated_from_id UUID;
BEGIN
    SELECT id INTO derived_into_id FROM relationship_types WHERE code = 'DERIVED_INTO' LIMIT 1;
    SELECT id INTO builds_on_id FROM relationship_types WHERE code = 'BUILDS_ON' LIMIT 1;
    SELECT id INTO explains_id FROM relationship_types WHERE code = 'EXPLAINS' LIMIT 1;
    SELECT id INTO supports_id FROM relationship_types WHERE code = 'SUPPORTS' LIMIT 1;
    SELECT id INTO references_id FROM relationship_types WHERE code = 'REFERENCES' LIMIT 1;
    SELECT id INTO applies_to_id FROM relationship_types WHERE code = 'APPLIES_TO' LIMIT 1;
    SELECT id INTO learns_through_id FROM relationship_types WHERE code = 'LEARNS_THROUGH' LIMIT 1;
    SELECT id INTO originated_from_id FROM relationship_types WHERE code = 'ORIGINATED_FROM' LIMIT 1;

    -- 1. DERIVED_INTO compatibility
    IF derived_into_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), derived_into_id, 'JOURNAL_ENTRY', 'TECH_NOTE'),
            (gen_random_uuid(), derived_into_id, 'JOURNAL_ENTRY', 'ARTICLE'),
            (gen_random_uuid(), derived_into_id, 'JOURNAL_ENTRY', 'ADR'),
            (gen_random_uuid(), derived_into_id, 'TECH_NOTE', 'ARTICLE'),
            (gen_random_uuid(), derived_into_id, 'ARTICLE', 'TECH_NOTE'),
            (gen_random_uuid(), derived_into_id, 'ARTICLE', 'ADR')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;

    -- 2. BUILDS_ON compatibility
    IF builds_on_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), builds_on_id, 'ARTICLE', 'ARTICLE'),
            (gen_random_uuid(), builds_on_id, 'ARTICLE', 'JOURNAL_ENTRY'),
            (gen_random_uuid(), builds_on_id, 'TECH_NOTE', 'ARTICLE'),
            (gen_random_uuid(), builds_on_id, 'TECH_NOTE', 'TECH_NOTE'),
            (gen_random_uuid(), builds_on_id, 'ADR', 'JOURNAL_ENTRY'),
            (gen_random_uuid(), builds_on_id, 'ADR', 'ADR'),
            (gen_random_uuid(), builds_on_id, 'JOURNAL_ENTRY', 'JOURNAL_ENTRY')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;

    -- 3. EXPLAINS compatibility
    IF explains_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), explains_id, 'ARTICLE', 'PROJECT'),
            (gen_random_uuid(), explains_id, 'ARTICLE', 'ADR'),
            (gen_random_uuid(), explains_id, 'ARTICLE', 'TECHNOLOGY'),
            (gen_random_uuid(), explains_id, 'ARTICLE', 'DOMAIN'),
            (gen_random_uuid(), explains_id, 'TECH_NOTE', 'TECHNOLOGY'),
            (gen_random_uuid(), explains_id, 'TECH_NOTE', 'PROJECT'),
            (gen_random_uuid(), explains_id, 'TECH_NOTE', 'ADR'),
            (gen_random_uuid(), explains_id, 'PROJECT_CASE_STUDY', 'ADR')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;

    -- 4. SUPPORTS compatibility
    IF supports_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), supports_id, 'ARTICLE', 'PROJECT_CASE_STUDY'),
            (gen_random_uuid(), supports_id, 'ARTICLE', 'ADR'),
            (gen_random_uuid(), supports_id, 'JOURNAL_ENTRY', 'PROJECT_CASE_STUDY'),
            (gen_random_uuid(), supports_id, 'JOURNAL_ENTRY', 'ADR'),
            (gen_random_uuid(), supports_id, 'JOURNAL_ENTRY', 'ARTICLE'),
            (gen_random_uuid(), supports_id, 'TECH_NOTE', 'ARTICLE'),
            (gen_random_uuid(), supports_id, 'TECH_NOTE', 'ADR'),
            (gen_random_uuid(), supports_id, 'TECH_NOTE', 'PROJECT_CASE_STUDY'),
            (gen_random_uuid(), supports_id, 'CERTIFICATE', 'ARTICLE')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;

    -- 5. REFERENCES compatibility
    IF references_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            -- Article references
            (gen_random_uuid(), references_id, 'ARTICLE', 'ARTICLE'),
            (gen_random_uuid(), references_id, 'ARTICLE', 'TECH_NOTE'),
            (gen_random_uuid(), references_id, 'ARTICLE', 'ADR'),
            (gen_random_uuid(), references_id, 'ARTICLE', 'PROJECT'),
            (gen_random_uuid(), references_id, 'ARTICLE', 'TECHNOLOGY'),
            (gen_random_uuid(), references_id, 'ARTICLE', 'DOMAIN'),
            (gen_random_uuid(), references_id, 'ARTICLE', 'CERTIFICATE'),
            -- TechNote references
            (gen_random_uuid(), references_id, 'TECH_NOTE', 'TECH_NOTE'),
            (gen_random_uuid(), references_id, 'TECH_NOTE', 'ARTICLE'),
            (gen_random_uuid(), references_id, 'TECH_NOTE', 'ADR'),
            (gen_random_uuid(), references_id, 'TECH_NOTE', 'PROJECT'),
            (gen_random_uuid(), references_id, 'TECH_NOTE', 'TECHNOLOGY'),
            (gen_random_uuid(), references_id, 'TECH_NOTE', 'DOMAIN'),
            -- ADR references
            (gen_random_uuid(), references_id, 'ADR', 'ADR'),
            (gen_random_uuid(), references_id, 'ADR', 'ARTICLE'),
            (gen_random_uuid(), references_id, 'ADR', 'TECH_NOTE'),
            (gen_random_uuid(), references_id, 'ADR', 'PROJECT'),
            -- JournalEntry references
            (gen_random_uuid(), references_id, 'JOURNAL_ENTRY', 'ARTICLE'),
            (gen_random_uuid(), references_id, 'JOURNAL_ENTRY', 'TECH_NOTE'),
            (gen_random_uuid(), references_id, 'JOURNAL_ENTRY', 'ADR'),
            (gen_random_uuid(), references_id, 'JOURNAL_ENTRY', 'PROJECT'),
            -- LearningPath & Roadmap references
            (gen_random_uuid(), references_id, 'LEARNING_PATH', 'PROJECT'),
            (gen_random_uuid(), references_id, 'LEARNING_PATH', 'ARTICLE'),
            (gen_random_uuid(), references_id, 'LEARNING_PATH', 'TECH_NOTE'),
            (gen_random_uuid(), references_id, 'ROADMAP', 'PROJECT'),
            (gen_random_uuid(), references_id, 'ROADMAP', 'LEARNING_PATH')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;

    -- 6. APPLIES_TO compatibility
    IF applies_to_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), applies_to_id, 'TECH_NOTE', 'PROJECT'),
            (gen_random_uuid(), applies_to_id, 'TECH_NOTE', 'DOMAIN'),
            (gen_random_uuid(), applies_to_id, 'TECH_NOTE', 'TECHNOLOGY'),
            (gen_random_uuid(), applies_to_id, 'ARTICLE', 'DOMAIN'),
            (gen_random_uuid(), applies_to_id, 'ARTICLE', 'TECHNOLOGY'),
            (gen_random_uuid(), applies_to_id, 'ADR', 'PROJECT'),
            (gen_random_uuid(), applies_to_id, 'ADR', 'DOMAIN'),
            (gen_random_uuid(), applies_to_id, 'ADR', 'TECHNOLOGY')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;

    -- 7. LEARNS_THROUGH compatibility
    IF learns_through_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), learns_through_id, 'LEARNING_PATH', 'PROJECT'),
            (gen_random_uuid(), learns_through_id, 'LEARNING_PATH', 'ARTICLE'),
            (gen_random_uuid(), learns_through_id, 'LEARNING_PATH', 'JOURNAL_ENTRY'),
            (gen_random_uuid(), learns_through_id, 'LEARNING_PATH', 'TECH_NOTE'),
            (gen_random_uuid(), learns_through_id, 'LEARNING_PATH', 'ADR'),
            (gen_random_uuid(), learns_through_id, 'LEARNING_PATH', 'TECHNOLOGY'),
            (gen_random_uuid(), learns_through_id, 'LEARNING_PATH', 'DOMAIN'),
            (gen_random_uuid(), learns_through_id, 'ROADMAP', 'PROJECT'),
            (gen_random_uuid(), learns_through_id, 'ROADMAP', 'LEARNING_PATH')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;

    -- 8. ORIGINATED_FROM compatibility
    IF originated_from_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), originated_from_id, 'ARTICLE', 'PROJECT'),
            (gen_random_uuid(), originated_from_id, 'ARTICLE', 'EXPERIENCE'),
            (gen_random_uuid(), originated_from_id, 'ARTICLE', 'LEARNING_PATH'),
            (gen_random_uuid(), originated_from_id, 'ARTICLE', 'JOURNAL_ENTRY'),
            (gen_random_uuid(), originated_from_id, 'JOURNAL_ENTRY', 'PROJECT'),
            (gen_random_uuid(), originated_from_id, 'JOURNAL_ENTRY', 'EXPERIENCE'),
            (gen_random_uuid(), originated_from_id, 'TECH_NOTE', 'PROJECT'),
            (gen_random_uuid(), originated_from_id, 'TECH_NOTE', 'JOURNAL_ENTRY'),
            (gen_random_uuid(), originated_from_id, 'ADR', 'PROJECT'),
            (gen_random_uuid(), originated_from_id, 'ADR', 'JOURNAL_ENTRY')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;
END $$;
