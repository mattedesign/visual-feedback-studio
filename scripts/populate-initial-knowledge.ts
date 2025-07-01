import { vectorKnowledgeService } from '../src/services/knowledgeBase/vectorService';
import { KnowledgeEntry } from '../src/types/vectorDatabase';
import { ADDITIONAL_UX_ENTRIES } from './data/additionalUxEntries';
import { PROFESSIONAL_UX_ENTRIES } from './data/professionalUxEntries';

// Keep existing core UX knowledge entries
const CORE_UX_KNOWLEDGE: Partial<KnowledgeEntry>[] = [
  {
    title: "Fitts' Law for Touch Interfaces",
    content: "The time to acquire a target is a function of the distance to the target and the size of the target. For touch interfaces, this means buttons should be at least 44px for easy interaction. Larger buttons reduce errors and improve user satisfaction. Consider thumb reach zones on mobile devices.",
    source: "Fitts, P. M. (1954). The information capacity of the human motor system",
    category: "ux-patterns",
    primary_category: "interaction-design",
    secondary_category: "mobile-ux",
    industry_tags: ["mobile", "web", "applications"],
    element_type: "button",
    tags: ["fitts-law", "touch-targets", "mobile", "interaction-design"],
    complexity_level: "basic",
    use_cases: ["Mobile app design", "Touch interface optimization", "Button sizing"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      minimum_size: "44px x 44px",
      optimal_spacing: "8px between targets",
      thumb_zones: "bottom third of screen most accessible"
    }
  },
  {
    title: "Nielsen's 10 Usability Heuristics",
    content: "The 10 general principles for interaction design: visibility of system status, match between system and real world, user control and freedom, consistency and standards, error prevention, recognition rather than recall, flexibility and efficiency of use, aesthetic and minimalist design, help users recognize and recover from errors, and help and documentation.",
    source: "Nielsen, J. (1994). 10 Usability Heuristics for User Interface Design",
    category: "ux-research",
    primary_category: "principles",
    secondary_category: "heuristics",
    industry_tags: ["all"],
    element_type: "system",
    tags: ["heuristics", "usability", "principles", "evaluation"],
    complexity_level: "intermediate",
    use_cases: ["Usability evaluation", "Design reviews", "UX audit"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      evaluation_method: "heuristic evaluation",
      severity_rating: "0-4 scale",
      evaluator_count: "3-5 evaluators recommended"
    }
  },
  {
    title: "F-Pattern Reading Behavior",
    content: "Users read web content in an F-shaped pattern: two horizontal stripes followed by a vertical stripe. This pattern suggests placing the most important information along these areas. The pattern is most pronounced in text-heavy layouts and less predictable in more visual designs.",
    source: "Nielsen Norman Group Eye-tracking Studies",
    category: "ux-patterns",
    primary_category: "layout",
    secondary_category: "reading-patterns",
    industry_tags: ["web", "content", "publishing"],
    element_type: "layout",
    tags: ["f-pattern", "eye-tracking", "reading", "layout"],
    complexity_level: "basic",
    use_cases: ["Content layout", "Landing page design", "Article formatting"],
    related_patterns: [],
    freshness_score: 0.9,
    application_context: {
      content_strategy: "front-load important information",
      layout_priority: "left side and top sections",
      text_formatting: "use headings and bullet points"
    }
  },
  {
    title: "Progressive Disclosure",
    content: "A technique for managing information complexity by presenting only essential information at each step. Progressive disclosure improves comprehension by breaking complex tasks into manageable chunks. It reduces cognitive load and helps users focus on immediate tasks.",
    source: "Information Architecture: Blueprints for the Web",
    category: "ux-patterns",
    primary_category: "information-architecture",
    secondary_category: "complexity-management",
    industry_tags: ["forms", "dashboards", "onboarding"],
    element_type: "interface",
    tags: ["progressive-disclosure", "complexity", "cognitive-load", "information-architecture"],
    complexity_level: "intermediate",
    use_cases: ["Multi-step forms", "Onboarding flows", "Settings panels"],
    related_patterns: [],
    freshness_score: 0.9,
    application_context: {
      implementation: "accordion, tabs, or step-by-step flows",
      timing: "reveal information just-in-time",
      user_control: "allow users to access more detail if needed"
    }
  },
  {
    title: "Color Accessibility and Contrast",
    content: "WCAG 2.1 requires minimum contrast ratios of 4.5:1 for normal text and 3:1 for large text against backgrounds. Color should not be the only way to convey information. Consider color blindness affecting 8% of men and 0.5% of women. Use tools like WebAIM's contrast checker.",
    source: "Web Content Accessibility Guidelines (WCAG) 2.1",
    category: "accessibility",
    primary_category: "visual-design",
    secondary_category: "compliance",
    industry_tags: ["web", "mobile", "government"],
    element_type: "color",
    tags: ["accessibility", "contrast", "color", "wcag", "compliance"],
    complexity_level: "basic",
    use_cases: ["Color scheme design", "Accessibility compliance", "Text readability"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      testing_tools: "WebAIM Contrast Checker, Stark plugin",
      compliance_level: "AA standard recommended",
      color_blindness_types: "protanopia, deuteranopia, tritanopia"
    }
  }
];

// Combine all knowledge entries
const ALL_KNOWLEDGE_ENTRIES = [
  ...CORE_UX_KNOWLEDGE,
  ...ADDITIONAL_UX_ENTRIES,
  ...PROFESSIONAL_UX_ENTRIES
];

export async function populateInitialKnowledge() {
  console.log('🚀 Starting initial knowledge population...');
  console.log(`📊 Processing ${ALL_KNOWLEDGE_ENTRIES.length} total entries...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  try {
    for (const [index, entry] of ALL_KNOWLEDGE_ENTRIES.entries()) {
      try {
        console.log(`\n🔄 Processing ${index + 1}/${ALL_KNOWLEDGE_ENTRIES.length}: "${entry.title}"`);
        
        await vectorKnowledgeService.addKnowledgeEntry(entry);
        successCount++;
        
        console.log(`✅ Successfully added: ${entry.title}`);
        
        // Small delay to prevent overwhelming the system
        if (index < ALL_KNOWLEDGE_ENTRIES.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (entryError) {
        errorCount++;
        console.error(`❌ Failed to add "${entry.title}":`, entryError);
        continue;
      }
    }
    
    console.log('\n📋 === POPULATION SUMMARY ===');
    console.log(`✅ Successfully added: ${successCount} entries`);
    console.log(`❌ Failed: ${errorCount} entries`);
    console.log(`📊 Total processed: ${ALL_KNOWLEDGE_ENTRIES.length} entries`);
    
    if (successCount > 0) {
      console.log('🎉 Initial knowledge population completed successfully!');
    } else {
      console.log('⚠️ No entries were successfully added. Check the logs above for errors.');
    }
    
  } catch (error) {
    console.error('💥 Critical error during knowledge population:', error);
    throw error;
  }
}

// Auto-run if called directly
if (import.meta.main) {
  populateInitialKnowledge()
    .then(() => {
      console.log('✨ Script completed successfully');
      Deno.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      Deno.exit(1);
    });
}
