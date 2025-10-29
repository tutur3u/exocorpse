-- Enhanced function to atomically replace service addons with proper error handling
CREATE OR REPLACE FUNCTION replace_service_addons(
  p_service UUID, 
  p_addons UUID[]
)
RETURNS jsonb AS $$
DECLARE
  v_error_message TEXT;
  v_deleted_count INT;
BEGIN
  -- Delete all existing service addon links for this service
  DELETE FROM service_addons WHERE service_id = p_service;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Insert new addon links if any are provided
  IF array_length(p_addons, 1) IS NOT NULL AND array_length(p_addons, 1) > 0 THEN
    INSERT INTO service_addons (service_id, addon_id, addon_is_exclusive)
    SELECT p_service, UNNEST(p_addons), FALSE;
  END IF;
  
  -- Return success response
  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Service addons updated successfully',
    'deleted_count', v_deleted_count,
    'inserted_count', COALESCE(array_length(p_addons, 1), 0)
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Capture any error and return error response
  GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLSTATE,
    'message', v_error_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unique partial index to prevent multiple primary examples per style
CREATE UNIQUE INDEX IF NOT EXISTS pictures_primary_example_per_style_idx
ON pictures (style_id)
WHERE is_primary_example = TRUE;

-- Function to atomically set a picture as the primary example for a style
-- Returns JSON response with success status and detailed error information if needed
CREATE OR REPLACE FUNCTION set_primary_picture(
  p_style_id UUID,
  p_picture_id UUID
)
RETURNS jsonb AS $$
DECLARE
  v_picture_style_id UUID;
  v_error_message TEXT;
BEGIN
  -- Verify the picture exists and belongs to the specified style
  SELECT style_id INTO v_picture_style_id
  FROM pictures
  WHERE picture_id = p_picture_id
  LIMIT 1;

  IF v_picture_style_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error_code', 'PICTURE_NOT_FOUND',
      'message', 'Picture with the specified ID does not exist'
    );
  END IF;

  IF v_picture_style_id != p_style_id THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error_code', 'PICTURE_STYLE_MISMATCH',
      'message', 'Picture does not belong to the specified style'
    );
  END IF;

  -- Atomically clear all is_primary_example flags for the style and set the new primary
  UPDATE pictures SET is_primary_example = FALSE
  WHERE style_id = p_style_id AND is_primary_example = TRUE;

  UPDATE pictures SET is_primary_example = TRUE
  WHERE picture_id = p_picture_id;

  -- Return success response
  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Primary picture set successfully',
    'picture_id', p_picture_id,
    'style_id', p_style_id
  );

EXCEPTION WHEN OTHERS THEN
  -- Capture any error and return error response
  GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
  RETURN jsonb_build_object(
    'success', FALSE,
    'error_code', SQLSTATE,
    'message', v_error_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;