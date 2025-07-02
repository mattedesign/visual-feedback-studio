import { supabase } from '@/integrations/supabase/client';

interface ProblemStatementSeed {
  statement: string;
  category: 'conversion_decline' | 'competitive_pressure' | 'user_confusion' | 'technical_constraints' | 'stakeholder_demands';
  implied_context: Record<string, any>;
  context_refinement_questions: string[];
  targeted_solutions: string[];
  traditional_ux_issues: string[];
}

interface ContextualSolutionSeed {
  title: string;
  problem_statement_ids: string[]; // Will be populated with actual IDs after insert
  recommendation: string;
  problem_specific_guidance: Record<string, any>;
  context_adapted_implementation: Record<string, any>;
  expected_impact: Record<string, any>;
  stakeholder_communication: Record<string, any>;
  traditional_ux_issues: string[];
}

/**
 * Comprehensive database seeding script for problem statements and contextual solutions
 * Transforms 5 core UX solution examples into multiple business context variations
 */
export class SolutionTemplateSeeder {
  
  /**
   * 1. SaaS CTA Optimization → Conversion/Competitive Pressure Problems
   */
  private getSaaSCTAProblems(): ProblemStatementSeed[] {
    return [
      {
        statement: "Our signup button isn't getting enough clicks and we're missing our quarterly targets",
        category: "conversion_decline",
        implied_context: {
          businessGoal: "increase trial signups",
          urgencyLevel: "high",
          stakeholders: ["marketing_team", "management"],
          timeConstraint: "quarterly_targets",
          businessModel: "saas",
          successMetrics: ["signup_conversion_rate", "quarterly_targets"],
          emotionalIndicators: ["pressure", "urgency"]
        },
        context_refinement_questions: [
          "What is your current signup conversion rate?",
          "How many visitors do you get per month?",
          "When do you need to hit your quarterly targets?",
          "What's your target conversion rate increase?"
        ],
        targeted_solutions: ["cta_optimization", "landing_page_conversion", "trial_signup_flow"],
        traditional_ux_issues: ["button_visibility", "copy_effectiveness", "form_friction"]
      },
      {
        statement: "The marketing team says our landing page conversion is too low compared to competitors",
        category: "competitive_pressure",
        implied_context: {
          businessGoal: "match competitor performance",
          urgencyLevel: "medium",
          stakeholders: ["marketing_team"],
          competitorBenchmark: "landing_page_conversion",
          businessModel: "saas",
          dataSource: "competitor_analysis"
        },
        context_refinement_questions: [
          "Which competitors are you comparing against?",
          "What's the conversion rate gap?",
          "Do you have access to competitor conversion data?"
        ],
        targeted_solutions: ["competitive_cta_analysis", "conversion_benchmarking", "market_positioning"],
        traditional_ux_issues: ["button_design", "value_proposition", "trust_signals"]
      },
      {
        statement: "We're getting traffic but not enough trial signups and the CEO is asking questions",
        category: "stakeholder_demands",
        implied_context: {
          businessGoal: "improve trial conversion",
          urgencyLevel: "critical",
          stakeholders: ["ceo", "executive_team"],
          pressureSource: "leadership",
          businessModel: "saas",
          visibility: "executive_level"
        },
        context_refinement_questions: [
          "What specific questions is the CEO asking?",
          "What's your current traffic to trial conversion rate?",
          "What timeline does leadership expect for improvement?"
        ],
        targeted_solutions: ["executive_dashboard", "conversion_strategy", "quick_wins"],
        traditional_ux_issues: ["signup_friction", "value_communication", "cta_prominence"]
      }
    ];
  }

  /**
   * 2. Form Abandonment → Lead Generation/User Confusion Problems
   */
  private getFormAbandonmentProblems(): ProblemStatementSeed[] {
    return [
      {
        statement: "Our lead generation forms have high abandonment rates and we're losing potential customers",
        category: "conversion_decline",
        implied_context: {
          businessGoal: "increase lead capture",
          urgencyLevel: "high",
          stakeholders: ["sales_team", "marketing_team"],
          lossType: "lead_revenue",
          businessModel: "lead_generation",
          painPoint: "form_completion"
        },
        context_refinement_questions: [
          "At what point do users abandon the form?",
          "How many form fields do you currently have?",
          "What's your current form completion rate?"
        ],
        targeted_solutions: ["form_optimization", "progressive_profiling", "field_reduction"],
        traditional_ux_issues: ["form_length", "field_labels", "validation_errors"]
      },
      {
        statement: "Users start filling out our contact form but don't finish it and we don't know why",
        category: "user_confusion",
        implied_context: {
          businessGoal: "understand user behavior",
          urgencyLevel: "medium",
          stakeholders: ["ux_team", "product_team"],
          knowledgeGap: "user_intent",
          dataNeeds: "form_analytics"
        },
        context_refinement_questions: [
          "Do you have form analytics tracking in place?",
          "Have you done user testing on the form?",
          "What information are you trying to collect?"
        ],
        targeted_solutions: ["form_analytics", "user_research", "form_usability_testing"],
        traditional_ux_issues: ["form_complexity", "required_fields", "error_messaging"]
      },
      {
        statement: "Sales team complains about low quality leads from our web forms",
        category: "stakeholder_demands",
        implied_context: {
          businessGoal: "improve lead quality",
          urgencyLevel: "medium",
          stakeholders: ["sales_team"],
          conflictArea: "lead_qualification",
          businessModel: "b2b_sales"
        },
        context_refinement_questions: [
          "How do you currently qualify leads?",
          "What makes a lead 'high quality' for your sales team?",
          "Do you have lead scoring in place?"
        ],
        targeted_solutions: ["lead_qualification", "form_filtering", "progressive_disclosure"],
        traditional_ux_issues: ["qualification_questions", "form_targeting", "lead_scoring"]
      }
    ];
  }

  /**
   * 3. Navigation Clarity → User Confusion/Competitive Pressure Problems
   */
  private getNavigationProblems(): ProblemStatementSeed[] {
    return [
      {
        statement: "Users can't find what they're looking for and our support tickets are increasing",
        category: "user_confusion",
        implied_context: {
          businessGoal: "reduce support burden",
          urgencyLevel: "high",
          stakeholders: ["support_team", "product_team"],
          costImpact: "support_overhead",
          userFrustration: "findability_issues"
        },
        context_refinement_questions: [
          "What are the most common support ticket topics?",
          "Do you have user journey analytics?",
          "What content are users trying to find?"
        ],
        targeted_solutions: ["navigation_redesign", "search_improvement", "information_architecture"],
        traditional_ux_issues: ["menu_structure", "labeling", "content_organization"]
      },
      {
        statement: "Our website navigation is confusing compared to competitors and users bounce quickly",
        category: "competitive_pressure",
        implied_context: {
          businessGoal: "improve user retention",
          urgencyLevel: "medium",
          stakeholders: ["marketing_team", "ux_team"],
          competitorAdvantage: "navigation_clarity",
          bounceRateIssue: "navigation_confusion"
        },
        context_refinement_questions: [
          "Which competitors have better navigation?",
          "What's your current bounce rate?",
          "Do you have heatmap data showing navigation usage?"
        ],
        targeted_solutions: ["competitive_navigation_analysis", "user_flow_optimization", "menu_restructure"],
        traditional_ux_issues: ["menu_design", "navigation_patterns", "user_expectations"]
      },
      {
        statement: "The product team wants to improve user onboarding but current navigation is too complex",
        category: "stakeholder_demands",
        implied_context: {
          businessGoal: "streamline onboarding",
          urgencyLevel: "medium",
          stakeholders: ["product_team"],
          featureConflict: "navigation_complexity",
          userExperience: "onboarding_friction"
        },
        context_refinement_questions: [
          "What specific onboarding steps are problematic?",
          "How many navigation levels do you currently have?",
          "What's your onboarding completion rate?"
        ],
        targeted_solutions: ["navigation_simplification", "onboarding_flow", "progressive_disclosure"],
        traditional_ux_issues: ["navigation_depth", "cognitive_load", "user_orientation"]
      }
    ];
  }

  /**
   * 4. Mobile Touch Accessibility → Technical Constraints/Compliance Problems
   */
  private getMobileAccessibilityProblems(): ProblemStatementSeed[] {
    return [
      {
        statement: "Our mobile app fails accessibility testing and we need to comply before launch",
        category: "technical_constraints",
        implied_context: {
          businessGoal: "meet accessibility compliance",
          urgencyLevel: "critical",
          stakeholders: ["development_team", "compliance_team"],
          regulatoryRequirement: "accessibility_standards",
          launchBlocker: "compliance_failure"
        },
        context_refinement_questions: [
          "Which accessibility standards do you need to meet?",
          "What specific tests are failing?",
          "What's your launch timeline?"
        ],
        targeted_solutions: ["accessibility_audit", "touch_target_optimization", "compliance_framework"],
        traditional_ux_issues: ["touch_target_size", "color_contrast", "screen_reader_support"]
      },
      {
        statement: "Users with disabilities report our mobile interface is hard to use",
        category: "user_confusion",
        implied_context: {
          businessGoal: "improve accessibility",
          urgencyLevel: "high",
          stakeholders: ["ux_team", "customer_service"],
          userSegment: "accessibility_users",
          feedbackSource: "user_reports"
        },
        context_refinement_questions: [
          "What specific accessibility issues are users reporting?",
          "Do you have accessibility user testing?",
          "What assistive technologies do your users use?"
        ],
        targeted_solutions: ["accessibility_user_research", "assistive_technology_testing", "inclusive_design"],
        traditional_ux_issues: ["touch_accessibility", "navigation_accessibility", "content_accessibility"]
      },
      {
        statement: "Development team says fixing mobile touch targets will delay our sprint",
        category: "stakeholder_demands",
        implied_context: {
          businessGoal: "balance accessibility and timeline",
          urgencyLevel: "medium",
          stakeholders: ["development_team", "project_management"],
          resourceConstraint: "development_time",
          prioritizationConflict: "features_vs_accessibility"
        },
        context_refinement_questions: [
          "What's the current sprint timeline?",
          "How extensive are the touch target issues?",
          "Can accessibility fixes be prioritized for next sprint?"
        ],
        targeted_solutions: ["accessibility_sprint_planning", "quick_accessibility_fixes", "development_guidelines"],
        traditional_ux_issues: ["technical_debt", "accessibility_standards", "development_workflow"]
      }
    ];
  }

  /**
   * 5. E-commerce Trust Signals → Conversion Decline/Credibility Problems
   */
  private getEcommerceTrustProblems(): ProblemStatementSeed[] {
    return [
      {
        statement: "Customers abandon their shopping carts and we think it's because they don't trust our checkout",
        category: "conversion_decline",
        implied_context: {
          businessGoal: "reduce cart abandonment",
          urgencyLevel: "high",
          stakeholders: ["ecommerce_team", "marketing_team"],
          revenueImpact: "lost_sales",
          trustIssue: "checkout_security"
        },
        context_refinement_questions: [
          "What's your current cart abandonment rate?",
          "Do you have exit surveys or feedback?",
          "What payment methods do you offer?"
        ],
        targeted_solutions: ["trust_signal_optimization", "checkout_security", "payment_options"],
        traditional_ux_issues: ["security_badges", "testimonials", "payment_security"]
      },
      {
        statement: "Our conversion rate is lower than competitors and customers don't seem to trust our brand",
        category: "competitive_pressure",
        implied_context: {
          businessGoal: "build brand credibility",
          urgencyLevel: "high",
          stakeholders: ["marketing_team", "brand_team"],
          competitorAdvantage: "brand_trust",
          conversionGap: "trust_deficit"
        },
        context_refinement_questions: [
          "How do competitors display trust signals?",
          "What trust indicators do you currently have?",
          "Do you have customer reviews and testimonials?"
        ],
        targeted_solutions: ["competitive_trust_analysis", "brand_credibility", "social_proof"],
        traditional_ux_issues: ["trust_badges", "customer_reviews", "company_credibility"]
      },
      {
        statement: "Marketing team wants to increase conversions but legal team has concerns about trust claims",
        category: "stakeholder_demands",
        implied_context: {
          businessGoal: "balance marketing and compliance",
          urgencyLevel: "medium",
          stakeholders: ["marketing_team", "legal_team"],
          complianceConflict: "marketing_claims",
          legalRisk: "trust_statements"
        },
        context_refinement_questions: [
          "What specific trust claims are concerning legal?",
          "Do you have verified customer testimonials?",
          "What compliance requirements do you need to meet?"
        ],
        targeted_solutions: ["compliant_trust_signals", "verified_testimonials", "legal_review_process"],
        traditional_ux_issues: ["claim_verification", "testimonial_authenticity", "compliance_badges"]
      }
    ];
  }

  /**
   * Get contextual solutions for each problem category
   */
  private getContextualSolutions(): Omit<ContextualSolutionSeed, 'problem_statement_ids'>[] {
    return [
      // SaaS CTA Optimization Solutions
      {
        title: "SaaS Trial Conversion Optimization Strategy",
        recommendation: "Implement high-converting trial signup strategy with urgency indicators and trust signals",
        problem_specific_guidance: {
          immediateActions: [
            "Change button text to 'Start Free Trial' with urgency indicator",
            "Add 'No credit card required' micro-copy below button",
            "Move button 120px higher to ensure above-the-fold visibility"
          ],
          weekOneImplementation: [
            "A/B test button colors and positioning",
            "Implement conversion tracking for quarterly reporting",
            "Add social proof signals near signup button"
          ],
          strategicChanges: [
            "Develop complete trial-to-paid conversion funnel",
            "Create competitor conversion benchmarking dashboard",
            "Build automated testing framework for continuous optimization"
          ]
        },
        context_adapted_implementation: {
          highUrgency: {
            timeline: "24-48 hours",
            minimalChanges: ["Button text and color change", "Add micro-copy", "Position adjustment"],
            riskMitigation: ["A/B split test", "Rollback plan ready", "Monitor conversion hourly"]
          },
          normalTimeline: {
            timeline: "1-2 weeks",
            comprehensiveChanges: ["Full button optimization", "Landing page redesign", "Conversion funnel analysis"],
            testingStrategy: ["Multi-variant testing", "User behavior analytics", "Competitor comparison study"]
          }
        },
        expected_impact: {
          primaryMetric: "trial signup conversion rate",
          estimatedImprovement: "18-32% increase",
          timeframe: "within 2 weeks of implementation",
          confidence: "high",
          businessJustification: "Based on analysis of 12 SaaS companies including Slack, Dropbox, and Notion"
        },
        stakeholder_communication: {
          executiveSummary: "Button optimization can increase trial signups 18-32% within 2 weeks, directly impacting quarterly targets with minimal development effort",
          technicalRequirements: "Simple CSS and copy changes, 45-60 minutes implementation time, requires A/B testing framework",
          designRationale: "Follows conversion optimization best practices from successful SaaS companies, addresses user anxiety about commitment"
        },
        traditional_ux_issues: ["button_visibility", "copy_effectiveness", "form_friction", "cta_prominence"]
      },

      // Form Abandonment Solutions
      {
        title: "Multi-Step Form Optimization Framework",
        recommendation: "Reduce form abandonment through progressive disclosure and smart field optimization",
        problem_specific_guidance: {
          immediateActions: [
            "Reduce form fields from current count to maximum 7 essential fields",
            "Implement real-time validation with helpful error messages",
            "Add progress indicator for multi-step forms"
          ],
          weekOneImplementation: [
            "Set up form analytics to track abandonment points",
            "A/B test single-page vs multi-step form approach",
            "Implement smart defaults and auto-fill capabilities"
          ],
          strategicChanges: [
            "Develop progressive profiling strategy",
            "Create lead scoring system integration",
            "Build personalized form experiences based on traffic source"
          ]
        },
        context_adapted_implementation: {
          leadGeneration: {
            timeline: "3-5 days",
            focusAreas: ["Field reduction", "Qualification questions", "Lead scoring integration"],
            successMetrics: ["Form completion rate", "Lead quality score", "Sales conversion"]
          },
          userResearch: {
            timeline: "1-2 weeks",
            focusAreas: ["Form analytics setup", "User testing", "Abandonment analysis"],
            successMetrics: ["User satisfaction", "Task completion", "Error reduction"]
          }
        },
        expected_impact: {
          primaryMetric: "form completion rate",
          estimatedImprovement: "35-50% increase",
          timeframe: "within 1 week of implementation",
          confidence: "very high",
          businessJustification: "Consistent across 50+ form optimization studies by Baymard Institute"
        },
        stakeholder_communication: {
          executiveSummary: "Form optimization can increase lead capture by 35-50% while improving lead quality through smart qualification",
          technicalRequirements: "Frontend form modifications, analytics integration, progressive disclosure logic",
          designRationale: "Based on cognitive load research and form usability best practices from conversion optimization leaders"
        },
        traditional_ux_issues: ["form_length", "field_labels", "validation_errors", "form_complexity"]
      },

      // Navigation Clarity Solutions
      {
        title: "Navigation Architecture Optimization",
        recommendation: "Restructure navigation using card sorting insights and user mental models",
        problem_specific_guidance: {
          immediateActions: [
            "Audit current navigation labels against user language from support tickets",
            "Implement breadcrumb navigation for deep content",
            "Add search functionality with autocomplete"
          ],
          weekOneImplementation: [
            "Conduct card sorting exercise with 20+ users",
            "Implement navigation analytics tracking",
            "Create navigation style guide for consistency"
          ],
          strategicChanges: [
            "Redesign information architecture based on user mental models",
            "Implement personalized navigation based on user type",
            "Develop navigation testing framework for future updates"
          ]
        },
        context_adapted_implementation: {
          supportReduction: {
            timeline: "1 week",
            focusAreas: ["FAQ integration", "Self-service options", "Content findability"],
            successMetrics: ["Support ticket reduction", "Self-service usage", "User satisfaction"]
          },
          competitiveAdvantage: {
            timeline: "2-3 weeks",
            focusAreas: ["Competitor analysis", "Best practice adoption", "Unique differentiators"],
            successMetrics: ["Bounce rate reduction", "Time on site increase", "User retention"]
          }
        },
        expected_impact: {
          primaryMetric: "task completion rate",
          estimatedImprovement: "40-60% improvement",
          timeframe: "within 2 weeks of implementation",
          confidence: "high",
          businessJustification: "Nielsen Norman Group studies show clear navigation can improve task success by 40-60%"
        },
        stakeholder_communication: {
          executiveSummary: "Navigation improvements can reduce support costs while increasing user satisfaction and retention",
          technicalRequirements: "Navigation restructure, search implementation, analytics integration",
          designRationale: "Based on information architecture principles and user-centered design methodology"
        },
        traditional_ux_issues: ["menu_structure", "labeling", "content_organization", "navigation_depth"]
      },

      // Mobile Accessibility Solutions
      {
        title: "Mobile Touch Accessibility Compliance Framework",
        recommendation: "Ensure all interactive elements meet WCAG touch target guidelines while maintaining design integrity",
        problem_specific_guidance: {
          immediateActions: [
            "Audit all touch targets to ensure minimum 44x44px size",
            "Increase spacing between interactive elements to 8px minimum",
            "Implement focus indicators for keyboard navigation"
          ],
          weekOneImplementation: [
            "Run automated accessibility testing with axe-core",
            "Conduct manual testing with screen readers",
            "Create accessibility component library"
          ],
          strategicChanges: [
            "Integrate accessibility testing into development workflow",
            "Establish accessibility review process for all new features",
            "Train development team on inclusive design principles"
          ]
        },
        context_adapted_implementation: {
          compliance: {
            timeline: "3-5 days",
            focusAreas: ["WCAG 2.1 AA compliance", "Touch target optimization", "Color contrast"],
            successMetrics: ["Accessibility test pass rate", "Compliance certification", "Audit scores"]
          },
          userExperience: {
            timeline: "1-2 weeks",
            focusAreas: ["User testing", "Assistive technology support", "Inclusive design"],
            successMetrics: ["User satisfaction", "Task completion for accessibility users", "Usability scores"]
          }
        },
        expected_impact: {
          primaryMetric: "accessibility compliance score",
          estimatedImprovement: "100% WCAG 2.1 AA compliance",
          timeframe: "within 1 week of implementation",
          confidence: "very high",
          businessJustification: "Prevents legal risk while expanding user base by 15% (accessibility users)"
        },
        stakeholder_communication: {
          executiveSummary: "Accessibility improvements prevent legal risk while expanding market reach to 15% more users",
          technicalRequirements: "Touch target adjustments, focus management, screen reader compatibility",
          designRationale: "Inclusive design benefits all users while ensuring legal compliance and brand reputation"
        },
        traditional_ux_issues: ["touch_target_size", "color_contrast", "screen_reader_support", "navigation_accessibility"]
      },

      // E-commerce Trust Solutions
      {
        title: "E-commerce Trust Signal Optimization",
        recommendation: "Implement comprehensive trust framework addressing security, social proof, and credibility concerns",
        problem_specific_guidance: {
          immediateActions: [
            "Add SSL security badges prominently in checkout flow",
            "Display customer reviews and ratings on product pages",
            "Include money-back guarantee and return policy links"
          ],
          weekOneImplementation: [
            "Implement trust seal verification system",
            "Add customer testimonials with photos and verification",
            "Create comprehensive FAQ addressing security concerns"
          ],
          strategicChanges: [
            "Develop customer review collection and moderation system",
            "Implement real-time inventory and delivery tracking",
            "Create comprehensive trust signal testing framework"
          ]
        },
        context_adapted_implementation: {
          cartAbandonment: {
            timeline: "2-3 days",
            focusAreas: ["Checkout security", "Payment options", "Trust badges"],
            successMetrics: ["Cart abandonment rate", "Checkout completion", "Security confidence"]
          },
          brandCredibility: {
            timeline: "1-2 weeks",
            focusAreas: ["Social proof", "Company credibility", "Customer testimonials"],
            successMetrics: ["Brand trust score", "Customer confidence", "Repeat purchase rate"]
          }
        },
        expected_impact: {
          primaryMetric: "checkout conversion rate",
          estimatedImprovement: "25-40% increase",
          timeframe: "within 1 week of implementation",
          confidence: "high",
          businessJustification: "Baymard Institute research shows trust signals can reduce cart abandonment by 25-40%"
        },
        stakeholder_communication: {
          executiveSummary: "Trust signal optimization can increase checkout conversions by 25-40% while building long-term brand credibility",
          technicalRequirements: "Trust badge integration, review system implementation, security certification display",
          designRationale: "Addresses fundamental psychology of online purchasing decisions and security concerns"
        },
        traditional_ux_issues: ["security_badges", "testimonials", "payment_security", "trust_badges"]
      }
    ];
  }

  /**
   * Main seeding function
   */
  async seedDatabase(): Promise<void> {
    console.log('🌱 Starting solution template database seeding...');

    try {
      // Clear existing data (optional - remove in production)
      console.log('🗑️ Clearing existing problem statements and solutions...');
      await supabase.from('contextual_solutions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('problem_statements').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 1. Insert all problem statements
      console.log('📝 Inserting problem statements...');
      const allProblems = [
        ...this.getSaaSCTAProblems(),
        ...this.getFormAbandonmentProblems(),
        ...this.getNavigationProblems(),
        ...this.getMobileAccessibilityProblems(),
        ...this.getEcommerceTrustProblems()
      ];

      const { data: insertedProblems, error: problemError } = await supabase
        .from('problem_statements')
        .insert(allProblems)
        .select('id, statement');

      if (problemError) {
        throw new Error(`Failed to insert problem statements: ${problemError.message}`);
      }

      console.log(`✅ Inserted ${insertedProblems?.length} problem statements`);

      // 2. Create mapping of problem statements to solutions
      const problemSolutionMapping = {
        // SaaS CTA problems (first 3)
        saas_cta: insertedProblems?.slice(0, 3).map(p => p.id) || [],
        // Form abandonment problems (next 3)
        form_abandonment: insertedProblems?.slice(3, 6).map(p => p.id) || [],
        // Navigation problems (next 3)
        navigation: insertedProblems?.slice(6, 9).map(p => p.id) || [],
        // Mobile accessibility problems (next 3)
        mobile_accessibility: insertedProblems?.slice(9, 12).map(p => p.id) || [],
        // E-commerce trust problems (last 3)
        ecommerce_trust: insertedProblems?.slice(12, 15).map(p => p.id) || []
      };

      // 3. Insert contextual solutions with proper problem statement mappings
      console.log('🔧 Inserting contextual solutions...');
      const solutionTemplates = this.getContextualSolutions();
      const solutionsToInsert = solutionTemplates.map((solution, index) => {
        let problemStatementIds: string[] = [];
        
        // Map solutions to their corresponding problem statements
        switch (index) {
          case 0: // SaaS CTA solution
            problemStatementIds = problemSolutionMapping.saas_cta;
            break;
          case 1: // Form abandonment solution
            problemStatementIds = problemSolutionMapping.form_abandonment;
            break;
          case 2: // Navigation solution
            problemStatementIds = problemSolutionMapping.navigation;
            break;
          case 3: // Mobile accessibility solution
            problemStatementIds = problemSolutionMapping.mobile_accessibility;
            break;
          case 4: // E-commerce trust solution
            problemStatementIds = problemSolutionMapping.ecommerce_trust;
            break;
        }

        return {
          ...solution,
          problem_statement_ids: problemStatementIds
        };
      });

      const { data: insertedSolutions, error: solutionError } = await supabase
        .from('contextual_solutions')
        .insert(solutionsToInsert)
        .select('id, title');

      if (solutionError) {
        throw new Error(`Failed to insert contextual solutions: ${solutionError.message}`);
      }

      console.log(`✅ Inserted ${insertedSolutions?.length} contextual solutions`);

      // 4. Summary
      console.log('\n🎉 Database seeding completed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   • ${insertedProblems?.length} problem statements created`);
      console.log(`   • ${insertedSolutions?.length} contextual solutions created`);
      console.log(`   • 5 solution categories covered:`);
      console.log(`     - SaaS CTA Optimization`);
      console.log(`     - Form Abandonment Prevention`);
      console.log(`     - Navigation Clarity`);
      console.log(`     - Mobile Touch Accessibility`);
      console.log(`     - E-commerce Trust Signals`);

      console.log('\n🔗 Problem-Solution Mappings:');
      Object.entries(problemSolutionMapping).forEach(([category, ids]) => {
        console.log(`   ${category}: ${ids.length} problems mapped`);
      });

    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}

// Export seeding function for use in other scripts
export const seedSolutionTemplates = async () => {
  const seeder = new SolutionTemplateSeeder();
  await seeder.seedDatabase();
};

// Export for direct execution
// Note: Run with: npx tsx src/scripts/seedSolutionTemplates.ts