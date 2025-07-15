
import { useCallback } from 'react';
import { CoordinateAccuratePrompting } from '../../utils/coordinateAccuratePrompting';
import { BusinessImpactCalculator } from '../../utils/businessImpactCalculator';
import { StrategicContextBuilder, EnhancedAnalysisContext } from '../../utils/strategicFramework';
import { BusinessImpactMetrics } from '../../types/businessImpact';

interface ImageAnnotation {
  imageUrl: string;
  annotations: Array<{
    x: number;
    y: number;
    comment: string;
    id: string;
  }>;
}

interface TechnicalAuditData {
  accessibility: {
    averageScore: number;
    criticalIssues: number;
    totalIssues: number;
  };
  performance: {
    averageScore: number;
    failingMetrics: number;
    totalMetrics: number;
  };
  components: {
    totalComponents: number;
    accessibilityIssues: number;
  };
  technical: {
    htmlIssues: number;
    seoIssues: number;
  };
}

interface BusinessContext {
  industry?: string;
  userBase?: number;
  averageOrderValue?: number;
  conversionRate?: number;
  trafficVolume?: number;
}

export const usePromptBuilder = () => {
  const buildIntelligentPrompt = useCallback((
    customPrompt?: string,
    imageAnnotations?: ImageAnnotation[],
    imageUrls?: string[]
  ) => {
    // Use the enhanced coordinate-accurate prompting system
    return CoordinateAccuratePrompting.buildEnhancedAnalysisPrompt(
      customPrompt,
      imageAnnotations,
      imageUrls
    );
  }, []);

  const buildEnhancedBusinessPrompt = useCallback((
    persona: string,
    userContext: string,
    technicalAuditData?: TechnicalAuditData,
    businessContext?: BusinessContext,
    imageAnnotations?: ImageAnnotation[],
    imageUrls?: string[]
  ) => {
    // Generate business impact metrics if technical audit data is available
    let businessImpact: BusinessImpactMetrics | null = null;
    let analysisContext: EnhancedAnalysisContext | null = null;

    if (technicalAuditData) {
      businessImpact = BusinessImpactCalculator.calculateBusinessImpact(
        technicalAuditData,
        businessContext
      );

      analysisContext = StrategicContextBuilder.buildAnalysisContext(
        technicalAuditData,
        businessImpact,
        userContext
      );
    }

    // Build base prompt with coordinate-accurate prompting
    const basePrompt = CoordinateAccuratePrompting.buildEnhancedAnalysisPrompt(
      userContext,
      imageAnnotations,
      imageUrls
    );

    // Enhance with strategic framework if available
    if (analysisContext) {
      const strategicPrompt = StrategicContextBuilder.buildConsultantPrompt(
        analysisContext,
        persona
      );
      
      return `${strategicPrompt}\n\n## VISUAL ANALYSIS\n${basePrompt}`;
    }

    return basePrompt;
  }, []);

  const calculateBusinessImpact = useCallback((
    technicalAuditData: TechnicalAuditData,
    businessContext?: BusinessContext
  ) => {
    return BusinessImpactCalculator.calculateBusinessImpact(
      technicalAuditData,
      businessContext
    );
  }, []);

  const generateQuickWins = useCallback((technicalAuditData: TechnicalAuditData) => {
    return BusinessImpactCalculator.generateQuickWins(technicalAuditData);
  }, []);

  const generateMajorProjects = useCallback((technicalAuditData: TechnicalAuditData) => {
    return BusinessImpactCalculator.generateMajorProjects(technicalAuditData);
  }, []);

  return {
    buildIntelligentPrompt,
    buildEnhancedBusinessPrompt,
    calculateBusinessImpact,
    generateQuickWins,
    generateMajorProjects,
  };
};
