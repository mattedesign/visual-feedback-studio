
import { googleVisionService, VisionAnalysisResult } from '../vision/googleVisionService';
import { supabase } from '@/integrations/supabase/client';
import { KnowledgeEntry, SearchFilters } from '@/types/vectorDatabase';

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

class EnhancedRagService {
  private readonly DEFAULT_OPTIONS: Required<EnhancedRagOptions> = {
    maxKnowledgeEntries: 15,
    minConfidenceThreshold: 0.7,
    includeIndustrySpecific: true,
    focusAreas: []
  };

  /**
   * Main method to enhance analysis with vision + knowledge
   */
  public async enhanceAnalysis(
    imageUrls: string[],
    originalPrompt: string,
    options: EnhancedRagOptions = {}
  ): Promise<EnhancedContext> {
    const startTime = Date.now();
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    console.log('🚀 Enhanced RAG: Starting comprehensive analysis', {
      imageCount: imageUrls.length,
      originalPromptLength: originalPrompt.length,
      options: opts
    });

    try {
      // Step 1: Analyze images with Google Vision
      console.log('👁️ Enhanced RAG: Running vision analysis...');
      const visionResults = await this.analyzeImages(imageUrls);
      
      // Step 2: Generate intelligent search queries based on vision analysis
      console.log('🔍 Enhanced RAG: Generating intelligent search queries...');
      const searchQueries = this.generateSearchQueries(visionResults, originalPrompt, opts);
      
      // Step 3: Retrieve relevant knowledge using smart queries
      console.log('📚 Enhanced RAG: Retrieving relevant knowledge...');
      const retrievedKnowledge = await this.retrieveKnowledge(searchQueries, opts);
      
      // Step 4: Build enhanced prompt with vision + knowledge context
      console.log('✨ Enhanced RAG: Building enhanced prompt...');
      const enhancedPrompt = this.buildEnhancedPrompt(
        originalPrompt,
        visionResults,
        retrievedKnowledge,
        searchQueries
      );
      
      // Step 5: Calculate confidence and metrics
      const confidenceScore = this.calculateOverallConfidence(visionResults, retrievedKnowledge, searchQueries);
      const citations = this.extractCitations(retrievedKnowledge);
      
      const processingTime = Date.now() - startTime;
      
      const enhancedContext: EnhancedContext = {
        visionAnalysis: visionResults[0] || this.getEmptyVisionResult(), // Use first image's analysis
        searchQueries,
        retrievedKnowledge,
        enhancedPrompt,
        confidenceScore,
        processingTime,
        knowledgeSourcesUsed: retrievedKnowledge.length,
        citations
      };
      
      console.log('✅ Enhanced RAG: Analysis completed successfully', {
        visionElementsDetected: visionResults.reduce((sum, r) => sum + r.uiElements.length, 0),
        searchQueriesGenerated: searchQueries.length,
        knowledgeEntriesRetrieved: retrievedKnowledge.length,
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
        // Continue with other images
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
    options: Required<EnhancedRagOptions>
  ): EnhancedSearchQuery[] {
    const queries: EnhancedSearchQuery[] = [];
    
    visionResults.forEach((vision, index) => {
      // Industry-specific queries
      if (options.includeIndustrySpecific && vision.industry.confidence > 0.5) {
        queries.push({
          query: `${vision.industry.industry} UX best practices user interface design`,
          category: 'industry_patterns',
          industry: vision.industry.industry,
          confidence: vision.industry.confidence,
          reasoning: `Detected ${vision.industry.industry} industry with ${vision.industry.indicators.length} indicators`
        });
      }
      
      // Layout-specific queries
      if (vision.layout.confidence > 0.6) {
        queries.push({
          query: `${vision.layout.type} layout design patterns user experience`,
          category: 'layout_patterns',
          confidence: vision.layout.confidence,
          reasoning: `Identified ${vision.layout.type} layout: ${vision.layout.description}`
        });
      }
      
      // Device-specific queries
      if (vision.deviceType.confidence > 0.7) {
        queries.push({
          query: `${vision.deviceType.type} UX design responsive interface`,
          category: 'device_optimization',
          confidence: vision.deviceType.confidence,
          reasoning: `Detected ${vision.deviceType.type} interface design`
        });
      }
      
      // Accessibility queries (if issues found)
      if (vision.accessibility.length > 0) {
        const highPriorityIssues = vision.accessibility.filter(issue => issue.severity === 'high');
        if (highPriorityIssues.length > 0) {
          queries.push({
            query: `accessibility WCAG compliance ${highPriorityIssues.map(i => i.type).join(' ')}`,
            category: 'accessibility',
            confidence: 0.9,
            reasoning: `Found ${highPriorityIssues.length} high-priority accessibility issues`
          });
        }
      }
      
      // UI Element-specific queries
      const buttonCount = vision.uiElements.filter(e => e.type === 'button').length;
      const formCount = vision.uiElements.filter(e => e.type === 'form').length;
      
      if (buttonCount > 2) {
        queries.push({
          query: 'button design interaction patterns call to action',
          category: 'interaction_patterns',
          confidence: 0.8,
          reasoning: `Detected ${buttonCount} buttons requiring interaction design guidance`
        });
      }
      
      if (formCount > 0) {
        queries.push({
          query: 'form design user input validation UX patterns',
          category: 'form_patterns',
          confidence: 0.85,
          reasoning: `Found ${formCount} forms requiring input design optimization`
        });
      }
    });
    
    // Add focus area queries if specified
    options.focusAreas.forEach(area => {
      queries.push({
        query: `${area} UX design best practices`,
        category: 'focus_area',
        confidence: 0.9,
        reasoning: `User-specified focus area: ${area}`
      });
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
    
    // Sort by confidence and limit
    return queries
      .filter(q => q.confidence >= options.minConfidenceThreshold)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8); // Limit to top 8 queries
  }

  /**
   * Retrieve knowledge using intelligent queries
   */
  private async retrieveKnowledge(
    searchQueries: EnhancedSearchQuery[],
    options: Required<EnhancedRagOptions>
  ): Promise<KnowledgeEntry[]> {
    const allKnowledge: KnowledgeEntry[] = [];
    const seenIds = new Set<string>();
    
    for (const query of searchQueries) {
      try {
        console.log(`🔍 Enhanced RAG: Searching for "${query.query}" (${query.category})`);
        
        const filters: SearchFilters = {
          match_threshold: 0.75,
          match_count: Math.ceil(options.maxKnowledgeEntries / searchQueries.length)
        };
        
        // Add category-specific filters
        if (query.category === 'industry_patterns' && query.industry) {
          filters.industry_tags = [query.industry];
        }
        
        if (query.category === 'accessibility') {
          filters.primary_category = 'accessibility';
        }
        
        if (query.category === 'form_patterns') {
          filters.secondary_category = 'forms';
        }
        
        // Call vector search
        const { data, error } = await supabase.functions.invoke('build-rag-context', {
          body: {
            query: query.query,
            filters,
            includeCompetitive: options.includeIndustrySpecific
          }
        });
        
        if (error) {
          console.error(`❌ Enhanced RAG: Search failed for "${query.query}":`, error);
          continue;
        }
        
        if (data?.knowledge) {
          data.knowledge.forEach((entry: KnowledgeEntry) => {
            if (!seenIds.has(entry.id)) {
              seenIds.add(entry.id);
              // Add query context to entry
              entry.metadata = {
                ...entry.metadata,
                searchQuery: query.query,
                searchCategory: query.category,
                searchConfidence: query.confidence,
                searchReasoning: query.reasoning
              };
              allKnowledge.push(entry);
            }
          });
        }
        
      } catch (error) {
        console.error(`❌ Enhanced RAG: Knowledge retrieval failed for query "${query.query}":`, error);
      }
    }
    
    // Sort by relevance and limit
    return allKnowledge
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, options.maxKnowledgeEntries);
  }

  /**
   * Build enhanced prompt with vision + knowledge context
   */
  private buildEnhancedPrompt(
    originalPrompt: string,
    visionResults: VisionAnalysisResult[],
    knowledge: KnowledgeEntry[],
    searchQueries: EnhancedSearchQuery[]
  ): string {
    let enhancedPrompt = originalPrompt + '\n\n';
    
    // Add vision context
    enhancedPrompt += '=== VISUAL ANALYSIS CONTEXT ===\n';
    visionResults.forEach((vision, index) => {
      enhancedPrompt += `Image ${index + 1} Analysis:\n`;
      enhancedPrompt += `- Industry: ${vision.industry.industry} (${Math.round(vision.industry.confidence * 100)}% confidence)\n`;
      enhancedPrompt += `- Layout Type: ${vision.layout.type} - ${vision.layout.description}\n`;
      enhancedPrompt += `- Device Type: ${vision.deviceType.type} (${vision.deviceType.dimensions.width}x${vision.deviceType.dimensions.height})\n`;
      enhancedPrompt += `- UI Elements: ${vision.uiElements.length} detected (${vision.uiElements.filter(e => e.type === 'button').length} buttons, ${vision.uiElements.filter(e => e.type === 'form').length} forms)\n`;
      
      if (vision.accessibility.length > 0) {
        enhancedPrompt += `- Accessibility Issues: ${vision.accessibility.length} found (${vision.accessibility.filter(a => a.severity === 'high').length} high priority)\n`;
      }
      
      enhancedPrompt += '\n';
    });
    
    // Add research context
    if (knowledge.length > 0) {
      enhancedPrompt += '=== RESEARCH KNOWLEDGE CONTEXT ===\n';
      enhancedPrompt += `Based on visual analysis, I've retrieved ${knowledge.length} relevant UX knowledge sources:\n\n`;
      
      knowledge.slice(0, 8).forEach((entry, index) => {
        enhancedPrompt += `${index + 1}. ${entry.title}\n`;
        enhancedPrompt += `   Source: ${entry.source || 'Internal Knowledge'}\n`;
        enhancedPrompt += `   Category: ${entry.category || entry.primary_category || 'General'}\n`;
        if (entry.metadata?.searchReasoning) {
          enhancedPrompt += `   Relevance: ${entry.metadata.searchReasoning}\n`;
        }
        enhancedPrompt += `   Content: ${entry.content.substring(0, 200)}...\n\n`;
      });
    }
    
    // Add intelligent search context
    enhancedPrompt += '=== ANALYSIS FOCUS AREAS ===\n';
    enhancedPrompt += 'Based on the visual analysis, please focus your feedback on:\n';
    searchQueries.forEach((query, index) => {
      enhancedPrompt += `${index + 1}. ${query.reasoning} (Query: "${query.query}")\n`;
    });
    
    enhancedPrompt += '\n=== ENHANCED ANALYSIS REQUEST ===\n';
    enhancedPrompt += 'Please provide comprehensive UX analysis that:\n';
    enhancedPrompt += '1. Incorporates the visual context and detected patterns\n';
    enhancedPrompt += '2. References the retrieved research knowledge where relevant\n';
    enhancedPrompt += '3. Addresses the specific focus areas identified\n';
    enhancedPrompt += '4. Provides actionable recommendations based on industry best practices\n';
    enhancedPrompt += '5. Prioritizes issues based on business impact and user experience\n';
    
    return enhancedPrompt;
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
    const knowledgeConfidence = knowledge.length > 0 ? 0.9 : 0.3; // High if we have knowledge
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
      .filter((source, index, arr) => arr.indexOf(source) === index) // Remove duplicates
      .slice(0, 10); // Limit citations
  }

  /**
   * Get empty vision result for fallback
   */
  private getEmptyVisionResult(): VisionAnalysisResult {
    return {
      uiElements: [],
      layout: { type: 'landing', confidence: 0.3, description: 'General layout' },
      industry: { industry: 'marketing', confidence: 0.3, indicators: [] },
      accessibility: [],
      textContent: [],
      colors: {
        dominantColors: ['#000000'],
        colorPalette: { primary: '#000000', secondary: '#666666', accent: '#0066cc' },
        colorContrast: { textBackground: 4.5, accessibility: 'AA' }
      },
      deviceType: { type: 'desktop', confidence: 0.7, dimensions: { width: 1200, height: 800, aspectRatio: 1.5 } },
      overallConfidence: 0.3,
      processingTime: 0
    };
  }
}

export const enhancedRagService = new EnhancedRagService();
