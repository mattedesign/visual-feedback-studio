import { supabase } from '@/integrations/supabase/client';

interface SeedingProgress {
  step: string;
  status: 'starting' | 'in_progress' | 'completed' | 'failed';
  details: string;
  recordsInserted?: number;
  error?: string;
}

export interface SeedingResult {
  success: boolean;
  problemStatementsInserted: number;
  contextualSolutionsInserted: number;
  competitorPatternsInserted: number;
  verificationResults: {
    problemStatementCount: number;
    solutionCount: number;
    patternCount: number;
    relationshipCount: number;
    dataIntegrityPassed: boolean;
  };
  errors: string[];
  warnings: string[];
}

export class ProblemStatementSeeder {
  private progress: SeedingProgress[] = [];
  
  private logProgress(step: string, status: SeedingProgress['status'], details: string, recordsInserted?: number, error?: string) {
    const progressItem: SeedingProgress = { step, status, details, recordsInserted, error };
    this.progress.push(progressItem);
    console.log(`[${status.toUpperCase()}] ${step}: ${details}`, recordsInserted ? `(${recordsInserted} records)` : '', error ? `Error: ${error}` : '');
  }

  async seedDatabase(): Promise<SeedingResult> {
    const result: SeedingResult = {
      success: false,
      problemStatementsInserted: 0,
      contextualSolutionsInserted: 0,
      competitorPatternsInserted: 0,
      verificationResults: {
        problemStatementCount: 0,
        solutionCount: 0,
        patternCount: 0,
        relationshipCount: 0,
        dataIntegrityPassed: false
      },
      errors: [],
      warnings: []
    };

    try {
      this.logProgress('Database Seeding', 'starting', 'Beginning comprehensive database seeding process');

      // Step 1: Seed Problem Statements
      this.logProgress('Problem Statements', 'starting', 'Preparing problem statement data');
      
      const problemStatements = [
        {
          statement: "Our free trial signups dropped 40% after we added credit card requirements and I need to recover conversions before next quarter's board meeting",
          category: 'conversion_decline',
          implied_context: {
            businessGoal: "recover trial signup conversion rate",
            urgencyLevel: "high",
            stakeholders: ["board", "growth_team"],
            businessModel: "saas",
            timeConstraint: "next quarter",
            emotionalIndicators: ["pressure", "urgency"],
            successMetrics: ["signup_conversion_rate", "quarterly_targets"]
          },
          context_refinement_questions: [
            'What was your trial signup conversion rate before adding credit card requirements?',
            'What percentage of trial users typically convert to paid plans?',
            'Are you open to alternative lead qualification methods besides credit cards?',
            'What is your target conversion rate for the next quarter?'
          ],
          targeted_solutions: ['progressive_lead_qualification', 'no_cc_trial_strategy']
        },
        {
          statement: "Our biggest competitor just launched a feature that's getting amazing user feedback and our customers are asking when we'll have something similar",
          category: 'competitive_pressure',
          implied_context: {
            businessGoal: "maintain competitive position",
            urgencyLevel: "medium",
            stakeholders: ["product_team", "customers"],
            businessModel: "general",
            competitorThreat: "feature_gap",
            customerFeedback: "direct_requests"
          },
          context_refinement_questions: [
            'What specific feature did your competitor launch?',
            'How many customers have asked about this feature?',
            'What is your current product roadmap timeline?',
            'Do you have the technical resources to build a similar feature?'
          ],
          targeted_solutions: ['competitive_feature_response', 'rapid_feature_development']
        },
        {
          statement: "Users keep getting confused in our checkout flow and we're losing sales, but I'm not sure which part is causing the problem",
          category: 'user_confusion',
          implied_context: {
            businessGoal: "reduce checkout abandonment",
            urgencyLevel: "high",
            problemArea: "checkout_flow",
            businessImpact: "revenue_loss",
            diagnosticNeeded: true,
            uncertaintyLevel: "high"
          },
          context_refinement_questions: [
            'What is your current checkout abandonment rate?',
            'At which step do most users drop off?',
            'Have you conducted any user testing on the checkout flow?',
            'Do you have analytics tracking for each checkout step?'
          ],
          targeted_solutions: ['checkout_flow_optimization', 'user_journey_analysis']
        },
        {
          statement: "My development team says implementing the design will take 3 months but we need to launch by Black Friday",
          category: 'technical_constraints',
          implied_context: {
            businessGoal: "meet launch deadline",
            urgencyLevel: "critical",
            constraint: "development_timeline",
            deadline: "black_friday",
            stakeholders: ["development_team", "management"],
            seasonalPressure: true
          },
          context_refinement_questions: [
            'What are the most complex parts of the design to implement?',
            'Are there any features that could be simplified or phased?',
            'What is the minimum viable version that could launch on time?',
            'Can additional development resources be allocated?'
          ],
          targeted_solutions: ['phased_launch_strategy', 'scope_reduction_framework']
        },
        {
          statement: "The CEO wants a complete homepage redesign but we only have budget for small improvements this quarter",
          category: 'stakeholder_demands',
          implied_context: {
            businessGoal: "satisfy_stakeholder_requirements",
            urgencyLevel: "medium",
            constraint: "budget_limited",
            scope: "homepage_redesign",
            timeframe: "this_quarter",
            stakeholderPressure: "executive_level"
          },
          context_refinement_questions: [
            'What specific outcomes is the CEO hoping to achieve?',
            'What is the exact budget available for homepage changes?',
            'Are there high-impact changes that could deliver 80% of the desired results?',
            'Can the redesign be phased across multiple quarters?'
          ],
          targeted_solutions: ['budget_conscious_optimization', 'stakeholder_expectation_management']
        }
      ];

      this.logProgress('Problem Statements', 'in_progress', 'Inserting problem statement records');
      
      const { data: insertedProblems, error: problemError } = await supabase
        .from('problem_statements')
        .insert(problemStatements)
        .select('id, category');

      if (problemError) {
        this.logProgress('Problem Statements', 'failed', 'Failed to insert problem statements', 0, problemError.message);
        result.errors.push(`Problem statements insertion failed: ${problemError.message}`);
        throw problemError;
      }

      result.problemStatementsInserted = insertedProblems?.length || 0;
      this.logProgress('Problem Statements', 'completed', 'Successfully inserted problem statements', result.problemStatementsInserted);

      // Step 2: Seed Contextual Solutions
      this.logProgress('Contextual Solutions', 'starting', 'Preparing contextual solution data');

      // Create a mapping of categories to problem statement IDs
      const categoryMap = new Map();
      insertedProblems?.forEach(problem => {
        categoryMap.set(problem.category, problem.id);
      });

      const contextualSolutions = [
        {
          title: "Progressive Lead Qualification Strategy",
          problem_statement_ids: [categoryMap.get('conversion_decline')],
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
          title: "Competitive Feature Response Framework",
          problem_statement_ids: [categoryMap.get('competitive_pressure')],
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
          title: "Checkout Flow Diagnostic & Optimization",
          problem_statement_ids: [categoryMap.get('user_confusion')],
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
          title: "Phased Launch Strategy for Technical Constraints",
          problem_statement_ids: [categoryMap.get('technical_constraints')],
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
          problem_statement_ids: [categoryMap.get('stakeholder_demands')],
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

      this.logProgress('Contextual Solutions', 'in_progress', 'Inserting contextual solution records');

      const { data: insertedSolutions, error: solutionError } = await supabase
        .from('contextual_solutions')
        .insert(contextualSolutions)
        .select('id, title');

      if (solutionError) {
        this.logProgress('Contextual Solutions', 'failed', 'Failed to insert contextual solutions', 0, solutionError.message);
        result.errors.push(`Contextual solutions insertion failed: ${solutionError.message}`);
        throw solutionError;
      }

      result.contextualSolutionsInserted = insertedSolutions?.length || 0;
      this.logProgress('Contextual Solutions', 'completed', 'Successfully inserted contextual solutions', result.contextualSolutionsInserted);

      // Step 3: Seed Competitor Patterns
      this.logProgress('Competitor Patterns', 'starting', 'Preparing competitor pattern data');

      const competitorPatterns = [
        {
          pattern_name: "Progressive CTA Optimization",
          description: "Multi-step approach to CTA testing and optimization based on user behavior analysis and progressive profiling techniques",
          industry: "SaaS",
          pattern_type: "conversion_optimization",
          examples: {
            implementations: [
              "A/B testing different CTA copy variations with statistical significance",
              "Progressive profiling for lead qualification without friction",
              "Dynamic CTA personalization based on user segment and behavior",
              "Multi-step form optimization with progressive disclosure"
            ],
            results: [
              "30-50% improvement in conversion rates across tested variants",
              "Reduced form abandonment by 25% through progressive profiling",
              "Higher quality lead generation with 40% better sales qualification",
              "Improved user experience scores and reduced cognitive load"
            ],
            companies: ["HubSpot", "Salesforce", "Zoom", "Slack"]
          },
          effectiveness_score: 0.85
        },
        {
          pattern_name: "Competitive Feature Leapfrogging",
          description: "Strategic framework for responding to competitive threats by building superior versions of competitor features with unique differentiation",
          industry: "Technology",
          pattern_type: "competitive_response",
          examples: {
            implementations: [
              "Feature gap analysis with customer impact prioritization",
              "Rapid MVP development and testing with target users",
              "Strategic feature bundling for enhanced value propositions",
              "Beta program launches with key customers for feedback"
            ],
            results: [
              "Reduced customer churn by 40% during competitive pressure periods",
              "Accelerated feature delivery timeline by 60% through focused scope",
              "Improved competitive positioning with unique value propositions",
              "Higher customer satisfaction scores post-feature release"
            ],
            companies: ["Microsoft", "Google", "Adobe", "Atlassian"]
          },
          effectiveness_score: 0.78
        },
        {
          pattern_name: "Checkout Flow Optimization Framework",
          description: "Systematic approach to reducing checkout abandonment through UX research, A/B testing, and progressive enhancement strategies",
          industry: "E-commerce",
          pattern_type: "conversion_optimization",
          examples: {
            implementations: [
              "Single-page checkout with progressive disclosure",
              "Guest checkout options with account creation incentives",
              "Progress indicators and trust signals throughout flow",
              "Mobile-first design with touch-optimized interactions"
            ],
            results: [
              "20-35% reduction in cart abandonment rates",
              "Improved mobile conversion rates by 45%",
              "Higher customer satisfaction scores for checkout experience",
              "Reduced customer service inquiries about checkout issues"
            ],
            companies: ["Amazon", "Shopify", "Stripe", "PayPal"]
          },
          effectiveness_score: 0.82
        },
        {
          pattern_name: "Agile MVP Launch Strategy",
          description: "Phased product launch approach that delivers core value quickly while building enhanced features based on user feedback and market validation",
          industry: "Software Development",
          pattern_type: "launch_strategy",
          examples: {
            implementations: [
              "80/20 feature prioritization for maximum user value",
              "Continuous deployment with feature flags for controlled rollouts",
              "User feedback loops integrated into development cycles",
              "Post-launch optimization based on real user behavior data"
            ],
            results: [
              "60-70% faster time-to-market for core functionality",
              "Higher product-market fit scores through iterative improvement",
              "Reduced development costs through focused scope",
              "Better resource allocation based on validated user needs"
            ],
            companies: ["Spotify", "Netflix", "Airbnb", "Uber"]
          },
          effectiveness_score: 0.79
        },
        {
          pattern_name: "Stakeholder Alignment & Budget Optimization",
          description: "Strategic approach to managing stakeholder expectations while maximizing impact within budget constraints through data-driven prioritization",
          industry: "Business Strategy",
          pattern_type: "stakeholder_management",
          examples: {
            implementations: [
              "Impact vs. effort matrix for feature prioritization",
              "Stakeholder communication templates with clear ROI projections",
              "Phased implementation roadmaps with budget allocation transparency",
              "Quick wins identification for immediate stakeholder satisfaction"
            ],
            results: [
              "Improved stakeholder satisfaction scores by 35%",
              "Better budget utilization with 25% higher ROI on initiatives",
              "Faster decision-making through clear prioritization frameworks",
              "Enhanced cross-functional collaboration and alignment"
            ],
            companies: ["McKinsey", "BCG", "Deloitte", "PwC"]
          },
          effectiveness_score: 0.76
        }
      ];

      this.logProgress('Competitor Patterns', 'in_progress', 'Inserting competitor pattern records');

      const { data: insertedPatterns, error: patternError } = await supabase
        .from('competitor_patterns')
        .insert(competitorPatterns)
        .select('id, pattern_name');

      if (patternError) {
        this.logProgress('Competitor Patterns', 'failed', 'Failed to insert competitor patterns', 0, patternError.message);
        result.errors.push(`Competitor patterns insertion failed: ${patternError.message}`);
        throw patternError;
      }

      result.competitorPatternsInserted = insertedPatterns?.length || 0;
      this.logProgress('Competitor Patterns', 'completed', 'Successfully inserted competitor patterns', result.competitorPatternsInserted);

      // Step 4: Verification
      this.logProgress('Verification', 'starting', 'Beginning data integrity verification');

      const verificationResult = await this.verifyDataIntegrity();
      result.verificationResults = verificationResult;

      if (verificationResult.dataIntegrityPassed) {
        this.logProgress('Verification', 'completed', 'All data integrity checks passed');
        result.success = true;
      } else {
        this.logProgress('Verification', 'failed', 'Data integrity verification failed');
        result.errors.push('Data integrity verification failed');
      }

      this.logProgress('Database Seeding', 'completed', 'Database seeding process completed successfully');

    } catch (error) {
      this.logProgress('Database Seeding', 'failed', 'Database seeding process failed', 0, error.message);
      result.errors.push(`Seeding process failed: ${error.message}`);
      result.success = false;
    }

    return result;
  }

  private async verifyDataIntegrity() {
    try {
      // Count records in each table
      const { count: problemCount } = await supabase
        .from('problem_statements')
        .select('*', { count: 'exact', head: true });

      const { count: solutionCount } = await supabase
        .from('contextual_solutions')
        .select('*', { count: 'exact', head: true });

      const { count: patternCount } = await supabase
        .from('competitor_patterns')
        .select('*', { count: 'exact', head: true });

      // Check relationships between problem statements and solutions
      const { data: solutionsWithProblems } = await supabase
        .from('contextual_solutions')
        .select('id, problem_statement_ids')
        .not('problem_statement_ids', 'is', null);

      const relationshipCount = solutionsWithProblems?.reduce((count, solution) => {
        return count + (solution.problem_statement_ids?.length || 0);
      }, 0) || 0;

      const dataIntegrityPassed = 
        (problemCount || 0) >= 5 && 
        (solutionCount || 0) >= 5 && 
        (patternCount || 0) >= 3 && 
        relationshipCount >= 5;

      return {
        problemStatementCount: problemCount || 0,
        solutionCount: solutionCount || 0,
        patternCount: patternCount || 0,
        relationshipCount,
        dataIntegrityPassed
      };
    } catch (error) {
      console.error('Verification failed:', error);
      return {
        problemStatementCount: 0,
        solutionCount: 0,
        patternCount: 0,
        relationshipCount: 0,
        dataIntegrityPassed: false
      };
    }
  }

  getProgress(): SeedingProgress[] {
    return this.progress;
  }
}

// Main execution function
export async function executeDatabaseSeeding(): Promise<SeedingResult> {
  console.log('🌱 Starting Problem Statement Database Seeding...');
  
  const seeder = new ProblemStatementSeeder();
  const result = await seeder.seedDatabase();
  
  console.log('\n📊 SEEDING SUMMARY:');
  console.log('==================');
  console.log(`Success: ${result.success}`);
  console.log(`Problem Statements Inserted: ${result.problemStatementsInserted}`);
  console.log(`Contextual Solutions Inserted: ${result.contextualSolutionsInserted}`);
  console.log(`Competitor Patterns Inserted: ${result.competitorPatternsInserted}`);
  console.log('\n🔍 VERIFICATION RESULTS:');
  console.log(`Problem Statements in DB: ${result.verificationResults.problemStatementCount}`);
  console.log(`Solutions in DB: ${result.verificationResults.solutionCount}`);
  console.log(`Patterns in DB: ${result.verificationResults.patternCount}`);
  console.log(`Relationships: ${result.verificationResults.relationshipCount}`);
  console.log(`Data Integrity: ${result.verificationResults.dataIntegrityPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  console.log('\n📋 DETAILED PROGRESS:');
  const progress = seeder.getProgress();
  progress.forEach(step => {
    const status = step.status === 'completed' ? '✅' : step.status === 'failed' ? '❌' : '⏳';
    console.log(`${status} [${step.step}] ${step.details}`);
    if (step.recordsInserted) {
      console.log(`    Records inserted: ${step.recordsInserted}`);
    }
    if (step.error) {
      console.log(`    Error: ${step.error}`);
    }
  });
  
  return result;
}

// Browser console execution helper
(window as any).seedDatabase = executeDatabaseSeeding;