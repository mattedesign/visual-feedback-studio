
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { AnnotationData } from './types.ts';

export async function saveAnnotationsToDatabase(
  annotations: AnnotationData[],
  analysisId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<any[]> {
  console.log('=== Database Save Phase ===');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const savedAnnotations = [];
  
  // Process annotations with imageIndex handling
  const processedAnnotations = annotations.map(annotation => ({
    ...annotation,
    imageIndex: annotation.imageIndex ?? 0
  }));

  console.log('Annotations processed:', {
    originalCount: annotations.length,
    processedCount: processedAnnotations.length,
    imageIndexDistribution: processedAnnotations.reduce((acc, ann) => {
      acc[ann.imageIndex] = (acc[ann.imageIndex] || 0) + 1;
      return acc;
    }, {} as Record<number, number>)
  });
  
  for (const annotation of processedAnnotations) {
    try {
      const { data, error } = await supabase
        .from('annotations')
        .insert({
          analysis_id: analysisId,
          x: annotation.x,
          y: annotation.y,
          category: annotation.category,
          severity: annotation.severity,
          feedback: annotation.feedback,
          implementation_effort: annotation.implementationEffort,
          business_impact: annotation.businessImpact,
          image_index: annotation.imageIndex
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving annotation:', error);
        throw new Error(`Database save failed: ${error.message}`);
      }

      savedAnnotations.push(data);
      console.log('Annotation saved successfully:', data.id);
    } catch (saveError) {
      console.error('Failed to save annotation:', saveError);
      throw new Error(`Failed to save annotation: ${saveError.message}`);
    }
  }

  console.log('All annotations saved to database:', {
    totalSaved: savedAnnotations.length,
    savedIds: savedAnnotations.map(a => a.id)
  });

  return savedAnnotations;
}
