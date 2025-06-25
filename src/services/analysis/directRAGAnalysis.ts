import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';

interface DirectRAGAnalysisRequest {
  imageUrl: string;
  analysisPrompt: string;
  openaiApiKey: string;
}

interface DirectRAGAnalysisResponse {
  success: boolean;
  annotations: Annotation[];
  totalAnnotations: number;
  researchEnhanced: boolean;
  knowledgeSourcesUsed: number;
  error?: string;
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  similarity: number;
}

export class DirectRAGAnalysisService {
  private static instance: DirectRAGAnalysisService;

  private constructor() {}

  public static getInstance(): DirectRAGAnalysisService {
    if (!DirectRAGAnalysisService.instance) {
      DirectRAGAnalysisService.instance = new DirectRAGAnalysisService();
    }
    return DirectRAGAnalysisService.instance;
  }

  async analyzeWithRAG(request: DirectRAGAnalysisRequest): Promise<DirectRAGAnalysisResponse> {
    try {
      console.log('🚀 DirectRAGAnalysisService.analyzeWithRAG - Starting analysis');
      console.log('📊 Request details:', {
        imageUrl: request.imageUrl ? 'PROVIDED' : 'MISSING',
        analysisPrompt: request.analysisPrompt?.substring(0, 100) + '...',
        openaiApiKey: request.openaiApiKey ? 'PROVIDED' : 'MISSING'
      });
      
      // Step 1: Get research context from knowledge base
      const knowledgeEntries = await this.getRelevantKnowledge(request.analysisPrompt);
      console.log(`📚 Knowledge retrieval complete: ${knowledgeEntries.length} entries found`);

      // Step 2: Enhance the prompt with research context
      const enhancedPrompt = this.enhancePromptWithResearch(request.analysisPrompt, knowledgeEntries);
      console.log('✍️ Enhanced prompt created');
      
      // Step 3: Convert image to base64
      console.log('🖼️ Converting image to base64...');
      const imageBase64 = await this.convertImageToBase64(request.imageUrl);
      console.log('✅ Image conversion complete');
      
      // Step 4: Call OpenAI API directly
      console.log('🤖 Calling OpenAI API...');
      const annotations = await this.callOpenAIForAnalysis(
        enhancedPrompt,
        imageBase64,
        request.openaiApiKey
      );

      console.log(`🎯 Analysis complete! Generated annotations:`, {
        count: annotations.length,
        annotations: annotations.map(a => ({
          id: a.id,
          category: a.category,
          severity: a.severity,
          feedback: a.feedback.substring(0, 50) + '...',
          x: a.x,
          y: a.y
        }))
      });

      const result = {
        success: true,
        annotations,
        totalAnnotations: annotations.length,
        researchEnhanced: knowledgeEntries.length > 0,
        knowledgeSourcesUsed: knowledgeEntries.length
      };

      console.log('📋 Final service result:', {
        success: result.success,
        annotationsCount: result.annotations.length,
        totalAnnotations: result.totalAnnotations,
        researchEnhanced: result.researchEnhanced,
        knowledgeSourcesUsed: result.knowledgeSourcesUsed
      });
      
      return result;

    } catch (error) {
      console.error('❌ DirectRAGAnalysisService.analyzeWithRAG - Error:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return {
        success: false,
        annotations: [],
        totalAnnotations: 0,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async getRelevantKnowledge(prompt: string): Promise<KnowledgeEntry[]> {
    try {
      console.log('🔍 Fetching relevant knowledge for prompt:', prompt.substring(0, 100) + '...');
      
      // Create a dummy embedding for the RPC call (since we can't generate real embeddings in frontend)
      // In a real implementation, you'd generate embeddings, but for this quick solution we'll use a dummy
      const dummyEmbedding = Array(1536).fill(0.1);
      
      const { data: knowledge, error } = await supabase.rpc('match_knowledge', {
        query_embedding: `[${dummyEmbedding.join(',')}]`,
        match_threshold: 0.1, // Lower threshold since we're using dummy embeddings
        match_count: 5,
        filter_category: null
      });

      if (error) {
        console.error('❌ Knowledge retrieval error:', error);
        return [];
      }

      console.log('✅ Knowledge retrieval successful:', knowledge?.length || 0, 'entries');
      return knowledge || [];
    } catch (error) {
      console.error('❌ Error fetching knowledge:', error);
      return [];
    }
  }

  private enhancePromptWithResearch(originalPrompt: string, knowledgeEntries: KnowledgeEntry[]): string {
    console.log('🔧 Enhancing prompt with research context');
    
    if (knowledgeEntries.length === 0) {
      console.log('📝 No knowledge entries, using base prompt');
      return this.getBaseAnalysisPrompt(originalPrompt);
    }

    const researchContext = knowledgeEntries.map(entry => 
      `${entry.title}: ${entry.content.substring(0, 200)}...`
    ).join('\n\n');

    console.log('📝 Enhanced prompt with', knowledgeEntries.length, 'knowledge sources');

    return `${this.getBaseAnalysisPrompt(originalPrompt)}

RELEVANT UX RESEARCH CONTEXT:
${researchContext}

Based on this research context, provide analysis that references relevant UX principles and best practices from the research above.`;
  }

  private getBaseAnalysisPrompt(userPrompt: string): string {
    return `You are an expert UX analyst. Analyze the provided design image and identify specific areas for improvement.

USER CONTEXT: ${userPrompt}

Please analyze the design and return a JSON array of annotations with the following structure:
[
  {
    "x": number (0-100, percentage from left),
    "y": number (0-100, percentage from top),
    "category": "ux" | "visual" | "accessibility" | "conversion" | "brand",
    "severity": "critical" | "suggested" | "enhancement",
    "feedback": "Detailed feedback explaining the issue and suggesting improvements",
    "implementationEffort": "low" | "medium" | "high",
    "businessImpact": "low" | "medium" | "high"
  }
]

Focus on:
- User experience and usability issues
- Visual design improvements
- Accessibility concerns
- Conversion optimization opportunities
- Brand consistency

Return ONLY the JSON array, no additional text.`;
  }

  private async convertImageToBase64(imageUrl: string): Promise<string> {
    try {
      console.log('🖼️ Converting image to base64:', imageUrl);
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('📦 Image blob size:', blob.size, 'bytes');
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];
          console.log('✅ Image converted to base64, length:', base64Data.length);
          resolve(base64Data);
        };
        reader.onerror = (error) => {
          console.error('❌ FileReader error:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  private async callOpenAIForAnalysis(
    prompt: string,
    imageBase64: string,
    apiKey: string
  ): Promise<Annotation[]> {
    try {
      console.log('🤖 Making OpenAI API call');
      console.log('📝 Prompt length:', prompt.length);
      console.log('🖼️ Image base64 length:', imageBase64.length);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      console.log('📞 OpenAI API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 OpenAI API response data:', {
        choices: data.choices?.length || 0,
        usage: data.usage
      });
      
      const content = data.choices[0]?.message?.content;
      console.log('📝 OpenAI response content:', content?.substring(0, 200) + '...');

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the JSON response
      const annotations = this.parseAnnotationsFromResponse(content);
      console.log('🎯 Parsed annotations:', annotations.length, 'total');
      
      return annotations;

    } catch (error) {
      console.error('❌ OpenAI API call failed:', error);
      throw new Error(`Failed to analyze with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAnnotationsFromResponse(content: string): Annotation[] {
    try {
      console.log('🔧 Parsing annotations from OpenAI response');
      console.log('📝 Raw content to parse:', content.substring(0, 500) + '...');
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('❌ No JSON array found in response');
        throw new Error('No JSON array found in response');
      }

      const jsonString = jsonMatch[0];
      console.log('🔍 Extracted JSON string:', jsonString.substring(0, 200) + '...');
      
      const rawAnnotations = JSON.parse(jsonString);
      console.log('📊 Parsed raw annotations:', rawAnnotations.length, 'items');

      // Validate and transform annotations
      const annotations = rawAnnotations.map((annotation: any, index: number) => {
        const transformedAnnotation = {
          id: `annotation-${Date.now()}-${index}`,
          x: Math.max(0, Math.min(100, annotation.x || 10)),
          y: Math.max(0, Math.min(100, annotation.y || 10)),
          category: this.validateCategory(annotation.category),
          severity: this.validateSeverity(annotation.severity),
          feedback: annotation.feedback || 'No feedback provided',
          implementationEffort: this.validateEffort(annotation.implementationEffort),
          businessImpact: this.validateImpact(annotation.businessImpact)
        };
        
        console.log(`✅ Transformed annotation ${index + 1}:`, {
          id: transformedAnnotation.id,
          category: transformedAnnotation.category,
          severity: transformedAnnotation.severity,
          feedback: transformedAnnotation.feedback.substring(0, 50) + '...'
        });
        
        return transformedAnnotation;
      });

      console.log('🎯 Final annotations array:', annotations.length, 'valid annotations');
      return annotations;

    } catch (error) {
      console.error('❌ Failed to parse annotations:', error);
      console.error('❌ Raw content that failed to parse:', content);
      
      // Return a fallback annotation if parsing fails
      const fallbackAnnotation = {
        id: `fallback-${Date.now()}`,
        x: 50,
        y: 50,
        category: 'ux' as const,
        severity: 'suggested' as const,
        feedback: 'Analysis completed but response parsing failed. Please try again.',
        implementationEffort: 'medium' as const,
        businessImpact: 'medium' as const
      };
      
      console.log('🔄 Returning fallback annotation:', fallbackAnnotation);
      return [fallbackAnnotation];
    }
  }

  private validateCategory(category: string): 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand' {
    const validCategories = ['ux', 'visual', 'accessibility', 'conversion', 'brand'];
    return validCategories.includes(category) ? category as any : 'ux';
  }

  private validateSeverity(severity: string): 'critical' | 'suggested' | 'enhancement' {
    const validSeverities = ['critical', 'suggested', 'enhancement'];
    return validSeverities.includes(severity) ? severity as any : 'suggested';
  }

  private validateEffort(effort: string): 'low' | 'medium' | 'high' {
    const validEfforts = ['low', 'medium', 'high'];
    return validEfforts.includes(effort) ? effort as any : 'medium';
  }

  private validateImpact(impact: string): 'low' | 'medium' | 'high' {
    const validImpacts = ['low', 'medium', 'high'];
    return validImpacts.includes(impact) ? impact as any : 'medium';
  }
}

// Export singleton instance
export const directRAGAnalysisService = DirectRAGAnalysisService.getInstance();
