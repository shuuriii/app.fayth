-- ============================================================================
-- Update increment_xp() to also auto-compute and set the level column.
-- This keeps level in sync with total_xp at the database level,
-- eliminating client-side level drift.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_xp(p_user_id UUID, p_amount INT)
RETURNS INT AS $$
DECLARE
  new_xp INT;
  new_level TEXT;
BEGIN
  UPDATE patients
  SET total_xp = COALESCE(total_xp, 0) + p_amount
  WHERE user_id = p_user_id
  RETURNING total_xp INTO new_xp;

  IF new_xp IS NULL THEN
    RETURN 0;
  END IF;

  -- Derive level from XP thresholds (mirrors LEVEL_THRESHOLDS in types)
  new_level := CASE
    WHEN new_xp >= 12000 THEN 'thrive'
    WHEN new_xp >= 7000  THEN 'flow'
    WHEN new_xp >= 3500  THEN 'focus'
    WHEN new_xp >= 1500  THEN 'sprout'
    WHEN new_xp >= 500   THEN 'sapling'
    ELSE 'seed'
  END;

  UPDATE patients
  SET level = new_level
  WHERE user_id = p_user_id;

  RETURN new_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
