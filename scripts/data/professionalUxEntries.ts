
import { KnowledgeEntry } from '../src/types/vectorDatabase';

export const PROFESSIONAL_UX_ENTRIES: Partial<KnowledgeEntry>[] = [
  {
    id: "entry-auto-001",
    title: "CTA Clarity Over Creativity",
    content: "Clear, descriptive CTAs like 'Start Free Trial' convert better than vague ones like 'Get Started'. Users hesitate when they don't understand the result of their action.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "optimization",
    secondary_category: "conversion-cta",
    industry_tags: ["SaaS", "ecommerce"],
    element_type: "CTA",
    tags: ["clarity", "conversion", "CTA copy"],
    complexity_level: "basic",
    use_cases: ["Landing page CTAs", "Pricing pages", "Signup modals"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      cta_copy_examples: ["Start Free Trial", "Schedule a Demo", "Download Guide"],
      example_components: ["Hero CTA", "Sticky button", "Pricing toggle"]
    },
    metadata: {
      failure_risk: "ambiguous intent",
      recommended_length: "2–4 words"
    }
  },
  {
    id: "entry-auto-002",
    title: "Use Urgency Without Manipulation",
    content: "Effective urgency cues like 'Limited time offer' increase action but must be truthful. False urgency (timers that reset) erodes trust and creates legal risk.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "optimization",
    secondary_category: "conversion-psychology",
    industry_tags: ["retail", "ecommerce", "events"],
    element_type: "banner",
    tags: ["urgency", "trust", "scarcity"],
    complexity_level: "intermediate",
    use_cases: ["Flash sales", "Event registration", "Product launches"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      ethical_urgency: "Use real deadlines or limited inventory language",
      example_components: ["Timer bar", "Stock indicator", "Event CTA"]
    },
    metadata: {
      risk_factor: "legal",
      ethical_guideline: "no false scarcity"
    }
  }
  // ... continue with the rest of the 25 professional entries
];
