-- Create a function to clear prototypes for an analysis
CREATE OR REPLACE FUNCTION public.clear_prototypes_for_analysis(p_analysis_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete holistic prototypes for the analysis
  DELETE FROM public.figmant_holistic_prototypes 
  WHERE analysis_id = p_analysis_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Also delete any solution metrics for those prototypes
  DELETE FROM public.figmant_solution_metrics 
  WHERE prototype_id NOT IN (
    SELECT id FROM public.figmant_holistic_prototypes
  );
  
  -- Reset prototype generation status in analysis results
  UPDATE public.figmant_analysis_results 
  SET 
    prototype_generation_status = 'not_started',
    prototype_count = 0,
    prototype_generation_started_at = NULL,
    prototype_generation_completed_at = NULL
  WHERE id = p_analysis_id;
  
  RETURN deleted_count;
END;
$function$;