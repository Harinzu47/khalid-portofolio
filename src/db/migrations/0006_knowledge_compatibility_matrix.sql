-- ==============================================================================
-- Migration: 0006_knowledge_compatibility_matrix.sql
-- Description: Seed canonical semantic relationship compatibility matrix for DERIVED_INTO
-- per HZCODE Relationship Model v1 & Phase 4 Extraction Workflow
-- ==============================================================================

DO $$
DECLARE
    derived_into_id UUID;
    explains_id UUID;
    supports_id UUID;
    references_id UUID;
    applies_to_id UUID;
BEGIN
    SELECT id INTO derived_into_id FROM relationship_types WHERE code = 'DERIVED_INTO' LIMIT 1;
    SELECT id INTO explains_id FROM relationship_types WHERE code = 'EXPLAINS' LIMIT 1;
    SELECT id INTO supports_id FROM relationship_types WHERE code = 'SUPPORTS' LIMIT 1;
    SELECT id INTO references_id FROM relationship_types WHERE code = 'REFERENCES' LIMIT 1;
    SELECT id INTO applies_to_id FROM relationship_types WHERE code = 'APPLIES_TO' LIMIT 1;

    -- 1. DERIVED_INTO compatibility
    IF derived_into_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), derived_into_id, 'JOURNAL_ENTRY', 'TECH_NOTE'),
            (gen_random_uuid(), derived_into_id, 'JOURNAL_ENTRY', 'ARTICLE'),
            (gen_random_uuid(), derived_into_id, 'JOURNAL_ENTRY', 'ADR'),
            (gen_random_uuid(), derived_into_id, 'TECH_NOTE', 'ARTICLE')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;

    -- 2. EXPLAINS compatibility
    IF explains_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), explains_id, 'ARTICLE', 'PROJECT'),
            (gen_random_uuid(), explains_id, 'TECH_NOTE', 'PROJECT')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;

    -- 3. SUPPORTS compatibility
    IF supports_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), supports_id, 'ARTICLE', 'ADR'),
            (gen_random_uuid(), supports_id, 'TECH_NOTE', 'ADR'),
            (gen_random_uuid(), supports_id, 'JOURNAL_ENTRY', 'ADR')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;

    -- 4. REFERENCES compatibility
    IF references_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), references_id, 'ARTICLE', 'ARTICLE'),
            (gen_random_uuid(), references_id, 'ARTICLE', 'TECH_NOTE'),
            (gen_random_uuid(), references_id, 'TECH_NOTE', 'TECH_NOTE'),
            (gen_random_uuid(), references_id, 'ADR', 'ADR')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;

    -- 5. APPLIES_TO compatibility
    IF applies_to_id IS NOT NULL THEN
        INSERT INTO relationship_type_compatibility (id, relationship_type_id, source_type, target_type)
        VALUES
            (gen_random_uuid(), applies_to_id, 'TECH_NOTE', 'PROJECT'),
            (gen_random_uuid(), applies_to_id, 'TECH_NOTE', 'DOMAIN')
        ON CONFLICT (relationship_type_id, source_type, target_type) DO NOTHING;
    END IF;
END $$;
