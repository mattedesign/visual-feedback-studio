import { vectorKnowledgeService } from '../src/services/knowledgeBase/vectorService';
import { supabase } from '../src/integrations/supabase/client';
import { KnowledgeEntry } from '../src/types/vectorDatabase';

// Essential UX knowledge entries for the knowledge base
const CORE_UX_KNOWLEDGE: Array<Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>> = [
  {
    title: "Fitts' Law for UI Design",
    content: "Fitts' Law states that the time to acquire a target is a function of the distance to and size of the target. In UI design, this means that frequently used buttons should be large and placed close to where users expect them. Critical actions like 'Submit' or 'Buy Now' should have larger click targets and be positioned prominently. This principle is essential for touch interfaces where finger size affects accuracy.",
    source: "Paul Fitts Research & UX Design Principles",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "interaction-design",
    industry_tags: ["web-apps", "mobile-apps"],
    complexity_level: "intermediate",
    use_cases: ["button-design", "touch-interfaces", "accessibility"],
    industry: "technology",
    element_type: "interaction",
    metadata: {
      importance: "high",
      applicability: "universal",
      lastUpdated: new Date().toISOString()
    },
    tags: ["interaction-design", "usability", "ui-patterns", "target-size"]
  },
  {
    title: "E-commerce Cart Abandonment Solutions",
    content: "Cart abandonment rates average 70% across industries. Key solutions include: transparent pricing with no hidden fees, guest checkout options, multiple payment methods, progress indicators, security badges, exit-intent popups, and abandoned cart email sequences. Implement save-for-later functionality and show social proof near checkout. Mobile optimization is crucial as mobile cart abandonment rates are typically higher.",
    source: "Baymard Institute & E-commerce Research",
    category: "ecommerce-patterns",
    primary_category: "patterns",
    secondary_category: "conversion-design",
    industry_tags: ["e-commerce"],
    complexity_level: "intermediate",
    use_cases: ["cart-optimization", "conversion-improvement", "checkout-flow"],
    industry: "ecommerce",
    element_type: "checkout-flow",
    metadata: {
      conversionImpact: "high",
      implementationComplexity: "medium",
      avgAbandonmentRate: "70%"
    },
    tags: ["cart-abandonment", "checkout-optimization", "conversion", "ecommerce"]
  },
  {
    title: "WCAG Color Contrast Standards",
    content: "WCAG 2.1 requires minimum contrast ratios of 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold) to meet AA compliance. AAA level requires 7:1 for normal text and 4.5:1 for large text. Use tools like WebAIM's contrast checker to verify compliance. Consider users with color blindness and ensure information isn't conveyed through color alone.",
    source: "Web Content Accessibility Guidelines (WCAG) 2.1",
    category: "accessibility",
    primary_category: "compliance",
    secondary_category: "accessibility-standards",
    industry_tags: ["public-sector", "healthcare", "web-apps"],
    complexity_level: "basic",
    use_cases: ["color-design", "accessibility-compliance", "inclusive-design"],
    industry: "technology",
    element_type: "color-system",
    metadata: {
      complianceLevel: "WCAG 2.1 AA/AAA",
      toolsRecommended: ["WebAIM Contrast Checker", "Colour Contrast Analyser"],
      affectedUsers: "15% of population"
    },
    tags: ["accessibility", "color-contrast", "wcag", "compliance", "inclusive-design"]
  },
  {
    title: "Mobile-First Design Principles",
    content: "Mobile-first design starts with the smallest screen and progressively enhances for larger devices. Key principles: touch-friendly targets (44px minimum), thumb-friendly navigation zones, readable typography (16px+ body text), fast loading times, offline functionality consideration, and progressive disclosure of information. Design for one-handed use and consider device orientation changes.",
    source: "Luke Wroblewski & Mobile UX Research",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "mobile-design",
    industry_tags: ["mobile-apps", "web-apps"],
    complexity_level: "intermediate",
    use_cases: ["responsive-design", "mobile-optimization", "touch-interfaces"],
    industry: "technology",
    element_type: "responsive-design",
    metadata: {
      minTouchTarget: "44px",
      minFontSize: "16px",
      mobileTraffic: "60%+"
    },
    tags: ["mobile-first", "responsive-design", "touch-interface", "progressive-enhancement"]
  },
  {
    title: "Conversion Rate Optimization Benchmarks",
    content: "Average conversion rates vary by industry: E-commerce (2-3%), SaaS (3-5%), Lead generation (2-5%), B2B services (2-3%). Key optimization areas: headlines (can improve conversion by 30%+), call-to-action buttons (test color, size, text), form length (reduce fields by 50% to increase conversions), social proof, urgency/scarcity, and mobile optimization. A/B testing is essential for optimization.",
    source: "ConversionXL & Industry Benchmarks",
    category: "conversion",
    primary_category: "optimization",
    secondary_category: "conversion-optimization",
    industry_tags: ["e-commerce", "saas", "marketing"],
    complexity_level: "intermediate",
    use_cases: ["cro", "ab-testing", "performance-optimization"],
    industry: "marketing",
    element_type: "optimization-strategy",
    metadata: {
      benchmarks: {
        ecommerce: "2-3%",
        saas: "3-5%",
        leadgen: "2-5%"
      },
      headlineImpact: "30%+"
    },
    tags: ["conversion-optimization", "cro", "benchmarks", "ab-testing", "performance"]
  },
  {
    title: "Nielsen's 10 Usability Heuristics",
    content: "Jakob Nielsen's 10 principles: 1) System status visibility, 2) Match system and real world, 3) User control and freedom, 4) Consistency and standards, 5) Error prevention, 6) Recognition rather than recall, 7) Flexibility and efficiency, 8) Aesthetic and minimalist design, 9) Help users recognize/recover from errors, 10) Help and documentation. These form the foundation of usability evaluation.",
    source: "Jakob Nielsen, Nielsen Norman Group",
    category: "ux-research",
    primary_category: "research",
    secondary_category: "usability-evaluation",
    industry_tags: ["web-apps", "mobile-apps", "saas"],
    complexity_level: "basic",
    use_cases: ["usability-testing", "heuristic-evaluation", "design-principles"],
    industry: "technology",
    element_type: "evaluation-framework",
    metadata: {
      yearEstablished: "1994",
      applicability: "universal",
      evaluationMethod: "heuristic-evaluation"
    },
    tags: ["usability-heuristics", "nielsen", "ux-evaluation", "design-principles", "user-experience"]
  },
  {
    title: "Progressive Web App Best Practices",
    content: "PWAs combine web and native app benefits. Key requirements: HTTPS, Service Worker, Web App Manifest, responsive design, fast loading (3s max), offline functionality, app-like navigation, push notifications, and installability. Focus on shell architecture, cache strategies, and performance optimization. PWAs can increase engagement by 137% and conversions by 52%.",
    source: "Google PWA Guidelines & Performance Data",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "app-architecture",
    industry_tags: ["web-apps", "mobile-apps"],
    complexity_level: "advanced",
    use_cases: ["offline-functionality", "app-performance", "mobile-web"],
    industry: "technology",
    element_type: "app-architecture",
    metadata: {
      loadTimeTarget: "3s",
      engagementIncrease: "137%",
      conversionIncrease: "52%"
    },
    tags: ["pwa", "progressive-web-app", "offline-first", "performance", "mobile-experience"]
  },
  {
    title: "Typography Hierarchy Standards",
    content: "Establish clear hierarchy with 6-8 font sizes maximum. Use modular scale (1.2-1.618 ratios) for consistent sizing. H1 should be 2-3x body text size, maintain adequate line spacing (1.4-1.6), and ensure sufficient contrast. Use no more than 2-3 font families per project. Consider readability: optimal line length is 45-75 characters, and use appropriate font weights to create emphasis without relying solely on size.",
    source: "Typography Research & Design Systems",
    category: "visual",
    primary_category: "design",
    secondary_category: "typography-design",
    industry_tags: ["web-apps", "mobile-apps", "saas"],
    complexity_level: "intermediate",
    use_cases: ["design-system", "visual-hierarchy", "readability"],
    industry: "design",
    element_type: "typography-system",
    metadata: {
      modularScale: "1.2-1.618",
      lineSpacing: "1.4-1.6",
      optimalLineLength: "45-75 characters"
    },
    tags: ["typography", "hierarchy", "readability", "design-system", "visual-design"]
  },
  {
    title: "Form Design Optimization",
    content: "Optimize forms for conversion: minimize required fields, use smart defaults, implement real-time validation, group related fields, use appropriate input types, provide clear error messages, and show progress for multi-step forms. Single-column layouts convert better than multi-column. Reduce cognitive load with conditional logic and auto-complete functionality.",
    source: "Form Optimization Research & UX Studies",
    category: "conversion",
    primary_category: "patterns",
    secondary_category: "interaction-design",
    industry_tags: ["web-apps", "saas", "e-commerce"],
    complexity_level: "intermediate",
    use_cases: ["form-optimization", "conversion-improvement", "user-input"],
    industry: "technology",
    element_type: "form-design",
    metadata: {
      layoutPreference: "single-column",
      validationTiming: "real-time",
      errorHandling: "inline"
    },
    tags: ["form-optimization", "conversion", "user-input", "validation", "ux-patterns"]
  },
  {
    title: "Trust Signal Implementation",
    content: "Build user trust through: security badges (SSL certificates, payment security), social proof (testimonials, reviews, user counts), professional design, contact information visibility, clear return/refund policies, industry certifications, press mentions, and transparent pricing. Place trust signals near conversion points and checkout areas. Customer reviews can increase conversion by 270%.",
    source: "Trust & Conversion Research Studies",
    category: "conversion",
    primary_category: "patterns",
    secondary_category: "conversion-design",
    industry_tags: ["e-commerce", "saas", "fintech"],
    complexity_level: "basic",
    use_cases: ["trust-building", "conversion-optimization", "credibility"],
    industry: "ecommerce",
    element_type: "trust-elements",
    metadata: {
      reviewsImpact: "270% conversion increase",
      placementStrategy: "near conversion points",
      types: ["security", "social-proof", "authority"]
    },
    tags: ["trust-signals", "social-proof", "conversion", "credibility", "security"]
  },
  {
    title: "Information Architecture Principles",
    content: "Organize content using card sorting, tree testing, and user mental models. Follow principles: logical grouping, clear labeling, consistent navigation, breadcrumbs for deep sites, search functionality, and sitemap accessibility. Use the 7±2 rule for menu items and implement progressive disclosure. Consider user goals and create multiple paths to important content.",
    source: "Information Architecture Research & UX Methods",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "navigation-design",
    industry_tags: ["web-apps", "saas", "e-commerce"],
    complexity_level: "intermediate",
    use_cases: ["navigation-design", "content-organization", "user-research"],
    industry: "technology",
    element_type: "navigation-structure",
    metadata: {
      menuItemLimit: "7±2",
      testingMethods: ["card-sorting", "tree-testing"],
      navigationDepth: "3-4 levels max"
    },
    tags: ["information-architecture", "navigation", "content-organization", "user-mental-models"]
  },
  {
    title: "Microinteraction Design Guidelines",
    content: "Microinteractions provide feedback and guide users through tasks. Include: visual feedback for actions, loading states, hover effects, form validation, and system status updates. Keep animations under 300ms for immediate responses, 500ms for transitions. Use easing functions for natural motion. Provide option to reduce motion for accessibility. Microinteractions can increase engagement by 47%.",
    source: "Dan Saffer & Microinteraction Research",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "interaction-design",
    industry_tags: ["web-apps", "mobile-apps", "saas"],
    complexity_level: "intermediate",
    use_cases: ["user-engagement", "feedback-design", "animation"],
    industry: "technology",
    element_type: "interaction-design",
    metadata: {
      immediateResponse: "300ms",
      transitionTiming: "500ms",
      engagementIncrease: "47%"
    },
    tags: ["microinteractions", "feedback", "animation", "user-engagement", "interaction-design"]
  },
  {
    title: "Cognitive Load Reduction Strategies",
    content: "Minimize cognitive load through: chunking information, using familiar patterns, providing clear navigation, reducing choices (Hick's Law), using white space effectively, and implementing progressive disclosure. Apply Miller's Rule (7±2 items) for menu design. Use visual hierarchy to guide attention and reduce decision fatigue through smart defaults and recommendations.",
    source: "Cognitive Psychology & UX Research",
    category: "ux-research",
    primary_category: "research",
    secondary_category: "cognitive-psychology",
    industry_tags: ["web-apps", "mobile-apps", "saas"],
    complexity_level: "intermediate",
    use_cases: ["information-design", "decision-making", "cognitive-psychology"],
    industry: "psychology",
    element_type: "cognitive-principles",
    metadata: {
      millersRule: "7±2 items",
      hicksLaw: "choice-decision time correlation",
      techniques: ["chunking", "progressive-disclosure", "defaults"]
    },
    tags: ["cognitive-load", "psychology", "decision-making", "information-processing", "usability"]
  },
  {
    title: "Accessibility Testing Methods",
    content: "Comprehensive accessibility testing includes: automated tools (axe, WAVE), manual keyboard navigation, screen reader testing (NVDA, JAWS, VoiceOver), color contrast analysis, and user testing with disabled users. Test focus management, ARIA labels, semantic HTML, and alternative text. Aim for WCAG 2.1 AA compliance minimum.",
    source: "Web Accessibility Initiative & Testing Guidelines",
    category: "accessibility",
    primary_category: "compliance",
    secondary_category: "accessibility-standards",
    industry_tags: ["web-apps", "public-sector", "healthcare"],
    complexity_level: "advanced",
    use_cases: ["accessibility-testing", "compliance-validation", "inclusive-design"],
    industry: "technology",
    element_type: "testing-methodology",
    metadata: {
      tools: ["axe", "WAVE", "NVDA", "JAWS", "VoiceOver"],
      complianceTarget: "WCAG 2.1 AA",
      testingTypes: ["automated", "manual", "user-testing"]
    },
    tags: ["accessibility-testing", "wcag", "screen-readers", "inclusive-design", "compliance"]
  },
  {
    title: "User Research Methodology",
    content: "Combine qualitative and quantitative research: user interviews, surveys, usability testing, A/B testing, analytics analysis, and field studies. Use appropriate sample sizes (5 users for usability testing, 100+ for quantitative data). Document findings with personas, journey maps, and insights. Research should inform design decisions and be conducted throughout the design process.",
    source: "UX Research Best Practices & Methodologies",
    category: "ux-research",
    primary_category: "research",
    secondary_category: "user-research",
    industry_tags: ["web-apps", "mobile-apps", "saas"],
    complexity_level: "intermediate",
    use_cases: ["user-research", "usability-testing", "data-collection"],
    industry: "research",
    element_type: "research-methods",
    metadata: {
      usabilityTestingSample: "5 users",
      quantitativeSample: "100+",
      methods: ["interviews", "surveys", "testing", "analytics"]
    },
    tags: ["user-research", "methodology", "usability-testing", "data-collection", "insights"]
  },
  {
    title: "Performance Impact on User Experience",
    content: "Page load speed directly affects user experience and conversions. Target: 2-3 seconds load time, First Contentful Paint under 1.8s, Largest Contentful Paint under 2.5s, Cumulative Layout Shift under 0.1. Each second of delay reduces conversions by 7%. Optimize images, minimize JavaScript, use CDNs, and implement lazy loading. Core Web Vitals are now Google ranking factors.",
    source: "Google Performance Guidelines & Web Vitals",
    category: "ux-patterns",
    primary_category: "optimization",
    secondary_category: "performance-optimization",
    industry_tags: ["web-apps", "e-commerce", "saas"],
    complexity_level: "intermediate",
    use_cases: ["performance-optimization", "conversion-improvement", "seo"],
    industry: "technology",
    element_type: "performance-optimization",
    metadata: {
      loadTimeTarget: "2-3s",
      fcpTarget: "1.8s",
      lcpTarget: "2.5s",
      clsTarget: "0.1",
      conversionImpact: "7% per second"
    },
    tags: ["performance", "web-vitals", "load-speed", "conversion-impact", "optimization"]
  },
  {
    title: "Design System Principles",
    content: "Build scalable design systems with: consistent color palette, typography scale, spacing system, component library, interaction patterns, and documentation. Use atomic design methodology (atoms, molecules, organisms). Maintain single source of truth, version control, and governance processes. Design systems can reduce design debt by 47% and development time by 34%.",
    source: "Design Systems Research & Best Practices",
    category: "visual",
    primary_category: "design",
    secondary_category: "design-systems",
    industry_tags: ["web-apps", "mobile-apps", "saas"],
    complexity_level: "advanced",
    use_cases: ["design-system", "scalability", "component-library"],
    industry: "design",
    element_type: "design-system",
    metadata: {
      methodology: "atomic-design",
      designDebtReduction: "47%",
      developmentTimeReduction: "34%",
      components: ["atoms", "molecules", "organisms"]
    },
    tags: ["design-system", "scalability", "consistency", "component-library", "atomic-design"]
  },
  {
    title: "Error Prevention and Recovery",
    content: "Implement error prevention through: input validation, confirmation dialogs for destructive actions, auto-save functionality, and clear constraints. For error recovery: provide specific error messages, suggest solutions, maintain user input, offer undo functionality, and show system status. Use progressive enhancement to handle edge cases gracefully.",
    source: "Error Handling UX Guidelines",
    category: "ux-patterns",
    primary_category: "patterns",
    secondary_category: "feedback-design",
    industry_tags: ["web-apps", "saas", "e-commerce"],
    complexity_level: "intermediate",
    use_cases: ["error-handling", "user-experience", "resilience"],
    industry: "technology",
    element_type: "error-handling",
    metadata: {
      preventionMethods: ["validation", "confirmation", "auto-save"],
      recoveryFeatures: ["specific-messages", "solutions", "undo"],
      principles: ["progressive-enhancement", "graceful-degradation"]
    },
    tags: ["error-prevention", "error-recovery", "validation", "user-experience", "resilience"]
  },
  {
    title: "SaaS Onboarding Best Practices",
    content: "Effective SaaS onboarding includes: progressive user activation, clear value demonstration, interactive tutorials, empty state guidance, and achievement tracking. Use a combination of tooltips, guided tours, and contextual help. Focus on time-to-value and first meaningful action. Good onboarding can increase user retention by 50% and reduce churn by 30%.",
    source: "SaaS User Onboarding Research",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "onboarding-design",
    industry_tags: ["saas"],
    complexity_level: "intermediate",
    use_cases: ["user-onboarding", "retention", "saas-growth"],
    industry: "saas",
    element_type: "onboarding-flow",
    metadata: {
      retentionIncrease: "50%",
      churnReduction: "30%",
      keyMetrics: ["time-to-value", "first-meaningful-action", "activation-rate"]
    },
    tags: ["saas-onboarding", "user-activation", "retention", "guided-experience", "time-to-value"]
  },
  {
    title: "Fintech Security UX Patterns",
    content: "Balance security with usability in fintech: multi-factor authentication with user-friendly options, biometric authentication, session management, clear security communications, fraud alerts, and transparent privacy policies. Use progressive security based on risk levels. Implement security without creating friction that drives users away. Security measures should feel protective, not punitive.",
    source: "Fintech UX Security Guidelines",
    category: "fintech-patterns",
    primary_category: "patterns",
    secondary_category: "security-design",
    industry_tags: ["fintech"],
    complexity_level: "advanced",
    use_cases: ["security-ux", "fintech-compliance", "user-trust"],
    industry: "fintech",
    element_type: "security-ux",
    metadata: {
      authMethods: ["MFA", "biometric", "risk-based"],
      balancingAct: "security-vs-usability",
      userPerception: "protective-not-punitive"
    },
    tags: ["fintech-security", "authentication", "fraud-prevention", "user-trust", "regulatory-compliance"]
  },

  // NEW SAAS PATTERNS (12 entries)
  {
    title: "SaaS Trial Onboarding Flow Patterns",
    content: "Optimize SaaS trial onboarding with progressive disclosure techniques that reveal features incrementally. Use contextual tooltips triggered by user actions, implement checklist patterns to guide completion with visual progress indicators. Show value early with quick wins in first 5 minutes. Interactive tutorials with real data perform 87% better than empty demos. Include skip options and personalized paths based on user role and company size.",
    source: "Appcues SaaS Onboarding Research & UserPilot Studies",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "onboarding-design",
    industry_tags: ["saas"],
    complexity_level: "advanced",
    use_cases: ["trial-conversion", "user-activation", "product-adoption"],
    metadata: {
      conversionLift: "87%",
      timeToValue: "5 minutes",
      completionRate: "73%"
    },
    tags: ["saas-onboarding", "trial-conversion", "progressive-disclosure", "interactive-tutorials"]
  },
  {
    title: "Multi-Tenant Dashboard Navigation",
    content: "Design scalable multi-tenant navigation with workspace selectors prominently placed in top-left corner, breadcrumb navigation showing tenant > section > page hierarchy, and role-based access controls that gracefully hide unavailable features. Use consistent workspace switching patterns, visual workspace indicators in navigation, and quick workspace search for users managing multiple tenants.",
    source: "SaaS Dashboard Design Patterns & Multi-Tenancy UX Research",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "navigation-design",
    industry_tags: ["saas", "enterprise"],
    complexity_level: "advanced",
    use_cases: ["multi-tenancy", "enterprise-saas", "workspace-management"],
    metadata: {
      workspaceLimit: "50+ tenants",
      switchingTime: "2 seconds",
      roleComplexity: "hierarchical"
    },
    tags: ["multi-tenant", "navigation", "workspace-switching", "role-based-access"]
  },
  {
    title: "SaaS Pricing Page Optimization",
    content: "Optimize SaaS pricing with annual billing toggles showing 20-30% savings, feature comparison tables with up to 5 plans maximum, social proof placement near enterprise tier. Use 'Most Popular' badges on middle tier, calculator widgets for usage-based pricing, and FAQ sections addressing common objections. A/B testing shows left-aligned pricing tables perform 15% better than centered layouts.",
    source: "Price Intelligently & SaaS Pricing Research",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "conversion-design",
    industry_tags: ["saas"],
    complexity_level: "intermediate",
    use_cases: ["pricing-optimization", "saas-conversion", "plan-selection"],
    metadata: {
      annualDiscount: "20-30%",
      planLimit: "5 maximum",
      conversionLift: "15%"
    },
    tags: ["saas-pricing", "conversion-optimization", "billing-toggles", "feature-comparison"]
  },
  {
    title: "B2B SaaS Performance Standards",
    content: "B2B SaaS applications must meet 5-second load time limits for dashboard pages, implement skeleton loading patterns for data-heavy interfaces, and use progressive data loading with infinite scroll or pagination. Critical user paths should load under 3 seconds. Use lazy loading for charts/widgets, implement proper caching strategies, and provide offline indicators when connectivity is lost.",
    source: "Google SaaS Performance Guidelines & B2B UX Benchmarks",
    category: "saas-patterns",
    primary_category: "optimization",
    secondary_category: "performance-optimization",
    industry_tags: ["saas", "enterprise"],
    complexity_level: "intermediate",
    use_cases: ["performance-optimization", "dashboard-loading", "data-visualization"],
    metadata: {
      loadTimeLimit: "5 seconds",
      criticalPathTime: "3 seconds",
      skeletonPatterns: "required"
    },
    tags: ["saas-performance", "loading-patterns", "dashboard-optimization", "progressive-loading"]
  },
  {
    title: "SaaS Permission Management UX",
    content: "Design intuitive SaaS permission systems with visual role hierarchy using indentation and color coding, toggle switches for binary permissions, and inheritance indicators showing inherited vs. direct permissions. Group permissions by feature area, provide bulk operations for team management, and include permission templates for common roles. Always show permission preview before applying changes.",
    source: "Enterprise SaaS Security UX & Permission Design Patterns",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "security-design",
    industry_tags: ["saas", "enterprise"],
    complexity_level: "advanced",
    use_cases: ["permission-management", "team-administration", "security-configuration"],
    metadata: {
      inheritanceVisualization: "required",
      bulkOperations: "essential",
      previewMode: "mandatory"
    },
    tags: ["permission-management", "role-based-access", "team-administration", "security-ux"]
  },
  {
    title: "SaaS Notification Systems",
    content: "Implement layered SaaS notification urgency with immediate (red), important (amber), and informational (blue) categories. Use progressive disclosure with notification summaries and expandable details, granular user preferences by category and delivery method. Include smart notification batching, quiet hours settings, and notification history. Push notifications should have 40-character limits for mobile compatibility.",
    source: "SaaS Notification Best Practices & User Preference Research",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "communication-design",
    industry_tags: ["saas"],
    complexity_level: "intermediate",
    use_cases: ["notification-management", "user-communication", "engagement"],
    metadata: {
      urgencyLevels: "3 categories",
      mobileLimit: "40 characters",
      batchingRequired: "yes"
    },
    tags: ["notification-system", "user-preferences", "communication", "progressive-disclosure"]
  },
  {
    title: "SaaS Data Export/Import Flows",
    content: "Design comprehensive SaaS data flows supporting multiple formats (CSV, JSON, XML, Excel), progress indicators for large datasets, and drag-drop validation with clear error messaging. Include data mapping interfaces for imports, preview modes before processing, and scheduling options for regular exports. Always provide rollback options and audit trails for data changes.",
    source: "SaaS Data Management UX & Enterprise Import/Export Patterns",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "data-management",
    industry_tags: ["saas", "enterprise"],
    complexity_level: "advanced",
    use_cases: ["data-migration", "backup-restore", "integration"],
    metadata: {
      supportedFormats: ["CSV", "JSON", "XML", "Excel"],
      progressIndicators: "required",
      rollbackSupport: "mandatory"
    },
    tags: ["data-export", "data-import", "file-processing", "data-migration"]
  },
  {
    title: "SaaS Search and Filter Interfaces",
    content: "Implement dual-search architecture with global search across all data and scoped search within specific sections. Use autocomplete with recent searches, saved search functionality, and advanced filter panels with clear/reset options. Include search result highlighting, type-ahead suggestions, and search analytics. Keyboard shortcuts (Cmd/Ctrl+K) for power users increase engagement by 40%.",
    source: "SaaS Search UX Research & Enterprise Search Patterns",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "search-design",
    industry_tags: ["saas"],
    complexity_level: "intermediate",
    use_cases: ["data-discovery", "content-search", "advanced-filtering"],
    metadata: {
      searchTypes: "global + scoped",
      keyboardShortcuts: "Cmd/Ctrl+K",
      engagementLift: "40%"
    },
    tags: ["search-interface", "filtering", "autocomplete", "keyboard-shortcuts"]
  },
  {
    title: "SaaS Customer Support Integration",
    content: "Integrate contextual help systems with in-app messaging, screen sharing capabilities, and escalation paths from self-service to live support. Include help widget with search functionality, article suggestions based on current page, and seamless handoff to support agents with conversation context. Implement satisfaction scoring and feedback loops for continuous improvement.",
    source: "SaaS Customer Success & In-App Support Research",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "support-design",
    industry_tags: ["saas"],
    complexity_level: "intermediate",
    use_cases: ["customer-support", "self-service", "user-assistance"],
    metadata: {
      escalationPath: "self-service to live",
      contextHandoff: "required",
      satisfactionTracking: "essential"
    },
    tags: ["customer-support", "help-system", "contextual-assistance", "screen-sharing"]
  },
  {
    title: "SaaS Analytics Dashboard Design",
    content: "Design SaaS analytics with card-based layouts for modular arrangement, real-time data updates with WebSocket connections, and drill-down patterns enabling detailed exploration. Use consistent chart types across dashboard, implement dashboard customization with drag-drop widgets, and provide export functionality for all visualizations. Include date range selectors and comparison modes.",
    source: "SaaS Analytics UX & Dashboard Design Research",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "data-visualization",
    industry_tags: ["saas"],
    complexity_level: "intermediate",
    use_cases: ["analytics-dashboards", "data-visualization", "business-intelligence"],
    metadata: {
      layoutType: "card-based",
      realTimeUpdates: "WebSocket",
      customization: "drag-drop"
    },
    tags: ["analytics-dashboard", "data-visualization", "real-time-data", "customizable-widgets"]
  },
  {
    title: "SaaS User Role Management",
    content: "Structure SaaS role management with clear team hierarchies, permission inheritance from parent roles, and bulk operations for efficiency. Design role templates for common scenarios, visual permission matrices, and delegation capabilities. Include role activity logging, approval workflows for sensitive permissions, and temporary access grants with automatic expiration.",
    source: "Enterprise SaaS Role Management & Team Administration Research",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "user-management",
    industry_tags: ["saas", "enterprise"],
    complexity_level: "advanced",
    use_cases: ["team-management", "role-administration", "access-control"],
    metadata: {
      hierarchySupport: "required",
      bulkOperations: "essential",
      temporaryAccess: "supported"
    },
    tags: ["role-management", "team-administration", "permission-inheritance", "bulk-operations"]
  },
  {
    title: "SaaS API Documentation UX",
    content: "Create developer-friendly SaaS API docs with interactive examples, live code snippets in multiple languages, and authentication flow walkthroughs. Include API testing playground, comprehensive error code reference, and SDK download sections. Use progressive disclosure for complex endpoints, status page integration, and community discussion areas. Interactive docs increase developer adoption by 60%.",
    source: "Developer Experience Research & API Documentation Best Practices",
    category: "saas-patterns",
    primary_category: "patterns",
    secondary_category: "developer-experience",
    industry_tags: ["saas", "developer-tools"],
    complexity_level: "intermediate",
    use_cases: ["api-documentation", "developer-onboarding", "integration-support"],
    metadata: {
      interactiveExamples: "required",
      multiLanguageSupport: "essential",
      adoptionIncrease: "60%"
    },
    tags: ["api-documentation", "developer-experience", "interactive-examples", "code-snippets"]
  },

  // NEW AI PATTERNS (10 entries)
  {
    title: "AI Conversation Interface Best Practices",
    content: "Design AI conversation interfaces with streaming text display, clear message attribution between user and AI, and regeneration options for unsatisfactory responses. Include conversation branching, message editing capabilities, and conversation saving/sharing. Implement typing indicators, response time estimation, and graceful handling of long responses with progressive revelation. Include conversation export and history search functionality.",
    source: "OpenAI Interface Guidelines & Conversational AI UX Research",
    category: "ai-patterns",
    primary_category: "patterns",
    secondary_category: "conversation-design",
    industry_tags: ["ai-tools", "conversational-ai"],
    complexity_level: "intermediate",
    use_cases: ["ai-chat", "conversational-interfaces", "ai-assistance"],
    metadata: {
      streamingRequired: "yes",
      regenerationOptions: "essential",
      conversationBranching: "advanced"
    },
    tags: ["ai-conversation", "streaming-text", "message-attribution", "conversation-history"]
  },
  {
    title: "AI Model Selection UX",
    content: "Create intuitive AI model selection with comparison matrices showing performance, cost, and capability trade-offs. Include preset configurations for common use cases, model performance metrics visualization, and clear pricing information. Implement model switching with conversation continuity, A/B testing capabilities for model comparison, and usage analytics for optimization recommendations.",
    source: "AI Model Selection UX & ML Platform Design Research",
    category: "ai-patterns",
    primary_category: "patterns",
    secondary_category: "model-management",
    industry_tags: ["ai-tools", "ml-platforms"],
    complexity_level: "advanced",
    use_cases: ["model-selection", "ai-configuration", "performance-optimization"],
    metadata: {
      comparisonMatrix: "required",
      presetConfigs: "recommended",
      continuitySupport: "essential"
    },
    tags: ["ai-model-selection", "performance-comparison", "model-switching", "configuration"]
  },
  {
    title: "AI Prompt Engineering Interfaces",
    content: "Design prompt engineering tools with template libraries, version control for prompt iterations, and syntax highlighting for prompt structure. Include prompt testing playground, variable substitution interfaces, and performance analytics for prompt effectiveness. Implement collaborative prompt sharing, A/B testing for prompts, and automated prompt optimization suggestions based on success metrics.",
    source: "Prompt Engineering UX & AI Development Tool Research",
    category: "ai-patterns",
    primary_category: "patterns",
    secondary_category: "prompt-engineering",
    industry_tags: ["ai-tools", "developer-tools"],
    complexity_level: "advanced",
    use_cases: ["prompt-development", "ai-optimization", "template-management"],
    metadata: {
      templateLibrary: "required",
      versionControl: "essential",
      collaborativeSharing: "recommended"
    },
    tags: ["prompt-engineering", "template-library", "version-control", "syntax-highlighting"]
  },
  {
    title: "AI Content Review Workflows",
    content: "Implement AI content review with side-by-side comparison interfaces, annotation tools for feedback, and approval workflow management. Include diff visualization for content changes, collaborative review processes, and audit trails for compliance. Design batch review capabilities, automated quality scoring, and escalation paths for complex content decisions.",
    source: "AI Content Management & Review Workflow Research",
    category: "ai-patterns",
    primary_category: "patterns",
    secondary_category: "content-management",
    industry_tags: ["ai-tools", "content-management"],
    complexity_level: "intermediate",
    use_cases: ["content-review", "quality-assurance", "collaborative-editing"],
    metadata: {
      sideBySideComparison: "required",
      annotationTools: "essential",
      auditTrails: "compliance"
    },
    tags: ["content-review", "approval-workflow", "diff-visualization", "collaborative-review"]
  },
  {
    title: "AI Training Data Management",
    content: "Design training data interfaces with card-based layouts for data samples, quality indicators and confidence scores, and preview functionality for different data types. Include data labeling workflows, batch operations for data management, and data versioning with rollback capabilities. Implement data filtering and search, quality metrics dashboards, and automated data validation pipelines.",
    source: "ML Data Management UX & Training Data Platform Research",
    category: "ai-patterns",
    primary_category: "patterns",
    secondary_category: "data-management",
    industry_tags: ["ai-tools", "ml-platforms"],
    complexity_level: "advanced",
    use_cases: ["training-data", "data-labeling", "ml-operations"],
    metadata: {
      cardLayout: "recommended",
      qualityIndicators: "required",
      versioningSupport: "essential"
    },
    tags: ["training-data", "data-labeling", "quality-indicators", "data-versioning"]
  },
  {
    title: "AI Bias Detection UX",
    content: "Create bias detection dashboards with bias metrics visualization, warning systems for potential bias, and mitigation workflow guidance. Include demographic analysis tools, fairness metrics comparison, and bias testing scenarios. Implement automated bias monitoring, alert systems for bias threshold breaches, and remediation tracking with progress indicators.",
    source: "AI Fairness Research & Bias Detection Tool UX Studies",
    category: "ai-patterns",
    primary_category: "compliance",
    secondary_category: "ai-ethics",
    industry_tags: ["ai-tools", "ml-platforms"],
    complexity_level: "advanced",
    use_cases: ["bias-detection", "ai-ethics", "fairness-monitoring"],
    metadata: {
      biasMetrics: "comprehensive",
      warningSystem: "required",
      automatedMonitoring: "essential"
    },
    tags: ["bias-detection", "ai-fairness", "metrics-dashboard", "automated-monitoring"]
  },
  {
    title: "AI Model Performance Monitoring",
    content: "Design performance monitoring with time-series charts for model metrics, alert systems for performance degradation, and version comparison interfaces. Include model drift detection, performance benchmark comparisons, and automated retraining triggers. Implement real-time monitoring dashboards, anomaly detection visualization, and performance optimization recommendations.",
    source: "MLOps Monitoring & AI Performance Management Research",
    category: "ai-patterns",
    primary_category: "optimization",
    secondary_category: "performance-monitoring",
    industry_tags: ["ai-tools", "ml-platforms"],
    complexity_level: "advanced",
    use_cases: ["model-monitoring", "performance-optimization", "mlops"],
    metadata: {
      timeSeriesCharts: "required",
      driftDetection: "essential",
      realtimeMonitoring: "recommended"
    },
    tags: ["model-monitoring", "performance-metrics", "drift-detection", "alert-systems"]
  },
  {
    title: "AI Explainability Interfaces",
    content: "Create explainable AI interfaces with reasoning panels showing decision factors, feature importance visualization, and confidence scoring displays. Include interactive exploration of AI decisions, counterfactual explanations, and decision pathway tracing. Implement different explanation levels for technical and non-technical users, with contextual help for understanding AI outputs.",
    source: "Explainable AI Research & AI Transparency UX Studies",
    category: "ai-patterns",
    primary_category: "patterns",
    secondary_category: "ai-transparency",
    industry_tags: ["ai-tools"],
    complexity_level: "advanced",
    use_cases: ["ai-explainability", "decision-transparency", "ai-trust"],
    metadata: {
      reasoningPanels: "required",
      featureImportance: "essential",
      multiLevelExplanations: "recommended"
    },
    tags: ["ai-explainability", "reasoning-panels", "feature-importance", "confidence-scoring"]
  },
  {
    title: "AI Loading and Processing States",
    content: "Design AI processing states with progressive indicators showing completion percentage, streaming responses for real-time feedback, and cancellation options for long-running processes. Include estimated time remaining, progress stage descriptions, and graceful handling of interruptions. Implement queue status for batch processing and priority indicators for urgent requests.",
    source: "AI UX Loading States & Processing Interface Research",
    category: "ai-patterns",
    primary_category: "patterns",
    secondary_category: "feedback-design",
    industry_tags: ["ai-tools"],
    complexity_level: "intermediate",
    use_cases: ["ai-processing", "loading-states", "user-feedback"],
    metadata: {
      progressiveIndicators: "required",
      streamingSupport: "recommended",
      cancellationOptions: "essential"
    },
    tags: ["ai-loading", "progress-indicators", "streaming-responses", "cancellation"]
  },
  {
    title: "AI Error Handling and Recovery",
    content: "Implement comprehensive AI error handling with graceful degradation strategies, alternative suggestion systems, and retry mechanisms with exponential backoff. Include error categorization (temporary, permanent, user-fixable), clear error explanations, and recovery action guidance. Design fallback modes, error reporting interfaces, and learning from error patterns for system improvement.",
    source: "AI Error Handling Research & Resilient AI System Design",
    category: "ai-patterns",
    primary_category: "patterns",
    secondary_category: "error-handling",
    industry_tags: ["ai-tools"],
    complexity_level: "advanced",
    use_cases: ["error-recovery", "system-resilience", "user-guidance"],
    metadata: {
      gracefulDegradation: "required",
      alternativeSuggestions: "recommended",
      retryMechanisms: "essential"
    },
    tags: ["ai-error-handling", "graceful-degradation", "retry-mechanisms", "alternative-suggestions"]
  },

  // NEW FINTECH PATTERNS (10 entries)
  {
    title: "Financial Transaction Confirmation",
    content: "Design transaction confirmation with single-step for low-value transactions (<$100) and two-step verification for high-value transfers. Include real-time validation of account numbers, recipient verification, and clear fee disclosure. Implement transaction summaries with edit options, biometric confirmation for mobile, and immediate confirmation receipts with reference numbers.",
    source: "Fintech Transaction UX & Banking Security Research",
    category: "fintech-patterns",
    primary_category: "patterns",
    secondary_category: "transaction-design",
    industry_tags: ["fintech", "banking"],
    complexity_level: "intermediate",
    use_cases: ["transaction-processing", "payment-confirmation", "security-verification"],
    metadata: {
      lowValueThreshold: "$100",
      twoStepRequired: "high-value",
      biometricSupport: "mobile"
    },
    tags: ["transaction-confirmation", "payment-security", "biometric-auth", "fee-disclosure"]
  },
  {
    title: "KYC User Experience Optimization",
    content: "Optimize KYC processes with document-first approach using AI-powered document scanning, guided photo capture with real-time feedback, and progress indicators showing completion stages. Include smart document validation, error prevention with inline guidance, and multi-language support. Implement progressive KYC for different risk levels and seamless re-verification workflows.",
    source: "KYC UX Research & Digital Identity Verification Studies",
    category: "fintech-patterns",
    primary_category: "compliance",
    secondary_category: "identity-verification",
    industry_tags: ["fintech", "banking"],
    complexity_level: "advanced",
    use_cases: ["identity-verification", "regulatory-compliance", "user-onboarding"],
    metadata: {
      documentScanning: "AI-powered",
      progressiveKYC: "risk-based",
      multiLanguage: "supported"
    },
    tags: ["kyc-optimization", "document-scanning", "identity-verification", "compliance"]
  },
  {
    title: "Investment Portfolio Visualization",
    content: "Design investment portfolios with interactive pie charts showing asset allocation, time period selectors for performance analysis, and benchmark comparison overlays. Include performance metrics with gain/loss indicators, risk assessment visualization, and dividend tracking. Implement portfolio rebalancing suggestions, goal progress tracking, and market news integration contextual to holdings.",
    source: "Investment Platform UX & Portfolio Management Interface Research",
    category: "fintech-patterns",
    primary_category: "patterns",
    secondary_category: "data-visualization",
    industry_tags: ["fintech", "investment"],
    complexity_level: "intermediate",
    use_cases: ["portfolio-management", "investment-tracking", "performance-analysis"],
    metadata: {
      chartTypes: "pie + time-series",
      benchmarkComparison: "required",
      rebalancingSuggestions: "recommended"
    },
    tags: ["portfolio-visualization", "investment-tracking", "performance-metrics", "asset-allocation"]
  },
  {
    title: "Payment Method Management",
    content: "Create payment method interfaces with card display showing last 4 digits, default payment indicators with easy switching, and security validation for changes. Include payment method verification flows, automatic card update services, and spending limit controls. Implement payment history by method, fraud alerts, and seamless payment method addition with minimal friction.",
    source: "Payment UX Research & Card Management Interface Studies",
    category: "fintech-patterns",
    primary_category: "patterns",
    secondary_category: "payment-management",
    industry_tags: ["fintech", "e-commerce"],
    complexity_level: "intermediate",
    use_cases: ["payment-management", "card-administration", "fraud-prevention"],
    metadata: {
      cardDisplay: "last 4 digits",
      defaultIndicators: "visual",
      automaticUpdates: "supported"
    },
    tags: ["payment-methods", "card-management", "fraud-alerts", "spending-limits"]
  },
  {
    title: "Financial Goal Planning UX",
    content: "Design goal planning with visual progress bars, scenario planning tools, and milestone tracking systems. Include goal categorization (emergency fund, retirement, vacation), automatic savings allocation, and progress projection based on current savings rate. Implement goal sharing with family members, achievement celebrations, and goal adjustment workflows when circumstances change.",
    source: "Personal Finance UX & Goal Setting Research",
    category: "fintech-patterns",
    primary_category: "patterns",
    secondary_category: "financial-planning",
    industry_tags: ["fintech", "personal-finance"],
    complexity_level: "intermediate",
    use_cases: ["financial-planning", "goal-setting", "savings-automation"],
    metadata: {
      progressVisualization: "bars + projections",
      scenarioPlanning: "supported",
      familySharing: "optional"
    },
    tags: ["financial-goals", "progress-tracking", "scenario-planning", "savings-automation"]
  },
  {
    title: "Crypto Trading Interface Design",
    content: "Create crypto trading interfaces with real-time price charts, order book visualization, and market depth displays. Include trading pair selection, order type configuration (market, limit, stop), and portfolio balance integration. Implement price alerts, trading history analysis, and risk management tools. Design for both desktop and mobile with gesture-based chart navigation.",
    source: "Cryptocurrency Exchange UX & Trading Interface Research",
    category: "fintech-patterns",
    primary_category: "patterns",
    secondary_category: "trading-interface",
    industry_tags: ["fintech", "cryptocurrency"],
    complexity_level: "advanced",
    use_cases: ["crypto-trading", "market-analysis", "portfolio-management"],
    metadata: {
      realTimeCharts: "required",
      orderTypes: "market + limit + stop",
      mobileGestures: "supported"
    },
    tags: ["crypto-trading", "real-time-charts", "order-book", "market-depth"]
  },
  {
    title: "Banking Security Authentication",
    content: "Implement banking authentication with biometric-first approach (fingerprint, face, voice), step-up authentication for sensitive operations, and contextual security timeouts based on risk assessment. Include device registration, location-based security, and fraud detection integration. Design authentication fallbacks, security settings management, and clear security status indicators.",
    source: "Banking Security UX & Authentication Research",
    category: "fintech-patterns",
    primary_category: "patterns",
    secondary_category: "security-design",
    industry_tags: ["fintech", "banking"],
    complexity_level: "advanced",
    use_cases: ["banking-security", "authentication", "fraud-prevention"],
    metadata: {
      biometricFirst: "preferred",
      stepUpAuth: "risk-based",
      contextualTimeouts: "adaptive"
    },
    tags: ["banking-authentication", "biometric-security", "step-up-auth", "fraud-detection"]
  },
  {
    title: "Financial Compliance Reporting",
    content: "Design compliance reporting with automated report generation, audit trail maintenance, and regulatory requirement mapping. Include customizable report templates, data validation workflows, and submission tracking. Implement compliance calendar integration, regulatory update notifications, and cross-jurisdictional reporting support for multi-region operations.",
    source: "Financial Compliance UX & Regulatory Reporting Research",
    category: "fintech-patterns",
    primary_category: "compliance",
    secondary_category: "regulatory-reporting",
    industry_tags: ["fintech", "banking"],
    complexity_level: "advanced",
    use_cases: ["compliance-reporting", "regulatory-compliance", "audit-management"],
    metadata: {
      automatedGeneration: "required",
      auditTrails: "mandatory",
      multiJurisdiction: "supported"
    },
    tags: ["compliance-reporting", "audit-trails", "regulatory-requirements", "automated-reporting"]
  },
  {
    title: "Insurance Claims Processing UX",
    content: "Streamline insurance claims with guided photo capture for damage assessment, automatic claim categorization, and progress tracking throughout the process. Include document upload with OCR processing, adjuster communication tools, and settlement negotiation interfaces. Implement claim history access, fraud detection indicators, and customer support integration for complex claims.",
    source: "Insurance UX Research & Claims Processing Optimization",
    category: "fintech-patterns",
    primary_category: "patterns",
    secondary_category: "claims-processing",
    industry_tags: ["insurance", "fintech"],
    complexity_level: "intermediate",
    use_cases: ["insurance-claims", "damage-assessment", "settlement-processing"],
    metadata: {
      photoCapture: "guided",
      ocrProcessing: "automated",
      fraudDetection: "integrated"
    },
    tags: ["insurance-claims", "damage-assessment", "progress-tracking", "document-processing"]
  },
  {
    title: "Personal Finance Budgeting Tools",
    content: "Create budgeting interfaces with category-based spending management, spending alert systems, and goal visualization dashboards. Include automatic transaction categorization, budget vs. actual comparison, and spending trend analysis. Implement budget adjustment workflows, family budget sharing, and integration with bank accounts for real-time balance updates.",
    source: "Personal Finance App UX & Budgeting Interface Research",
    category: "fintech-patterns",
    primary_category: "patterns",
    secondary_category: "budgeting-tools",
    industry_tags: ["fintech", "personal-finance"],
    complexity_level: "intermediate",
    use_cases: ["budgeting", "expense-tracking", "financial-planning"],
    metadata: {
      categorization: "automatic",
      spendingAlerts: "customizable",
      familySharing: "supported"
    },
    tags: ["budgeting-tools", "expense-tracking", "spending-alerts", "category-management"]
  },

  // NEW TRANSPORTATION PATTERNS (8 entries)
  {
    title: "Real-time Vehicle Tracking UI",
    content: "Design vehicle tracking with live map interfaces showing accurate location indicators, ETA calculations with traffic consideration, and route optimization displays. Include driver status indicators, delivery progress tracking, and customer notification systems. Implement geofencing alerts, location sharing with customers, and historical route analysis for performance optimization.",
    source: "Transportation Tracking UX & Fleet Management Research",
    category: "transportation-patterns",
    primary_category: "patterns",
    secondary_category: "tracking-interfaces",
    industry_tags: ["transportation", "logistics"],
    complexity_level: "intermediate",
    use_cases: ["vehicle-tracking", "delivery-management", "fleet-operations"],
    metadata: {
      realTimeUpdates: "30 second intervals",
      etaAccuracy: "traffic-adjusted",
      geofencingSupport: "included"
    },
    tags: ["vehicle-tracking", "real-time-mapping", "eta-calculation", "route-optimization"]
  },
  {
    title: "Transportation Booking Flows",
    content: "Optimize booking flows with intuitive route selection, flexible scheduling options, and seamless payment integration. Include fare estimation, vehicle type selection, and booking confirmation workflows. Implement recurring booking templates, group booking capabilities, and integration with calendar systems. Design for both immediate and scheduled bookings with clear pricing transparency.",
    source: "Transportation Booking UX & Ride-sharing Interface Research",
    category: "transportation-patterns",
    primary_category: "patterns",
    secondary_category: "booking-interfaces",
    industry_tags: ["transportation", "ride-sharing"],
    complexity_level: "intermediate",
    use_cases: ["ride-booking", "transportation-scheduling", "fare-calculation"],
    metadata: {
      fareEstimation: "upfront",
      recurringBookings: "supported",
      groupBookings: "available"
    },
    tags: ["transportation-booking", "route-selection", "fare-estimation", "scheduling"]
  },
  {
    title: "Safety and Emergency Features",
    content: "Implement comprehensive safety features with prominent emergency buttons, driver verification systems, and trip sharing capabilities. Include real-time location sharing with trusted contacts, emergency contact integration, and automatic incident detection. Design safety check-ins, panic button functionality, and integration with emergency services for rapid response.",
    source: "Transportation Safety UX & Emergency Response Research",
    category: "transportation-patterns",
    primary_category: "patterns",
    secondary_category: "safety-design",
    industry_tags: ["transportation", "ride-sharing"],
    complexity_level: "advanced",
    use_cases: ["passenger-safety", "emergency-response", "driver-verification"],
    metadata: {
      emergencyButton: "prominent placement",
      driverVerification: "photo + rating",
      incidentDetection: "automated"
    },
    tags: ["transportation-safety", "emergency-features", "driver-verification", "trip-sharing"]
  },
  {
    title: "Mobile-First Transportation UX",
    content: "Design transportation apps for one-handed operation with large touch targets, swipe gesture support, and thumb-friendly navigation zones. Include offline capability for core functions, voice command integration, and adaptive interface based on usage context (walking, driving, waiting). Implement quick booking shortcuts and location-based intelligent suggestions.",
    source: "Mobile Transportation UX & One-Handed Interface Research",
    category: "transportation-patterns",
    primary_category: "patterns",
    secondary_category: "mobile-design",
    industry_tags: ["transportation", "mobile-apps"],
    complexity_level: "intermediate",
    use_cases: ["mobile-transportation", "one-handed-use", "gesture-navigation"],
    metadata: {
      oneHandedOperation: "optimized",
      offlineCapability: "core functions",
      voiceCommands: "supported"
    },
    tags: ["mobile-transportation", "one-handed-design", "gesture-support", "offline-capability"]
  },
  {
    title: "Fleet Management Dashboards",
    content: "Create fleet dashboards with vehicle status monitoring, route optimization tools, and maintenance alert systems. Include driver performance metrics, fuel efficiency tracking, and cost analysis reports. Implement real-time fleet overview, dispatch management tools, and predictive maintenance scheduling based on vehicle usage patterns and manufacturer recommendations.",
    source: "Fleet Management UX & Transportation Operations Research",
    category: "transportation-patterns",
    primary_category: "patterns",
    secondary_category: "management-dashboards",
    industry_tags: ["transportation", "logistics"],
    complexity_level: "advanced",
    use_cases: ["fleet-management", "vehicle-monitoring", "dispatch-operations"],
    metadata: {
      realTimeMonitoring: "full fleet",
      predictiveMaintenance: "usage-based",
      routeOptimization: "ai-powered"
    },
    tags: ["fleet-management", "vehicle-monitoring", "route-optimization", "maintenance-alerts"]
  },
  {
    title: "Public Transit Integration",
    content: "Design multi-modal transportation with seamless transit connections, real-time schedule updates, and accessibility feature indicators. Include trip planning across different transport modes, payment integration for multiple systems, and service disruption notifications. Implement crowdsourcing for real-time conditions, wheelchair accessibility routing, and offline schedule access.",
    source: "Public Transit UX & Multi-Modal Transportation Research",
    category: "transportation-patterns",
    primary_category: "patterns",
    secondary_category: "public-transit",
    industry_tags: ["transportation", "public-transit"],
    complexity_level: "advanced",
    use_cases: ["multi-modal-planning", "transit-integration", "accessibility-routing"],
    metadata: {
      multiModalPlanning: "seamless",
      accessibilityRouting: "wheelchair + visual",
      crowdsourcing: "real-time conditions"
    },
    tags: ["public-transit", "multi-modal", "accessibility-routing", "real-time-updates"]
  },
  {
    title: "Transportation Accessibility Design",
    content: "Implement comprehensive accessibility with screen reader optimization, high contrast mode support, and motor impairment considerations. Include voice navigation options, large text support, and simplified interaction patterns. Design wheelchair-accessible route planning, hearing impairment accommodations with visual notifications, and cognitive accessibility features with clear, simple language.",
    source: "Transportation Accessibility Research & Inclusive Design Studies",
    category: "transportation-patterns",
    primary_category: "compliance",
    secondary_category: "accessibility-standards",
    industry_tags: ["transportation", "accessibility"],
    complexity_level: "advanced",
    use_cases: ["accessibility-compliance", "inclusive-transportation", "disability-accommodation"],
    metadata: {
      screenReaderOptimized: "full support",
      wheelchairRouting: "available",
      cognitiveAccessibility: "simplified language"
    },
    tags: ["transportation-accessibility", "screen-reader", "wheelchair-routing", "inclusive-design"]
  },
  {
    title: "Ride-sharing Social Features",
    content: "Design social ride-sharing with passenger verification systems, in-app communication tools, and mutual rating systems. Include ride-sharing etiquette guidance, group ride coordination, and social proof indicators. Implement privacy controls for profile sharing, community features for regular commuters, and integration with social networks for trusted connections verification.",
    source: "Ride-sharing Social UX & Community Transportation Research",
    category: "transportation-patterns",
    primary_category: "patterns",
    secondary_category: "social-features",
    industry_tags: ["transportation", "ride-sharing"],
    complexity_level: "intermediate",
    use_cases: ["ride-sharing", "passenger-verification", "community-transport"],
    metadata: {
      passengerVerification: "social + rating",
      privacyControls: "granular",
      communityFeatures: "commuter-focused"
    },
    tags: ["ride-sharing", "passenger-verification", "social-proof", "community-features"]
  }
];

interface PopulationResult {
  totalEntries: number;
  successfullyAdded: number;
  failed: number;
  errors: string[];
}

async function populateInitialKnowledge(): Promise<PopulationResult> {
  console.log('🚀 Starting expanded knowledge base population...');
  console.log(`📚 Preparing to add ${CORE_UX_KNOWLEDGE.length} knowledge entries (targeting 150+ total)`);
  
  const result: PopulationResult = {
    totalEntries: CORE_UX_KNOWLEDGE.length,
    successfullyAdded: 0,
    failed: 0,
    errors: []
  };

  // Test database connection
  try {
    console.log('🔗 Testing database connection...');
    const { data, error } = await supabase.from('knowledge_entries').select('count').limit(1);
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      throw new Error(`Database connection failed: ${error.message}`);
    }
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw new Error('Database connection failed');
  }

  console.log('📝 Adding knowledge entries with industry-specific categorization...\n');

  // Process each knowledge entry
  for (let i = 0; i < CORE_UX_KNOWLEDGE.length; i++) {
    const entry = CORE_UX_KNOWLEDGE[i];
    const entryNumber = i + 1;
    
    try {
      console.log(`[${entryNumber}/${CORE_UX_KNOWLEDGE.length}] Adding: "${entry.title}"`);
      console.log(`   Primary: ${entry.primary_category} | Secondary: ${entry.secondary_category}`);
      console.log(`   Industries: ${entry.industry_tags?.join(', ') || 'general'} | Complexity: ${entry.complexity_level}`);
      console.log(`   Use Cases: ${entry.use_cases?.join(', ') || 'general'}`);
      
      // Add the knowledge entry to the vector database
      const addedEntry = await vectorKnowledgeService.addKnowledgeEntry(entry);
      
      result.successfullyAdded++;
      console.log(`   ✅ Successfully added (ID: ${addedEntry.id})`);
      
      // Add a small delay to avoid overwhelming the API
      if (i < CORE_UX_KNOWLEDGE.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Entry "${entry.title}": ${errorMessage}`);
      
      console.log(`   ❌ Failed to add: ${errorMessage}`);
    }
    
    console.log(''); // Add blank line for readability
  }

  return result;
}

export { populateInitialKnowledge, CORE_UX_KNOWLEDGE };
