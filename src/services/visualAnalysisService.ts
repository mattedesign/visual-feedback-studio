
// Temporarily commented out to fix TypeScript build errors
// This service will be rebuilt incrementally after the core platform is stable

/*
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { Annotation } from '@/types/analysis';

export interface VisualAnalysisExportData {
  imageUrl: string;
  annotations: Annotation[];
  analysisId: string;
  siteName?: string;
}

// This entire service is temporarily disabled
// Core functionality (RAG + Research Citations) is working
// Visual export features will be rebuilt incrementally

export const visualAnalysisService = {
  downloadAnnotatedImage: async (data: VisualAnalysisExportData): Promise<void> => {
    toast.info('Coming soon - feature temporarily disabled');
  },

  copyAnnotationURLs: async (data: VisualAnalysisExportData): Promise<void> => {
    toast.info('Coming soon - feature temporarily disabled');
  },

  generateTechnicalBrief: async (data: VisualAnalysisExportData): Promise<void> => {
    toast.info('Coming soon - feature temporarily disabled');
  },

  getSeverityColor: (severity: string): string => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'suggested': return '#eab308';
      case 'enhancement': return '#3b82f6';
      default: return '#6b7280';
    }
  }
};
*/

// Simplified placeholder service for now
export const visualAnalysisService = {
  downloadAnnotatedImage: async (): Promise<void> => {
    alert('Export functionality coming soon!');
  },

  copyAnnotationURLs: async (): Promise<void> => {
    alert('URL sharing coming soon!');
  },

  generateTechnicalBrief: async (): Promise<void> => {
    alert('Technical brief generation coming soon!');
  },

  getSeverityColor: (severity: string): string => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'suggested': return '#eab308';
      case 'enhancement': return '#3b82f6';
      default: return '#6b7280';
    }
  }
};
