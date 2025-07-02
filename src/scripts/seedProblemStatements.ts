import { supabase } from '../integrations/supabase/client';

interface ProblemStatement {
  statement: string;
  category: string;
  implied_context: any;
  context_refinement_questions: string[];
  targeted_solutions: string[];
}

interface ContextualSolution {
  title: string;
  problem_statement_category: string; // Used to match with problem statements
  recommendation: string;
  problem_specific_guidance: any;
  context_adapted_implementation: any;
  expected_impact: any;
  stakeholder_communication: any;
}

export async function seedProblemStatements() {
  console.log('Starting to seed problem statements and solutions...');

  try {
    // First, insert problem statements
    const problemStatements: ProblemStatement[] = [
      {
        statement: "Our free trial signups dropped 40% after we added credit card requirements and I need to recover conversions before next quarter's board meeting",
        category: 'conversion_decline',
        implied_context: {
          businessGoal: "recover trial signup conversion rate",
          urgencyLevel: "high",
          stakeholders: ["board", "growth_team"],
          businessModel: "saas",
          timeConstraint: "next quarter"
        },
        context_refinement_questions: [
          'What was your trial signup conversion rate before adding credit card requirements?',
          'What percentage of trial users typically convert to paid plans?',
          'Are you open to alternative lead qualification methods besides credit cards?'
        ],
        targeted_solutions: ['no_cc_trial_with_progressive_qualification']
      },
      {
        statement: "Our biggest competitor just launched a feature that's getting amazing user feedback and our customers are asking when we'll have something similar",
        category: 'competitive_pressure',
        implied_context: {
          businessGoal: "maintain competitive position",
          urgencyLevel: "medium",
          stakeholders: ["product_team", "customers"],
          businessModel: "general",
          competitorThreat: "feature_gap"
        },
        context_refinement_questions: [
          'What specific feature did your competitor launch?',
          'How many customers have asked about this feature?',
          'What is your current product roadmap timeline?'
        ],
        targeted_solutions: ['competitive_feature_response_strategy']
      },
      {
        statement: "Users keep getting confused in our checkout flow and we're losing sales, but I'm not sure which part is causing the problem",
        category: 'user_confusion',
        implied_context: {
          businessGoal: "reduce checkout abandonment",
          urgencyLevel: "high",
          problemArea: "checkout_flow",
          businessImpact: "revenue_loss",
          diagnosticNeeded: true
        },
        context_refinement_questions: [
          'What is your current checkout abandonment rate?',
          'At which step do most users drop off?',
          'Have you conducted any user testing on the checkout flow?'
        ],
        targeted_solutions: ['checkout_flow_optimization']
      },
      {
        statement: "My development team says implementing the design will take 3 months but we need to launch by Black Friday",
        category: 'technical_constraints',
        implied_context: {
          businessGoal: "meet launch deadline",
          urgencyLevel: "critical",
          constraint: "development_timeline",
          deadline: "black_friday",
          stakeholders: ["development_team", "management"]
        },
        context_refinement_questions: [
          'What are the most complex parts of the design to implement?',
          'Are there any features that could be simplified or phased?',
          'What is the minimum viable version that could launch on time?'
        ],
        targeted_solutions: ['phased_launch_strategy']
      },
      {
        statement: "The CEO wants a complete homepage redesign but we only have budget for small improvements this quarter",
        category: 'stakeholder_demands',
        implied_context: {
          businessGoal: "satisfy_stakeholder_requirements",
          urgencyLevel: "medium",
          constraint: "budget_limited",
          scope: "homepage_redesign",
          timeframe: "this_quarter"
        },
        context_refinement_questions: [
          'What specific outcomes is the CEO hoping to achieve?',
          'What is the exact budget available for homepage changes?',
          'Are there high-impact changes that could deliver 80% of the desired results?'
        ],
        targeted_solutions: ['budget_conscious_homepage_optimization']
      }
    ];

    // Insert problem statements
    const { data: insertedProblems, error: problemError } = await supabase
      .from('problem_statements')
      .insert(problemStatements)
      .select('id, category');

    if (problemError) {
      throw new Error(`Error inserting problem statements: ${problemError.message}`);
    }

    console.log(`Inserted ${insertedProblems?.length} problem statements`);

    // Now insert contextual solutions
    const contextualSolutions: ContextualSolution[] = [
      {
        title: "No Credit Card Trial with Progressive Qualification",
        problem_statement_category: 'conversion_decline',
        recommendation: "Remove credit card requirement from trial signup while implementing progressive qualification methods to maintain lead quality and reduce friction.",
        problem_specific_guidance: {
          implementationPhases: [
            "Remove credit card requirement from signup form",
            "Add progressive profiling during trial (company size, use case, timeline)",
            "Implement engagement-based qualification scoring",
            "Create targeted nurture sequences based on qualification data"
          ],
          quickWins: [
            "A/B test removing credit card requirement immediately",
            "Add optional company information field",
            "Implement email verification with engagement tracking"
          ],
          riskMitigation: [
            "Monitor trial-to-paid conversion rates closely",
            "Set up fraud detection for free trials",
            "Implement usage-based qualification metrics"
          ]
        },
        context_adapted_implementation: {
          saasSpecific: {
            usageTracking: "Track feature adoption during trial period",
            scoringModel: "Combine company size + feature usage + email engagement",
            conversionTriggers: "Automated upgrade prompts based on usage patterns"
          },
          timelineConstraints: {
            quarterGoal: "Show board improved signup conversion within 30 days",
            implementationSpeed: "Phase 1 (remove CC) can be done within 1 week",
            dataCollection: "Need 2-4 weeks of data to show trend improvement"
          }
        },
        expected_impact: {
          conversionMetrics: {
            trialSignups: "Expected 60-80% increase in trial signups",
            qualifiedLeads: "Maintain 70%+ of previous lead quality through progressive profiling",
            timeToValue: "Reduce signup friction from 3 minutes to 30 seconds"
          },
          businessOutcomes: {
            revenueImpact: "Potential 25-40% increase in qualified pipeline",
            boardPresentation: "Clear upward trend in trial conversion for board meeting",
            competitiveAdvantage: "Easier trial experience vs. competitors requiring CC"
          }
        },
        stakeholder_communication: {
          boardUpdate: "We've removed signup friction while maintaining lead quality through smart progressive profiling, resulting in X% increase in trial signups with Y% qualification rate.",
          developmentTeam: "Priority: Remove CC requirement from signup form, add progressive profiling fields, implement engagement scoring backend.",
          marketingTeam: "Update all trial signup messaging to emphasize 'No credit card required' and create nurture sequences for new trial qualification data."
        }
      },
      {
        title: "Competitive Feature Response Strategy",
        problem_statement_category: 'competitive_pressure',
        recommendation: "Develop rapid competitive response plan that leverages your unique strengths while addressing customer feature requests through strategic product positioning.",
        problem_specific_guidance: {
          assessmentFramework: [
            "Analyze competitor feature's core value proposition",
            "Identify your product's unique differentiation opportunities",
            "Map customer request urgency and business impact",
            "Evaluate build vs. buy vs. strategic partnership options"
          ],
          responseOptions: [
            "Direct feature replication with improved implementation",
            "Alternative solution that achieves same user outcome",
            "Strategic positioning to highlight your existing advantages",
            "Feature bundling that creates superior overall value"
          ]
        },
        context_adapted_implementation: {
          productStrategy: {
            rapidPrototyping: "Create MVP version of core functionality within 2-4 weeks",
            differentiationFocus: "Identify 2-3 ways to make your version uniquely better",
            customerCommunication: "Proactive outreach to customers who requested the feature"
          },
          marketingPosition: {
            competitiveMessaging: "Position your upcoming feature as 'next generation' solution",
            customerRetention: "Highlight existing features competitor lacks",
            thoughtLeadership: "Share insights on industry trends driving this feature need"
          }
        },
        expected_impact: {
          competitivePosition: {
            marketShare: "Prevent 10-15% customer churn to competitor",
            featureParity: "Achieve feature parity within 6-8 weeks",
            differentiation: "Establish 2-3 unique advantages over competitor version"
          },
          customerSatisfaction: {
            requestFulfillment: "Address 80%+ of customer feature requests",
            retentionRate: "Maintain current customer retention levels",
            newAcquisitions: "Use enhanced feature set for competitive wins"
          }
        },
        stakeholder_communication: {
          customerCommunication: "We're excited to share that [feature] is coming soon with enhanced capabilities that go beyond what you've seen elsewhere. Here's our timeline...",
          productTeam: "Prioritize competitive analysis and rapid prototyping. Goal: functional MVP within 4 weeks, full feature within 8 weeks.",
          salesTeam: "New competitive battlecard attached. Emphasize our upcoming enhanced version and existing unique capabilities competitor lacks."
        }
      },
      {
        title: "Checkout Flow Optimization",
        problem_statement_category: 'user_confusion',
        recommendation: "Implement systematic checkout flow analysis and optimization using user behavior data, testing, and progressive improvements to reduce abandonment.",
        problem_specific_guidance: {
          diagnosticApproach: [
            "Set up heatmap and session recording tools for checkout pages",
            "Implement funnel analytics to identify exact drop-off points",
            "Conduct moderated user testing sessions with target customers",
            "Survey users who abandoned checkout about specific pain points"
          ],
          optimizationPriorities: [
            "Simplify required fields and eliminate unnecessary form elements",
            "Add progress indicators and clear next steps",
            "Implement guest checkout option",
            "Optimize mobile checkout experience",
            "Add trust signals and security badges"
          ]
        },
        context_adapted_implementation: {
          testingStrategy: {
            quickDiagnostics: "Install Hotjar/FullStory within 48 hours",
            userTesting: "Recruit 5-8 users for moderated checkout sessions",
            dataCollection: "Need 1-2 weeks of data before implementing changes"
          },
          implementationPhases: {
            phase1: "Fix obvious friction points (too many fields, unclear messaging)",
            phase2: "A/B test guest checkout and simplified flows",
            phase3: "Optimize mobile experience and add trust elements"
          }
        },
        expected_impact: {
          conversionMetrics: {
            checkoutCompletion: "Increase checkout completion rate by 15-25%",
            mobileConversion: "Improve mobile checkout conversion by 20-30%",
            timeToComplete: "Reduce average checkout time by 30-40%"
          },
          revenueImpact: {
            immediateGains: "Recover 10-20% of currently lost checkout revenue",
            customerExperience: "Improved satisfaction scores and reduced support tickets",
            competitiveAdvantage: "Smoother checkout than industry average"
          }
        },
        stakeholder_communication: {
          managementUpdate: "We've identified the checkout friction points and have a 3-phase optimization plan that should recover 15-25% of lost checkout revenue.",
          developmentTeam: "Priority: Implement analytics tracking, simplify checkout form fields, add guest checkout option. Full technical requirements attached.",
          customerService: "Expect reduced checkout-related support tickets as we optimize the flow. Please track and report any new issues customers mention."
        }
      },
      {
        title: "Phased Launch Strategy",
        problem_statement_category: 'technical_constraints',
        recommendation: "Create phased launch approach that delivers core value by deadline while planning enhanced features for post-launch releases.",
        problem_specific_guidance: {
          scopeReduction: [
            "Identify the 20% of features that deliver 80% of user value",
            "Separate 'nice-to-have' features from core functionality",
            "Plan which features can be simplified without losing core benefit",
            "Determine what can be handled through configuration vs. custom development"
          ],
          launchStrategy: [
            "MVP launch with core features by Black Friday",
            "Phase 2 enhancements within 4-6 weeks post-launch",
            "Phase 3 advanced features in Q1 following year",
            "Continuous optimization based on user feedback"
          ]
        },
        context_adapted_implementation: {
          timelineManagement: {
            blackFridayMVP: "Focus on checkout optimization and key product pages",
            criticalPath: "Identify dependencies and blockers for core features",
            qualityAssurance: "Reserve 2 weeks for testing and bug fixes"
          },
          developmentApproach: {
            agileMethodology: "2-week sprints with weekly stakeholder reviews",
            riskMitigation: "Identify backup plans for high-risk features",
            resourceAllocation: "All developers focused on MVP features only"
          }
        },
        expected_impact: {
          businessOutcomes: {
            blackFridayReadiness: "Core functionality ready for peak shopping season",
            revenueProtection: "Avoid missing critical sales period",
            marketingSupport: "Functional product ready for holiday campaigns"
          },
          developmentEfficiency: {
            scopeReduction: "Reduce development complexity by 60-70%",
            teamFocus: "Clear priorities eliminate scope creep",
            postLaunchLearning: "Real user data to guide future development"
          }
        },
        stakeholder_communication: {
          managementUpdate: "We've created a phased approach that delivers core functionality by Black Friday deadline while planning enhanced features for early next year.",
          developmentTeam: "New scope defined: MVP features only through Black Friday. Phase 2 planning starts after launch. Clear feature prioritization attached.",
          marketingTeam: "Adjusted feature set for Black Friday launch. Updated marketing materials needed to reflect MVP capabilities while hinting at upcoming enhancements."
        }
      },
      {
        title: "Budget-Conscious Homepage Optimization",
        problem_statement_category: 'stakeholder_demands',
        recommendation: "Maximize homepage impact through strategic, low-cost improvements that address core business objectives while preparing roadmap for comprehensive redesign.",
        problem_specific_guidance: {
          highImpactChanges: [
            "Update hero section messaging and call-to-action",
            "Optimize page load speed and mobile responsiveness",
            "Refresh testimonials and social proof elements",
            "Improve navigation clarity and user flow",
            "A/B test key conversion elements"
          ],
          budgetOptimization: [
            "Focus on content and copy improvements over visual redesign",
            "Use existing brand assets and photography",
            "Implement changes that can be done through CMS",
            "Prioritize changes with measurable business impact"
          ]
        },
        context_adapted_implementation: {
          quarterlyExecution: {
            month1: "Content audit, messaging optimization, speed improvements",
            month2: "A/B testing of headlines, CTAs, and value propositions",
            month3: "Analysis, iteration, and planning for comprehensive redesign"
          },
          stakeholderAlignment: {
            ceoExpectations: "Show measurable improvement in homepage performance metrics",
            futureRoadmap: "Present comprehensive redesign plan for next quarter",
            budgetJustification: "Demonstrate ROI from current improvements to secure future budget"
          }
        },
        expected_impact: {
          performanceMetrics: {
            conversionRate: "Improve homepage conversion by 15-25%",
            engagementMetrics: "Increase time on page and reduce bounce rate",
            loadSpeed: "Achieve sub-3 second load times across devices"
          },
          businessOutcomes: {
            ceoSatisfaction: "Demonstrate proactive leadership and measurable results",
            futureInvestment: "Build case for comprehensive redesign budget",
            competitivePosition: "Improved first impression for prospects"
          }
        },
        stakeholder_communication: {
          ceoUpdate: "We've identified high-impact homepage improvements that can be implemented within current budget while building the business case for comprehensive redesign next quarter.",
          marketingTeam: "New homepage messaging and conversion optimization plan attached. Please coordinate content updates and A/B testing schedule.",
          designTeam: "Phase 1: Optimize within existing design system. Phase 2: Begin comprehensive redesign planning for next quarter's budget cycle."
        }
      }
    ];

    // Get problem statement IDs to link solutions
    const problemMap = new Map();
    insertedProblems?.forEach(problem => {
      problemMap.set(problem.category, problem.id);
    });

    // Add problem statement IDs to solutions
    const solutionsWithIds = contextualSolutions.map(solution => ({
      title: solution.title,
      problem_statement_ids: [problemMap.get(solution.problem_statement_category)],
      recommendation: solution.recommendation,
      problem_specific_guidance: solution.problem_specific_guidance,
      context_adapted_implementation: solution.context_adapted_implementation,
      expected_impact: solution.expected_impact,
      stakeholder_communication: solution.stakeholder_communication
    }));

    // Insert contextual solutions
    const { data: insertedSolutions, error: solutionError } = await supabase
      .from('contextual_solutions')
      .insert(solutionsWithIds)
      .select('id, title');

    if (solutionError) {
      throw new Error(`Error inserting contextual solutions: ${solutionError.message}`);
    }

    console.log(`Inserted ${insertedSolutions?.length} contextual solutions`);
    console.log('Problem statements and solutions seeded successfully!');

    return {
      problemStatements: insertedProblems,
      contextualSolutions: insertedSolutions
    };

  } catch (error) {
    console.error('Error seeding problem statements:', error);
    throw error;
  }
}

// Export for use in other scripts or components
export default seedProblemStatements;