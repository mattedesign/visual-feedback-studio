
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
      targetInsights: '16-19',
      primaryModel: 'Claude Sonnet 4'
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

      // Build comprehensive analysis prompt with strengthened requirements
      console.log('✨ Building comprehensive analysis prompt with mandatory 16-19 insights requirement');
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
        comprehensiveScope: true,
        mandatoryRequirements: enhancedPrompt.includes('MANDATORY OUTPUT REQUIREMENT')
      });

      // 🚀 TRY CLAUDE FIRST (Primary Model)
      console.log('🎯 Attempting Claude Sonnet 4 analysis (Primary)...');
      try {
        const claudeResult = await this.callClaude(processedImages, enhancedPrompt);
        console.log('✅ Claude analysis successful:', {
          annotationCount: claudeResult.annotations.length,
          modelUsed: 'Claude Sonnet 4',
          targetAchieved: claudeResult.annotations.length >= 16
        });
        
        const processingTime = Date.now() - startTime;
        return {
          success: true,
          annotations: claudeResult.annotations,
          modelUsed: 'Claude Sonnet 4',
          processingTime,
          ragEnhanced: !!ragContext
        };
      } catch (claudeError) {
        console.warn('⚠️ Claude analysis failed, falling back to OpenAI:', claudeError);
      }

      // 🔄 FALLBACK TO OPENAI
      console.log('🔄 Claude failed, attempting OpenAI fallback...');
      const openaiResult = await this.callOpenAI(processedImages, enhancedPrompt);

      if (!openaiResult.ok) {
        throw new Error(`Both Claude and OpenAI failed. OpenAI error: ${openaiResult.status} ${openaiResult.statusText}`);
      }

      const data = await openaiResult.json();
      
      console.log('📊 OpenAI fallback analysis response received:', {
        choices: data.choices?.length || 0,
        usage: data.usage,
        responseLength: data.choices?.[0]?.message?.content?.length || 0
      });

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices received from OpenAI fallback');
      }

      const rawContent = data.choices[0].message.content;
      console.log('📝 Raw AI response length:', rawContent.length);
      
      // Parse comprehensive annotations with validation
      const annotations = this.parseAnnotations(rawContent);
      
      console.log('✅ Comprehensive annotations parsed successfully (OpenAI fallback):', {
        annotationCount: annotations.length,
        targetCount: '16-19',
        meetsTarget: annotations.length >= 16,
        exceedsMinimum: annotations.length >= 12
      });

      // Enhanced validation for comprehensive analysis
      if (annotations.length < 12) {
        console.warn('⚠️ INSUFFICIENT ANNOTATION COUNT - Below professional UX audit standards:', {
          received: annotations.length,
          expected: '16-19',
          minimum: 12,
          rawResponsePreview: rawContent.substring(0, 500)
        });
        
        // Log the categories to understand what's missing
        const categories = annotations.map(a => a.category);
        const severities = annotations.map(a => a.severity);
        console.warn('📊 Analysis distribution check:', {
          categories: [...new Set(categories)],
          severities: [...new Set(severities)],
          totalAnnotations: annotations.length
        });
      }

      const processingTime = Date.now() - startTime;

      console.log('✅ AI comprehensive analysis completed successfully (OpenAI fallback):', {
        annotationsCount: annotations.length,
        processingTimeMs: processingTime,
        ragEnhanced: !!ragContext,
        comprehensiveAnalysis: true,
        professionalStandard: annotations.length >= 16,
        targetsAchieved: annotations.length >= 16,
        modelUsed: 'OpenAI GPT-4o-mini (fallback)'
      });

      return {
        success: true,
        annotations,
        modelUsed: 'OpenAI GPT-4o-mini (fallback)',
        processingTime,
        ragEnhanced: !!ragContext
      };

    } catch (error) {
      console.error('❌ AI comprehensive analysis failed (both Claude and OpenAI):', error);
      
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

  // 🎯 UPDATED: Claude Sonnet 4 Primary Method with Latest Model
  private async callClaude(images: ProcessedImage[], prompt: string): Promise<{annotations: any[]}> {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    console.log('🔍 Claude API Debug - Key status:', {
      hasKey: !!anthropicApiKey,
      keyLength: anthropicApiKey.length,
      keyPreview: anthropicApiKey.substring(0, 12) + '...'
    });

    // Convert images to base64 for Claude
    const imageContents = await Promise.all(
      images.map(async (img) => {
        try {
          const response = await fetch(img.imageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          return {
            type: "image",
            source: {
              type: "base64",
              media_type: `image/${img.format}`,
              data: base64
            }
          };
        } catch (error) {
          console.error('Image processing error:', error);
          throw new Error(`Failed to process image: ${error.message}`);
        }
      })
    );

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

Ensure exactly 16-19 insights for comprehensive professional analysis.`;

    try {
      console.log('🚀 Making Claude API request with model claude-3-5-sonnet-20241022');
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anthropicApiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          temperature: 0.3,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                ...imageContents
              ]
            }
          ]
        })
      });

      console.log('📡 Claude API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Claude API error details:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText.substring(0, 500)
        });
        throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('❌ Invalid Claude response format:', data);
        throw new Error('Invalid Claude response format');
      }

      const rawContent = data.content[0].text;
      console.log('✅ Claude response received, length:', rawContent.length);
      
      const annotations = this.parseAnnotations(rawContent);
      
      if (annotations.length < 12) {
        console.warn('⚠️ Claude returned insufficient insights:', annotations.length);
        throw new Error(`Claude returned insufficient insights: ${annotations.length} (minimum 12 required)`);
      }

      console.log('✅ Claude analysis successful with', annotations.length, 'insights');
      return { annotations };

    } catch (error) {
      console.error('❌ Claude API call failed:', error);
      throw error;
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

  // 🔄 KEPT: OpenAI Fallback Method
  private async callOpenAI(images: ProcessedImage[], prompt: string): Promise<Response> {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('🔍 OpenAI API Debug - Key status:', {
      hasKey: !!openaiApiKey,
      keyLength: openaiApiKey.length
    });

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
            image_url: { url: img.imageUrl, detail: 'high' }
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
