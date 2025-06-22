
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisRequest {
  imageUrl: string;
  analysisId: string;
  analysisPrompt?: string;
  designType?: string;
}

interface AnnotationData {
  x: number;
  y: number;
  category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand';
  severity: 'critical' | 'suggested' | 'enhancement';
  feedback: string;
  implementationEffort: 'low' | 'medium' | 'high';
  businessImpact: 'low' | 'medium' | 'high';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { imageUrl, analysisId, analysisPrompt, designType }: AnalysisRequest = await req.json()

    console.log('Starting AI analysis for:', { analysisId, imageUrl, designType })

    // Fetch the image as base64
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // Create analysis prompt
    const systemPrompt = `You are an expert UX/UI designer and conversion optimization specialist. Analyze the provided design image and identify specific areas for improvement.

${analysisPrompt || 'Analyze this design for UX, accessibility, and conversion optimization opportunities.'}

For each issue you identify, provide:
1. Exact coordinates (x, y as percentages from 0-100) where the issue is located
2. Category: ux, visual, accessibility, conversion, or brand
3. Severity: critical, suggested, or enhancement
4. Detailed feedback explaining the issue and recommended solution
5. Implementation effort: low, medium, or high
6. Business impact: low, medium, or high

Respond with a JSON array of annotations in this exact format:
[
  {
    "x": 25.5,
    "y": 30.2,
    "category": "ux",
    "severity": "critical",
    "feedback": "Detailed explanation of the issue and recommended solution",
    "implementationEffort": "low",
    "businessImpact": "high"
  }
]

Provide 3-7 annotations focusing on the most impactful improvements.`

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anthropicApiKey}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: systemPrompt
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', errorText)
      throw new Error(`Anthropic API error: ${response.status} ${errorText}`)
    }

    const aiResponse = await response.json()
    console.log('AI response received')

    let annotations: AnnotationData[] = []
    try {
      // Extract JSON from the response
      const content = aiResponse.content[0].text
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        annotations = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON array found in response')
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      // Return a sample annotation if parsing fails
      annotations = [
        {
          x: 50,
          y: 30,
          category: 'ux',
          severity: 'suggested',
          feedback: 'AI analysis completed, but response formatting needs adjustment. Please try again.',
          implementationEffort: 'medium',
          businessImpact: 'medium'
        }
      ]
    }

    console.log('Analysis completed successfully with', annotations.length, 'annotations')

    return new Response(
      JSON.stringify({ 
        success: true, 
        annotations: annotations.map((ann, index) => ({
          id: `ai-${Date.now()}-${index}`,
          x: ann.x,
          y: ann.y,
          category: ann.category,
          severity: ann.severity,
          feedback: ann.feedback,
          implementationEffort: ann.implementationEffort,
          businessImpact: ann.businessImpact
        })),
        totalAnnotations: annotations.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in analyze-design function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Analysis failed', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
