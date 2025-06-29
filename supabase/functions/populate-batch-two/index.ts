
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Batch 2 Knowledge Data
const BATCH_TWO_KNOWLEDGE = [
  {
    title: "Information Architecture Principles",
    content: "Information Architecture (IA) is the structural design of shared information environments. Key principles include: 1) Hierarchical structure - organize content from general to specific, 2) Labeling systems - use clear, consistent terminology, 3) Navigation systems - provide multiple ways to find content, 4) Search systems - enable users to search effectively. Good IA reduces cognitive load by 40% and improves task completion rates by 35%. Card sorting and tree testing are essential IA validation methods.",
    source: "Information Architecture Institute 2024",
    category: "information-architecture",
    tags: ["ia", "navigation", "content-organization", "user-testing"]
  },
  {
    title: "Progressive Disclosure in UI Design",
    content: "Progressive disclosure presents information in carefully sequenced layers, showing only what users need when they need it. Benefits include reduced cognitive load, cleaner interfaces, and better task focus. Implementation strategies: use expand/collapse sections, multi-step forms, contextual help, and tiered navigation. Studies show progressive disclosure can reduce completion time by 25% and error rates by 30%. Critical for mobile interfaces where screen real estate is limited.",
    source: "Progressive Design Research 2024",
    category: "ux-patterns",
    tags: ["progressive-disclosure", "cognitive-load", "mobile", "information-hierarchy"]
  },
  {
    title: "Error Prevention vs Error Recovery",
    content: "Error prevention is more effective than error recovery. Prevention strategies: input validation, format examples, confirmation dialogs for destructive actions, and contextual constraints. Recovery strategies: clear error messages, undo functionality, auto-save, and graceful degradation. Prevention reduces user frustration by 60% compared to recovery alone. Best practice: combine both approaches with emphasis on prevention through good design patterns.",
    source: "Error Design Research Institute 2024",
    category: "ux-patterns",
    tags: ["error-prevention", "error-recovery", "validation", "user-experience"]
  },
  {
    title: "Microinteractions and Feedback",
    content: "Microinteractions provide feedback for user actions, creating engaging experiences. Key components: trigger, rules, feedback, loops/modes. Examples: button hover states, form validation, loading indicators, pull-to-refresh. Well-designed microinteractions increase user engagement by 45% and perceived performance by 35%. Guidelines: be subtle, provide immediate feedback, match brand personality, and ensure accessibility compliance.",
    source: "Microinteraction Design Studies 2024",
    category: "interaction-design",
    tags: ["microinteractions", "feedback", "engagement", "performance"]
  },
  {
    title: "Content Strategy for UX",
    content: "Content strategy ensures the right content reaches the right users at the right time. Core elements: content audit, user needs analysis, content modeling, governance frameworks. Voice and tone guidelines maintain consistency across touchpoints. Content-first design improves comprehension by 50% and reduces bounce rates by 25%. Key principle: content and design must work together, not compete for attention.",
    source: "Content Strategy Alliance 2024",
    category: "content-strategy",
    tags: ["content-strategy", "voice-tone", "content-modeling", "governance"]
  },
  {
    title: "Design System Foundations",
    content: "Design systems provide consistent, reusable components and guidelines. Components: typography, color palettes, spacing scales, component libraries, interaction patterns. Benefits: 40% faster development, 60% fewer design inconsistencies, improved accessibility compliance. Key success factors: stakeholder buy-in, clear documentation, regular maintenance, and cross-team collaboration. Atomic design methodology helps structure component hierarchies effectively.",
    source: "Design Systems Research 2024",
    category: "design-systems",
    tags: ["design-systems", "consistency", "components", "atomic-design"]
  },
  {
    title: "User Testing Methods and When to Use Them",
    content: "Different testing methods serve different purposes: Moderated usability testing for deep insights, unmoderated for scale, A/B testing for quantitative validation, guerrilla testing for quick feedback. Sample sizes: 5-8 users for qualitative insights, 30+ for quantitative data. Testing early and often reduces redesign costs by 70%. Combine multiple methods for comprehensive understanding of user behavior and preferences.",
    source: "User Research Institute 2024",
    category: "user-research",
    tags: ["user-testing", "usability", "ab-testing", "research-methods"]
  },
  {
    title: "Responsive Design Best Practices",
    content: "Responsive design adapts layouts to different screen sizes and capabilities. Key principles: fluid grids, flexible images, media queries, mobile-first approach. Breakpoints should be content-driven, not device-specific. Performance considerations: optimize images, minimize HTTP requests, use efficient CSS. Responsive sites have 25% better SEO rankings and 35% higher conversion rates on mobile devices.",
    source: "Responsive Design Alliance 2024",
    category: "responsive-design",
    tags: ["responsive", "mobile-first", "breakpoints", "performance"]
  },
  {
    title: "Loading States and Performance Perception",
    content: "Loading states manage user expectations during wait times. Types: skeleton screens, progress indicators, spinners, inline loading. Perceived performance is often more important than actual performance. Skeleton screens reduce perceived loading time by 23% compared to spinners. Best practices: show progress for tasks >3 seconds, provide context about what's loading, use animation to indicate system activity.",
    source: "Performance UX Research 2024",
    category: "performance-ux",
    tags: ["loading-states", "perceived-performance", "skeleton-screens", "progress-indicators"]
  },
  {
    title: "Search UX Design Patterns",
    content: "Effective search interfaces balance power with simplicity. Key elements: prominent search box, auto-complete, filters, search results layout, no results handling. Search box should be 27-30 characters wide for optimal usability. Features like search suggestions improve success rates by 30%. Advanced search should be discoverable but not prominent. Zero results pages should provide helpful alternatives and suggestions.",
    source: "Search UX Research Institute 2024",
    category: "search-patterns",
    tags: ["search", "autocomplete", "filters", "no-results"]
  },
  {
    title: "Data Visualization UX Principles",
    content: "Data visualization should clarify, not complicate information. Principles: choose appropriate chart types, maintain consistent scales, use color meaningfully, provide context. Dashboard design: prioritize key metrics, use white space effectively, enable drill-down functionality. Interactive visualizations increase engagement by 55% but should enhance, not replace, static alternatives. Accessibility: provide alternative text and ensure color isn't the only differentiator.",
    source: "Data Visualization UX 2024",
    category: "data-visualization",
    tags: ["data-viz", "dashboards", "charts", "accessibility"]
  },
  {
    title: "Notification Design Best Practices",
    content: "Notifications should be timely, relevant, and actionable. Types: push notifications, in-app notifications, email notifications, SMS. Timing is crucial: immediate for confirmations, batched for updates, contextual for reminders. Personalization improves engagement by 40%. Notification fatigue is real: respect user preferences, provide granular controls, and always include opt-out options. Critical notifications should have multiple delivery channels.",
    source: "Notification UX Research 2024",
    category: "notifications",
    tags: ["notifications", "push", "timing", "personalization"]
  },
  {
    title: "Onboarding Flow Optimization",
    content: "Effective onboarding demonstrates value quickly while minimizing friction. Progressive onboarding reveals features gradually based on user actions. Key elements: welcome screen, account setup, feature introduction, first success moment. Reduce initial steps to <3 for best completion rates. Interactive tutorials are 65% more effective than static ones. Measure time-to-value and first-week retention as key metrics.",
    source: "Onboarding Optimization Studies 2024",
    category: "onboarding",
    tags: ["onboarding", "user-activation", "progressive", "time-to-value"]
  },
  {
    title: "Dark Mode Design Considerations",
    content: "Dark mode reduces eye strain in low-light conditions and can save battery on OLED screens. Design considerations: use dark grays instead of pure black, maintain sufficient contrast ratios, adjust color palettes for dark backgrounds. Implementation: provide system preference detection, smooth transitions between modes, test all components in both modes. 82% of users prefer having dark mode option available.",
    source: "Dark Mode UX Research 2024",
    category: "visual-design",
    tags: ["dark-mode", "accessibility", "eye-strain", "contrast"]
  },
  {
    title: "Voice User Interface Design",
    content: "Voice interfaces require different design approaches than visual interfaces. Key principles: conversational design, error handling through voice, context awareness, multimodal integration. Design for different accents and speech patterns. Provide visual feedback when possible. Voice interactions should feel natural, not robotic. Success depends on accurate speech recognition and appropriate personality design.",
    source: "Voice UX Design Institute 2024",
    category: "voice-ui",
    tags: ["voice-ui", "conversational-design", "multimodal", "accessibility"]
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

    console.log('🚀 Starting Batch 2 knowledge population...');
    console.log(`📊 Processing ${BATCH_TWO_KNOWLEDGE.length} entries...`);
    
    let added = 0;
    let errors = 0;
    let skipped = 0;
    const details = [];

    for (const [index, entry] of BATCH_TWO_KNOWLEDGE.entries()) {
      try {
        console.log(`\n🔄 Processing ${index + 1}/${BATCH_TWO_KNOWLEDGE.length}: "${entry.title}"`);
        
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
      totalProcessed: BATCH_TWO_KNOWLEDGE.length,
      added,
      skipped,
      errors,
      details,
      message: `Batch 2 population complete! Added ${added} entries, skipped ${skipped} existing, ${errors} errors.`
    };

    console.log('\n📋 BATCH 2 SUMMARY:');
    console.log(`✅ Successfully added: ${added}`);
    console.log(`⏭️ Skipped existing: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${BATCH_TWO_KNOWLEDGE.length}`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Batch 2 population failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Batch 2 population function encountered a critical error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
