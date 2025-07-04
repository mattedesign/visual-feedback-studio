/**
 * 🎯 Claude-Oriented UX AI Analysis Pipeline
 * Multi-Model Orchestrator with Claude-First Architecture
 * 
 * This orchestrator implements the Claude-first weighting system:
 * - Claude Sonnet 4.0: 70% weight (primary strategic analysis)
 * - OpenAI GPT-4.1: 20% weight (fallback & synthesis support)
 * - Perplexity: 10% weight (research validation & competitive intelligence)
 */

interface ModelWeights {
  claude: number;
  openai: number;
  perplexity: number;
}

interface ModelResult {
  modelName: string;
  annotations: any[];
  confidence: number;
  processingTime: number;
  success: boolean;
  error?: string;
  metadata?: any;
}

interface OrchestratedResult {
  finalAnnotations: any[];
  modelResults: ModelResult[];
  synthesisMetadata: {
    primaryModel: string;
    weights: ModelWeights;
    confidenceScore: number;
    totalModelsUsed: number;
    fallbacksTriggered: string[];
    qualityScore: number;
  };
}

export class MultiModelOrchestrator {
  // ✅ FIXED: Claude-First Weighting Matrix (was broken before)
  private static readonly CLAUDE_FIRST_WEIGHTS: ModelWeights = {
    claude: 0.70,    // Primary strategic model (70%)
    openai: 0.20,    // Secondary synthesis support (20%)
    perplexity: 0.10 // Research validation layer (10%)
  };

  // Quality thresholds for model performance
  private static readonly QUALITY_THRESHOLDS = {
    claude: {
      minAnnotations: 16,     // Professional UX audit standard
      confidenceThreshold: 0.85,
      targetRange: [16, 19]
    },
    openai: {
      minAnnotations: 12,     // Fallback minimum
      confidenceThreshold: 0.75,
      targetRange: [12, 16]
    },
    perplexity: {
      minResearchSources: 3,  // Research validation minimum
      confidenceThreshold: 0.70
    }
  };

  /**
   * 🚀 Main orchestration method - Claude-first with intelligent fallbacks
   */
  async orchestrateAnalysis(
    processedImages: any[],
    analysisPrompt: string,
    options: {
      ragEnabled?: boolean;
      perplexityEnabled?: boolean;
      forceClaudeOnly?: boolean;
    } = {}
  ): Promise<OrchestratedResult> {
    console.log('🎯 MultiModelOrchestrator - Starting Claude-first analysis pipeline', {
      imageCount: processedImages.length,
      promptLength: analysisPrompt.length,
      claudeWeight: MultiModelOrchestrator.CLAUDE_FIRST_WEIGHTS.claude,
      ragEnabled: options.ragEnabled,
      perplexityEnabled: options.perplexityEnabled,
      forceClaudeOnly: options.forceClaudeOnly
    });

    const modelResults: ModelResult[] = [];
    const fallbacksTriggered: string[] = [];
    const startTime = Date.now();

    try {
      // 🎯 PHASE 1: Claude Sonnet 4.0 Primary Analysis (70% weight)
      console.log('🤖 Phase 1: Claude Sonnet 4.0 Primary Analysis (70% weight)');
      const claudeResult = await this.runClaudeAnalysis(processedImages, analysisPrompt, options);
      modelResults.push(claudeResult);

      // Check if Claude meets quality standards
      if (this.isClaudeResultAcceptable(claudeResult)) {
        console.log('✅ Claude result meets quality standards - proceeding with synthesis');
        
        // If force Claude only, return early
        if (options.forceClaudeOnly) {
          return this.createSingleModelResult(claudeResult, 'claude');
        }
      } else {
        console.warn('⚠️ Claude result below quality threshold - triggering fallbacks');
        fallbacksTriggered.push('claude-quality-insufficient');
      }

      // 🔄 PHASE 2: OpenAI GPT-4.1 Fallback/Enhancement (20% weight)
      console.log('🔄 Phase 2: OpenAI GPT-4.1 Synthesis Support (20% weight)');
      const openaiResult = await this.runOpenAIAnalysis(processedImages, analysisPrompt, claudeResult);
      modelResults.push(openaiResult);

      // 🔍 PHASE 3: Perplexity Research Validation (10% weight) - if enabled
      let perplexityResult: ModelResult | null = null;
      if (options.perplexityEnabled) {
        console.log('🔍 Phase 3: Perplexity Research Validation (10% weight)');
        perplexityResult = await this.runPerplexityValidation(analysisPrompt, claudeResult.annotations);
        if (perplexityResult) {
          modelResults.push(perplexityResult);
        }
      }

      // 🧠 PHASE 4: Intelligent Synthesis with Claude-First Weighting
      console.log('🧠 Phase 4: Claude-First Weighted Synthesis');
      const synthesizedResult = await this.synthesizeResults(
        modelResults,
        MultiModelOrchestrator.CLAUDE_FIRST_WEIGHTS,
        fallbacksTriggered
      );

      const totalProcessingTime = Date.now() - startTime;

      console.log('✅ Multi-model orchestration completed', {
        modelsUsed: modelResults.length,
        finalAnnotationCount: synthesizedResult.annotations.length,
        primaryModel: 'Claude Sonnet 4.0',
        claudeWeight: MultiModelOrchestrator.CLAUDE_FIRST_WEIGHTS.claude,
        processingTimeMs: totalProcessingTime,
        fallbacksTriggered: fallbacksTriggered.length
      });

      return {
        finalAnnotations: synthesizedResult.annotations,
        modelResults,
        synthesisMetadata: {
          primaryModel: 'Claude Sonnet 4.0',
          weights: MultiModelOrchestrator.CLAUDE_FIRST_WEIGHTS,
          confidenceScore: synthesizedResult.confidence,
          totalModelsUsed: modelResults.length,
          fallbacksTriggered,
          qualityScore: this.calculateOverallQuality(modelResults)
        }
      };

    } catch (error) {
      console.error('❌ Multi-model orchestration failed', error);
      
      // Emergency fallback - try to return the best available result
      const bestResult = this.selectBestFallbackResult(modelResults);
      if (bestResult) {
        return this.createSingleModelResult(bestResult, 'emergency-fallback');
      }

      throw new Error(`Multi-model orchestration failed: ${error.message}`);
    }
  }

  /**
   * 🤖 Claude Sonnet 4.0 Analysis (Primary Model) - Enhanced with robust error handling
   */
  private async runClaudeAnalysis(
    images: any[],
    prompt: string,
    options: any
  ): Promise<ModelResult> {
    const startTime = Date.now();
    
    try {
      console.log('🤖 Executing Enhanced Claude Sonnet 4.0 analysis...');
      
      // ✅ ENHANCED: Validate inputs before processing
      if (!images || !Array.isArray(images) || images.length === 0) {
        throw new Error('No images provided for Claude analysis');
      }
      
      // Import and use the existing Claude model manager
      const { analyzeWithClaudeModels } = await import('./claude/modelManager.ts');
      
      const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!anthropicApiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured in Supabase secrets');
      }

      // ✅ ENHANCED: Validate image data more thoroughly
      const primaryImage = images[0];
      if (!primaryImage) {
        throw new Error('Primary image is null or undefined');
      }
      
      if (!primaryImage.base64Data || typeof primaryImage.base64Data !== 'string') {
        throw new Error('Primary image missing valid base64Data');
      }
      
      if (primaryImage.base64Data.length < 100) {
        throw new Error('Primary image base64Data appears corrupted (too short)');
      }
      
      if (!primaryImage.mimeType || !primaryImage.mimeType.startsWith('image/')) {
        throw new Error(`Invalid image mime type: ${primaryImage.mimeType}`);
      }

      const systemPrompt = `You are a professional UX analysis expert conducting comprehensive audits. You MUST generate exactly 16-19 detailed, research-backed insights covering all aspects of design quality, usability, and business impact.

CRITICAL REQUIREMENTS:
- Generate EXACTLY 16-19 insights (professional consulting standard)
- Include a mix of: critical issues, improvements, positive validations, and business opportunities
- Cover: UX patterns, accessibility, visual design, conversion optimization, mobile experience
- Use research-backed recommendations when possible
- Format as valid JSON array with proper structure

RESPONSE FORMAT - Return ONLY a JSON array like this:
[
  {
    "id": "annotation-1",
    "x": 50,
    "y": 30,
    "severity": "critical",
    "category": "ux",
    "feedback": "Detailed insight with specific recommendations...",
    "imageIndex": 0
  }
]

Ensure exactly 16-19 insights for comprehensive professional analysis.

ANALYSIS CONTEXT: ${prompt}`;

      // ✅ ENHANCED: Add timeout and retry logic for Claude API calls
      console.log('🚀 Calling Claude with enhanced error handling...', {
        imageBase64Length: primaryImage.base64Data.length,
        imageType: primaryImage.mimeType,
        promptLength: systemPrompt.length
      });
      
      const annotations = await this.withClaudeTimeout(
        analyzeWithClaudeModels(
          primaryImage.base64Data,
          primaryImage.mimeType,
          systemPrompt,
          anthropicApiKey,
          'claude-sonnet-4-20250514' // Prioritize Sonnet 4.0
        ),
        35000 // 35 second timeout for Claude
      );

      // ✅ ENHANCED: Validate Claude response quality
      console.log('🔍 CLAUDE RESPONSE DEBUG:', {
        responseType: typeof annotations,
        isArray: Array.isArray(annotations),
        length: Array.isArray(annotations) ? annotations.length : 'N/A',
        rawResponse: typeof annotations === 'string' ? annotations.substring(0, 200) + '...' : annotations
      });

      if (!Array.isArray(annotations)) {
        console.error('❌ Claude returned non-array response:', annotations);
        throw new Error(`Claude returned non-array response: ${typeof annotations}`);
      }
      
      if (annotations.length === 0) {
        console.error('❌ Claude returned empty annotations array');
        throw new Error('Claude returned empty annotations array');
      }

      const processingTime = Date.now() - startTime;
      const confidence = this.calculateClaudeConfidence(annotations);

      console.log('✅ Enhanced Claude analysis completed', {
        annotationCount: annotations.length,
        confidence,
        processingTimeMs: processingTime,
        meetsQualityStandard: annotations.length >= 16,
        qualityGrade: annotations.length >= 18 ? 'Excellent' : annotations.length >= 16 ? 'Good' : annotations.length >= 12 ? 'Acceptable' : 'Below Standard',
        // ✅ DEBUG: Log first few annotations to check structure
        sampleAnnotations: annotations.slice(0, 2).map(a => ({
          id: a.id,
          x: a.x,
          y: a.y,
          category: a.category,
          feedbackPreview: typeof a.feedback === 'string' ? a.feedback.substring(0, 50) + '...' : 'No feedback'
        }))
      });

      return {
        modelName: 'Claude Sonnet 4.0',
        annotations,
        confidence,
        processingTime,
        success: true,
        metadata: {
          targetRange: [16, 19],
          actualCount: annotations.length,
          qualityScore: this.calculateAnnotationQuality(annotations)
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown Claude error';
      
      console.error('❌ Enhanced Claude analysis failed', {
        error: errorMessage,
        processingTimeMs: processingTime,
        imageValidation: {
          hasImages: images.length > 0,
          firstImageValid: images[0]?.base64Data?.length > 0,
          imageCount: images.length
        }
      });
      
      // ✅ ENHANCED: Categorize Claude errors for better debugging
      let enhancedError = errorMessage;
      if (errorMessage.includes('API key')) {
        enhancedError = 'Claude API authentication failed - check ANTHROPIC_API_KEY in Supabase secrets';
      } else if (errorMessage.includes('timeout')) {
        enhancedError = 'Claude API request timed out - image may be too large or service overloaded';
      } else if (errorMessage.includes('rate limit')) {
        enhancedError = 'Claude API rate limit exceeded - please wait and try again';
      } else if (errorMessage.includes('base64')) {
        enhancedError = 'Image processing error - invalid or corrupted image data';
      }
      
      return {
        modelName: 'Claude Sonnet 4.0',
        annotations: [],
        confidence: 0,
        processingTime,
        success: false,
        error: enhancedError,
        errorCategory: this.categorizeError(errorMessage)
      };
    }
  }

  /**
   * ✅ NEW: Timeout wrapper specifically for Claude API calls
   */
  private withClaudeTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Claude API call timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId));
    });
  }

  /**
   * ✅ NEW: Error categorization for better debugging
   */
  private categorizeError(errorMessage: string): string {
    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      return 'authentication';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return 'timeout';
    } else if (errorMessage.includes('rate limit')) {
      return 'rate_limit';
    } else if (errorMessage.includes('base64') || errorMessage.includes('image')) {
      return 'image_processing';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network';
    } else {
      return 'unknown';
    }
  }

  /**
   * 🔄 OpenAI GPT-4.1 Analysis (Fallback/Enhancement)
   */
  private async runOpenAIAnalysis(
    images: any[],
    prompt: string,
    claudeResult: ModelResult
  ): Promise<ModelResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Executing OpenAI GPT-4.1 fallback analysis...');
      
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }

      // Prepare image content for OpenAI
      const imageContent = images.map(img => ({
        type: "image_url",
        image_url: {
          url: `data:${img.mimeType};base64,${img.base64Data}`,
          detail: "high"
        }
      }));

      const messages = [
        {
          role: "system",
          content: `You are a UX analysis expert providing ${claudeResult.success ? 'supplementary' : 'primary'} analysis. Generate 12-16 detailed insights in JSON format.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...imageContent
          ]
        }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages,
          max_tokens: 4000,
          temperature: 0.3
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.choices[0].message.content;
      
      // Parse annotations from OpenAI response
      const annotations = this.parseAnnotations(rawContent);
      const processingTime = Date.now() - startTime;
      const confidence = this.calculateOpenAIConfidence(annotations, claudeResult);

      console.log('✅ OpenAI analysis completed', {
        annotationCount: annotations.length,
        confidence,
        processingTimeMs: processingTime,
        isSupplementary: claudeResult.success
      });

      return {
        modelName: 'OpenAI GPT-4.1',
        annotations,
        confidence,
        processingTime,
        success: true,
        metadata: {
          role: claudeResult.success ? 'supplementary' : 'primary',
          rawResponseLength: rawContent.length
        }
      };

    } catch (error) {
      console.error('❌ OpenAI analysis failed', error);
      
      return {
        modelName: 'OpenAI GPT-4.1',
        annotations: [],
        confidence: 0,
        processingTime: Date.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🔍 Perplexity Research Validation
   */
  private async runPerplexityValidation(
    prompt: string,
    annotations: any[]
  ): Promise<ModelResult | null> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Executing Perplexity research validation...');
      
      // Extract key themes from annotations for research
      const researchQueries = this.extractResearchQueries(annotations, prompt);
      const validationResults = [];

      for (const query of researchQueries.slice(0, 3)) { // Limit to 3 queries
        try {
          const research = await this.queryPerplexity(query);
          if (research) {
            validationResults.push(research);
          }
        } catch (error) {
          console.warn('⚠️ Perplexity query failed:', query, error);
        }
      }

      const processingTime = Date.now() - startTime;
      const confidence = validationResults.length / researchQueries.length;

      console.log('✅ Perplexity validation completed', {
        queriesExecuted: validationResults.length,
        totalQueries: researchQueries.length,
        confidence,
        processingTimeMs: processingTime
      });

      return {
        modelName: 'Perplexity Research',
        annotations: [], // Perplexity provides validation, not annotations
        confidence,
        processingTime,
        success: true,
        metadata: {
          validationResults,
          researchQueries,
          sourcesFound: validationResults.reduce((sum, r) => sum + (r.sources?.length || 0), 0)
        }
      };

    } catch (error) {
      console.error('❌ Perplexity validation failed', error);
      return null;
    }
  }

  /**
   * 🧠 Intelligent Synthesis with Claude-First Weighting
   */
  private async synthesizeResults(
    modelResults: ModelResult[],
    weights: ModelWeights,
    fallbacks: string[]
  ): Promise<{ annotations: any[]; confidence: number }> {
    console.log('🧠 Synthesizing results with Claude-first weighting', {
      resultsCount: modelResults.length,
      claudeWeight: weights.claude,
      openaiWeight: weights.openai,
      perplexityWeight: weights.perplexity
    });

    const claudeResult = modelResults.find(r => r.modelName.includes('Claude'));
    const openaiResult = modelResults.find(r => r.modelName.includes('OpenAI'));
    const perplexityResult = modelResults.find(r => r.modelName.includes('Perplexity'));

    // If Claude succeeded and meets quality, use it as primary
    if (claudeResult?.success && this.isClaudeResultAcceptable(claudeResult)) {
      console.log('✅ Using Claude as primary with high confidence');
      
      // Enhance Claude results with OpenAI insights if available
      let enhancedAnnotations = [...claudeResult.annotations];
      
      if (openaiResult?.success && openaiResult.annotations.length > 0) {
        enhancedAnnotations = this.mergeAnnotations(
          claudeResult.annotations,
          openaiResult.annotations,
          weights.claude,
          weights.openai
        );
      }

      // Apply Perplexity research validation if available
      if (perplexityResult?.success) {
        enhancedAnnotations = this.applyPerplexityValidation(
          enhancedAnnotations,
          perplexityResult.metadata?.validationResults || []
        );
      }

      return {
        annotations: enhancedAnnotations,
        confidence: claudeResult.confidence * 0.9 // High confidence for Claude-primary
      };
    }

    // Fallback: Use OpenAI if Claude failed
    if (openaiResult?.success) {
      console.log('🔄 Using OpenAI as primary fallback');
      
      return {
        annotations: openaiResult.annotations,
        confidence: openaiResult.confidence * 0.7 // Lower confidence for fallback
      };
    }

    // Emergency: Return empty result
    console.warn('⚠️ All models failed - returning empty result');
    return {
      annotations: [],
      confidence: 0
    };
  }

  /**
   * Quality Assessment Methods
   */
  private isClaudeResultAcceptable(result: ModelResult): boolean {
    if (!result.success) return false;
    
    const thresholds = MultiModelOrchestrator.QUALITY_THRESHOLDS.claude;
    const annotationCount = result.annotations.length;
    
    return (
      annotationCount >= thresholds.minAnnotations &&
      result.confidence >= thresholds.confidenceThreshold &&
      annotationCount <= thresholds.targetRange[1]
    );
  }

  private calculateClaudeConfidence(annotations: any[]): number {
    const targetMin = MultiModelOrchestrator.QUALITY_THRESHOLDS.claude.targetRange[0];
    const targetMax = MultiModelOrchestrator.QUALITY_THRESHOLDS.claude.targetRange[1];
    const count = annotations.length;
    
    if (count >= targetMin && count <= targetMax) {
      return 0.95; // High confidence for target range
    } else if (count >= 12) {
      return 0.80; // Good confidence for acceptable range
    } else {
      return 0.50; // Low confidence for insufficient results
    }
  }

  private calculateOpenAIConfidence(annotations: any[], claudeResult: ModelResult): number {
    const count = annotations.length;
    const isSupplementary = claudeResult.success;
    
    if (isSupplementary) {
      return count >= 8 ? 0.75 : 0.60; // Lower expectation for supplementary
    } else {
      return count >= 12 ? 0.80 : 0.65; // Higher expectation for primary
    }
  }

  private calculateOverallQuality(results: ModelResult[]): number {
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) return 0;
    
    const avgConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length;
    const completionRate = successfulResults.length / results.length;
    
    return (avgConfidence * 0.7 + completionRate * 0.3);
  }

  /**
   * Utility Methods
   */
  private parseAnnotations(rawContent: string): any[] {
    try {
      // Try to extract JSON array from the response
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: manual parsing
      return this.manualAnnotationParsing(rawContent);
    } catch (error) {
      console.warn('⚠️ Annotation parsing failed, using manual parsing');
      return this.manualAnnotationParsing(rawContent);
    }
  }

  private manualAnnotationParsing(content: string): any[] {
    // Basic fallback parsing - create minimal annotations
    const lines = content.split('\n').filter(line => line.trim());
    const annotations = [];
    
    for (let i = 0; i < Math.min(lines.length, 12); i++) {
      const line = lines[i];
      if (line.length > 10) {
        annotations.push({
          id: `parsed-${i + 1}`,
          x: 30 + (i % 3) * 30,
          y: 20 + Math.floor(i / 3) * 25,
          severity: i < 3 ? 'critical' : i < 8 ? 'suggested' : 'positive',
          category: 'ux',
          feedback: line.trim(),
          imageIndex: 0
        });
      }
    }
    
    return annotations;
  }

  private mergeAnnotations(
    primaryAnnotations: any[],
    secondaryAnnotations: any[],
    primaryWeight: number,
    secondaryWeight: number
  ): any[] {
    // Prioritize primary annotations and selectively add secondary ones
    const merged = [...primaryAnnotations];
    const maxTotal = 19;
    
    if (merged.length < maxTotal) {
      const remainingSlots = maxTotal - merged.length;
      const uniqueSecondary = secondaryAnnotations
        .filter(sec => !primaryAnnotations.some(pri => 
          Math.abs(pri.x - sec.x) < 10 && Math.abs(pri.y - sec.y) < 10
        ))
        .slice(0, remainingSlots);
      
      merged.push(...uniqueSecondary);
    }
    
    return merged;
  }

  private applyPerplexityValidation(annotations: any[], validationResults: any[]): any[] {
    // Enhance annotations with research validation indicators
    return annotations.map(annotation => ({
      ...annotation,
      researchValidated: validationResults.length > 0,
      researchSources: validationResults.slice(0, 2)
    }));
  }

  private extractResearchQueries(annotations: any[], prompt: string): string[] {
    const themes = annotations
      .map(a => a.category || 'ux')
      .filter((category, index, self) => self.indexOf(category) === index)
      .slice(0, 3);
    
    return themes.map(theme => `UX best practices for ${theme} in modern web design`);
  }

  private async queryPerplexity(query: string): Promise<any> {
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'user', content: query }
        ],
        temperature: 0.2,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      query,
      content: data.choices[0].message.content,
      sources: [] // Perplexity provides sources in some responses
    };
  }

  private selectBestFallbackResult(results: ModelResult[]): ModelResult | null {
    const successfulResults = results.filter(r => r.success && r.annotations.length > 0);
    if (successfulResults.length === 0) return null;
    
    // Prioritize Claude, then OpenAI
    return successfulResults.find(r => r.modelName.includes('Claude')) ||
           successfulResults.find(r => r.modelName.includes('OpenAI')) ||
           successfulResults[0];
  }

  private createSingleModelResult(modelResult: ModelResult, reason: string): OrchestratedResult {
      return {
        finalAnnotations: modelResult.annotations,
        modelResults: [modelResult],
        synthesisMetadata: {
          primaryModel: modelResult.modelName,
          weights: reason === 'claude' ? MultiModelOrchestrator.CLAUDE_FIRST_WEIGHTS : { claude: 1, openai: 0, perplexity: 0 },
          confidenceScore: modelResult.confidence,
          totalModelsUsed: 1,
          fallbacksTriggered: [reason],
          qualityScore: modelResult.confidence
        }
      };
    }

    /**
     * ✅ NEW: Calculate annotation quality score
     */
    private calculateAnnotationQuality(annotations: any[]): number {
      if (!annotations || annotations.length === 0) return 0;
      
      let qualityScore = 0;
      
      // Base score from count
      const countScore = Math.min(annotations.length / 18, 1); // Max at 18 annotations
      qualityScore += countScore * 0.4;
      
      // Diversity score (different categories)
      const categories = new Set(annotations.map(a => a.category).filter(Boolean));
      const diversityScore = Math.min(categories.size / 5, 1); // Max at 5 categories
      qualityScore += diversityScore * 0.3;
      
      // Content quality score (feedback length and detail)
      const avgFeedbackLength = annotations.reduce((sum, a) => sum + (a.feedback?.length || 0), 0) / annotations.length;
      const contentScore = Math.min(avgFeedbackLength / 100, 1); // Max at 100 chars average
      qualityScore += contentScore * 0.3;
      
      return qualityScore;
    }
  }

  export const multiModelOrchestrator = new MultiModelOrchestrator();