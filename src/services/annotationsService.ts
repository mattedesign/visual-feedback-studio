
import { Annotation } from '@/types/analysis';

// Minimal working service for modular dashboard
export interface AnnotationData {
  id: string;
  text: string;
  suggestion?: string;
  category?: string;
  severity?: string;
}

export const annotationsService = {
  async saveAnalysis(data: any) {
    console.log('Analysis saved:', data);
    return { id: Date.now().toString(), ...data };
  },
  
  async getAnalysis(id: string) {
    return null;
  },
  
  async updateAnalysis(id: string, data: any) {
    return data;
  }
};

// Functions expected by the hooks
export const saveAnnotation = async (annotationData: Omit<Annotation, 'id'>, analysisId: string): Promise<Annotation | null> => {
  console.log('Saving annotation:', annotationData, 'for analysis:', analysisId);
  const annotation: Annotation = {
    id: Date.now().toString(),
    ...annotationData
  };
  return annotation;
};

export const deleteAnnotation = async (annotationId: string): Promise<boolean> => {
  console.log('Deleting annotation:', annotationId);
  return true;
};

export const getAnnotationsForAnalysis = async (analysisId: string): Promise<Annotation[]> => {
  console.log('Getting annotations for analysis:', analysisId);
  return [];
};
