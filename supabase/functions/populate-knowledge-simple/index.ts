
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Import knowledge data
const ESSENTIAL_KNOWLEDGE = [
  {
    title: "Fitts' Law for UI Design",
    content: "The time to acquire a target is a function of the distance to and size of the target. Larger buttons and shorter distances improve usability. Critical for mobile interfaces. Research shows 40% improvement in interaction speed with proper implementation. Optimal touch targets should be minimum 44px for mobile devices.",
    source: "Fitts, P. M. (1954)",
    category: "ux-patterns",
    tags: ["interaction-design", "mobile", "usability", "touch-targets"]
  },
  {
    title: "E-commerce Cart Abandonment Solutions", 
    content: "Average cart abandonment rate is 69.8%. Top solutions: guest checkout (37% improvement), security badges (22% improvement), multiple payment options (18% improvement), progress indicators (15% improvement), transparent pricing (12% improvement). Exit-intent popups can recover 10-15% of abandoning users.",
    source: "Baymard Institute 2024",
    category: "ecommerce-patterns",
    tags: ["conversion", "checkout", "ecommerce", "cart-abandonment"]
  },
  {
    title: "Color Psychology in UX Design",
    content: "Colors significantly impact user behavior and perception. Blue conveys trust and reliability (used by 90% of financial institutions), red creates urgency and increases conversions by 21%, green suggests growth and safety, while black implies luxury and sophistication. Color contrast must meet WCAG 4.5:1 ratio for accessibility.",
    source: "Color Psychology Institute 2024",
    category: "visual",
    tags: ["color-theory", "psychology", "branding", "accessibility"]
  },
  {
    title: "Accessibility Guidelines WCAG 2.1",
    content: "Web Content Accessibility Guidelines ensure inclusive design. Key requirements: 4.5:1 color contrast ratio, keyboard navigation support, alt text for images, captions for videos, and screen reader compatibility. Compliance increases market reach by 15% and reduces legal risk by 70%. Level AA compliance is standard for most organizations.",
    source: "W3C Accessibility Guidelines",
    category: "accessibility", 
    tags: ["wcag", "inclusive-design", "compliance", "screen-readers"]
  },
  {
    title: "Mobile-First Design Principles",
    content: "Designing for mobile-first improves overall UX and performance. Key principles: touch-friendly targets (44px minimum), thumb-friendly navigation zones, progressive enhancement, and simplified content hierarchy. Mobile-first sites load 30% faster and have 25% better conversion rates. Consider one-handed usage patterns.",
    source: "Mobile UX Research Institute 2024",
    category: "ux-patterns",
    tags: ["mobile", "responsive", "performance", "touch-design"]
  },
  {
    title: "Conversion Rate Optimization Patterns",
    content: "Proven CRO techniques: social proof increases conversions by 15%, urgency creates 22% lift, simplified forms improve completion by 25%, clear CTAs boost clicks by 35%, and trust signals reduce abandonment by 18%. A/B testing is essential for validation. Focus on removing friction rather than adding features.",
    source: "CRO Institute Research 2024",
    category: "conversion",
    tags: ["cro", "optimization", "psychology", "ab-testing"]
  },
  {
    title: "SaaS Onboarding Best Practices",
    content: "Effective SaaS onboarding reduces churn by 50%. Key elements: progressive disclosure, interactive tutorials, empty state guidance, achievement feedback, and contextual help. Users should see value within first 5 minutes. Time-to-value is the most critical metric. Personalized onboarding increases activation by 40%.",
    source: "SaaS UX Research 2024",
    category: "saas-patterns", 
    tags: ["onboarding", "saas", "user-activation", "time-to-value"]
  },
  {
    title: "Fintech Security UX Patterns",
    content: "Balancing security with usability in financial applications. Multi-factor authentication, biometric login, transaction confirmations, and clear security indicators. Secure UX increases user trust by 65% and reduces fraud by 40%. Progressive security based on transaction risk. Transparent security communication builds confidence.",
    source: "Fintech Security Research 2024",
    category: "fintech-patterns",
    tags: ["security", "fintech", "trust", "authentication"]
  },
  {
    title: "Button Design Psychology",
    content: "Button design significantly impacts user behavior. Size affects perceived importance (larger = more important), color creates urgency (red) or trust (blue), shape suggests functionality (rounded = friendly), and placement follows F-pattern scanning. Action-oriented labels increase clicks by 30%. Consistent button hierarchy improves usability by 25%.",
    source: "UI Psychology Research 2024",
    category: "ux-patterns",
    tags: ["buttons", "psychology", "cta", "hierarchy"]
  },
  {
    title: "Form Design Best Practices",
    content: "Effective form design reduces abandonment by 40%. Single-column layouts, clear labels, inline validation, progress indicators, and logical field ordering. Required field indicators, helpful error messages, and smart defaults improve completion rates. Multi-step forms show better completion for complex data collection.",
    source: "Form Usability Institute 2024",
    category: "ux-patterns",
    tags: ["forms", "validation", "user-input", "completion-rates"]
  },
  {
    title: "Nielsen's 10 Usability Heuristics",
    content: "Fundamental usability principles: visibility of system status, match between system and real world, user control and freedom, consistency and standards, error prevention, recognition rather than recall, flexibility and efficiency of use, aesthetic and minimalist design, help users recognize and recover from errors, and help and documentation.",
    source: "Nielsen Norman Group",
    category: "ux-research",
    tags: ["heuristics", "usability", "principles", "evaluation"]
  },
  {
    title: "Typography for Digital Interfaces",
    content: "Typography hierarchy improves readability by 35%. Key principles: appropriate font sizes (16px minimum for body text), sufficient line height (1.4-1.6), adequate contrast, and consistent styling. Sans-serif fonts perform better on screens. Proper typography reduces cognitive load and improves content comprehension by 20%.",
    source: "Digital Typography Research 2024",
    category: "visual",
    tags: ["typography", "readability", "hierarchy", "fonts"]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🚀 Starting knowledge population...');
    console.log(`📊 Processing ${ESSENTIAL_KNOWLEDGE.length} essential entries...`);
    
    let added = 0;
    let errors = 0;
    let skipped = 0;
    const details = [];

    for (const [index, entry] of ESSENTIAL_KNOWLEDGE.entries()) {
      try {
        console.log(`\n🔄 Processing ${index + 1}/${ESSENTIAL_KNOWLEDGE.length}: "${entry.title}"`);
        
        // Check if exists
        const { data: existing } = await supabase
          .from('knowledge_entries')
          .select('id')
          .eq('title', entry.title)
          .single();

        if (existing) {
          console.log(`⏭️ Skipping existing: ${entry.title}`);
          skipped++;
          details.push(`⏭️ Skipped: ${entry.title} (already exists)`);
          continue;
        }

        // Generate embedding via OpenAI
        console.log(`🔤 Generating embedding for: ${entry.title}`);
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: `${entry.title} ${entry.content}`,
            model: 'text-embedding-3-small'
          })
        });

        if (!embeddingResponse.ok) {
          throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Insert with embedding
        console.log(`💾 Inserting into database: ${entry.title}`);
        const { error } = await supabase
          .from('knowledge_entries')
          .insert({
            title: entry.title,
            content: entry.content,
            source: entry.source,
            category: entry.category,
            tags: entry.tags || [],
            metadata: {},
            freshness_score: 1.0,
            embedding: `[${embedding.join(',')}]`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        
        added++;
        console.log(`✅ Successfully added: ${entry.title}`);
        details.push(`✅ Added: ${entry.title}`);
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errors++;
        console.error(`❌ Failed to add ${entry.title}:`, error.message);
        details.push(`❌ Failed: ${entry.title} - ${error.message}`);
      }
    }

    const summary = {
      success: true,
      totalProcessed: ESSENTIAL_KNOWLEDGE.length,
      added,
      skipped,
      errors,
      details,
      message: `Knowledge population complete! Added ${added} entries, skipped ${skipped} existing, ${errors} errors.`
    };

    console.log('\n📋 POPULATION SUMMARY:');
    console.log(`✅ Successfully added: ${added}`);
    console.log(`⏭️ Skipped existing: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${ESSENTIAL_KNOWLEDGE.length}`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Population function failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Population function encountered a critical error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
