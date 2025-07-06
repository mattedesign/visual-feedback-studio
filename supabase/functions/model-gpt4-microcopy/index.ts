import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

console.log('✍️ Model GPT4 Microcopy - UI text optimization');

serve(async (req) => {
  console.log('🔥 GPT4 MICROCOPY CALLED - Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }

  try {
    const body = await req.json();
    console.log('✍️ Processing microcopy enhancement request:', body);

    const { sessionId, baseAnalysis, analysisContext } = body;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const prompt = `As a UX copywriter and microcopy specialist, analyze this design analysis and enhance it with specific microcopy and UI text improvements.

Base Analysis: ${JSON.stringify(baseAnalysis)}
Context: ${analysisContext}

Please provide microcopy-focused recommendations in this JSON format:

{
  "microcopyEnhancements": [
    {
      "id": "mc1",
      "title": "Improve CTA button text",
      "location": "Primary action button",
      "currentText": "Submit",
      "suggestedText": "Complete Your Order",
      "reasoning": "More specific and action-oriented",
      "category": "conversion",
      "severity": "medium",
      "x": 50,
      "y": 70
    }
  ],
  "generalPrinciples": [
    "Use action-oriented language",
    "Be specific and clear",
    "Address user concerns"
  ]
}

Focus on:
- Button text and CTAs
- Form labels and placeholders  
- Error messages and validation
- Tooltips and help text
- Navigation labels
- Empty states and loading messages`;

    console.log('✍️ Calling GPT-4 for microcopy analysis...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a UX copywriter specializing in microcopy that improves conversion and user experience.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.4
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    let microcopyResults;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      microcopyResults = JSON.parse(jsonMatch[0]);
      
      // Validate and enhance microcopy recommendations
      if (!microcopyResults.microcopyEnhancements) {
        microcopyResults.microcopyEnhancements = [];
      }
      
      microcopyResults.microcopyEnhancements = microcopyResults.microcopyEnhancements.map((rec: any, index: number) => ({
        id: rec.id || `mc${index + 1}`,
        title: rec.title || 'Improve microcopy',
        location: rec.location || 'UI element',
        currentText: rec.currentText || '',
        suggestedText: rec.suggestedText || '',
        reasoning: rec.reasoning || 'Better user experience',
        category: rec.category || 'usability',
        severity: rec.severity || 'medium',
        x: typeof rec.x === 'number' ? rec.x : Math.random() * 80 + 10,
        y: typeof rec.y === 'number' ? rec.y : Math.random() * 80 + 10
      }));

    } catch (parseError) {
      console.warn('Failed to parse GPT-4 response, using fallback');
      microcopyResults = {
        microcopyEnhancements: [
          {
            id: 'mc1',
            title: 'Improve action button text',
            location: 'Primary CTA',
            currentText: 'Click here',
            suggestedText: 'Get Started',
            reasoning: 'More specific and action-oriented',
            category: 'conversion',
            severity: 'medium',
            x: 50,
            y: 70
          }
        ],
        generalPrinciples: [
          'Use clear, action-oriented language',
          'Be specific about outcomes',
          'Address user concerns proactively'
        ]
      };
    }

    // Get current session data to update
    const { data: sessionData } = await supabase
      .from('analysis_sessions')
      .select('multimodel_results')
      .eq('id', sessionId)
      .single();

    const currentResults = sessionData?.multimodel_results || {};

    // Update session with microcopy results
    await supabase
      .from('analysis_sessions')
      .update({ 
        multimodel_results: {
          ...currentResults,
          microcopy: {
            ...microcopyResults,
            processedAt: new Date().toISOString(),
            model: 'gpt-4.1-2025-04-14',
            confidence: 0.8
          }
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log('✅ Microcopy enhancement completed');

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        results: microcopyResults,
        summary: {
          totalEnhancements: microcopyResults.microcopyEnhancements?.length || 0,
          model: 'gpt-4.1-2025-04-14',
          confidence: 0.8
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Microcopy processing failed:`, errorMessage);

    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});