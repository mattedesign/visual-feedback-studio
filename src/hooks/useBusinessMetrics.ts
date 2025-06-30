
import { useMemo } from 'react';
import { AnalysisTransformer, EnhancedAnalysisData } from '../utils/analysisTransformers';

export const useBusinessMetrics = (analysisData: any): EnhancedAnalysisData => {
  const transformer = useMemo(() => new AnalysisTransformer(), []);

  const enhancedData = useMemo(() => {
    return transformer.enhanceAnalysisData(analysisData);
  }, [analysisData, transformer]);

  return enhancedData;
};

export const useExecutiveSummary = (analysisData: any): string => {
  const transformer = useMemo(() => new AnalysisTransformer(), []);
  
  const summary = useMemo(() => {
    const enhancedData = transformer.enhanceAnalysisData(analysisData);
    return transformer.getExecutiveSummary(enhancedData);
  }, [analysisData, transformer]);

  return summary;
};

export const useKeyInsights = (analysisData: any): {
  topRecommendation: string;
  quickestWin: string;
  highestImpact: string;
} => {
  const transformer = useMemo(() => new AnalysisTransformer(), []);
  
  const insights = useMemo(() => {
    const enhancedData = transformer.enhanceAnalysisData(analysisData);
    return transformer.getKeyInsights(enhancedData);
  }, [analysisData, transformer]);

  return insights;
};
