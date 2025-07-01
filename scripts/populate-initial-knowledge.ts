import { vectorKnowledgeService } from '../src/services/knowledgeBase/vectorService';
import { KnowledgeEntry } from '../src/types/vectorDatabase';

// Keep existing core UX knowledge entries and add 25 new professional entries
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
  },
  // 25 new professional UX research entries
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
  },
  {
    id: "entry-auto-003",
    title: "Optimize Button Contrast for Conversion",
    content: "High-contrast buttons (visually and contextually) outperform muted or ghost buttons in most A/B tests. Ensure CTA is visually distinct and contrasts from other actions.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "optimization",
    secondary_category: "visual-priority",
    industry_tags: ["SaaS", "ecommerce"],
    element_type: "button",
    tags: ["contrast", "CTA", "visual salience"],
    complexity_level: "basic",
    use_cases: ["Signup forms", "Checkout", "Product pages"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      button_styling: "Use brand accent color and ensure >3:1 contrast ratio vs background",
      example_components: ["Primary CTA", "Ghost button", "Color token"]
    },
    metadata: {
      contrast_ratio: ">= 3:1",
      failure_mode: "visual blending"
    }
  },
  {
    id: "entry-auto-004",
    title: "Avoid Multiple Competing CTAs",
    content: "Multiple primary CTAs (e.g., 'Get Quote' and 'Contact Sales') create decision paralysis. Always prioritize one action per screen or module.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "optimization",
    secondary_category: "choice-architecture",
    industry_tags: ["finance", "SaaS", "real estate"],
    element_type: "section",
    tags: ["decision fatigue", "conversion", "choice minimization"],
    complexity_level: "intermediate",
    use_cases: ["Homepages", "Pricing", "Hero sections"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      cta_hierarchy: "Use primary + ghost button structure, avoid 2 same-weight CTAs",
      example_components: ["Hero", "Pricing tier", "CTA card"]
    },
    metadata: {
      cognitive_bias: "paradox of choice",
      recommendation: "1 clear primary CTA"
    }
  },
  {
    id: "entry-auto-005",
    title: "Trust Signals Boost Signup Flow Conversion",
    content: "Adding client logos, testimonials, or third-party security badges near a signup CTA increases conversions by up to 42%, especially for first-time visitors.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "optimization",
    secondary_category: "social-proof",
    industry_tags: ["B2B", "enterprise", "ecommerce"],
    element_type: "form",
    tags: ["social proof", "trust", "conversion"],
    complexity_level: "intermediate",
    use_cases: ["Signup forms", "Landing pages", "Free trial pages"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      trust_boosters: "Show logos of known clients, 3rd-party badges, or brief testimonials",
      example_components: ["Signup box", "Footer area", "Sidebar trust block"]
    },
    metadata: {
      conversion_lift: "10–42%",
      trust_type: "third-party endorsement"
    }
  },
  {
    id: "entry-auto-006",
    title: "Immediate Feedback in Button Interactions",
    content: "Buttons should offer immediate visual feedback when clicked—like color change or loading spinners—to signal system response. Delays create confusion and increase bounce.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "interaction-feedback",
    industry_tags: ["SaaS", "commerce", "mobile"],
    element_type: "button",
    tags: ["feedback", "response time", "button state"],
    complexity_level: "basic",
    use_cases: ["Form submission", "Navigation buttons", "Async triggers"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      feedback_modes: "Use pressed state and spinner within 150ms of action",
      example_components: ["Submit button", "Next button", "Login action"]
    },
    metadata: {
      acceptable_delay: "< 200ms",
      failure_risk: "perceived lag"
    }
  },
  {
    id: "entry-auto-007",
    title: "Avoid Dead Taps in Mobile Interfaces",
    content: "Mobile users expect every visual element to be tappable. Elements that look like buttons or cards but aren't interactive create frustration. Ensure visual affordance matches behavior.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "interaction-mobile",
    industry_tags: ["mobile", "social", "news"],
    element_type: "card",
    tags: ["affordance", "tap area", "mobile UX"],
    complexity_level: "intermediate",
    use_cases: ["Feed cards", "Profile elements", "Image galleries"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      interaction_tip: "Only style elements as buttons if they are actionable.",
      example_components: ["Profile tile", "Content card", "Product preview"]
    },
    metadata: {
      usability_heuristic: "match between design and system behavior",
      tap_target_guideline: "44px minimum"
    }
  },
  {
    id: "entry-auto-008",
    title: "Progress Indicators for Long Tasks",
    content: "Use progress bars or loaders for actions taking more than 1 second. For multi-step processes, show a visible step indicator to reduce abandonment and build trust.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "interaction-feedback",
    industry_tags: ["SaaS", "enterprise", "legal"],
    element_type: "loader",
    tags: ["progress indicator", "loading", "trust"],
    complexity_level: "intermediate",
    use_cases: ["File uploads", "Form wizards", "Data sync"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      feedback_timing: "Display a loader if delay > 1000ms",
      example_components: ["Progress bar", "Step tracker", "Spinner"]
    },
    metadata: {
      threshold: "1s for loader, 3s for percent bar",
      user_emotion: "anxiety when blind wait"
    }
  },
  {
    id: "entry-auto-009",
    title: "Hover States Should Offer Preview or Context",
    content: "Hover states shouldn't just be cosmetic. Use them to reveal tooltips, previews, or confirm interactivity. Avoid using hover-only actions for critical features on touch devices.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "interaction-desktop",
    industry_tags: ["dashboards", "tools", "data platforms"],
    element_type: "hover",
    tags: ["hover state", "desktop UX", "context"],
    complexity_level: "intermediate",
    use_cases: ["Table rows", "Tooltips", "Menus"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      preview_examples: "Show file info, action menu, or extended labels on hover",
      example_components: ["Row hover", "Tooltip trigger", "Card preview"]
    },
    metadata: {
      device_limit: "not available on mobile",
      tooltip_timing: "< 300ms"
    }
  },
  {
    id: "entry-auto-010",
    title: "Don't Overload Gestures on Mobile",
    content: "Avoid hiding core functionality behind unfamiliar gestures like long-press or multi-swipe. Mobile interfaces should prioritize visible buttons over gesture reliance for key actions.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "gesture-ux",
    industry_tags: ["mobile", "social", "productivity"],
    element_type: "gesture",
    tags: ["gesture", "discoverability", "mobile UX"],
    complexity_level: "advanced",
    use_cases: ["Messaging apps", "Dashboards", "Content actions"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      gesture_guidelines: "Keep core actions visible, use gestures for secondary/advanced tools",
      example_components: ["Swipe card", "Long-press menu", "Drag area"]
    },
    metadata: {
      discoverability_risk: "high with invisible gestures",
      gesture_category: "secondary only"
    }
  },
  {
    id: "entry-auto-011",
    title: "Group Related Items for Visual Scan Efficiency",
    content: "Users scan pages in chunks. Group related actions, filters, or menu items together using proximity, whitespace, and heading cues. Random placement increases time to comprehension.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "information-architecture",
    industry_tags: ["ecommerce", "SaaS", "enterprise"],
    element_type: "menu",
    tags: ["grouping", "chunking", "scanability"],
    complexity_level: "basic",
    use_cases: ["Nav menus", "Product filters", "Toolbar UI"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      grouping_tip: "Visually separate sections with whitespace or heading labels.",
      example_components: ["Sidebar menu", "Settings panel", "Filter block"]
    },
    metadata: {
      IA_principle: "proximity and grouping",
      scan_mode: "F-pattern or Z-pattern"
    }
  },
  {
    id: "entry-auto-012",
    title: "Label Navigation Clearly for Recognition",
    content: "Avoid vague or branded terms in nav menus. Use labels users can predict. Test with first-click studies or tree testing to validate label clarity.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "information-architecture",
    industry_tags: ["news", "ecommerce", "education"],
    element_type: "navigation",
    tags: ["labeling", "nav clarity", "tree testing"],
    complexity_level: "intermediate",
    use_cases: ["Global navigation", "Account settings", "Mobile menu"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      labeling_rules: "Favor utility over creativity in nav. E.g. 'Pricing' over 'The Deal'.",
      example_components: ["Nav bar", "Footer nav", "Account dropdown"]
    },
    metadata: {
      UX_validation: "tree testing or card sorting",
      recall_reduction: "lowers friction"
    }
  },
  {
    id: "entry-auto-013",
    title: "Use Breadcrumbs for Deep Information Structures",
    content: "Breadcrumbs help users understand where they are and how to navigate up. Use in systems with more than two levels of hierarchy, especially in content-heavy experiences.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "navigation",
    industry_tags: ["ecommerce", "B2B", "CMS"],
    element_type: "breadcrumb",
    tags: ["navigation", "location awareness", "hierarchy"],
    complexity_level: "intermediate",
    use_cases: ["Product pages", "Knowledge base", "Course modules"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      breadcrumb_usage: "Show path from root to current page; make all levels clickable.",
      example_components: ["Breadcrumb bar", "Secondary nav", "Page header"]
    },
    metadata: {
      when_to_use: "3+ page hierarchy",
      failure_case: "user disorientation"
    }
  },
  {
    id: "entry-auto-014",
    title: "Avoid Excessive Nesting in Menus",
    content: "Excessively nested menus increase cognitive load. Flatten IA where possible, especially on mobile. Keep hierarchy to 2–3 levels max for optimal usability.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "menu-structure",
    industry_tags: ["enterprise", "education", "platforms"],
    element_type: "menu",
    tags: ["navigation", "hierarchy depth", "cognitive load"],
    complexity_level: "advanced",
    use_cases: ["SaaS platforms", "CMS menus", "Settings panels"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      flattening_tip: "Use mega menus or grouped sections instead of 4+ deep nesting.",
      example_components: ["Dropdown menu", "Sidebar", "Accordion"]
    },
    metadata: {
      depth_limit: "2 levels on mobile, 3 on desktop",
      IA_risk: "user confusion"
    }
  },
  {
    id: "entry-auto-015",
    title: "Structure Dashboards with Task-Based Zones",
    content: "Dashboards should reflect user workflows. Organize content into zones: overview (top), actions (middle), and deeper detail (bottom or right). This supports scan-first behavior.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "dashboard-ia",
    industry_tags: ["analytics", "enterprise", "admin tools"],
    element_type: "layout",
    tags: ["dashboard", "IA", "task flow"],
    complexity_level: "advanced",
    use_cases: ["Admin panels", "Analytics dashboards", "CRM tools"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      zoning_guidelines: "Use top-left for most-used info, right edge for contextual tools.",
      example_components: ["KPI header", "Graph area", "Activity feed"]
    },
    metadata: {
      workflow_alignment: "task-based zoning",
      IA_strategy: "top-down priority"
    }
  },
  {
    id: "entry-auto-016",
    title: "Ensure Sufficient Color Contrast for Text",
    content: "Text must have sufficient contrast against its background to be readable by users with low vision. For normal text, WCAG requires a 4.5:1 contrast ratio minimum.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "compliance",
    secondary_category: "accessibility-color",
    industry_tags: ["all"],
    element_type: "text",
    tags: ["color contrast", "legibility", "WCAG"],
    complexity_level: "basic",
    use_cases: ["Body text", "Button labels", "Captions"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      contrast_check_tool: "Use tools like Stark or WebAIM to check ratios.",
      example_components: ["Text blocks", "Form labels", "Card titles"]
    },
    metadata: {
      wcag_level: "AA",
      contrast_requirement: "4.5:1 normal text, 3:1 large text"
    }
  },
  {
    id: "entry-auto-017",
    title: "Use ARIA Labels for Screen Reader Navigation",
    content: "Accessible Rich Internet Applications (ARIA) labels help screen readers interpret components that aren't native HTML, such as custom dropdowns or modals.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "compliance",
    secondary_category: "accessibility-aria",
    industry_tags: ["SaaS", "tools", "dashboards"],
    element_type: "form",
    tags: ["ARIA", "screen reader", "accessibility"],
    complexity_level: "advanced",
    use_cases: ["Custom UI components", "Form helpers", "Dialog modals"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      aria_usage: "Use aria-label, aria-labelledby, and role attributes where needed.",
      example_components: ["Custom dropdown", "Accordion", "Dialog"]
    },
    metadata: {
      screen_reader_support: "JAWS, NVDA",
      semantic_enhancement: "required for non-semantic HTML"
    }
  },
  {
    id: "entry-auto-018",
    title: "Support Keyboard-Only Navigation",
    content: "Users must be able to navigate and operate all site functions using only the keyboard. This means managing focus states, skip links, and logical tab order.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "compliance",
    secondary_category: "accessibility-keyboard",
    industry_tags: ["government", "legal", "education"],
    element_type: "navigation",
    tags: ["keyboard nav", "tab order", "focus state"],
    complexity_level: "intermediate",
    use_cases: ["Menus", "Forms", "Interactive UI"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      keyboard_rules: "Use tabindex, ensure skip links, highlight active focus.",
      example_components: ["Tab nav", "Search bar", "Modal"]
    },
    metadata: {
      usability_mode: "keyboard-only users",
      WCAG_guideline: "2.1.1"
    }
  },
  {
    id: "entry-auto-019",
    title: "Label All Form Inputs Clearly",
    content: "Every form input should have a visible label associated with it for accessibility and clarity. Placeholder text is not a replacement for a proper label.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "compliance",
    secondary_category: "accessibility-forms",
    industry_tags: ["finance", "health", "education"],
    element_type: "form",
    tags: ["form label", "input clarity", "accessibility"],
    complexity_level: "basic",
    use_cases: ["Signup", "Survey", "Checkout"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      label_rule: "Use <label> with for= attribute or aria-label for clarity.",
      example_components: ["Text input", "Dropdown", "Radio group"]
    },
    metadata: {
      label_vs_placeholder: "label required, placeholder optional",
      form_pattern: "explicit field labeling"
    }
  },
  {
    id: "entry-auto-020",
    title: "Avoid Auto-Playing Content Without Controls",
    content: "Auto-playing media (audio, video, carousels) must have pause/stop controls and should not disrupt keyboard focus. WCAG guidelines prohibit uncontrolled motion/audio.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "compliance",
    secondary_category: "accessibility-motion",
    industry_tags: ["media", "commerce", "education"],
    element_type: "media",
    tags: ["auto-play", "motion control", "audio accessibility"],
    complexity_level: "advanced",
    use_cases: ["Home banners", "Product tours", "Video embeds"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      media_rule: "Provide stop/pause controls and avoid stealing focus.",
      example_components: ["Video player", "Auto slider", "Hero animation"]
    },
    metadata: {
      WCAG_rule: "2.2.2 Pause, Stop, Hide",
      user_disruption: "high for screen readers"
    }
  },
  {
    id: "entry-auto-021",
    title: "Use Easing for Natural Motion",
    content: "Linear animations feel robotic. Use easing functions (ease-in, ease-out, ease-in-out) to mimic real-world acceleration and deceleration. Default to 'ease-out' for UI entrances.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "motion-principles",
    industry_tags: ["tools", "mobile", "commerce"],
    element_type: "animation",
    tags: ["easing", "motion design", "natural animation"],
    complexity_level: "intermediate",
    use_cases: ["Modal transitions", "Page load", "Element entrance"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      recommended_easing: "ease-out for entering, ease-in for exiting",
      example_components: ["Modal", "Drawer", "Toast"]
    },
    metadata: {
      animation_style: "ease-in-out",
      motion_library: "Material, Framer, Apple HIG"
    }
  },
  {
    id: "entry-auto-022",
    title: "Keep Motion Duration Between 200–500ms",
    content: "UI animations should be fast enough to feel responsive but slow enough to be seen. Recommended durations are 200–300ms for microinteractions, 300–500ms for larger UI shifts.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "motion-duration",
    industry_tags: ["all"],
    element_type: "transition",
    tags: ["animation speed", "feedback timing", "motion duration"],
    complexity_level: "basic",
    use_cases: ["Page transitions", "Hover effects", "Swipe actions"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      duration_ranges: "Use 200ms for button presses, 400ms for overlays",
      example_components: ["Button tap", "Card expand", "Modal open"]
    },
    metadata: {
      duration_range: "200–500ms",
      user_perception: "too slow = lag, too fast = missed"
    }
  },
  {
    id: "entry-auto-023",
    title: "Avoid Non-Essential Motion for Cognitive Disabilities",
    content: "Motion can distract or harm users with vestibular or cognitive disabilities. Allow reduced motion preferences and avoid gratuitous animation for aesthetic only.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "compliance",
    secondary_category: "motion-accessibility",
    industry_tags: ["education", "health", "apps"],
    element_type: "animation",
    tags: ["reduced motion", "vestibular accessibility", "animation toggles"],
    complexity_level: "advanced",
    use_cases: ["Intro animations", "Background movement", "Page transitions"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      reduced_motion_support: "Respect prefers-reduced-motion media query.",
      example_components: ["Hero banner", "Animated background", "Intro screen"]
    },
    metadata: {
      WCAG_compatibility: "prefers-reduced-motion",
      risk: "vestibular disruption"
    }
  },
  {
    id: "entry-auto-024",
    title: "Use Motion to Reinforce Spatial Metaphors",
    content: "Slide-in and fade transitions help users understand spatial relationships between UI layers (e.g., side panels, nested modals). This aids orientation and reduces disorientation.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "motion-meaning",
    industry_tags: ["SaaS", "tools", "mobile"],
    element_type: "overlay",
    tags: ["spatial design", "UI layering", "motion hierarchy"],
    complexity_level: "advanced",
    use_cases: ["Drawer menus", "Side panels", "Dialog stacks"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      motion_hierarchy: "Use directional slide for nesting; fade for overlays.",
      example_components: ["Sidebar", "Sheet", "Full-screen modal"]
    },
    metadata: {
      spatial_rule: "direction = hierarchy",
      disorientation_fix: "motion context"
    }
  },
  {
    id: "entry-auto-025",
    title: "Avoid Animating Layout Shifts Without Context",
    content: "When elements move or resize without user interaction (e.g., carousels or loaders), it can confuse users. Use fade or highlight transitions, not layout jumps, for updates.",
    source: "https://www.generated-insights.ai/rag-bank",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "motion-anti-patterns",
    industry_tags: ["commerce", "news", "apps"],
    element_type: "content",
    tags: ["layout shift", "motion anti-pattern", "UX stability"],
    complexity_level: "intermediate",
    use_cases: ["Auto sliders", "News feeds", "Live dashboards"],
    related_patterns: [],
    freshness_score: 0.96,
    application_context: {
      anti_pattern_fix: "Use position anchoring or subtle crossfade instead of jumps.",
      example_components: ["Carousel", "Live card", "Score update"]
    },
    metadata: {
      core_concern: "motion-induced confusion",
      stability_goal: "predictable content"
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
