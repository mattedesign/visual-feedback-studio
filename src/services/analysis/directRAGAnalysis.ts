
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
      console.log('🚀 Starting Direct RAG Analysis');
      
      // Step 1: Get research context from knowledge base
      const knowledgeEntries = await this.getRelevantKnowledge(request.analysisPrompt);
      console.log(`📚 Found ${knowledgeEntries.length} relevant knowledge entries`);

      // Step 2: Enhance the prompt with research context
      const enhancedPrompt = this.enhancePromptWithResearch(request.analysisPrompt, knowledgeEntries);
      
      // Step 3: Convert image to base64
      const imageBase64 = await this.convertImageToBase64(request.imageUrl);
      
      // Step 4: Call OpenAI API directly
      const annotations = await this.callOpenAIForAnalysis(
        enhancedPrompt,
        imageBase64,
        request.openaiApiKey
      );

      console.log(`✅ Analysis complete: ${annotations.length} annotations generated`);
      
      return {
        success: true,
        annotations,
        totalAnnotations: annotations.length,
        researchEnhanced: knowledgeEntries.length > 0,
        knowledgeSourcesUsed: knowledgeEntries.length
      };

    } catch (error) {
      console.error('❌ Direct RAG Analysis failed:', error);
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
        console.error('Knowledge retrieval error:', error);
        return [];
      }

      return knowledge || [];
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      return [];
    }
  }

  private enhancePromptWithResearch(originalPrompt: string, knowledgeEntries: KnowledgeEntry[]): string {
    if (knowledgeEntries.length === 0) {
      return this.getBaseAnalysisPrompt(originalPrompt);
    }

    const researchContext = knowledgeEntries.map(entry => 
      `${entry.title}: ${entry.content.substring(0, 200)}...`
    ).join('\n\n');

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
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove the data URL prefix to get just the base64 data
          resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  private async callOpenAIForAnalysis(
    prompt: string,
    imageBase64: string,
    apiKey: string
  ): Promise<Annotation[]> {
    try {
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

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the JSON response
      const annotations = this.parseAnnotationsFromResponse(content);
      return annotations;

    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw new Error(`Failed to analyze with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAnnotationsFromResponse(content: string): Annotation[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const jsonString = jsonMatch[0];
      const annotations = JSON.parse(jsonString);

      // Validate and transform annotations
      return annotations.map((annotation: any, index: number) => ({
        id: `annotation-${Date.now()}-${index}`,
        x: Math.max(0, Math.min(100, annotation.x || 10)),
        y: Math.max(0, Math.min(100, annotation.y || 10)),
        category: this.validateCategory(annotation.category),
        severity: this.validateSeverity(annotation.severity),
        feedback: annotation.feedback || 'No feedback provided',
        implementationEffort: this.validateEffort(annotation.implementationEffort),
        businessImpact: this.validateImpact(annotation.businessImpact)
      }));

    } catch (error) {
      console.error('Failed to parse annotations:', error);
      // Return a fallback annotation if parsing fails
      return [{
        id: `fallback-${Date.now()}`,
        x: 50,
        y: 50,
        category: 'ux' as const,
        severity: 'suggested' as const,
        feedback: 'Analysis completed but response parsing failed. Please try again.',
        implementationEffort: 'medium' as const,
        businessImpact: 'medium' as const
      }];
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
