
import { buildAnalysisPrompt } from './promptBuilder.ts';

interface ProcessedImage {
  base64Data: string;
  mimeType: string;
  width?: number;
  height?: number;
}

interface AnalysisResult {
  success: boolean;
  annotations?: any[];
  error?: string;
  modelUsed?: string;
  processingTime?: number;
  ragEnhanced?: boolean;
}

interface RagContext {
  retrievedKnowledge: {
    relevantPatterns: any[];
    competitorInsights: any[];
  };
  enhancedPrompt: string;
  researchCitations: string[];
  industryContext: string;
  ragStatus: string;
}

class AIAnalysisManager {
  private circuitBreakerCount = 0;
  private maxCircuitBreakerAttempts = 3;

  async analyzeImages(
    processedImages: ProcessedImage[],
    analysisPrompt: string,
    isComparative: boolean = false,
    ragEnabled: boolean = false
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    console.log('🎯 AIAnalysisManager.analyzeImages - Starting Claude-Oriented UX AI Analysis Pipeline:', {
      imageCount: processedImages.length,
      promptLength: analysisPrompt.length,
      isComparative,
      ragEnabled,
      circuitBreakerCount: this.circuitBreakerCount,
      primaryModel: 'Claude Sonnet 4.0 (70% weight)',
      fallbackModel: 'OpenAI GPT-4.1 (20% weight)',
      researchLayer: 'Perplexity (10% weight)',
      targetInsights: '16-19 professional standard'
    });

    // ✅ ENHANCED: Emergency validation with detailed error reporting
    try {
      const validationResult = this.validateAnalysisInputs(processedImages, analysisPrompt);
      if (!validationResult.isValid) {
        console.error('❌ Analysis input validation failed:', validationResult.errors);
        return {
          success: false,
          error: `Input validation failed: ${validationResult.errors.join(', ')}`,
          validationErrors: validationResult.errors
        };
      }
    } catch (validationError) {
      console.error('❌ Critical validation error:', validationError);
      return {
        success: false,
        error: 'Critical validation failure - unable to process request'
      };
    }

    // Get validated images from validation
    const validImages = this.getValidatedImages(processedImages);

    try {
      // ✅ ENHANCED: Robust orchestrator initialization with error handling
      console.log('🚀 Initializing Enhanced Multi-Model Orchestrator with Claude-first weighting...');
      
      const { multiModelOrchestrator } = await import('./multiModelOrchestrator.ts');
      
      // ✅ ENHANCED: Circuit breaker check before orchestration
      if (this.circuitBreakerCount >= this.maxCircuitBreakerAttempts) {
        console.warn('🚨 Circuit breaker open - using emergency single model fallback');
        const emergencyResult = await this.executeEmergencyFallback(validImages, analysisPrompt);
        return emergencyResult;
      }
      
      const orchestrationResult = await this.withTimeout(
        multiModelOrchestrator.orchestrateAnalysis(
          validImages,
          analysisPrompt,
          {
            ragEnabled,
            perplexityEnabled: true, // Enable Perplexity for research validation
            forceClaudeOnly: false   // Allow fallbacks if needed
          }
        ),
        45000, // 45 second timeout for full orchestration
        'multi-model-orchestration'
      );

      const processingTime = Date.now() - startTime;

      console.log('✅ Claude-Oriented UX AI Analysis Pipeline completed:', {
        finalAnnotationsCount: orchestrationResult.finalAnnotations.length,
        primaryModel: orchestrationResult.synthesisMetadata.primaryModel,
        claudeWeight: orchestrationResult.synthesisMetadata.weights.claude,
        totalModelsUsed: orchestrationResult.synthesisMetadata.totalModelsUsed,
        confidenceScore: orchestrationResult.synthesisMetadata.confidenceScore,
        qualityScore: orchestrationResult.synthesisMetadata.qualityScore,
        fallbacksTriggered: orchestrationResult.synthesisMetadata.fallbacksTriggered,
        processingTimeMs: processingTime,
        professionalStandard: orchestrationResult.finalAnnotations.length >= 16
      });

      // Validate we meet professional UX audit standards
      if (orchestrationResult.finalAnnotations.length < 12) {
        console.warn('⚠️ INSUFFICIENT ANNOTATION COUNT - Below professional standards:', {
          received: orchestrationResult.finalAnnotations.length,
          minimum: 12,
          target: '16-19',
          qualityScore: orchestrationResult.synthesisMetadata.qualityScore
        });
      }

      return {
        success: true,
        annotations: orchestrationResult.finalAnnotations,
        modelUsed: orchestrationResult.synthesisMetadata.primaryModel,
        processingTime,
        ragEnhanced: ragEnabled,
        multiModelMetadata: orchestrationResult.synthesisMetadata
      };

    } catch (error) {
      console.error('❌ Claude-Oriented UX AI Analysis Pipeline failed:', error);
      
      this.circuitBreakerCount++;
      
      if (this.circuitBreakerCount >= this.maxCircuitBreakerAttempts) {
        console.error('🚨 Circuit breaker activated - too many failures');
        return {
          success: false,
          error: 'Analysis service temporarily unavailable after multiple failures',
          circuitBreakerActive: true
        };
      }

      // ✅ ENHANCED: Multi-tier emergency fallback system
      return await this.executeComprehensiveErrorRecovery(error, validImages, analysisPrompt, startTime);
    }
  }

  /**
   * ✅ NEW: Enhanced validation for analysis inputs
   */
  private validateAnalysisInputs(
    processedImages: ProcessedImage[],
    analysisPrompt: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate processed images
    if (!processedImages || !Array.isArray(processedImages)) {
      errors.push('Processed images must be an array');
    } else if (processedImages.length === 0) {
      errors.push('At least one processed image is required');
    } else {
      processedImages.forEach((img, index) => {
        if (!img.base64Data || typeof img.base64Data !== 'string') {
          errors.push(`Image ${index + 1} missing valid base64 data`);
        }
        if (!img.mimeType || typeof img.mimeType !== 'string') {
          errors.push(`Image ${index + 1} missing valid mime type`);
        }
        if (img.base64Data && img.base64Data.length < 100) {
          errors.push(`Image ${index + 1} base64 data too short (corrupted?)`);
        }
      });
    }

    // Validate analysis prompt
    if (!analysisPrompt || typeof analysisPrompt !== 'string') {
      errors.push('Analysis prompt must be a non-empty string');
    } else if (analysisPrompt.trim().length < 10) {
      errors.push('Analysis prompt too short (minimum 10 characters)');
    } else if (analysisPrompt.length > 3000) {
      errors.push('Analysis prompt too long (maximum 3000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * ✅ NEW: Get validated images with robust filtering
   */
  private getValidatedImages(processedImages: ProcessedImage[]): ProcessedImage[] {
    return processedImages.filter(img => {
      // Check for valid base64 data
      if (!img.base64Data || typeof img.base64Data !== 'string' || img.base64Data.length < 100) {
        console.warn('⚠️ Filtering out image with invalid base64 data');
        return false;
      }
      
      // Check for valid mime type
      if (!img.mimeType || !img.mimeType.startsWith('image/')) {
        console.warn('⚠️ Filtering out image with invalid mime type:', img.mimeType);
        return false;
      }
      
      return true;
    });
  }

  /**
   * ✅ NEW: Timeout wrapper for async operations
   */
  private withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operationName: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId));
    });
  }

  /**
   * ✅ NEW: Emergency fallback for when circuit breaker is open
   */
  private async executeEmergencyFallback(
    validImages: ProcessedImage[],
    analysisPrompt: string
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚨 Executing emergency fallback - direct Claude analysis');
      
      const claudeResult = await this.withTimeout(
        this.callClaudeWithModelManager(validImages, analysisPrompt),
        30000,
        'emergency-claude-fallback'
      );
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        annotations: claudeResult.annotations,
        modelUsed: claudeResult.modelUsed + ' (emergency fallback)',
        processingTime,
        ragEnhanced: false,
        emergencyMode: true
      };
    } catch (emergencyError) {
      console.error('❌ Emergency fallback failed:', emergencyError);
      
      // Final fallback - return minimal mock analysis
      return this.createMinimalFallbackAnalysis(emergencyError, startTime);
    }
  }

  /**
   * ✅ NEW: Comprehensive error recovery system
   */
  private async executeComprehensiveErrorRecovery(
    error: unknown,
    validImages: ProcessedImage[],
    analysisPrompt: string,
    startTime: number
  ): Promise<AnalysisResult> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.log('🔄 Executing comprehensive error recovery...');
    
    // Try emergency fallback first
    try {
      const emergencyResult = await this.executeEmergencyFallback(validImages, analysisPrompt);
      if (emergencyResult.success) {
        return emergencyResult;
      }
    } catch (emergencyError) {
      console.warn('⚠️ Emergency fallback also failed:', emergencyError);
    }

    // Final safety net - return minimal analysis
    return this.createMinimalFallbackAnalysis(error, startTime);
  }

  /**
   * ✅ NEW: Create minimal fallback analysis when all else fails
   */
  private createMinimalFallbackAnalysis(
    error: unknown,
    startTime: number
  ): AnalysisResult {
    const errorMessage = error instanceof Error ? error.message : 'Analysis pipeline failure';
    
    console.log('🔧 Creating minimal fallback analysis due to system failure');
    
    // Create minimal annotations based on common UX principles
    const minimalAnnotations = [
      {
        id: 'fallback-1',
        x: 50,
        y: 30,
        severity: 'suggested',
        category: 'ux',
        feedback: 'Unable to complete full analysis. Please verify your images are valid and try again.',
        imageIndex: 0,
        fallbackGenerated: true
      },
      {
        id: 'fallback-2',
        x: 30,
        y: 60,
        severity: 'informational',
        category: 'technical',
        feedback: 'System temporarily experiencing processing difficulties. Our team has been notified.',
        imageIndex: 0,
        fallbackGenerated: true
      }
    ];

    return {
      success: false,
      annotations: minimalAnnotations,
      modelUsed: 'Fallback System',
      processingTime: Date.now() - startTime,
      ragEnhanced: false,
      error: `Analysis failed: ${errorMessage}`,
      fallbackMode: true
    };
  }

  // 🎯 ENHANCED: Claude Model Manager Integration with comprehensive error handling
  private async callClaudeWithModelManager(images: ProcessedImage[], prompt: string): Promise<{annotations: any[], modelUsed?: string}> {
    console.log('🤖 Starting Claude 4.0 analysis with enhanced error handling...');
    
    try {
      const { analyzeWithClaudeModels } = await import('./claude/modelManager.ts');
      
      const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!anthropicApiKey) {
        console.error('❌ ANTHROPIC_API_KEY not found in environment');
        throw new Error('Anthropic API key not configured - check Supabase secrets');
      }

      // ✅ FIX: Enhanced validation and debugging
      console.log('🔍 Claude Model Manager Debug - Processing images:', {
        hasKey: !!anthropicApiKey,
        keyLength: anthropicApiKey.length,
        imageCount: images.length,
        imagesValid: images.every(img => img.base64Data && img.base64Data.length > 0),
        imageDetails: images.map((img, i) => ({
          index: i,
          base64Length: img.base64Data?.length || 0,
          mimeType: img.mimeType,
          hasValidData: !!(img.base64Data && img.base64Data.length > 0)
        }))
      });

      // Validate all images have valid base64 data
      const invalidImages = images.filter(img => !img.base64Data || img.base64Data.length === 0);
      if (invalidImages.length > 0) {
        console.error('❌ Invalid image data detected:', {
          invalidCount: invalidImages.length,
          totalImages: images.length,
          invalidDetails: invalidImages.map((img, i) => ({
            index: i,
            mimeType: img.mimeType,
            hasBase64: !!img.base64Data,
            base64Length: img.base64Data?.length || 0
          }))
        });
        throw new Error(`${invalidImages.length} images have invalid base64 data`);
      }

      // Use first image for analysis (model manager handles single image)
      const primaryImage = images[0];
      if (!primaryImage) {
        throw new Error('No valid image provided for analysis');
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

      console.log('🚀 Calling Claude Model Manager for analysis with Claude 4.0 priority');
      console.log('📋 Analysis request details:', {
        primaryImageBase64Length: primaryImage.base64Data.length,
        primaryImageMimeType: primaryImage.mimeType,
        systemPromptLength: systemPrompt.length,
        targetInsights: '16-19'
      });
      
      // ✅ FIX: Enhanced model manager call with comprehensive error handling
      const annotations = await analyzeWithClaudeModels(
        primaryImage.base64Data,
        primaryImage.mimeType,
        systemPrompt,
        anthropicApiKey
      );
      
      console.log('📊 Claude Model Manager response received:', {
        annotationCount: annotations?.length || 0,
        annotationsValid: Array.isArray(annotations),
        firstAnnotationSample: annotations?.[0] ? {
          hasId: !!annotations[0].id,
          hasFeedback: !!annotations[0].feedback,
          hasSeverity: !!annotations[0].severity,
          hasCoordinates: !!(annotations[0].x && annotations[0].y)
        } : null
      });
      
      if (!Array.isArray(annotations)) {
        console.error('❌ Claude returned non-array result:', typeof annotations);
        throw new Error('Claude Model Manager returned invalid data structure (not an array)');
      }
      
      if (annotations.length === 0) {
        console.error('❌ Claude returned empty annotations array');
        throw new Error('Claude Model Manager returned empty annotations array');
      }
      
      if (annotations.length < 12) {
        console.warn('⚠️ Claude returned insufficient insights:', {
          received: annotations.length,
          minimum: 12,
          target: '16-19'
        });
        throw new Error(`Claude returned insufficient insights: ${annotations.length} (minimum 12 required for professional analysis)`);
      }

      console.log('✅ Claude Model Manager analysis successful:', {
        annotationCount: annotations.length,
        targetRange: '16-19',
        meetsMinimum: annotations.length >= 12,
        meetsTarget: annotations.length >= 16,
        modelUsed: 'Claude 4.0'
      });
      
      return { 
        annotations,
        modelUsed: 'Claude 4.0 Opus (via Model Manager)'
      };

    } catch (error) {
      console.error('❌ Claude Model Manager call failed:', {
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.constructor.name
      });
      
      // ✅ FIX: Provide detailed error information for debugging
      if (error.message?.includes('API key')) {
        throw new Error('Claude API authentication failed - verify ANTHROPIC_API_KEY is correctly set in Supabase secrets');
      } else if (error.message?.includes('insufficient insights')) {
        throw new Error(`Claude 4.0 analysis quality issue: ${error.message}`);
      } else if (error.message?.includes('Model Manager')) {
        throw new Error(`Claude Model Manager error: ${error.message}`);
      } else {
        throw new Error(`Claude 4.0 analysis failed: ${error.message || 'Unknown Claude error'}`);
      }
    }
  }

  private async buildRagContext(prompt: string): Promise<RagContext | null> {
    try {
      console.log('🔍 Building RAG context for comprehensive analysis:', prompt.substring(0, 100));
      
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.7.1');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Call the build-rag-context function
      const { data, error } = await supabase.functions.invoke('build-rag-context', {
        body: {
          userPrompt: prompt,
          analysisId: 'temp-rag-' + Date.now()
        }
      });

      if (error) {
        console.error('❌ RAG context building failed:', error);
        return null;
      }

      console.log('✅ RAG context built:', {
        contextLength: data?.enhancedPrompt?.length || 0,
        knowledgeEntries: data?.retrievedKnowledge?.relevantPatterns?.length || 0,
        competitiveInsights: data?.retrievedKnowledge?.competitorInsights?.length || 0
      });

      return data;
    } catch (error) {
      console.error('❌ RAG context building error:', error);
      return null;
    }
  }

  private formatRagContext(ragResult: RagContext): string {
    let context = '=== UX RESEARCH CONTEXT FOR COMPREHENSIVE ANALYSIS ===\n\n';
    
    if (ragResult.retrievedKnowledge.relevantPatterns.length > 0) {
      context += 'RELEVANT UX PATTERNS AND BEST PRACTICES:\n';
      ragResult.retrievedKnowledge.relevantPatterns.slice(0, 8).forEach((pattern, index) => {
        context += `${index + 1}. ${pattern.title}\n`;
        context += `   ${pattern.content.substring(0, 200)}...\n\n`;
      });
    }

    if (ragResult.retrievedKnowledge.competitorInsights.length > 0) {
      context += 'COMPETITIVE INSIGHTS:\n';
      ragResult.retrievedKnowledge.competitorInsights.slice(0, 3).forEach((insight, index) => {
        context += `${index + 1}. ${insight.pattern_name}: ${insight.description.substring(0, 150)}...\n`;
      });
      context += '\n';
    }

    context += `INDUSTRY CONTEXT: ${ragResult.industryContext}\n\n`;
    context += 'Use this research context to provide comprehensive, evidence-based recommendations with exactly 16-19 professional insights.\n\n';
    
    return context;
  }

  // 🔄 UPDATED: OpenAI Fallback Method - Now uses base64Data directly
  private async callOpenAI(images: ProcessedImage[], prompt: string): Promise<Response> {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('🔍 OpenAI API Debug - Processing images:', {
      hasKey: !!openaiApiKey,
      keyLength: openaiApiKey.length,
      imageCount: images.length,
      imagesValid: images.every(img => img.base64Data && img.base64Data.length > 0)
    });

    // Validate all images have valid base64 data
    const invalidImages = images.filter(img => !img.base64Data || img.base64Data.length === 0);
    if (invalidImages.length > 0) {
      console.error('❌ Invalid image data detected for OpenAI:', {
        invalidCount: invalidImages.length,
        totalImages: images.length
      });
      throw new Error(`${invalidImages.length} images have invalid base64 data for OpenAI`);
    }

    const messages = [
      {
        role: 'system',
        content: 'You are a professional UX analysis expert conducting comprehensive audits. You MUST generate exactly 16-19 detailed, research-backed insights covering all aspects of design quality, usability, and business impact. Balance critical issues, improvements, and positive validations. This is a professional consulting requirement - never provide fewer than 16 insights for a comprehensive analysis.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...images.map(img => ({
            type: 'image_url',
            image_url: { 
              url: `data:${img.mimeType};base64,${img.base64Data}`, 
              detail: 'high' 
            }
          }))
        ]
      }
    ];

    try {
      console.log('🚀 Making OpenAI API request');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 4000,
          temperature: 0.3
        }),
      });

      console.log('📡 OpenAI API response status:', response.status, response.statusText);
      return response;

    } catch (error) {
      console.error('❌ OpenAI API call failed:', error);
      throw error;
    }
  }

  private parseAnnotations(rawContent: string): any[] {
    try {
      console.log('🔍 Parsing annotations from content length:', rawContent.length);
      
      // Clean the response to extract JSON
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('❌ No JSON array found in response');
        console.error('Raw content preview:', rawContent.substring(0, 1000));
        return [];
      }

      const jsonString = jsonMatch[0];
      console.log('🔍 Found JSON string, length:', jsonString.length);
      
      const annotations = JSON.parse(jsonString);

      if (!Array.isArray(annotations)) {
        console.error('❌ Parsed result is not an array');
        return [];
      }

      console.log('✅ Successfully parsed comprehensive annotations:', {
        count: annotations.length,
        target: '16-19',
        meetsMinimum: annotations.length >= 12,
        meetsTarget: annotations.length >= 16
      });
      
      return annotations;

    } catch (error) {
      console.error('❌ Failed to parse annotations:', error);
      console.error('Raw content preview:', rawContent.substring(0, 1000));
      return [];
    }
  }
}

export const aiAnalysisManager = new AIAnalysisManager();
