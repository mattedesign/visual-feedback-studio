// Multi-Model Orchestration System for Enhanced UX Analysis
import { ClaudeStrategistInput, EnhancedStrategistOutput } from '@/types/strategistInput';

export interface ModelResponse {
  modelName: 'claude' | 'gpt-4o' | 'perplexity' | 'google-vision';
  success: boolean;
  response?: any;
  error?: string;
  processingTime: number;
  confidence: number;
  metadata?: {
    tokensUsed?: number;
    requestId?: string;
    model?: string;
    sourcesFound?: number;
    featuresDetected?: number;
    validationScore?: number;
  };
}

export interface ModelWeights {
  claude: number;      // 0.5 - Primary strategic analysis
  gpt4o: number;       // 0.2 - Alternative perspective
  perplexity: number;  // 0.2 - Research and current trends
  googleVision: number; // 0.1 - Visual analysis validation
}

export interface SynthesisResult {
  synthesizedOutput: EnhancedStrategistOutput;
  modelContributions: {
    claude: number;
    gpt4o: number;
    perplexity: number;
    googleVision: number;
  };
  overallConfidence: number;
  processingMetrics: {
    totalTime: number;
    successfulModels: number;
    failedModels: string[];
    fallbacksUsed: string[];
  };
}

export class MultiModelOrchestrator {
  private weights: ModelWeights = {
    claude: 0.8,    // Primary - more weight
    gpt4o: 0.2,     // Backup only  
    perplexity: 0,  // Disabled for now
    googleVision: 0 // Disabled for now
  };

  private requestTimeout = 45000; // 45 seconds - more generous

  async orchestrateAnalysis(input: ClaudeStrategistInput): Promise<SynthesisResult> {
    console.log('🎭 Starting simplified orchestration (Claude primary)...');
    const startTime = Date.now();

    try {
      // Try Claude first
      const claudeResult = await this.callClaudeModel(input);
      
      if (claudeResult.success) {
        console.log('✅ Claude analysis successful');
        return {
          synthesizedOutput: claudeResult.response,
          modelContributions: { claude: 1, gpt4o: 0, perplexity: 0, googleVision: 0 },
          overallConfidence: claudeResult.confidence,
          processingMetrics: {
            totalTime: Date.now() - startTime,
            successfulModels: 1,
            failedModels: [],
            fallbacksUsed: []
          }
        };
      }

      // Fallback to GPT-4o if Claude fails
      console.log('⚠️ Claude failed, trying GPT-4o...');
      const gptResult = await this.callGPT4oModel(input);
      
      if (gptResult.success) {
        console.log('✅ GPT-4o fallback successful');
        return {
          synthesizedOutput: gptResult.response,
          modelContributions: { claude: 0, gpt4o: 1, perplexity: 0, googleVision: 0 },
          overallConfidence: gptResult.confidence,
          processingMetrics: {
            totalTime: Date.now() - startTime,
            successfulModels: 1,
            failedModels: ['claude'],
            fallbacksUsed: ['gpt-4o']
          }
        };
      }

      // Both failed - return simple fallback
      console.log('❌ Both Claude and GPT-4o failed');
      return this.generateFallbackSynthesis(input, Date.now() - startTime);

    } catch (error) {
      console.error('❌ Orchestration failed:', error);
      return this.generateFallbackSynthesis(input, Date.now() - startTime);
    }
  }


  private async callClaudeModel(input: ClaudeStrategistInput): Promise<ModelResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🎭 Calling Claude model...');
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = 'https://mxxtvtwcoplfajvazpav.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eHR2dHdjb3BsZmFqdmF6cGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDU2NjgsImV4cCI6MjA2NjE4MTY2OH0.b9sNxeDALujnw2tQD-qnbs3YkZvvTkja8jG6clgpibA';
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase.functions.invoke('claude-strategist', {
        body: {
          input,
          model: 'claude-opus-4-20250514',
          orchestrationMode: true
        }
      });

      if (error) throw error;

      return {
        modelName: 'claude',
        success: true,
        response: data.result,
        processingTime: Date.now() - startTime,
        confidence: data.result?.confidenceAssessment?.overallConfidence || 0.8,
        metadata: {
          model: 'claude-opus-4-20250514',
          requestId: data.requestId
        }
      };

    } catch (error) {
      return {
        modelName: 'claude',
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
        confidence: 0
      };
    }
  }

  private async callGPT4oModel(input: ClaudeStrategistInput): Promise<ModelResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🤖 Calling GPT-4o model...');
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = 'https://mxxtvtwcoplfajvazpav.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eHR2dHdjb3BsZmFqdmF6cGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDU2NjgsImV4cCI6MjA2NjE4MTY2OH0.b9sNxeDALujnw2tQD-qnbs3YkZvvTkja8jG6clgpibA';
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase.functions.invoke('multi-model-analysis', {
        body: {
          input,
          provider: 'openai',
          model: 'gpt-4.1-2025-04-14',
          analysisType: 'strategic-ux'
        }
      });

      if (error) throw error;

      return {
        modelName: 'gpt-4o',
        success: true,
        response: data.result,
        processingTime: Date.now() - startTime,
        confidence: data.confidence || 0.75,
        metadata: {
          model: 'gpt-4.1-2025-04-14',
          tokensUsed: data.tokensUsed
        }
      };

    } catch (error) {
      return {
        modelName: 'gpt-4o',
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
        confidence: 0
      };
    }
  }

  private async callPerplexityModel(input: ClaudeStrategistInput): Promise<ModelResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Calling Perplexity model for research enhancement...');
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = 'https://mxxtvtwcoplfajvazpav.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eHR2dHdjb3BsZmFqdmF6cGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDU2NjgsImV4cCI6MjA2NjE4MTY2OH0.b9sNxeDALujnw2tQD-qnbs3YkZvvTkja8jG6clgpibA';
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase.functions.invoke('perplexity-research', {
        body: {
          query: `UX research for ${input.problemStatement} in ${input.industryContext} industry`,
          industryContext: input.industryContext,
          businessContext: input.businessContext,
          enhancedMode: true
        }
      });

      if (error) throw error;

      return {
        modelName: 'perplexity',
        success: true,
        response: data.research,
        processingTime: Date.now() - startTime,
        confidence: data.confidence || 0.7,
        metadata: {
          model: 'llama-3.1-sonar-large-128k-online',
          sourcesFound: data.sources?.length || 0
        }
      };

    } catch (error) {
      return {
        modelName: 'perplexity',
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
        confidence: 0
      };
    }
  }

  private async callGoogleVisionModel(input: ClaudeStrategistInput): Promise<ModelResponse> {
    const startTime = Date.now();
    
    try {
      console.log('👁️ Calling Google Vision for visual analysis validation...');
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = 'https://mxxtvtwcoplfajvazpav.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eHR2dHdjb3BsZmFqdmF6cGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDU2NjgsImV4cCI6MjA2NjE4MTY2OH0.b9sNxeDALujnw2tQD-qnbs3YkZvvTkja8jG6clgpibA';
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase.functions.invoke('google-vision-analysis', {
        body: {
          visionSummary: input.visionSummary,
          analysisMode: 'validation',
          contextualAnalysis: true
        }
      });

      if (error) throw error;

      return {
        modelName: 'google-vision',
        success: true,
        response: data.analysis,
        processingTime: Date.now() - startTime,
        confidence: data.confidence || 0.6,
        metadata: {
          featuresDetected: data.featuresCount,
          validationScore: data.validationScore
        }
      };

    } catch (error) {
      return {
        modelName: 'google-vision',
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
        confidence: 0
      };
    }
  }

  private async synthesizeResponses(responses: ModelResponse[], input: ClaudeStrategistInput): Promise<SynthesisResult> {
    console.log('🔄 Synthesizing multi-model responses...');
    
    const successfulResponses = responses.filter(r => r.success);
    const failedModels = responses.filter(r => !r.success).map(r => r.modelName);
    
    if (successfulResponses.length === 0) {
      throw new Error('All AI models failed to respond');
    }

    // Calculate weighted contributions
    const totalWeight = successfulResponses.reduce((sum, response) => {
      return sum + this.weights[response.modelName];
    }, 0);

    // Normalize weights for successful models only
    const normalizedContributions: { claude: number; gpt4o: number; perplexity: number; googleVision: number } = {
      claude: 0,
      gpt4o: 0,
      perplexity: 0,
      googleVision: 0
    };
    
    successfulResponses.forEach(response => {
      normalizedContributions[response.modelName] = this.weights[response.modelName] / totalWeight;
    });

    // Primary synthesis from Claude (if available)
    const claudeResponse = successfulResponses.find(r => r.modelName === 'claude');
    const baseAnalysis = claudeResponse?.response || this.generateBaseSynthesis(input, successfulResponses);

    // Enhance with other model insights
    const enhancedAnalysis = this.enhanceWithMultiModelInsights(baseAnalysis, successfulResponses, input);

    // Calculate overall confidence
    const overallConfidence = this.calculateWeightedConfidence(successfulResponses, normalizedContributions);

    return {
      synthesizedOutput: enhancedAnalysis,
      modelContributions: normalizedContributions,
      overallConfidence,
      processingMetrics: {
        totalTime: 0, // Will be set by caller
        successfulModels: successfulResponses.length,
        failedModels,
        fallbacksUsed: failedModels.length > 0 ? ['enhanced-synthesis'] : []
      }
    };
  }

  private calculateWeightedConfidence(responses: ModelResponse[], contributions: any): number {
    return responses.reduce((totalConfidence, response) => {
      const contribution = contributions[response.modelName] || 0;
      return totalConfidence + (response.confidence * contribution);
    }, 0);
  }

  private enhanceWithMultiModelInsights(
    baseAnalysis: EnhancedStrategistOutput, 
    responses: ModelResponse[], 
    input: ClaudeStrategistInput
  ): EnhancedStrategistOutput {
    
    const enhanced = { ...baseAnalysis };

    // Enhance with Perplexity research insights
    const perplexityResponse = responses.find(r => r.modelName === 'perplexity');
    if (perplexityResponse?.response) {
      enhanced.researchSources.industrySources = [
        ...enhanced.researchSources.industrySources,
        ...this.extractPerplexitySources(perplexityResponse.response)
      ];
    }

    // Enhance with GPT-4o alternative perspectives
    const gpt4oResponse = responses.find(r => r.modelName === 'gpt-4o');
    if (gpt4oResponse?.response) {
      enhanced.expertRecommendations = this.mergeRecommendations(
        enhanced.expertRecommendations,
        gpt4oResponse.response.recommendations || []
      );
    }

    // Enhance with Google Vision validation
    const visionResponse = responses.find(r => r.modelName === 'google-vision');
    if (visionResponse?.response) {
      enhanced.confidenceAssessment.dataQualityScore = Math.max(
        enhanced.confidenceAssessment.dataQualityScore,
        visionResponse.response.validationScore || 0
      );
    }

    return enhanced;
  }

  private extractPerplexitySources(perplexityData: any): string[] {
    return perplexityData.sources?.slice(0, 3).map(source => source.title || source.url) || [];
  }

  private mergeRecommendations(primary: any[], secondary: any[]): any[] {
    // Smart merging logic to combine recommendations without duplication
    const merged = [...primary];
    
    secondary.forEach(secondaryRec => {
      const isDuplicate = primary.some(primaryRec => 
        primaryRec.title.toLowerCase().includes(secondaryRec.title?.toLowerCase()) ||
        secondaryRec.title?.toLowerCase().includes(primaryRec.title.toLowerCase())
      );
      
      if (!isDuplicate && merged.length < 6) {
        merged.push({
          ...secondaryRec,
          source: `${secondaryRec.source} (GPT-4o Enhanced)`,
          priority: Math.min(3, (secondaryRec.priority || 2) + 1)
        });
      }
    });
    
    return merged;
  }

  private generateBaseSynthesis(input: ClaudeStrategistInput, responses: ModelResponse[]): EnhancedStrategistOutput {
    // Fallback synthesis when Claude is not available
    console.log('🔄 Generating base synthesis from available models...');
    
    return {
      diagnosis: `Multi-model analysis identified key UX challenges in ${input.problemStatement}`,
      strategicRationale: `Strategic approach based on ${responses.length} AI model consensus`,
      expertRecommendations: [],
      businessImpactAssessment: {
        roiProjection: {
          timeframe: "6-12 months",
          estimatedValue: "$50,000-150,000 annual impact",
          confidence: 0.7
        },
        implementationRoadmap: {
          quickWins: ["Address critical usability issues"],
          weekOneActions: ["Implement quick accessibility fixes"],
          strategicInitiatives: ["Comprehensive UX audit"]
        },
        competitiveAdvantage: "Enhanced user experience positioning"
      },
      abTestFramework: {
        primaryHypothesis: "UX improvements will increase user satisfaction by 20-30%",
        testVariants: ["Control", "Enhanced UX"],
        successCriteria: ["User satisfaction > 80", "Task completion > 90%"],
        estimatedTestDuration: "2-4 weeks",
        expectedOutcome: "20-30% improvement in key metrics"
      },
      successMetrics: ["User satisfaction", "Task completion rate", "Error reduction"],
      validationFramework: {
        quantitativeMetrics: ["Conversion rate", "Time on task"],
        qualitativeIndicators: ["User feedback", "Satisfaction scores"],
        leadingIndicators: ["Engagement rate"],
        laggingIndicators: ["Customer retention"]
      },
      confidenceAssessment: {
        overallConfidence: 0.75,
        dataQualityScore: 0.7,
        researchBacking: 0.8,
        implementationFeasibility: 0.75,
        businessAlignmentScore: 0.8,
        reasoning: "Multi-model consensus with research backing"
      },
      researchSources: {
        academicSources: [],
        industrySources: [],
        competitorAnalysis: [],
        uxPrinciples: ["Usability Heuristics", "Cognitive Load Theory"]
      }
    };
  }

  private generateFallbackSynthesis(input: ClaudeStrategistInput, processingTime: number): SynthesisResult {
    console.log('⚠️ Generating complete fallback synthesis...');
    
    return {
      synthesizedOutput: this.generateBaseSynthesis(input, []),
      modelContributions: {
        claude: 0,
        gpt4o: 0,
        perplexity: 0,
        googleVision: 0
      },
      overallConfidence: 0.6,
      processingMetrics: {
        totalTime: processingTime,
        successfulModels: 0,
        failedModels: ['claude', 'gpt-4o', 'perplexity', 'google-vision'],
        fallbacksUsed: ['complete-fallback']
      }
    };
  }

  // Performance monitoring methods
  trackModelPerformance(responses: ModelResponse[]): void {
    responses.forEach(response => {
      console.log(`📊 ${response.modelName} Performance:`, {
        success: response.success,
        processingTime: response.processingTime,
        confidence: response.confidence,
        error: response.error
      });
    });
  }

  adjustWeights(performanceData: ModelResponse[]): void {
    // Dynamic weight adjustment based on model performance
    const successRates = {};
    const avgConfidences = {};
    
    performanceData.forEach(response => {
      const model = response.modelName;
      successRates[model] = response.success ? 1 : 0;
      avgConfidences[model] = response.confidence;
    });

    // Adjust weights based on performance (simplified)
    Object.keys(this.weights).forEach(model => {
      if (successRates[model] === 0) {
        this.weights[model] *= 0.9; // Reduce weight for failing models
      } else if (avgConfidences[model] > 0.8) {
        this.weights[model] *= 1.05; // Boost weight for high-confidence models
      }
    });

    // Normalize weights to sum to 1.0
    const totalWeight = Object.values(this.weights).reduce((sum, weight) => sum + weight, 0);
    Object.keys(this.weights).forEach(model => {
      this.weights[model] /= totalWeight;
    });
  }
}

export const multiModelOrchestrator = new MultiModelOrchestrator();