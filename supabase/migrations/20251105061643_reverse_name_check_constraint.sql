-- Migration to add the CHECK constraint and the updated_at trigger
-- to the existing relationship_types table.

-- PRE-CONSTRAINT DATA CLEANUP:
-- Any existing row that violates the new constraint must be fixed before adding the constraint.
-- The constraint requires: IF is_mutual = TRUE, THEN reverse_name MUST BE NULL.
-- This UPDATE sets reverse_name to NULL for all violating rows.
UPDATE public.relationship_types
SET reverse_name = NULL
WHERE is_mutual = TRUE AND reverse_name IS NOT NULL;

-- 1. Add the CHECK constraint: If is_mutual is TRUE, reverse_name must be NULL.
ALTER TABLE public.relationship_types
ADD CONSTRAINT chk_mutual_reverse_name CHECK (
  is_mutual IS DISTINCT FROM TRUE OR reverse_name IS NULL
);
