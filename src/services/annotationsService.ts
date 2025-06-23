
import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';

export const saveAnnotation = async (annotation: Omit<Annotation, 'id'>, analysisId: string, imageIndex?: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error('Please sign in to save annotations');
    return null;
  }

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
      image_index: imageIndex ?? 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving annotation:', error);
    toast.error('Failed to save annotation');
    return null;
  }

  return {
    id: data.id,
    x: data.x,
    y: data.y,
    category: data.category as Annotation['category'],
    severity: data.severity as Annotation['severity'],
    feedback: data.feedback,
    implementationEffort: data.implementation_effort as Annotation['implementationEffort'],
    businessImpact: data.business_impact as Annotation['businessImpact'],
    imageIndex: data.image_index ?? 0
  };
};

export const getAnnotationsForAnalysis = async (analysisId: string): Promise<Annotation[]> => {
  const { data, error } = await supabase
    .from('annotations')
    .select('*')
    .eq('analysis_id', analysisId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching annotations:', error);
    return [];
  }

  return data.map(annotation => ({
    id: annotation.id,
    x: annotation.x,
    y: annotation.y,
    category: annotation.category as Annotation['category'],
    severity: annotation.severity as Annotation['severity'],
    feedback: annotation.feedback,
    implementationEffort: annotation.implementation_effort as Annotation['implementationEffort'],
    businessImpact: annotation.business_impact as Annotation['businessImpact'],
    imageIndex: annotation.image_index ?? 0
  }));
};

export const deleteAnnotation = async (annotationId: string) => {
  const { error } = await supabase
    .from('annotations')
    .delete()
    .eq('id', annotationId);

  if (error) {
    console.error('Error deleting annotation:', error);
    toast.error('Failed to delete annotation');
    return false;
  }

  return true;
};

export const updateAnnotation = async (annotationId: string, updates: Partial<Annotation>) => {
  const updateData: any = {};
  if (updates.feedback !== undefined) updateData.feedback = updates.feedback;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.severity !== undefined) updateData.severity = updates.severity;
  if (updates.implementationEffort !== undefined) updateData.implementation_effort = updates.implementationEffort;
  if (updates.businessImpact !== undefined) updateData.business_impact = updates.businessImpact;

  const { data, error } = await supabase
    .from('annotations')
    .update(updateData)
    .eq('id', annotationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating annotation:', error);
    toast.error('Failed to update annotation');
    return null;
  }

  return {
    id: data.id,
    x: data.x,
    y: data.y,
    category: data.category as Annotation['category'],
    severity: data.severity as Annotation['severity'],
    feedback: data.feedback,
    implementationEffort: data.implementation_effort as Annotation['implementationEffort'],
    businessImpact: data.business_impact as Annotation['businessImpact']
  };
};
