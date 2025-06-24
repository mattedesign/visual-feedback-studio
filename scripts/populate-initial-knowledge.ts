
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
    industry: "fintech",
    element_type: "security-ux",
    metadata: {
      authMethods: ["MFA", "biometric", "risk-based"],
      balancingAct: "security-vs-usability",
      userPerception: "protective-not-punitive"
    },
    tags: ["fintech-security", "authentication", "fraud-prevention", "user-trust", "regulatory-compliance"]
  }
];

interface PopulationResult {
  totalEntries: number;
  successfullyAdded: number;
  failed: number;
  errors: string[];
}

async function populateInitialKnowledge(): Promise<PopulationResult> {
  console.log('🚀 Starting knowledge base population...');
  console.log(`📚 Preparing to add ${CORE_UX_KNOWLEDGE.length} knowledge entries`);
  
  const result: PopulationResult = {
    totalEntries: CORE_UX_KNOWLEDGE.length,
    successfullyAdded: 0,
    failed: 0,
    errors: []
  };

  // Ensure we have an OpenAI API key from environment
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    console.log('Please set your OpenAI API key: export OPENAI_API_KEY=your_key_here');
    process.exit(1);
  }

  // Initialize the vector service with OpenAI key
  console.log('🔑 Configuring OpenAI API key...');
  vectorKnowledgeService.setOpenAIKey(openaiKey);

  // Test database connection
  try {
    console.log('🔗 Testing database connection...');
    const { data, error } = await supabase.from('knowledge_entries').select('count').limit(1);
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }

  console.log('📝 Adding knowledge entries...\n');

  // Process each knowledge entry
  for (let i = 0; i < CORE_UX_KNOWLEDGE.length; i++) {
    const entry = CORE_UX_KNOWLEDGE[i];
    const entryNumber = i + 1;
    
    try {
      console.log(`[${entryNumber}/${CORE_UX_KNOWLEDGE.length}] Adding: "${entry.title}"`);
      console.log(`   Category: ${entry.category} | Industry: ${entry.industry || 'general'}`);
      
      // Add the knowledge entry to the vector database
      const addedEntry = await vectorKnowledgeService.addKnowledgeEntry(entry);
      
      result.successfullyAdded++;
      console.log(`   ✅ Successfully added (ID: ${addedEntry.id})`);
      
      // Add a small delay to avoid overwhelming the API
      if (i < CORE_UX_KNOWLEDGE.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
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

// Main execution function
async function main() {
  try {
    const startTime = Date.now();
    console.log('🎯 UX Knowledge Base Population Script');
    console.log('=====================================\n');
    
    const result = await populateInitialKnowledge();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('📊 POPULATION SUMMARY');
    console.log('=====================');
    console.log(`📚 Total entries processed: ${result.totalEntries}`);
    console.log(`✅ Successfully added: ${result.successfullyAdded}`);
    console.log(`❌ Failed: ${result.failed}`);
    console.log(`⏱️  Total time: ${duration} seconds`);
    
    if (result.errors.length > 0) {
      console.log('\n🚨 ERRORS ENCOUNTERED:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (result.successfullyAdded > 0) {
      console.log('\n🎉 Knowledge base population completed!');
      console.log('You can now test the vector search functionality in your app.');
    } else {
      console.log('\n⚠️  No entries were added successfully. Please check the errors above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  }
}

// Execute the script
if (require.main === module) {
  main();
}

export { populateInitialKnowledge, CORE_UX_KNOWLEDGE };
