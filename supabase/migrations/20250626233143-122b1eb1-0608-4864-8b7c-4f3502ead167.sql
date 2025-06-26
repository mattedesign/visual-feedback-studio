
-- First, add the new 'audience-specific' category to the knowledge_entries table
ALTER TABLE public.knowledge_entries 
DROP CONSTRAINT IF EXISTS knowledge_entries_category_check;

ALTER TABLE public.knowledge_entries 
ADD CONSTRAINT knowledge_entries_category_check 
CHECK (category IN ('ux', 'visual', 'accessibility', 'conversion', 'brand', 'ecommerce-patterns', 'ux-research', 'ux-patterns', 'saas-patterns', 'fintech-patterns', 'conversion-research', 'brand-psychology', 'audience-specific'));

-- Insert the 12 audience-specific design intelligence entries
INSERT INTO public.knowledge_entries (title, content, category, industry, element_type, source, tags, metadata) VALUES

-- 1. Product Manager Dashboard Psychology
('Product Manager Dashboard Psychology', 
'Information hierarchy optimized for decision-making: summary metrics at top, drill-down capabilities below. Anomaly detection through color coding (red for issues, yellow for attention, green for good). Daily highlights module showing flagged issues and wins. Plain-language tooltips explaining technical metrics. Time-series emphasis for trend identification. Mobile-responsive for on-the-go decisions.',
'audience-specific',
'technology',
'dashboard-design',
'Product Management UX Research',
ARRAY['product-managers', 'dashboards', 'decision-making', 'anomaly-detection', 'mobile', 'metrics'],
'{"target_audience": "product-managers", "design_patterns": ["information-hierarchy", "anomaly-detection", "mobile-responsive"], "color_coding": {"red": "issues", "yellow": "attention", "green": "good"}, "priority_elements": ["summary-metrics", "daily-highlights", "time-series"]}'::jsonb),

-- 2. Executive Interface Design Patterns
('Executive Interface Design Patterns',
'High-level summaries with option to drill down. Trend visualization over detailed data. Risk indicators prominently displayed with clear severity levels. Revenue and growth metrics prioritized. Time-series charts for strategic planning. Mobile-first design for busy schedules. One-click export for presentations. Status indicators that do not require interpretation.',
'audience-specific',
'business',
'executive-interface',
'Executive UX Research & Business Intelligence',
ARRAY['executives', 'summaries', 'trends', 'risk-indicators', 'mobile-executive', 'revenue'],
'{"target_audience": "executives", "design_principles": ["high-level-summaries", "trend-visualization", "mobile-first"], "key_metrics": ["revenue", "growth", "risk"], "features": ["one-click-export", "drill-down", "status-indicators"]}'::jsonb),

-- 3. Developer Tool UX Patterns
('Developer Tool UX Patterns',
'Code-like interfaces with monospace fonts and syntax highlighting. Dark themes preferred (80% of developers use dark mode). High information density acceptable. Keyboard shortcuts prominently displayed. Documentation integration within interface. Terminal-inspired design patterns. Customizable layouts and themes. Search-first navigation patterns.',
'audience-specific',
'technology',
'developer-tools',
'Developer Experience Research',
ARRAY['developers', 'dark-themes', 'information-density', 'keyboard-shortcuts', 'terminal', 'search'],
'{"target_audience": "developers", "theme_preference": "dark", "usage_stats": {"dark_mode": "80%"}, "design_patterns": ["monospace-fonts", "syntax-highlighting", "terminal-inspired"], "navigation": "search-first", "customization": "high"}'::jsonb),

-- 4. Designer Portfolio Psychology and Visual Storytelling
('Designer Portfolio Psychology and Visual Storytelling',
'Visual-first layouts with large hero images and minimal text. Case study structure: challenge, process, solution, impact. Behind-the-scenes content builds trust and authenticity. Progressive disclosure for detailed project information. Typography as a design element, not just content. Color psychology applied to project categorization. Smooth transitions and micro-interactions. Mobile portfolio optimization for client reviews.',
'audience-specific',
'design',
'portfolio-design',
'Creative Portfolio UX Research',
ARRAY['designers', 'portfolio', 'visual-storytelling', 'case-studies', 'typography', 'micro-interactions'],
'{"target_audience": "designers", "content_structure": ["challenge", "process", "solution", "impact"], "design_elements": ["hero-images", "typography", "color-psychology"], "interaction_patterns": ["progressive-disclosure", "smooth-transitions"], "mobile_optimization": true}'::jsonb),

-- 5. Customer Support Interface Empathy-Driven Design
('Customer Support Interface Empathy-Driven Design',
'Emotion-aware interface design with empathy indicators. Quick access to customer history and context. Sentiment analysis integration for prioritization. Stress-reducing color schemes (blues and greens). Clear escalation paths and supervisor alerts. Knowledge base integration with smart suggestions. Response templates with personalization options. Burnout prevention through workload visualization.',
'audience-specific',
'customer-service',
'support-interface',
'Customer Support UX Research',
ARRAY['customer-support', 'empathy-design', 'sentiment-analysis', 'stress-reduction', 'workload-management', 'personalization'],
'{"target_audience": "customer-support", "emotional_design": ["empathy-indicators", "stress-reducing-colors"], "efficiency_features": ["quick-context", "smart-suggestions", "response-templates"], "wellbeing": ["burnout-prevention", "workload-visualization"]}'::jsonb),

-- 6. Sales Team CRM Optimization Patterns
('Sales Team CRM Optimization Patterns',
'Lead scoring visualization with clear priority indicators. Pipeline stages with drag-and-drop functionality. Activity logging with minimal friction. Contact relationship mapping and history tracking. Revenue forecasting with confidence indicators. Mobile-first for field sales activities. Integration with communication tools. Gamification elements for motivation without overwhelming interface.',
'audience-specific',
'sales',
'crm-interface',
'Sales CRM UX Research',
ARRAY['sales-teams', 'lead-scoring', 'pipeline-management', 'mobile-sales', 'gamification', 'revenue-forecasting'],
'{"target_audience": "sales-teams", "key_features": ["lead-scoring", "pipeline-visualization", "activity-logging"], "mobile_priority": "field-sales", "motivation": ["gamification", "confidence-indicators"], "integrations": ["communication-tools"]}'::jsonb),

-- 7. Marketing Team Analytics Preferences
('Marketing Team Analytics Preferences',
'Campaign performance dashboards with clear ROI metrics. Attribution modeling visualization for multi-touch campaigns. A/B testing results with statistical significance indicators. Audience segmentation with visual representations. Creative performance comparison tools. Social media metrics integration. Automated reporting with customizable schedules. Goal tracking with progress indicators.',
'audience-specific',
'marketing',
'analytics-dashboard',
'Marketing Analytics UX Research',
ARRAY['marketing-teams', 'campaign-performance', 'roi-metrics', 'ab-testing', 'audience-segmentation', 'social-media'],
'{"target_audience": "marketing-teams", "core_metrics": ["roi", "attribution", "performance"], "testing_features": ["ab-testing", "statistical-significance"], "automation": ["automated-reporting", "goal-tracking"], "integrations": ["social-media"]}'::jsonb),

-- 8. HR Interface Design for Employee Experience
('HR Interface Design for Employee Experience',
'Employee journey mapping with milestone tracking. Self-service portal for common HR tasks. Confidential feedback mechanisms with anonymity assurance. Onboarding workflows with progress tracking. Performance review interfaces with 360-degree feedback. Benefits enrollment with decision support tools. Diversity and inclusion metrics dashboard. Employee wellness tracking with privacy controls.',
'audience-specific',
'human-resources',
'hr-interface',
'Human Resources UX Research',
ARRAY['hr-teams', 'employee-journey', 'self-service', 'onboarding', 'performance-reviews', 'benefits-enrollment'],
'{"target_audience": "hr-teams", "employee_focus": ["journey-mapping", "self-service", "onboarding"], "feedback_systems": ["confidential", "360-degree"], "privacy": ["anonymity-assurance", "wellness-privacy"], "decision_support": "benefits-enrollment"}'::jsonb),

-- 9. Finance Team Data Visualization Needs
('Finance Team Data Visualization Needs',
'Financial accuracy with clear data validation indicators. Drill-down capabilities from summary to transaction level. Variance analysis with exception highlighting. Regulatory compliance tracking with audit trails. Budget vs. actual comparisons with variance explanations. Cash flow forecasting with scenario modeling. Automated reconciliation status indicators. Risk assessment visualization with heat maps.',
'audience-specific',
'finance',
'financial-dashboard',
'Finance UX Research',
ARRAY['finance-teams', 'data-accuracy', 'variance-analysis', 'compliance-tracking', 'budget-comparison', 'cash-flow'],
'{"target_audience": "finance-teams", "accuracy_focus": ["data-validation", "audit-trails"], "analysis_tools": ["variance-analysis", "drill-down"], "forecasting": ["cash-flow", "scenario-modeling"], "compliance": ["regulatory-tracking", "reconciliation-status"]}'::jsonb),

-- 10. Content Creator Tool Design Patterns
('Content Creator Tool Design Patterns',
'Inspiration-driven interfaces with mood boards and visual galleries. Collaborative features with real-time editing and comments. Asset management with tagging and search capabilities. Version control with visual diff comparison. Publishing workflows with approval processes. Analytics integration for content performance. Creator-friendly pricing displays. Community features for feedback and networking.',
'audience-specific',
'content-creation',
'creator-tools',
'Content Creator UX Research',
ARRAY['content-creators', 'collaboration', 'asset-management', 'version-control', 'publishing-workflow', 'community'],
'{"target_audience": "content-creators", "creative_features": ["mood-boards", "visual-galleries"], "collaboration": ["real-time-editing", "comments"], "workflow": ["version-control", "approval-processes"], "community": ["feedback", "networking"]}'::jsonb),

-- 11. Educator Interface Design for Learning
('Educator Interface Design for Learning',
'Learning-centered design with clear lesson structure and progress tracking. Student engagement metrics with attention indicators. Assignment management with rubric integration. Accessibility features for diverse learning needs. Gradebook with multiple assessment types. Parent communication tools with progress sharing. Classroom management with behavior tracking. Resource library with curriculum alignment.',
'audience-specific',
'education',
'learning-management',
'Educational UX Research',
ARRAY['educators', 'learning-design', 'student-engagement', 'assignment-management', 'accessibility', 'parent-communication'],
'{"target_audience": "educators", "learning_focus": ["lesson-structure", "progress-tracking"], "engagement": ["attention-indicators", "behavior-tracking"], "assessment": ["rubric-integration", "multiple-types"], "accessibility": "diverse-learning-needs", "communication": "parent-tools"}'::jsonb),

-- 12. Healthcare Professional Workflow Design
('Healthcare Professional Workflow Design',
'Patient safety-first design with error prevention mechanisms. Clinical workflow optimization with time-saving shortcuts. Electronic health record integration with smart data entry. Medication management with interaction warnings. Appointment scheduling with patient history context. Telehealth interface with privacy controls. Compliance tracking with regulatory requirements. Emergency protocols with rapid access features.',
'audience-specific',
'healthcare',
'clinical-interface',
'Healthcare UX Research',
ARRAY['healthcare-professionals', 'patient-safety', 'clinical-workflow', 'ehr-integration', 'medication-management', 'telehealth'],
'{"target_audience": "healthcare-professionals", "safety_focus": ["error-prevention", "patient-safety"], "efficiency": ["workflow-optimization", "time-saving-shortcuts"], "integration": ["ehr", "smart-data-entry"], "compliance": ["regulatory-requirements", "emergency-protocols"], "telehealth": "privacy-controls"}'::jsonb);
