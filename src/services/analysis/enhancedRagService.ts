import { googleVisionService, VisionAnalysisResult } from '../vision/googleVisionService';
import { ragIntegrationService } from './ragIntegrationService';
import { KnowledgeEntry } from '@/types/vectorDatabase';

export interface EnhancedSearchQuery {
  query: string;
  category: string;
  industry?: string;
  confidence: number;
  reasoning: string;
}

export interface EnhancedContext {
  visionAnalysis: VisionAnalysisResult;
  searchQueries: EnhancedSearchQuery[];
  retrievedKnowledge: KnowledgeEntry[];
  enhancedPrompt: string;
  confidenceScore: number;
  processingTime: number;
  knowledgeSourcesUsed: number;
  citations: string[];
}

export interface EnhancedRagOptions {
  maxKnowledgeEntries?: number;
  minConfidenceThreshold?: number;
  includeIndustrySpecific?: boolean;
  focusAreas?: string[];
}

// Create a simplified workflow type for this service
interface WorkflowState {
  selectedImages: string[];
  aiAnnotations: any[];
  currentStep: string;
  imageAnnotations: Array<{
    imageUrl: string;
    annotations: Array<{
      id: string;
      x: number;
      y: number;
      comment: string;
    }>;
  }>;
}

class EnhancedRagService {
  private readonly DEFAULT_OPTIONS: Required<EnhancedRagOptions> = {
    maxKnowledgeEntries: 15,
    minConfidenceThreshold: 0.7,
    includeIndustrySpecific: true,
    focusAreas: []
  };

  /**
   * Main method to enhance analysis with vision + knowledge using workflow state
   */
  public async enhanceAnalysisWithWorkflow(
    workflow: WorkflowState,
    originalPrompt: string,
    options: EnhancedRagOptions = {}
  ): Promise<EnhancedContext> {
    const startTime = Date.now();
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    console.log('🚀 Enhanced RAG: Starting comprehensive analysis with workflow', {
      imageCount: workflow.selectedImages.length,
      originalPromptLength: originalPrompt.length,
      totalAnnotations: workflow.aiAnnotations.length,
      currentStep: workflow.currentStep,
      options: opts
    });

    try {
      // Step 1: Analyze images with Google Vision
      console.log('👁️ Enhanced RAG: Running vision analysis...');
      const visionResults = await this.analyzeImages(workflow.selectedImages);
      
      // Step 2: Generate intelligent search queries
      console.log('🔍 Enhanced RAG: Generating intelligent search queries...');
      const searchQueries = this.generateSearchQueries(visionResults, originalPrompt, workflow, opts);
      
      // Step 3: Retrieve knowledge using unified RAG integration
      console.log('📚 Enhanced RAG: Retrieving knowledge via unified service...');
      const mainQuery = this.buildMainSearchQuery(searchQueries, originalPrompt);
      const ragResult = await ragIntegrationService.retrieveKnowledgeContext(mainQuery, {
        maxKnowledgeEntries: opts.maxKnowledgeEntries,
        minConfidenceThreshold: opts.minConfidenceThreshold,
        includeIndustrySpecific: opts.includeIndustrySpecific
      });
      
      // Step 4: Build enhanced prompt
      console.log('✨ Enhanced RAG: Building enhanced prompt...');
      const visionContext = this.buildVisionContext(visionResults);
      const enhancedPrompt = ragIntegrationService.buildEnhancedPrompt(
        originalPrompt,
        ragResult.contextSummary,
        visionContext
      );
      
      // Step 5: Calculate metrics
      const confidenceScore = this.calculateOverallConfidence(visionResults, ragResult.knowledge, searchQueries);
      const citations = this.extractCitations(ragResult.knowledge);
      
      const processingTime = Date.now() - startTime;
      
      const enhancedContext: EnhancedContext = {
        visionAnalysis: visionResults[0] || this.getEmptyVisionResult(),
        searchQueries,
        retrievedKnowledge: ragResult.knowledge,
        enhancedPrompt,
        confidenceScore,
        processingTime,
        knowledgeSourcesUsed: ragResult.sourceCount,
        citations
      };
      
      console.log('✅ Enhanced RAG: Analysis completed successfully', {
        visionElementsDetected: visionResults.reduce((sum, r) => sum + r.uiElements.length, 0),
        searchQueriesGenerated: searchQueries.length,
        knowledgeEntriesRetrieved: ragResult.knowledge.length,
        overallConfidence: confidenceScore,
        processingTimeMs: processingTime
      });
      
      return enhancedContext;
      
    } catch (error) {
      console.error('❌ Enhanced RAG: Analysis failed:', error);
      throw new Error(`Enhanced RAG analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  public async enhanceAnalysis(
    imageUrls: string[],
    originalPrompt: string,
    options: EnhancedRagOptions = {}
  ): Promise<EnhancedContext> {
    const mockWorkflow = {
      selectedImages: imageUrls,
      aiAnnotations: [],
      currentStep: 'analyzing',
      imageAnnotations: []
    };
    
    return this.enhanceAnalysisWithWorkflow(mockWorkflow, originalPrompt, options);
  }

  /**
   * Analyze all images using Google Vision
   */
  private async analyzeImages(imageUrls: string[]): Promise<VisionAnalysisResult[]> {
    const results: VisionAnalysisResult[] = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      try {
        console.log(`📸 Enhanced RAG: Analyzing image ${i + 1}/${imageUrls.length}`);
        const result = await googleVisionService.analyzeImage(imageUrls[i]);
        results.push(result);
      } catch (error) {
        console.error(`❌ Enhanced RAG: Failed to analyze image ${i + 1}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Generate intelligent search queries based on vision analysis
   */
  private generateSearchQueries(
    visionResults: VisionAnalysisResult[],
    originalPrompt: string,
    workflow: WorkflowState,
    options: Required<EnhancedRagOptions>
  ): EnhancedSearchQuery[] {
    const queries: EnhancedSearchQuery[] = [];
    
    // Generate queries based on vision analysis
    visionResults.forEach((vision) => {
      if (options.includeIndustrySpecific && vision.industry.confidence > 0.5) {
        queries.push({
          query: `${vision.industry.industry} UX best practices user interface design`,
          category: 'industry_patterns',
          industry: vision.industry.industry,
          confidence: vision.industry.confidence,
          reasoning: `Detected ${vision.industry.industry}`
        });
      }
    });
    
    // Add general prompt-based query
    if (originalPrompt.length > 10) {
      queries.push({
        query: originalPrompt.substring(0, 100),
        category: 'general',
        confidence: 0.7,
        reasoning: 'Based on user prompt requirements'
      });
    }
    
    return queries
      .filter(q => q.confidence >= options.minConfidenceThreshold)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Build main search query from search queries
   */
  private buildMainSearchQuery(queries: EnhancedSearchQuery[], originalPrompt: string): string {
    if (queries.length === 0) {
      return originalPrompt;
    }
    
    const topQueries = queries.slice(0, 3).map(q => q.query).join(' ');
    return `${originalPrompt} ${topQueries}`.substring(0, 200);
  }

  /**
   * Build vision context from vision results
   */
  private buildVisionContext(visionResults: VisionAnalysisResult[]): string {
    if (visionResults.length === 0) {
      return '';
    }
    
    let context = '=== VISUAL ANALYSIS CONTEXT ===\n';
    visionResults.forEach((vision, index) => {
      context += `Image ${index + 1}: ${vision.industry.industry} industry, ${vision.layout.type} layout, ${vision.uiElements.length} UI elements\n`;
    });
    
    return context;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(
    visionResults: VisionAnalysisResult[],
    knowledge: KnowledgeEntry[],
    queries: EnhancedSearchQuery[]
  ): number {
    const visionConfidence = visionResults.reduce((sum, r) => sum + r.overallConfidence, 0) / Math.max(visionResults.length, 1);
    const knowledgeConfidence = knowledge.length > 0 ? 0.9 : 0.3;
    const queryConfidence = queries.reduce((sum, q) => sum + q.confidence, 0) / Math.max(queries.length, 1);
    
    return (visionConfidence * 0.4 + knowledgeConfidence * 0.3 + queryConfidence * 0.3);
  }

  /**
   * Extract citations from knowledge entries
   */
  private extractCitations(knowledge: KnowledgeEntry[]): string[] {
    return knowledge
      .filter(entry => entry.source)
      .map(entry => entry.source!)
      .filter((source, index, arr) => arr.indexOf(source) === index)
      .slice(0, 10);
  }

  /**
   * Get empty vision result for fallback
   */
  private getEmptyVisionResult(): VisionAnalysisResult {
    return {
      uiElements: [],
      layout: { 
        type: 'landing', 
        confidence: 0.3, 
        description: 'General layout',
        structure: {
          sections: [{ name: 'main', position: 'center', area: 100 }],
          hierarchy: ['main'],
          gridSystem: { columns: 1, gutters: 0 }
        }
      },
      industry: { 
        industry: 'marketing', 
        confidence: 0.3, 
        indicators: [],
        metadata: {
          designPatterns: [],
          brandElements: [],
          userInterfaceStyle: 'basic'
        }
      },
      accessibility: [],
      textContent: [],
      colors: {
        dominantColors: ['#000000'],
        colorPalette: { primary: '#000000', secondary: '#666666', accent: '#0066cc' },
        colorContrast: { textBackground: 4.5, accessibility: 'AA' },
        colorHarmony: { scheme: 'monochrome', temperature: 'neutral', saturation: 0 }
      },
      deviceType: { 
        type: 'desktop', 
        confidence: 0.7, 
        dimensions: { width: 1200, height: 800, aspectRatio: 1.5 },
        responsiveBreakpoints: [
          { name: 'mobile', minWidth: 320, maxWidth: 768 },
          { name: 'desktop', minWidth: 1024, maxWidth: 1920 }
        ]
      },
      designTokens: {
        spacing: [{ name: 'md', value: 16 }],
        typography: [{ element: 'body', fontSize: 16, lineHeight: 24, fontWeight: 'normal' }],
        borderRadius: [{ name: 'none', value: 0 }],
        shadows: [{ name: 'none', blur: 0, offset: { x: 0, y: 0 } }]
      },
      visualHierarchy: {
        primaryFocusAreas: [],
        readingFlow: {
          pattern: 'standard',
          confidence: 0.3,
          keypoints: []
        }
      },
      interactionElements: [],
      brandAnalysis: {
        logoDetected: false,
        brandConsistency: 0.3,
        visualIdentity: {
          style: 'basic',
          mood: 'neutral',
          personality: []
        }
      },
      technicalMetadata: {
        imageQuality: {
          resolution: { width: 1200, height: 800 },
          compression: 'unknown',
          clarity: 0.5
        },
        performanceIndicators: {
          estimatedLoadTime: 3.0,
          optimizationSuggestions: []
        }
      },
      overallConfidence: 0.3,
      processingTime: 0
    };
  }
}

export const enhancedRagService = new EnhancedRagService();
