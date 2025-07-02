interface ProblemStatement {
  id: string;
  statement: string;
  category: "conversion_decline" | "competitive_pressure" | "user_confusion" | "technical_constraints" | "stakeholder_demands";
  
  impliedContext: {
    businessGoal: string;
    currentChallenge: string;
    urgencyLevel: "low" | "medium" | "high" | "critical";
    timeConstraint?: string;
    stakeholders: string[];
    successMetrics: string[];
    businessModel: "saas" | "ecommerce" | "marketplace" | "media" | "b2b";
    resourceConstraints?: string[];
  };
  
  contextRefinementQuestions: string[];
  targetedSolutions: Solution[];
}

interface Solution {
  id: string;
  title: string;
  recommendation: string;
  
  problemSpecificGuidance: {
    immediateActions: string[];
    weekOneImplementation: string[];
    strategicChanges: string[];
    successMeasurement: string[];
  };
  
  contextAdaptedImplementation: {
    highUrgency: {
      timeline: string;
      minimalChanges: string[];
      riskMitigation: string[];
    };
    normalTimeline: {
      timeline: string;
      comprehensiveChanges: string[];
      testingStrategy: string[];
    };
  };
  
  expectedImpact: {
    primaryMetric: string;
    range: string;
    timeline: string;
    confidence: "high" | "medium" | "low";
    basedOn: string;
  };
  
  stakeholderCommunication: {
    executiveSummary: string;
    technicalRequirements: string;
    designRationale: string;
  };
}

export const problemStatementDatabase: ProblemStatement[] = [
  // CONVERSION DECLINE CATEGORY
  {
    id: "ecommerce_checkout_conversion_crisis",
    statement: "Our checkout conversion dropped 35% after we added required account creation and the CEO wants it fixed before Black Friday",
    category: "conversion_decline",
    
    impliedContext: {
      businessGoal: "recover checkout conversion before critical sales period",
      currentChallenge: "forced registration causing abandonment",
      urgencyLevel: "critical",
      timeConstraint: "before Black Friday (6 weeks)",
      stakeholders: ["ceo", "ecommerce_manager", "development"],
      successMetrics: ["checkout conversion rate", "cart abandonment rate", "revenue per session"],
      businessModel: "ecommerce",
      resourceConstraints: ["time_critical", "high_visibility"]
    },
    
    contextRefinementQuestions: [
      "What was your checkout conversion rate before adding required registration?",
      "What percentage of users abandon at the account creation step specifically?",
      "Are you open to guest checkout with optional account creation post-purchase?",
      "What's your current Black Friday traffic projection compared to last year?"
    ],
    
    targetedSolutions: [
      {
        id: "guest_checkout_implementation",
        title: "Implement Guest Checkout with Optional Registration",
        recommendation: "Add prominent guest checkout option, move account creation to post-purchase with incentives, and implement progressive account building over multiple visits.",
        
        problemSpecificGuidance: {
          immediateActions: [
            "Add 'Continue as Guest' button above registration form",
            "Change form headline from 'Create Account' to 'Checkout Options'",
            "Add text: 'Account creation is optional - checkout as guest anytime'"
          ],
          weekOneImplementation: [
            "Implement guest checkout flow with minimal required fields",
            "Create post-purchase account creation with benefit messaging",
            "Add email capture with newsletter signup incentive"
          ],
          strategicChanges: [
            "Implement progressive profiling over multiple purchases",
            "Add social login options for easier account creation",
            "Create personalized account benefits based on purchase history"
          ],
          successMeasurement: [
            "Track checkout conversion rate daily",
            "Monitor cart abandonment by checkout step",
            "Measure post-purchase account creation rate"
          ]
        },
        
        contextAdaptedImplementation: {
          highUrgency: {
            timeline: "2 weeks implementation",
            minimalChanges: [
              "Guest checkout button addition (2 days)",
              "Form field reduction to essentials only (1 day)",
              "Basic post-purchase email capture (3 days)"
            ],
            riskMitigation: [
              "A/B test guest checkout vs current flow",
              "Monitor account creation rates to ensure customer retention",
              "Track repeat purchase rates for guest vs registered users"
            ]
          },
          normalTimeline: {
            timeline: "4-6 weeks comprehensive implementation",
            comprehensiveChanges: [
              "Full guest checkout experience design",
              "Progressive registration strategy",
              "Social login integration",
              "Personalized post-purchase account benefits"
            ],
            testingStrategy: [
              "Multi-variant test of checkout flows",
              "Cohort analysis of guest vs registered user behavior",
              "Long-term customer lifetime value tracking"
            ]
          }
        },
        
        expectedImpact: {
          primaryMetric: "checkout conversion rate",
          range: "25-45% recovery of lost conversion",
          timeline: "within 2 weeks of guest checkout implementation",
          confidence: "high",
          basedOn: "Baymard Institute study: forced registration reduces checkout conversion by 35-50%, guest checkout implementation recovers 60-80% of losses"
        },
        
        stakeholderCommunication: {
          executiveSummary: "Guest checkout implementation can recover 25-45% of lost conversion within 2 weeks, potentially adding significant revenue before Black Friday based on current traffic projections",
          technicalRequirements: "Moderate development effort: guest session management, simplified checkout flow, post-purchase account creation workflow",
          designRationale: "Reduces cognitive load and purchase anxiety while maintaining long-term customer relationship building through strategic post-purchase engagement"
        }
      }
    ]
  },

  {
    id: "saas_signup_conversion_drop",
    statement: "Our SaaS signup conversion is 40% lower than industry benchmarks and investors are asking why",
    category: "conversion_decline",
    
    impliedContext: {
      businessGoal: "achieve industry-standard signup conversion rates",
      currentChallenge: "below-benchmark conversion performance affecting investor confidence",
      urgencyLevel: "high",
      timeConstraint: "before next board meeting",
      stakeholders: ["investors", "ceo", "growth_team"],
      successMetrics: ["signup conversion rate", "trial-to-paid conversion", "cost per acquisition"],
      businessModel: "saas",
      resourceConstraints: ["investor_scrutiny", "growth_pressure"]
    },
    
    contextRefinementQuestions: [
      "What's your current signup conversion rate vs industry benchmark?",
      "How many form fields are required for signup?",
      "Do you offer a free trial or freemium option?",
      "What's your current trial-to-paid conversion rate?"
    ],
    
    targetedSolutions: [
      {
        id: "progressive_signup_optimization",
        title: "Progressive Signup with Value-First Onboarding",
        recommendation: "Reduce initial signup friction to email-only, demonstrate value immediately in the product, then progressively collect additional information based on usage patterns.",
        
        problemSpecificGuidance: {
          immediateActions: [
            "Reduce signup form to email + password only",
            "Add social login options (Google, LinkedIn)",
            "Remove optional fields that create abandonment"
          ],
          weekOneImplementation: [
            "Implement progressive profiling within the app",
            "Create value-demonstration onboarding sequence",
            "Add signup abandonment recovery email sequence"
          ],
          strategicChanges: [
            "Build behavioral triggers for additional data collection",
            "Implement account scoring based on engagement",
            "Create personalized onboarding paths by user type"
          ],
          successMeasurement: [
            "Track signup conversion rate by traffic source",
            "Monitor onboarding completion rates",
            "Measure time-to-value for new users"
          ]
        },
        
        contextAdaptedImplementation: {
          highUrgency: {
            timeline: "1 week implementation",
            minimalChanges: [
              "Form field reduction (1 day)",
              "Social login integration (2 days)",
              "Basic onboarding flow (2 days)"
            ],
            riskMitigation: [
              "A/B test against current signup flow",
              "Monitor lead quality metrics",
              "Track progression from signup to activation"
            ]
          },
          normalTimeline: {
            timeline: "3-4 weeks comprehensive implementation",
            comprehensiveChanges: [
              "Full progressive onboarding system",
              "Behavioral data collection triggers",
              "Personalized user journey mapping",
              "Advanced analytics implementation"
            ],
            testingStrategy: [
              "Multivariate testing of signup flows",
              "Cohort analysis of different onboarding paths",
              "Long-term retention impact measurement"
            ]
          }
        },
        
        expectedImpact: {
          primaryMetric: "signup conversion rate",
          range: "40-65% improvement",
          timeline: "within 1 week of simplified signup implementation",
          confidence: "high",
          basedOn: "ConversionXL research: reducing form fields from 7+ to 3 increases conversion by 50-80%, social login adds 15-25% lift"
        },
        
        stakeholderCommunication: {
          executiveSummary: "Signup optimization can achieve industry-benchmark conversion rates within 2 weeks, demonstrating growth momentum to investors while improving unit economics",
          technicalRequirements: "Minimal development effort: form simplification, social auth integration, progressive data collection system",
          designRationale: "Reduces signup friction while maintaining lead quality through behavioral qualification and progressive value demonstration"
        }
      }
    ]
  },

  {
    id: "subscription_renewal_crisis",
    statement: "Our subscription renewal rate dropped 15% this quarter and churn is accelerating - CFO is demanding immediate action",
    category: "conversion_decline",
    
    impliedContext: {
      businessGoal: "stop subscription churn acceleration and recover renewal rates",
      currentChallenge: "declining customer retention affecting recurring revenue",
      urgencyLevel: "critical",
      timeConstraint: "before end of quarter",
      stakeholders: ["cfo", "customer_success", "product"],
      successMetrics: ["renewal rate", "churn rate", "customer lifetime value"],
      businessModel: "saas",
      resourceConstraints: ["revenue_impact", "quarterly_pressure"]
    },
    
    contextRefinementQuestions: [
      "What's the primary reason customers give for not renewing?",
      "How early do you engage customers about renewal?",
      "Do you have usage analytics to predict churn risk?",
      "What's your current customer health scoring system?"
    ],
    
    targetedSolutions: [
      {
        id: "proactive_renewal_intervention",
        title: "Proactive Churn Prevention with Value Reinforcement",
        recommendation: "Implement early warning system for churn risk, create value reinforcement touchpoints throughout subscription cycle, and design frictionless renewal experience with incentives.",
        
        problemSpecificGuidance: {
          immediateActions: [
            "Email all customers 60 days before renewal with value summary",
            "Add in-app renewal reminders with usage statistics",
            "Create one-click renewal option in account dashboard"
          ],
          weekOneImplementation: [
            "Implement churn risk scoring based on usage patterns",
            "Create automated email sequence highlighting customer wins",
            "Add renewal incentives for early commitment"
          ],
          strategicChanges: [
            "Build comprehensive customer health dashboard",
            "Implement predictive churn modeling",
            "Create personalized retention campaigns"
          ],
          successMeasurement: [
            "Track renewal rate by customer segment",
            "Monitor engagement with renewal communications",
            "Measure impact of early intervention on churn"
          ]
        },
        
        contextAdaptedImplementation: {
          highUrgency: {
            timeline: "1 week implementation",
            minimalChanges: [
              "Automated renewal reminder emails (2 days)",
              "In-app renewal notifications (1 day)",
              "Usage statistics in renewal communications (2 days)"
            ],
            riskMitigation: [
              "Segment communications by customer health score",
              "A/B test renewal incentive offers",
              "Monitor customer feedback to prevent irritation"
            ]
          },
          normalTimeline: {
            timeline: "4 weeks comprehensive implementation",
            comprehensiveChanges: [
              "Full customer health scoring system",
              "Predictive churn modeling",
              "Automated retention campaigns",
              "Customer success integration"
            ],
            testingStrategy: [
              "Test different renewal communication timing",
              "Compare incentive vs value-focused messaging",
              "Measure long-term impact on customer satisfaction"
            ]
          }
        },
        
        expectedImpact: {
          primaryMetric: "subscription renewal rate",
          range: "8-12% improvement",
          timeline: "within 30 days of implementation",
          confidence: "high",
          basedOn: "ChartMogul research: proactive renewal engagement increases retention by 10-15%, early intervention reduces churn by 20-30%"
        },
        
        stakeholderCommunication: {
          executiveSummary: "Proactive renewal system can recover 8-12% of lost renewals within 30 days, protecting quarterly recurring revenue and improving customer lifetime value",
          technicalRequirements: "Moderate development: customer health scoring, automated email sequences, in-app notification system",
          designRationale: "Shifts from reactive churn response to proactive value reinforcement, improving customer experience while protecting revenue"
        }
      }
    ]
  },

  // COMPETITIVE PRESSURE CATEGORY
  {
    id: "competitor_feature_pressure",
    statement: "Our main competitor just launched a feature that our customers are demanding and we're losing deals because of it",
    category: "competitive_pressure",
    
    impliedContext: {
      businessGoal: "maintain competitive position and stop deal losses",
      currentChallenge: "competitor advantage causing customer acquisition/retention issues",
      urgencyLevel: "high",
      timeConstraint: "before more customers churn to competitor",
      stakeholders: ["sales", "product", "ceo"],
      successMetrics: ["deal win rate", "customer retention", "feature adoption"],
      businessModel: "saas",
      resourceConstraints: ["development_time", "market_pressure"]
    },
    
    contextRefinementQuestions: [
      "What specific feature did your competitor launch?",
      "How many deals have you lost citing this feature gap?",
      "What's your current product roadmap priority?",
      "Can you differentiate rather than copy the competitor feature?"
    ],
    
    targetedSolutions: [
      {
        id: "competitive_differentiation_strategy",
        title: "Strategic Feature Differentiation with Superior Implementation",
        recommendation: "Instead of copying competitor feature, build a superior version that addresses the underlying customer need while leveraging your unique strengths and creating new competitive advantages.",
        
        problemSpecificGuidance: {
          immediateActions: [
            "Survey lost prospects about specific feature requirements",
            "Analyze competitor feature limitations and user complaints",
            "Document your unique advantages that can enhance the feature"
          ],
          weekOneImplementation: [
            "Create feature specification that addresses gaps in competitor solution",
            "Develop messaging that positions your approach as superior",
            "Begin MVP development focused on key differentiators"
          ],
          strategicChanges: [
            "Build comprehensive competitive intelligence system",
            "Implement faster feature development pipeline",
            "Create sustainable competitive moats"
          ],
          successMeasurement: [
            "Track deal win rate after feature launch",
            "Monitor competitive displacement metrics",
            "Measure feature adoption and user satisfaction"
          ]
        },
        
        contextAdaptedImplementation: {
          highUrgency: {
            timeline: "3-4 weeks MVP implementation",
            minimalChanges: [
              "Core feature functionality (2 weeks)",
              "Basic user interface (3 days)",
              "Customer communication about upcoming release (2 days)"
            ],
            riskMitigation: [
              "Beta test with key customers who mentioned competitor",
              "Prepare rollback plan if feature doesn't meet expectations",
              "Create messaging to retain customers during development"
            ]
          },
          normalTimeline: {
            timeline: "8-10 weeks comprehensive implementation",
            comprehensiveChanges: [
              "Full feature suite with advanced capabilities",
              "Integration with existing product ecosystem",
              "Comprehensive user experience design",
              "Advanced analytics and reporting"
            ],
            testingStrategy: [
              "Competitive feature comparison testing",
              "User experience benchmarking against competitor",
              "Long-term adoption and engagement measurement"
            ]
          }
        },
        
        expectedImpact: {
          primaryMetric: "competitive deal win rate",
          range: "25-40% improvement",
          timeline: "within 30 days of feature launch",
          confidence: "medium",
          basedOn: "Product benchmarking studies: superior feature implementation can recover 60-80% of competitive losses"
        },
        
        stakeholderCommunication: {
          executiveSummary: "Strategic feature differentiation can recover competitive losses while creating new advantages, protecting market share and enabling premium positioning",
          technicalRequirements: "Significant development effort: new feature development, testing, integration, ongoing maintenance",
          designRationale: "Transforms competitive pressure into innovation opportunity, building sustainable advantages rather than just feature parity"
        }
      }
    ]
  },

  {
    id: "ui_modernization_pressure",
    statement: "Our interface looks outdated compared to modern competitors and it's affecting our brand perception in sales meetings",
    category: "competitive_pressure",
    
    impliedContext: {
      businessGoal: "modernize brand perception and competitive positioning",
      currentChallenge: "outdated UI affecting sales credibility and market perception",
      urgencyLevel: "medium",
      timeConstraint: "before next major sales cycle",
      stakeholders: ["sales", "marketing", "design"],
      successMetrics: ["sales demo feedback", "brand perception", "customer acquisition"],
      businessModel: "b2b",
      resourceConstraints: ["design_resources", "development_time"]
    },
    
    contextRefinementQuestions: [
      "What specific UI elements do prospects comment on as outdated?",
      "Which competitors do they compare you to?",
      "What's your current design system maturity?",
      "Do you have user research on current UI pain points?"
    ],
    
    targetedSolutions: [
      {
        id: "strategic_ui_modernization",
        title: "Phased UI Modernization with High-Impact Visual Updates",
        recommendation: "Implement strategic visual updates focusing on elements most visible in sales demos and customer interactions, followed by systematic design system implementation.",
        
        problemSpecificGuidance: {
          immediateActions: [
            "Update primary navigation with modern typography and spacing",
            "Refresh dashboard cards with contemporary shadows and borders",
            "Modernize color palette to match current design trends"
          ],
          weekOneImplementation: [
            "Implement design system foundations (typography, colors, spacing)",
            "Update key customer-facing screens shown in sales demos",
            "Create style guide for consistent implementation"
          ],
          strategicChanges: [
            "Build comprehensive design system",
            "Implement component library for scalable updates",
            "Create user research program for ongoing validation"
          ],
          successMeasurement: [
            "Track sales demo feedback scores",
            "Monitor brand perception surveys",
            "Measure customer engagement with new interface"
          ]
        },
        
        contextAdaptedImplementation: {
          highUrgency: {
            timeline: "2 weeks visual refresh",
            minimalChanges: [
              "Color palette and typography updates (3 days)",
              "Navigation and header modernization (4 days)",
              "Key dashboard screen improvements (5 days)"
            ],
            riskMitigation: [
              "A/B test new designs with existing customers",
              "Gather feedback from sales team on demo impact",
              "Monitor user behavior for negative impacts"
            ]
          },
          normalTimeline: {
            timeline: "6-8 weeks comprehensive modernization",
            comprehensiveChanges: [
              "Complete design system implementation",
              "Comprehensive component library",
              "Responsive design improvements",
              "Advanced interaction and animation patterns"
            ],
            testingStrategy: [
              "User testing of modernized interfaces",
              "Competitive visual benchmarking",
              "Long-term brand perception tracking"
            ]
          }
        },
        
        expectedImpact: {
          primaryMetric: "sales demo reception",
          range: "30-50% improvement in positive feedback",
          timeline: "immediately upon deployment",
          confidence: "high",
          basedOn: "First impressions research: modern visual design increases credibility perception by 40-60% in B2B contexts"
        },
        
        stakeholderCommunication: {
          executiveSummary: "UI modernization eliminates competitive disadvantage in sales situations while building foundation for ongoing design leadership and brand strength",
          technicalRequirements: "Moderate development effort: CSS/styling updates, component refactoring, design system implementation",
          designRationale: "Strategic visual updates target highest-impact areas first, creating immediate competitive parity while building systematic design capabilities"
        }
      }
    ]
  },

  // USER CONFUSION CATEGORY
  {
    id: "navigation_confusion_crisis",
    statement: "Users can't find basic features and our support tickets about 'where is X' have tripled in the last month",
    category: "user_confusion",
    
    impliedContext: {
      businessGoal: "reduce user confusion and support burden",
      currentChallenge: "poor information architecture causing user frustration and support costs",
      urgencyLevel: "high",
      timeConstraint: "before support costs become unsustainable",
      stakeholders: ["support", "product", "users"],
      successMetrics: ["support ticket volume", "feature discovery rate", "user satisfaction"],
      businessModel: "saas",
      resourceConstraints: ["support_team_overwhelmed", "user_frustration"]
    },
    
    contextRefinementQuestions: [
      "Which specific features are users unable to find?",
      "What's the most common user journey that leads to confusion?",
      "Have you done any user testing on navigation?",
      "What's your current onboarding process for new features?"
    ],
    
    targetedSolutions: [
      {
        id: "navigation_clarity_system",
        title: "Intuitive Navigation with Progressive Disclosure",
        recommendation: "Restructure navigation based on user mental models, implement contextual help system, and create feature discovery mechanisms that reduce support dependency.",
        
        problemSpecificGuidance: {
          immediateActions: [
            "Add search functionality to main navigation",
            "Create 'Popular Features' section in dashboard",
            "Implement breadcrumb navigation for complex workflows"
          ],
          weekOneImplementation: [
            "Restructure main navigation based on user task frequency",
            "Add contextual tooltips to unclear interface elements",
            "Create in-app feature discovery tour"
          ],
          strategicChanges: [
            "Implement comprehensive onboarding system",
            "Build adaptive interface that learns user preferences",
            "Create self-service help system integrated into UI"
          ],
          successMeasurement: [
            "Track reduction in navigation-related support tickets",
            "Monitor feature discovery and adoption rates",
            "Measure user task completion times"
          ]
        },
        
        contextAdaptedImplementation: {
          highUrgency: {
            timeline: "1 week implementation",
            minimalChanges: [
              "Navigation search functionality (2 days)",
              "Popular features dashboard section (1 day)",
              "Basic contextual help tooltips (2 days)"
            ],
            riskMitigation: [
              "Test navigation changes with heavy users first",
              "Monitor support ticket trends during rollout",
              "Prepare quick rollback for navigation changes"
            ]
          },
          normalTimeline: {
            timeline: "4 weeks comprehensive implementation",
            comprehensiveChanges: [
              "Complete information architecture redesign",
              "Comprehensive contextual help system",
              "Adaptive user interface",
              "Advanced onboarding and discovery features"
            ],
            testingStrategy: [
              "Card sorting and tree testing for navigation structure",
              "User journey testing for common tasks",
              "A/B testing of different help system approaches"
            ]
          }
        },
        
        expectedImpact: {
          primaryMetric: "navigation-related support tickets",
          range: "40-60% reduction",
          timeline: "within 2 weeks of implementation",
          confidence: "high",
          basedOn: "Nielsen Norman Group research: improved navigation design reduces user confusion by 50-70%, contextual help reduces support needs by 30-50%"
        },
        
        stakeholderCommunication: {
          executiveSummary: "Navigation improvements can reduce support costs by 40-60% while improving user satisfaction and feature adoption, creating sustainable operational efficiency",
          technicalRequirements: "Moderate development effort: navigation restructuring, search implementation, contextual help system",
          designRationale: "Aligns interface structure with user mental models while providing progressive assistance, reducing cognitive load and support dependency"
        }
      }
    ]
  },

  {
    id: "onboarding_completion_crisis",
    statement: "Only 30% of new users complete our onboarding flow and activation rates are terrible",
    category: "user_confusion",
    
    impliedContext: {
      businessGoal: "improve new user activation and product adoption",
      currentChallenge: "poor onboarding experience preventing user success",
      urgencyLevel: "high",
      timeConstraint: "affecting monthly growth metrics",
      stakeholders: ["growth", "product", "customer_success"],
      successMetrics: ["onboarding completion rate", "user activation", "time to value"],
      businessModel: "saas",
      resourceConstraints: ["new_user_experience", "growth_targets"]
    },
    
    contextRefinementQuestions: [
      "At which step do most users abandon the onboarding?",
      "How long does your current onboarding flow take?",
      "What's your definition of user activation?",
      "Do you have data on what activated users did differently?"
    ],
    
    targetedSolutions: [
      {
        id: "progressive_onboarding_optimization",
        title: "Value-First Progressive Onboarding",
        recommendation: "Redesign onboarding to demonstrate value quickly, reduce initial cognitive load, and create multiple activation pathways based on user goals and experience levels.",
        
        problemSpecificGuidance: {
          immediateActions: [
            "Reduce initial onboarding to 3 essential steps maximum",
            "Add 'Skip for now' options to non-critical setup steps",
            "Show value demonstration before asking for effort"
          ],
          weekOneImplementation: [
            "Create role-based onboarding paths (beginner, advanced, specific use cases)",
            "Implement progress saving so users can complete onboarding over time",
            "Add contextual help for each onboarding step"
          ],
          strategicChanges: [
            "Build behavioral triggers for continued onboarding",
            "Create just-in-time feature introduction system",
            "Implement onboarding optimization based on user success patterns"
          ],
          successMeasurement: [
            "Track completion rate by onboarding step",
            "Monitor time-to-first-value for new users",
            "Measure correlation between onboarding completion and long-term retention"
          ]
        },
        
        contextAdaptedImplementation: {
          highUrgency: {
            timeline: "1 week implementation",
            minimalChanges: [
              "Onboarding step reduction (2 days)",
              "Skip options for optional steps (1 day)",
              "Basic progress saving (2 days)"
            ],
            riskMitigation: [
              "A/B test streamlined vs current onboarding",
              "Monitor activation quality (not just quantity)",
              "Track feature adoption patterns post-onboarding"
            ]
          },
          normalTimeline: {
            timeline: "3-4 weeks comprehensive implementation",
            comprehensiveChanges: [
              "Multiple onboarding paths by user type",
              "Comprehensive progress saving and resumption",
              "Behavioral onboarding triggers",
              "Advanced analytics and optimization"
            ],
            testingStrategy: [
              "Multivariate testing of onboarding flows",
              "User interview feedback on onboarding experience",
              "Cohort analysis of different onboarding approaches"
            ]
          }
        },
        
        expectedImpact: {
          primaryMetric: "onboarding completion rate",
          range: "50-80% improvement",
          timeline: "within 1 week of streamlined onboarding launch",
          confidence: "high",
          basedOn: "Onboarding optimization studies: reducing steps by 50% typically doubles completion rates, value-first approach increases retention by 40-60%"
        },
        
        stakeholderCommunication: {
          executiveSummary: "Onboarding optimization can double completion rates within 1 week, directly improving activation metrics and supporting growth targets through better new user experience",
          technicalRequirements: "Moderate development effort: onboarding flow redesign, progress saving system, conditional logic implementation",
          designRationale: "Prioritizes immediate value demonstration over comprehensive setup, reducing abandonment while enabling deeper engagement over time"
        }
      }
    ]
  },

  // TECHNICAL CONSTRAINTS CATEGORY
  {
    id: "limited_dev_resources_ux",
    statement: "We need major UX improvements but our development team is already overloaded with feature requests",
    category: "technical_constraints",
    
    impliedContext: {
      businessGoal: "improve UX within existing resource constraints",
      currentChallenge: "development bottleneck preventing UX improvements",
      urgencyLevel: "medium",
      timeConstraint: "ongoing resource limitation",
      stakeholders: ["development", "product", "design"],
      successMetrics: ["user satisfaction", "development efficiency", "feature delivery"],
      businessModel: "saas",
      resourceConstraints: ["limited_development_time", "competing_priorities"]
    },
    
    contextRefinementQuestions: [
      "What are the highest-impact UX issues that need minimal development?",
      "Do you have a design system that could accelerate implementation?",
      "Which UX improvements would reduce future development burden?",
      "Can any improvements be made through configuration rather than coding?"
    ],
    
    targetedSolutions: [
      {
        id: "low_dev_high_impact_ux",
        title: "High-Impact UX Improvements with Minimal Development",
        recommendation: "Focus on CSS-only improvements, copy optimizations, and design system implementation that provides immediate UX gains while building foundation for efficient future development.",
        
        problemSpecificGuidance: {
          immediateActions: [
            "Audit current interface for CSS-only improvement opportunities",
            "Optimize button text, form labels, and error messages",
            "Improve spacing, typography, and visual hierarchy through styling"
          ],
          weekOneImplementation: [
            "Implement design system foundations (colors, typography, spacing)",
            "Create reusable component library for common UI patterns",
            "Optimize user onboarding copy and micro-interactions"
          ],
          strategicChanges: [
            "Build comprehensive component library for faster development",
            "Implement user feedback collection system to prioritize improvements",
            "Create UX improvement process that integrates with development workflow"
          ],
          successMeasurement: [
            "Track user satisfaction scores before/after changes",
            "Monitor development velocity for UI updates",
            "Measure component reuse rates in new features"
          ]
        },
        
        contextAdaptedImplementation: {
          highUrgency: {
            timeline: "3-5 days implementation",
            minimalChanges: [
              "Typography and spacing improvements (1 day)",
              "Button and form styling updates (1 day)",
              "Copy optimization for key user flows (1 day)"
            ],
            riskMitigation: [
              "Focus on styling changes that don't affect functionality",
              "Test changes in staging environment thoroughly",
              "Prepare quick rollback for any styling issues"
            ]
          },
          normalTimeline: {
            timeline: "2-3 weeks systematic implementation",
            comprehensiveChanges: [
              "Complete design system implementation",
              "Component library creation",
              "Comprehensive copy optimization",
              "User feedback integration system"
            ],
            testingStrategy: [
              "User testing of styling improvements",
              "Development team feedback on component library efficiency",
              "Long-term measurement of development velocity improvements"
            ]
          }
        },
        
        expectedImpact: {
          primaryMetric: "user satisfaction",
          range: "20-35% improvement",
          timeline: "within 1 week of styling improvements",
          confidence: "high",
          basedOn: "Design system research: consistent styling improves perceived usability by 25-40%, copy optimization increases task completion by 15-30%"
        },
        
        stakeholderCommunication: {
          executiveSummary: "Strategic UX improvements can be achieved with minimal development time while building foundations for more efficient future development and sustained UX quality",
          technicalRequirements: "Minimal development effort: CSS styling updates, copy changes, design system implementation",
          designRationale: "Maximizes UX impact per development hour while creating reusable systems that accelerate future improvements and reduce long-term development burden"
        }
      }
    ]
  },

  {
    id: "mobile_responsive_constraints",
    statement: "Our mobile experience is broken but we don't have budget for a full mobile redesign",
    category: "technical_constraints",
    
    impliedContext: {
      businessGoal: "fix mobile usability within budget constraints",
      currentChallenge: "poor mobile experience affecting user satisfaction and conversions",
      urgencyLevel: "high",
      timeConstraint: "limited budget cycle",
      stakeholders: ["mobile_users", "product", "development"],
      successMetrics: ["mobile usability", "mobile conversion", "mobile engagement"],
      businessModel: "ecommerce",
      resourceConstraints: ["budget_limited", "no_full_redesign"]
    },
    
    contextRefinementQuestions: [
      "What specific mobile interactions are currently broken?",
      "What percentage of your traffic is mobile?",
      "Which mobile screens have the highest business impact?",
      "Do you have mobile analytics on current user behavior?"
    ],
    
    targetedSolutions: [
      {
        id: "tactical_mobile_optimization",
        title: "Targeted Mobile Fixes for Critical User Journeys",
        recommendation: "Focus mobile improvements on highest-impact screens and interactions, using CSS-first solutions and progressive enhancement to maximize mobile usability within budget constraints.",
        
        problemSpecificGuidance: {
          immediateActions: [
            "Fix touch target sizes for buttons and form elements (minimum 44px)",
            "Optimize critical forms for mobile keyboard and input",
            "Improve mobile navigation with touch-friendly interactions"
          ],
          weekOneImplementation: [
            "Implement mobile-first responsive breakpoints for key screens",
            "Optimize checkout/conversion flow for mobile interactions",
            "Add mobile-specific micro-interactions and feedback"
          ],
          strategicChanges: [
            "Build mobile design system for consistent future development",
            "Implement mobile user testing and feedback collection",
            "Create mobile-first development workflow"
          ],
          successMeasurement: [
            "Track mobile conversion rates for optimized flows",
            "Monitor mobile task completion times",
            "Measure mobile user satisfaction scores"
          ]
        },
        
        contextAdaptedImplementation: {
          highUrgency: {
            timeline: "1 week critical fixes",
            minimalChanges: [
              "Touch target size optimization (1 day)",
              "Mobile form input improvements (2 days)",
              "Navigation touch interaction fixes (2 days)"
            ],
            riskMitigation: [
              "Test changes on multiple mobile devices and browsers",
              "Monitor mobile analytics for negative impacts",
              "Prepare rollback plan for critical mobile flows"
            ]
          },
          normalTimeline: {
            timeline: "3-4 weeks comprehensive mobile optimization",
            comprehensiveChanges: [
              "Complete responsive redesign of critical screens",
              "Mobile design system implementation",
              "Advanced mobile interactions and animations",
              "Mobile user testing integration"
            ],
            testingStrategy: [
              "Mobile user testing of optimized flows",
              "Cross-device compatibility testing",
              "Mobile conversion funnel analysis"
            ]
          }
        },
        
        expectedImpact: {
          primaryMetric: "mobile conversion rate",
          range: "25-45% improvement",
          timeline: "within 1 week of critical mobile fixes",
          confidence: "high",
          basedOn: "Mobile optimization research: touch target fixes increase mobile conversion by 20-30%, form optimization adds 15-25% improvement"
        },
        
        stakeholderCommunication: {
          executiveSummary: "Targeted mobile optimization can significantly improve mobile conversion within budget constraints while building foundation for future mobile excellence",
          technicalRequirements: "Moderate development effort: responsive CSS updates, mobile interaction improvements, touch optimization",
          designRationale: "Focuses on highest-impact mobile usability issues first, creating immediate user experience improvements while establishing mobile-first development practices"
        }
      }
    ]
  },

  // STAKEHOLDER DEMANDS CATEGORY
  {
    id: "board_presentation_pressure",
    statement: "I need to present UX improvements to the board next week and show concrete business impact",
    category: "stakeholder_demands",
    
    impliedContext: {
      businessGoal: "demonstrate UX business value to board members",
      currentChallenge: "need concrete metrics and improvements for executive presentation",
      urgencyLevel: "critical",
      timeConstraint: "1 week until board presentation",
      stakeholders: ["board_members", "ceo", "investors"],
      successMetrics: ["demonstrable_improvements", "business_impact_metrics", "stakeholder_confidence"],
      businessModel: "saas",
      resourceConstraints: ["presentation_deadline", "executive_visibility"]
    },
    
    contextRefinementQuestions: [
      "What UX metrics do you currently track and present?",
      "What business outcomes is the board most interested in?",
      "Do you have before/after data for any recent UX improvements?",
      "What's the board's current perception of UX investment value?"
    ],
    
    targetedSolutions: [
      {
        id: "executive_ux_metrics_package",
        title: "Executive UX Metrics Dashboard with Business Impact Story",
        recommendation: "Create comprehensive UX metrics dashboard that connects user experience improvements directly to business outcomes, with clear before/after data and projected impact for ongoing initiatives.",
        
        problemSpecificGuidance: {
          immediateActions: [
            "Compile existing UX metrics into executive-friendly dashboard",
            "Calculate business impact of current UX improvements",
            "Create visual before/after comparisons of key improvements"
          ],
          weekOneImplementation: [
            "Build automated UX metrics reporting system",
            "Implement business impact tracking for UX initiatives",
            "Create standardized UX ROI calculation methodology"
          ],
          strategicChanges: [
            "Establish ongoing UX business impact measurement",
            "Create quarterly UX business review process",
            "Build predictive models for UX investment returns"
          ],
          successMeasurement: [
            "Track board engagement with UX metrics presentation",
            "Monitor increased UX investment approval rates",
            "Measure stakeholder confidence in UX business value"
          ]
        },
        
        contextAdaptedImplementation: {
          highUrgency: {
            timeline: "3 days presentation preparation",
            minimalChanges: [
              "Compile existing data into executive dashboard (1 day)",
              "Calculate ROI for recent UX improvements (1 day)",
              "Create presentation narrative connecting UX to business outcomes (1 day)"
            ],
            riskMitigation: [
              "Validate all metrics and calculations with data team",
              "Prepare detailed backup data for potential questions",
              "Practice presentation with internal stakeholders first"
            ]
          },
          normalTimeline: {
            timeline: "2 weeks comprehensive UX metrics system",
            comprehensiveChanges: [
              "Automated UX business impact dashboard",
              "Comprehensive UX ROI measurement system",
              "Predictive analytics for UX investment outcomes",
              "Integration with business intelligence systems"
            ],
            testingStrategy: [
              "Validate metrics accuracy with business outcomes",
              "Test dashboard usability with executive users",
              "Measure impact of UX metrics on investment decisions"
            ]
          }
        },
        
        expectedImpact: {
          primaryMetric: "stakeholder confidence in UX value",
          range: "significant improvement in UX investment approval",
          timeline: "immediately following board presentation",
          confidence: "high",
          basedOn: "Executive communication research: data-driven presentations increase investment approval by 60-80%, business-connected metrics improve stakeholder buy-in"
        },
        
        stakeholderCommunication: {
          executiveSummary: "Executive UX dashboard demonstrates concrete business value of user experience investments, enabling informed decision-making and strategic UX resource allocation",
          technicalRequirements: "Minimal development effort: data compilation, dashboard creation, metrics automation",
          designRationale: "Translates user experience improvements into business language and metrics that resonate with executive stakeholders and support continued UX investment"
        }
      }
    ]
  },

  {
    id: "immediate_roi_pressure",
    statement: "Marketing is demanding immediate UX changes to improve campaign conversion but I need to show ROI within 30 days",
    category: "stakeholder_demands",
    
    impliedContext: {
      businessGoal: "improve campaign conversion with measurable ROI within 30 days",
      currentChallenge: "pressure for fast UX improvements with proven business impact",
      urgencyLevel: "high",
      timeConstraint: "30 days to show ROI",
      stakeholders: ["marketing", "campaigns", "management"],
      successMetrics: ["campaign_conversion", "marketing_roi", "landing_page_performance"],
      businessModel: "saas",
      resourceConstraints: ["short_timeline", "roi_pressure"]
    },
    
    contextRefinementQuestions: [
      "Which marketing campaigns need the most conversion improvement?",
      "What's your current landing page conversion rate?",
      "Do you have A/B testing infrastructure in place?",
      "What's the average value of a converted campaign visitor?"
    ],
    
    targetedSolutions: [
      {
        id: "rapid_conversion_optimization",
        title: "High-Impact Landing Page Optimization with Rapid Testing",
        recommendation: "Implement proven conversion optimization tactics on highest-traffic landing pages, with rapid A/B testing to demonstrate measurable ROI within 30-day timeline.",
        
        problemSpecificGuidance: {
          immediateActions: [
            "Optimize primary CTA button text, color, and positioning",
            "Reduce form fields to absolute minimum required",
            "Add social proof elements above the fold"
          ],
          weekOneImplementation: [
            "Implement A/B testing for all optimization changes",
            "Create urgency and scarcity messaging for campaign offers",
            "Optimize page loading speed for mobile and desktop"
          ],
          strategicChanges: [
            "Build comprehensive conversion optimization system",
            "Implement advanced personalization for campaign traffic",
            "Create systematic testing and optimization workflow"
          ],
          successMeasurement: [
            "Track conversion rate improvement by campaign",
            "Calculate revenue impact of optimization changes",
            "Monitor statistical significance of A/B test results"
          ]
        },
        
        contextAdaptedImplementation: {
          highUrgency: {
            timeline: "1 week implementation",
            minimalChanges: [
              "CTA optimization and testing setup (2 days)",
              "Form field reduction (1 day)",
              "Social proof element addition (2 days)"
            ],
            riskMitigation: [
              "A/B test all changes to measure impact accurately",
              "Monitor campaign performance daily during optimization",
              "Prepare rollback plan for any negative impacts"
            ]
          },
          normalTimeline: {
            timeline: "3 weeks comprehensive optimization",
            comprehensiveChanges: [
              "Complete landing page redesign and optimization",
              "Advanced A/B testing and personalization",
              "Comprehensive conversion funnel optimization",
              "Advanced analytics and attribution modeling"
            ],
            testingStrategy: [
              "Multi-variant testing of optimization combinations",
              "Segmented analysis by traffic source and campaign",
              "Long-term impact measurement on customer quality"
            ]
          }
        },
        
        expectedImpact: {
          primaryMetric: "campaign conversion rate",
          range: "15-35% improvement",
          timeline: "within 2 weeks of optimization implementation",
          confidence: "high",
          basedOn: "Conversion optimization research: CTA optimization increases conversion by 10-25%, form reduction adds 15-30%, social proof adds 8-15%"
        },
        
        stakeholderCommunication: {
          executiveSummary: "Rapid conversion optimization can improve campaign ROI by 15-35% within 30 days, providing measurable business impact while building systematic optimization capabilities",
          technicalRequirements: "Minimal development effort: landing page updates, A/B testing implementation, analytics setup",
          designRationale: "Focuses on proven high-impact optimization tactics with rapid testing to demonstrate ROI quickly while building foundation for ongoing optimization"
        }
      }
    ]
  }
];

/**
 * Get problem statements by category
 */
export const getProblemStatementsByCategory = (category: ProblemStatement['category']): ProblemStatement[] => {
  return problemStatementDatabase.filter(ps => ps.category === category);
};

/**
 * Get problem statements by urgency level
 */
export const getProblemStatementsByUrgency = (urgency: ProblemStatement['impliedContext']['urgencyLevel']): ProblemStatement[] => {
  return problemStatementDatabase.filter(ps => ps.impliedContext.urgencyLevel === urgency);
};

/**
 * Get problem statements by business model
 */
export const getProblemStatementsByBusinessModel = (businessModel: ProblemStatement['impliedContext']['businessModel']): ProblemStatement[] => {
  return problemStatementDatabase.filter(ps => ps.impliedContext.businessModel === businessModel);
};

/**
 * Search problem statements by text
 */
export const searchProblemStatements = (query: string): ProblemStatement[] => {
  const lowercaseQuery = query.toLowerCase();
  return problemStatementDatabase.filter(ps => 
    ps.statement.toLowerCase().includes(lowercaseQuery) ||
    ps.impliedContext.businessGoal.toLowerCase().includes(lowercaseQuery) ||
    ps.impliedContext.currentChallenge.toLowerCase().includes(lowercaseQuery) ||
    ps.targetedSolutions.some(solution => 
      solution.title.toLowerCase().includes(lowercaseQuery) ||
      solution.recommendation.toLowerCase().includes(lowercaseQuery)
    )
  );
};

/**
 * Get problem statements by stakeholder type
 */
export const getProblemStatementsByStakeholder = (stakeholder: string): ProblemStatement[] => {
  return problemStatementDatabase.filter(ps => 
    ps.impliedContext.stakeholders.includes(stakeholder)
  );
};

/**
 * Get high-confidence solutions across all problem statements
 */
export const getHighConfidenceSolutions = (): Solution[] => {
  const allSolutions: Solution[] = [];
  problemStatementDatabase.forEach(ps => {
    allSolutions.push(...ps.targetedSolutions.filter(solution => 
      solution.expectedImpact.confidence === 'high'
    ));
  });
  return allSolutions;
};

/**
 * Get quick implementation solutions (1 week or less)
 */
export const getQuickImplementationSolutions = (): Solution[] => {
  const allSolutions: Solution[] = [];
  problemStatementDatabase.forEach(ps => {
    allSolutions.push(...ps.targetedSolutions.filter(solution => 
      solution.contextAdaptedImplementation.highUrgency.timeline.includes('week') ||
      solution.contextAdaptedImplementation.highUrgency.timeline.includes('day')
    ));
  });
  return allSolutions;
};

export default problemStatementDatabase;