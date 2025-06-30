
import { buildAnalysisPrompt } from './promptBuilder.ts';

interface ProcessedImage {
  imageUrl: string;
  size: number;
  format: string;
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
    
    console.log('🤖 AIAnalysisManager.analyzeImages - Starting comprehensive analysis:', {
      imageCount: processedImages.length,
      promptLength: analysisPrompt.length,
      isComparative,
      ragEnabled,
      circuitBreakerCount: this.circuitBreakerCount,
      targetInsights: '16-19'
    });

    try {
      let enhancedPrompt = analysisPrompt;
      let ragContext: string | undefined;

      // Build RAG context if enabled
      if (ragEnabled) {
        console.log('📚 Building comprehensive RAG context...');
        
        try {
          const ragResult = await this.buildRagContext(analysisPrompt);
          if (ragResult && ragResult.ragStatus === 'ENABLED') {
            ragContext = this.formatRagContext(ragResult);
            console.log('✅ RAG context built successfully:', {
              ragContextLength: ragContext.length,
              knowledgeEntries: ragResult.retrievedKnowledge.relevantPatterns.length,
              competitiveInsights: ragResult.retrievedKnowledge.competitorInsights.length
            });
          }
        } catch (ragError) {
          console.warn('⚠️ RAG context building failed:', ragError);
        }
      }

      // Build comprehensive analysis prompt
      console.log('✨ Enhancing prompt for comprehensive analysis');
      enhancedPrompt = buildAnalysisPrompt(
        analysisPrompt,
        ragContext,
        isComparative,
        processedImages.length
      );

      console.log('✅ Comprehensive prompt built successfully:', {
        enhancedPromptLength: enhancedPrompt.length,
        ragEnhanced: !!ragContext,
        targetInsights: '16-19',
        comprehensiveScope: true
      });

      // Perform AI analysis with comprehensive requirements
      console.log('🚀 Calling OpenAI API for comprehensive analysis...');
      const response = await this.callOpenAI(processedImages, enhancedPrompt);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('📊 OpenAI comprehensive analysis response received:', {
        choices: data.choices?.length || 0,
        usage: data.usage,
        responseLength: data.choices?.[0]?.message?.content?.length || 0
      });

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices received from OpenAI');
      }

      const rawContent = data.choices[0].message.content;
      console.log('📝 Raw AI response length:', rawContent.length);
      
      // Parse comprehensive annotations
      const annotations = this.parseAnnotations(rawContent);
      
      console.log('✅ Comprehensive annotations parsed successfully:', {
        annotationCount: annotations.length,
        targetCount: '16-19',
        meetsTarget: annotations.length >= 16
      });

      if (annotations.length < 10) {
        console.warn('⚠️ Low annotation count detected:', {
          received: annotations.length,
          expected: '16-19',
          rawResponsePreview: rawContent.substring(0, 500)
        });
      }

      const processingTime = Date.now() - startTime;

      console.log('✅ AI comprehensive analysis completed successfully:', {
        annotationsCount: annotations.length,
        processingTimeMs: processingTime,
        ragEnhanced: !!ragContext,
        comprehensiveAnalysis: true,
        targetsAchieved: annotations.length >= 16
      });

      return {
        success: true,
        annotations,
        modelUsed: 'gpt-4o-mini',
        processingTime,
        ragEnhanced: !!ragContext
      };

    } catch (error) {
      console.error('❌ AI comprehensive analysis failed:', error);
      
      this.circuitBreakerCount++;
      
      if (this.circuitBreakerCount >= this.maxCircuitBreakerAttempts) {
        console.error('🚨 Circuit breaker activated - too many failures');
        return {
          success: false,
          error: 'Analysis service temporarily unavailable after multiple failures'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown analysis error'
      };
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
    context += 'Use this research context to provide comprehensive, evidence-based recommendations.\n\n';
    
    return context;
  }

  private async callOpenAI(images: ProcessedImage[], prompt: string): Promise<Response> {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const messages = [
      {
        role: 'system',
        content: 'You are a comprehensive UX analysis expert. Generate detailed, research-backed insights covering all aspects of design quality, usability, and business impact. Always provide exactly 16-19 annotations for thorough professional analysis.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...images.map(img => ({
            type: 'image_url',
            image_url: { url: img.imageUrl, detail: 'high' }
          }))
        ]
      }
    ];

    return fetch('https://api.openai.com/v1/chat/completions', {
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
  }

  private parseAnnotations(rawContent: string): any[] {
    try {
      // Clean the response to extract JSON
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('❌ No JSON array found in response');
        return [];
      }

      const jsonString = jsonMatch[0];
      const annotations = JSON.parse(jsonString);

      if (!Array.isArray(annotations)) {
        console.error('❌ Parsed result is not an array');
        return [];
      }

      console.log('✅ Successfully parsed comprehensive annotations:', annotations.length);
      return annotations;

    } catch (error) {
      console.error('❌ Failed to parse annotations:', error);
      console.error('Raw content preview:', rawContent.substring(0, 1000));
      return [];
    }
  }
}

export const aiAnalysisManager = new AIAnalysisManager();
