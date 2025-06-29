
interface ProcessedImage {
  base64Data: string;
  mimeType: string;
  width?: number;
  height?: number;
}

interface AIAnalysisResult {
  success: boolean;
  annotations?: any[];
  error?: string;
  modelUsed?: string;
  processingTime?: number;
}

class AIAnalysisManager {
  private readonly OPENAI_API_KEY: string;
  private readonly MAX_TIMEOUT = 45000; // 45 seconds
  private readonly CIRCUIT_BREAKER_THRESHOLD = 3;
  private circuitBreakerCount = 0;

  constructor() {
    this.OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
    if (!this.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
    }
  }

  async analyzeImages(
    processedImages: ProcessedImage[],
    analysisPrompt: string,
    isComparative: boolean = false,
    ragEnabled: boolean = false
  ): Promise<AIAnalysisResult> {
    console.log('🤖 AIAnalysisManager.analyzeImages - Starting analysis:', {
      imageCount: processedImages.length,
      promptLength: analysisPrompt.length,
      isComparative,
      ragEnabled,
      circuitBreakerCount: this.circuitBreakerCount
    });

    const startTime = Date.now();

    try {
      // Circuit breaker check
      if (this.circuitBreakerCount >= this.CIRCUIT_BREAKER_THRESHOLD) {
        console.warn('⚠️ Circuit breaker triggered, falling back to basic analysis');
        // Reset circuit breaker after some time
        setTimeout(() => {
          this.circuitBreakerCount = 0;
          console.log('🔄 Circuit breaker reset');
        }, 60000);
      }

      if (!this.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      if (processedImages.length === 0) {
        throw new Error('No processed images provided');
      }

      // 🔥 FIXED: Build proper RAG context if enabled
      let enhancedPrompt = analysisPrompt;
      let ragContext = '';

      if (ragEnabled && this.circuitBreakerCount < this.CIRCUIT_BREAKER_THRESHOLD) {
        console.log('📚 Building RAG context...');
        try {
          ragContext = await this.buildRAGContext(analysisPrompt);
          if (ragContext) {
            enhancedPrompt = this.enhancePromptWithRAG(analysisPrompt, ragContext, isComparative, processedImages.length);
            console.log('✅ RAG context built successfully:', {
              ragContextLength: ragContext.length,
              enhancedPromptLength: enhancedPrompt.length
            });
          }
        } catch (ragError) {
          console.warn('⚠️ RAG context building failed, falling back to basic analysis:', ragError);
          this.circuitBreakerCount++;
          // Continue with basic analysis
        }
      } else if (ragEnabled) {
        console.log('⚠️ RAG requested but circuit breaker active, using basic analysis');
      }

      // Prepare messages for OpenAI
      const messages = this.buildOpenAIMessages(enhancedPrompt, processedImages);

      // Call OpenAI with timeout
      console.log('🚀 Calling OpenAI API...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.MAX_TIMEOUT);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          max_tokens: 4000,
          temperature: 0.3,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ OpenAI API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 OpenAI response received:', {
        choices: data.choices?.length || 0,
        usage: data.usage
      });

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No analysis results returned from OpenAI');
      }

      // Parse annotations from response
      const annotations = this.parseAnnotations(data.choices[0].message.content);
      
      const processingTime = Date.now() - startTime;
      console.log('✅ AI analysis completed successfully:', {
        annotationsCount: annotations.length,
        processingTimeMs: processingTime,
        ragEnhanced: ragEnabled && !!ragContext
      });

      // Reset circuit breaker on success
      if (this.circuitBreakerCount > 0) {
        this.circuitBreakerCount = Math.max(0, this.circuitBreakerCount - 1);
      }

      return {
        success: true,
        annotations,
        modelUsed: 'gpt-4o',
        processingTime
      };

    } catch (error) {
      console.error('❌ AIAnalysisManager.analyzeImages - Error:', error);
      
      // Increment circuit breaker on error
      this.circuitBreakerCount++;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI analysis error'
      };
    }
  }

  private async buildRAGContext(originalPrompt: string): Promise<string> {
    console.log('🔍 Building RAG context for prompt:', originalPrompt.substring(0, 100));
    
    try {
      // Create a timeout controller for RAG operations
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for RAG

      // Call the build-rag-context function
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const functionKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !functionKey) {
        throw new Error('Supabase configuration missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/build-rag-context`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${functionKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: originalPrompt,
          imageUrls: [],
          imageAnnotations: [],
          analysisId: 'temp-rag-context'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`RAG context API error: ${response.status}`);
      }

      const ragData = await response.json();
      
      if (ragData.ragStatus === 'ERROR') {
        throw new Error('RAG context building failed');
      }

      // Build context summary from retrieved knowledge
      let contextSummary = '';
      if (ragData.retrievedKnowledge?.relevantPatterns?.length > 0) {
        contextSummary += '=== UX RESEARCH CONTEXT ===\n';
        ragData.retrievedKnowledge.relevantPatterns.slice(0, 5).forEach((entry: any, index: number) => {
          contextSummary += `${index + 1}. ${entry.title}: ${entry.content?.substring(0, 200)}...\n`;
        });
      }

      if (ragData.retrievedKnowledge?.competitorInsights?.length > 0) {
        contextSummary += '\n=== COMPETITIVE INSIGHTS ===\n';
        ragData.retrievedKnowledge.competitorInsights.slice(0, 3).forEach((pattern: any, index: number) => {
          contextSummary += `${index + 1}. ${pattern.pattern_name}: ${pattern.description?.substring(0, 150)}...\n`;
        });
      }

      console.log('✅ RAG context built:', {
        contextLength: contextSummary.length,
        knowledgeEntries: ragData.retrievedKnowledge?.relevantPatterns?.length || 0,
        competitiveInsights: ragData.retrievedKnowledge?.competitorInsights?.length || 0
      });

      return contextSummary;

    } catch (error) {
      console.error('❌ RAG context building failed:', error);
      throw error;
    }
  }

  private enhancePromptWithRAG(
    originalPrompt: string, 
    ragContext: string, 
    isComparative: boolean, 
    imageCount: number
  ): string {
    console.log('✨ Enhancing prompt with RAG context');
    
    let enhancedPrompt = originalPrompt;

    if (ragContext && ragContext.trim().length > 0) {
      enhancedPrompt = `RESEARCH-ENHANCED ANALYSIS:

${ragContext}

Based on the above research context and UX best practices, ${originalPrompt}`;
    }

    // Add multi-image instructions if needed
    if (imageCount > 1) {
      enhancedPrompt += `

🚨 MULTI-IMAGE ANALYSIS CRITICAL INSTRUCTIONS 🚨
You are analyzing ${imageCount} different design images. Each annotation MUST specify the correct imageIndex (0 to ${imageCount - 1}) to indicate which image the annotation belongs to.

MANDATORY IMAGE INDEX ASSIGNMENT:
- Image 1 = imageIndex: 0
- Image 2 = imageIndex: 1
${imageCount > 2 ? '- Image 3 = imageIndex: 2' : ''}
${imageCount > 3 ? '- Image 4 = imageIndex: 3' : ''}

🚨 DISTRIBUTION REQUIREMENT 🚨
Ensure annotations are distributed across ALL ${imageCount} images. Each image should receive 2-3 specific annotations analyzing its unique design aspects. DO NOT assign all annotations to imageIndex: 0.`;
    }

    enhancedPrompt += `

CRITICAL: You MUST respond with a valid JSON array of annotation objects only. Do not include any markdown, explanations, or other text.

Required JSON format:
[
  {
    "x": 50,
    "y": 30,
    "category": "ux",
    "severity": "critical", 
    "feedback": "Research-backed feedback with specific citations and best practices",
    "implementationEffort": "medium",
    "businessImpact": "high",
    "imageIndex": ${imageCount > 1 ? `REQUIRED - specify 0 to ${imageCount - 1} based on which image this annotation analyzes` : '0 for single image'}
  }
]

Rules:
- x, y: Numbers 0-100 (percentage coordinates)
- category: "ux", "visual", "accessibility", "conversion", or "brand"
- severity: "critical", "suggested", or "enhancement"
- feedback: Research-enhanced explanation citing best practices (2-3 sentences)
- implementationEffort: "low", "medium", or "high"
- businessImpact: "low", "medium", or "high"
- imageIndex: ${imageCount > 1 ? `REQUIRED - specify 0 to ${imageCount - 1} based on which image this annotation analyzes` : '0 for single image'}

When research context is available, ensure feedback includes specific citations and evidence-based recommendations.`;

    return enhancedPrompt;
  }

  private buildOpenAIMessages(prompt: string, processedImages: ProcessedImage[]) {
    const messages = [
      {
        role: 'system',
        content: 'You are a UX expert specializing in design analysis. Analyze the provided images and return only a valid JSON array of annotations. Do not include any explanations or markdown formatting.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...processedImages.map(image => ({
            type: 'image_url',
            image_url: {
              url: `data:${image.mimeType};base64,${image.base64Data}`,
              detail: 'high'
            }
          }))
        ]
      }
    ];

    return messages;
  }

  private parseAnnotations(content: string): any[] {
    try {
      // Clean the content to extract JSON
      let jsonContent = content.trim();
      
      // Remove markdown code blocks if present
      jsonContent = jsonContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
      
      // Try to find JSON array
      const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }

      const annotations = JSON.parse(jsonContent);
      
      if (!Array.isArray(annotations)) {
        console.error('❌ Parsed content is not an array:', typeof annotations);
        return [];
      }

      console.log('✅ Successfully parsed annotations:', annotations.length);
      return annotations;

    } catch (error) {
      console.error('❌ Failed to parse annotations:', error);
      console.error('Raw content:', content);
      return [];
    }
  }
}

// 🔥 FIXED: Export properly functioning RAG context getter
export async function getRAGContext(userPrompt: string) {
  console.log('🔍 getRAGContext called with prompt:', userPrompt.substring(0, 50));
  
  try {
    const manager = new AIAnalysisManager();
    const ragContext = await (manager as any).buildRAGContext(userPrompt);
    console.log('✅ RAG context retrieved successfully');
    return ragContext;
  } catch (error) {
    console.error('❌ getRAGContext failed:', error);
    return null;
  }
}

export const aiAnalysisManager = new AIAnalysisManager();
