import { vectorKnowledgeService } from '../src/services/knowledgeBase/vectorService';
import { KnowledgeEntry } from '../src/types/vectorDatabase';

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

// Add the 12 new professional UX research entries to the existing knowledge base
const ADDITIONAL_UX_ENTRIES: Partial<KnowledgeEntry>[] = [
  {
    id: "entry-auto-001",
    title: "Use Authority Bias to Increase Trust in Conversions",
    content: "Users are more likely to take action when the interface highlights credible sources, endorsements, or expert testimonials. This is known as authority bias. Placing trust signals—such as industry certifications, customer logos, or expert reviews—near critical CTAs can increase conversion rates. Ensure the signals are visually distinct but not disruptive to flow.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "optimization",
    secondary_category: "persuasion-strategies",
    industry_tags: ["ecommerce", "SaaS", "finance"],
    element_type: "CTA",
    tags: ["psychology", "trust", "authority", "heuristics"],
    complexity_level: "intermediate",
    use_cases: ["Improve signup flow", "Increase checkout conversion", "Boost landing page trust"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      positioning_guidelines: "Place trust signals adjacent to or slightly above the primary CTA for visibility without distraction.",
      example_components: ["Signup form", "Testimonial carousel", "Certification badge"]
    },
    metadata: {
      bias_type: "authority",
      emotional_trigger: "trust",
      implementation_notes: "Avoid overloading with logos; 2–3 high-credibility signals are ideal."
    }
  },
  {
    id: "entry-auto-002",
    title: "Apply Fogg Behavior Model for Engagement Design",
    content: "The Fogg Behavior Model (B=MAP) shows that behavior happens when motivation, ability, and prompts converge. Use this model to identify which variable is missing in a failing experience: is the user not motivated, unable to act, or not prompted clearly?",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "research",
    secondary_category: "behavioral-models",
    industry_tags: ["edtech", "health", "SaaS"],
    element_type: "modal",
    tags: ["fogg model", "behavioral design", "UX psychology"],
    complexity_level: "advanced",
    use_cases: ["Onboarding", "Habit-forming apps", "Conversion optimization"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      diagnostic_prompt: "Check which component of B=MAP is failing when users drop off mid-flow.",
      example_components: ["Motivational banner", "Clear CTA", "Ease-of-use microcopy"]
    },
    metadata: {
      framework: "Fogg Behavior Model",
      failure_mode: "missing prompt or friction"
    }
  },
  {
    id: "entry-auto-003",
    title: "Progressive Disclosure for Mobile Navigation",
    content: "Progressive disclosure helps manage cognitive load on small screens by only showing essential information upfront. Use nested patterns, expandable menus, and hover-to-expand only where needed to avoid clutter.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "navigation",
    industry_tags: ["ecommerce", "news", "productivity"],
    element_type: "nav",
    tags: ["progressive disclosure", "mobile UX", "IA"],
    complexity_level: "basic",
    use_cases: ["Mobile menu design", "Dashboard sidebars", "Feature discovery"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      mobile_guideline: "Only display top-level nav on initial load, with child items expanded on tap or swipe.",
      example_components: ["Hamburger menu", "Mega menu", "Mobile filters"]
    },
    metadata: {
      usability_principle: "cognitive load",
      screen_type: "mobile"
    }
  },
  {
    id: "entry-auto-004",
    title: "Detect Visual Hierarchy Breakdown in Hero Sections",
    content: "If the hero area has more than one focal point, users may become confused about where to look. Strong visual hierarchy requires one dominant element, supported by a clear subtitle or CTA.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "design",
    secondary_category: "visual-hierarchy",
    industry_tags: ["SaaS", "real estate", "services"],
    element_type: "hero",
    tags: ["visual hierarchy", "attention", "first impression"],
    complexity_level: "intermediate",
    use_cases: ["Landing page design", "Homepage optimization"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      focus_checklist: "1 primary message, 1 CTA, supportive visuals only.",
      example_components: ["Hero image", "H1 text", "Primary CTA"]
    },
    metadata: {
      pattern_problem: "multiple visual anchors",
      attention_path: "broken"
    }
  },
  {
    id: "entry-auto-005",
    title: "Design for Cognitive Biases in Checkout UX",
    content: "Leverage decision-making heuristics such as scarcity, urgency, and default selection in checkout flows to encourage completion. Just ensure these are ethical and not deceptive.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "optimization",
    secondary_category: "checkout",
    industry_tags: ["ecommerce"],
    element_type: "checkout",
    tags: ["scarcity", "urgency", "choice architecture"],
    complexity_level: "advanced",
    use_cases: ["Abandoned cart recovery", "Pricing page", "Flash sales"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      checkout_heuristics: "Show 'Only 3 left!' or 'Selling fast' indicators above fold.",
      example_components: ["Cart summary", "Timer module", "Inventory notice"]
    },
    metadata: {
      bias_type: "scarcity",
      risk_level: "high if overused"
    }
  },
  {
    id: "entry-auto-007",
    title: "Improve Clarity with Accessible Form Design",
    content: "Forms should follow WCAG guidelines to support all users. Use clear labels, high-contrast colors, and keyboard navigability. Include real-time error feedback with helpful suggestions.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "compliance",
    secondary_category: "accessibility",
    industry_tags: ["finance", "health", "education"],
    element_type: "form",
    tags: ["accessibility", "WCAG", "form design", "inclusive design"],
    complexity_level: "intermediate",
    use_cases: ["Account creation", "Medical intake forms", "Payment flows"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      accessibility_guidelines: "All form elements must have labels, focus states, and ARIA roles where needed.",
      example_components: ["Text input", "Dropdown menu", "Checkbox group"]
    },
    metadata: {
      wcag_level: "AA",
      user_needs: ["screen reader", "colorblind", "keyboard-only"]
    }
  },
  {
    id: "entry-auto-008",
    title: "Calibrate Microcopy for Error Messages and Empty States",
    content: "Microcopy should be helpful, human, and context-aware. Avoid blame, use plain language, and guide the user forward. Especially critical in error messages, empty states, and onboarding.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "design",
    secondary_category: "microcopy",
    industry_tags: ["all"],
    element_type: "message",
    tags: ["microcopy", "empty state", "onboarding", "error feedback"],
    complexity_level: "basic",
    use_cases: ["First-time user experience", "Form submission", "Search results"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      copywriting_tips: "Be specific and action-oriented: 'Try searching for a product name' instead of 'No results found'.",
      example_components: ["Empty state", "Inline error", "Tooltip"]
    },
    metadata: {
      tone: "supportive",
      failure_context: "missing data or input error"
    }
  },
  {
    id: "entry-auto-009",
    title: "Detect Interaction Feedback Gaps in Microinteractions",
    content: "Microinteractions like toggles, swipes, and button presses should always provide immediate feedback. Missing animation or delay can cause user uncertainty.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "motion-ux",
    industry_tags: ["mobile", "productivity", "commerce"],
    element_type: "toggle",
    tags: ["feedback", "motion", "microinteraction", "animation"],
    complexity_level: "intermediate",
    use_cases: ["Settings UI", "Like/favorite interactions", "Status change"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      motion_guidelines: "Use 100–250ms animations for tactile interactions. Avoid lag or 'dead states'.",
      example_components: ["Switch toggle", "Swipe card", "Loading button"]
    },
    metadata: {
      motion_framework: "Material Design",
      accessibility_risk: "high with no feedback"
    }
  },
  {
    id: "entry-auto-010",
    title: "Structure Navigation with Recognition over Recall",
    content: "Good IA favors recognition over recall. Group similar items together, use descriptive labels, and avoid deep nested hierarchies unless necessary.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "information-architecture",
    industry_tags: ["SaaS", "marketplaces", "dashboards"],
    element_type: "navigation",
    tags: ["IA", "menu", "cognitive load", "recognition"],
    complexity_level: "intermediate",
    use_cases: ["Sidebar menus", "Site IA", "Product navigation"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      nav_rules: "Use consistent naming and limit hierarchy to 2 levels where possible.",
      example_components: ["Sidebar", "Mega nav", "Tab switcher"]
    },
    metadata: {
      cognitive_model: "recognition over recall",
      pattern_risk: "high if inconsistent"
    }
  },
  {
    id: "entry-auto-011",
    title: "Adapt UX to Cultural Expectations in Global Markets",
    content: "Cultural UX affects layout, tone, and interaction expectations. In Japan, hierarchy and clarity are key. In the US, brevity and bold CTAs matter. Design must adjust.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "research",
    secondary_category: "cultural-ux",
    industry_tags: ["global", "commerce", "education"],
    element_type: "layout",
    tags: ["cultural UX", "localization", "market fit"],
    complexity_level: "advanced",
    use_cases: ["Global onboarding", "Localized landing pages", "Checkout forms"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      localization_notes: "Adjust button text, form flow, and iconography by region.",
      example_components: ["Pricing page", "Form fields", "CTA area"]
    },
    metadata: {
      region_variance: ["US", "Japan", "Germany"],
      localization_level: "interface + tone"
    }
  },
  {
    id: "entry-auto-012",
    title: "Identify Design Debt Through Inconsistent Component Use",
    content: "Multiple versions of the same component (e.g., 5 button styles) signal design debt. Highlight style inconsistencies, rogue spacing, or unaligned typography to reduce friction.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "optimization",
    secondary_category: "design-debt",
    industry_tags: ["enterprise", "B2B", "startups"],
    element_type: "button",
    tags: ["design system", "inconsistency", "UI audit"],
    complexity_level: "intermediate",
    use_cases: ["Design refactor", "Library audit", "System migration"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      audit_steps: "Run a visual sweep of buttons and text inputs across pages to check for inconsistencies.",
      example_components: ["Button", "Input", "Card"]
    },
    metadata: {
      debt_signal: "variation",
      cleanup_priority: "high"
    }
  },
  {
    id: "entry-auto-013",
    title: "Predict Drop-Off with Analytics-Based Layout Heuristics",
    content: "Use heuristics from analytics (heatmaps, scroll depth, funnel tracking) to flag design regions likely to lose engagement. Common drop-off zones: right rail, deep-scroll content, form fields with unclear labels.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "research",
    secondary_category: "analytics",
    industry_tags: ["SaaS", "ecommerce", "news"],
    element_type: "layout",
    tags: ["analytics", "drop-off", "scroll depth", "heatmaps"],
    complexity_level: "advanced",
    use_cases: ["Landing optimization", "Funnel improvement", "UX testing"],
    related_patterns: [],
    freshness_score: 0.95,
    application_context: {
      dropoff_indicators: "Clicks on right rail under 5%, CTA visibility below the fold, unclear form labels",
      example_components: ["CTA", "Form", "Hero block"]
    },
    metadata: {
      data_sources: ["Hotjar", "GA4", "Mixpanel"],
      interpretation_risk: "requires volume context"
    }
  }
];

// Combine existing knowledge with new entries
const ALL_KNOWLEDGE_ENTRIES = [
  ...CORE_UX_KNOWLEDGE,
  ...ADDITIONAL_UX_ENTRIES
];

export async function populateInitialKnowledge() {
  console.log('🚀 Starting initial knowledge population...');
  console.log(`📊 Processing ${ALL_KNOWLEDGE_ENTRIES.length} total entries (${CORE_UX_KNOWLEDGE.length} existing + ${ADDITIONAL_UX_ENTRIES.length} new)...`);
  
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
        
        // Continue with other entries even if one fails
        continue;
      }
    }
    
    console.log('\n📋 === POPULATION SUMMARY ===');
    console.log(`✅ Successfully added: ${successCount} entries`);
    console.log(`❌ Failed: ${errorCount} entries`);
    console.log(`📊 Total processed: ${ALL_KNOWLEDGE_ENTRIES.length} entries`);
    console.log(`🆕 New entries added: ${ADDITIONAL_UX_ENTRIES.length}`);
    
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
