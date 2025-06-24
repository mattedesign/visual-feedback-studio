
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const testKnowledgeEntries = [
  {
    title: 'Button Design Best Practices',
    content: 'Buttons should have clear visual hierarchy with sufficient contrast ratio (minimum 3:1 for normal text, 4.5:1 for small text). Use consistent sizing with minimum 44px touch targets for mobile. Primary actions should use brand colors while secondary actions use neutral tones.',
    category: 'ux',
    tags: ['buttons', 'accessibility', 'mobile', 'contrast'],
    source: 'WCAG Guidelines & Material Design'
  },
  {
    title: 'Form Usability Guidelines',
    content: 'Forms should use clear labels positioned above input fields. Provide real-time validation feedback. Group related fields together. Use single-column layouts for better completion rates. Include helpful placeholder text and error messages.',
    category: 'ux',
    tags: ['forms', 'usability', 'validation', 'layout'],
    source: 'Nielsen Norman Group Research'
  },
  {
    title: 'Color Contrast Accessibility',
    content: 'WCAG AA requires minimum 4.5:1 contrast ratio for normal text and 3:1 for large text. AAA level requires 7:1 for normal text. Colors should not be the only way to convey information. Test with colorblind users.',
    category: 'accessibility',
    tags: ['contrast', 'accessibility', 'WCAG', 'color'],
    source: 'WCAG 2.1 Guidelines'
  },
  {
    title: 'Mobile Touch Interface Design',
    content: 'Touch targets should be minimum 44px (Apple) or 48dp (Google) for comfortable interaction. Leave adequate spacing between tappable elements. Design for thumb-friendly navigation zones.',
    category: 'ux',
    tags: ['mobile', 'touch', 'interface', 'usability'],
    source: 'Apple HIG & Material Design'
  },
  {
    title: 'Conversion Optimization Principles',
    content: 'Use clear, action-oriented CTA text. Position primary CTAs prominently with contrasting colors. Reduce form friction by minimizing required fields. Use social proof and urgency where appropriate.',
    category: 'conversion',
    tags: ['CTA', 'conversion', 'optimization', 'forms'],
    source: 'Conversion Rate Optimization Studies'
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Populating Test Knowledge Entries ===');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const results = [];

    for (const entry of testKnowledgeEntries) {
      try {
        // Generate embedding for the knowledge entry
        const embedding = await generateEmbedding(`${entry.title} ${entry.content}`);
        
        // Insert into knowledge_entries table
        const { data, error } = await supabaseClient
          .from('knowledge_entries')
          .insert({
            title: entry.title,
            content: entry.content,
            category: entry.category,
            tags: entry.tags,
            source: entry.source,
            embedding: `[${embedding.join(',')}]` // Store as string in Postgres
          })
          .select()
          .single();

        if (error) {
          console.error(`Error inserting entry "${entry.title}":`, error);
          results.push({ title: entry.title, success: false, error: error.message });
        } else {
          console.log(`✅ Inserted entry: ${entry.title}`);
          results.push({ title: entry.title, success: true, id: data.id });
        }
      } catch (error) {
        console.error(`Error processing entry "${entry.title}":`, error);
        results.push({ title: entry.title, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Population complete: ${successCount}/${testKnowledgeEntries.length} entries added`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully populated ${successCount} knowledge entries`,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Population failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Generate embeddings using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY_RAG');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY_RAG not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.data[0].embedding;
}
