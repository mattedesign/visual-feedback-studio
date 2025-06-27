
-- Insert UX Analysis Lenses into knowledge_entries table
-- These provide structured frameworks for comprehensive interface analysis

INSERT INTO public.knowledge_entries (title, content, category, industry, element_type, source, tags, metadata) VALUES

-- 1. Cognitive Load Analysis Lens
('Cognitive Load Analysis Lens',
'Systematic evaluation of mental processing demands on users. Intrinsic load: complexity inherent to the task itself. Extraneous load: poor design choices that add unnecessary complexity. Germane load: productive mental effort that builds understanding. Visual complexity measured through element density, color variance, and layout inconsistency. Information architecture clarity assessed via navigation depth, labeling consistency, and mental model alignment.',
'ux-patterns',
'technology',
'analysis-framework',
'Cognitive Load Theory & UX Research',
ARRAY['cognitive-load', 'mental-models', 'information-architecture', 'visual-complexity', 'user-psychology'],
'{"load_types": ["intrinsic", "extraneous", "germane"], "measurement_factors": ["element-density", "color-variance", "layout-consistency"], "assessment_areas": ["navigation-depth", "labeling-consistency", "mental-model-alignment"]}'::jsonb),

-- 2. Accessibility Heuristic Evaluation Lens
('Accessibility Heuristic Evaluation Lens',
'Comprehensive accessibility assessment framework combining WCAG guidelines with usability principles. Perceivable: content must be presentable to users in ways they can perceive (alt text, captions, color contrast). Operable: interface components must be operable (keyboard navigation, no seizure triggers). Understandable: information and UI operation must be understandable (clear language, consistent navigation). Robust: content must be robust enough for various assistive technologies.',
'accessibility',
'technology',
'evaluation-framework',
'WCAG 2.1 Guidelines & Accessibility Research',
ARRAY['wcag', 'perceivable', 'operable', 'understandable', 'robust', 'assistive-technology'],
'{"wcag_principles": ["perceivable", "operable", "understandable", "robust"], "evaluation_areas": ["screen-reader-compatibility", "keyboard-navigation", "color-contrast", "content-structure"], "compliance_levels": ["A", "AA", "AAA"]}'::jsonb),

-- 3. Emotional Journey Mapping Lens
('Emotional Journey Mapping Lens',
'Analysis framework tracking user emotional states throughout interface interactions. Anticipation phase: user expectations and entry emotions. Engagement phase: moment-to-moment emotional responses during task completion. Resolution phase: satisfaction or frustration at task completion. Micro-emotional triggers: specific interface elements that evoke emotional responses. Emotional recovery: how interface helps users recover from negative emotions or errors.',
'ux-patterns',
'design',
'journey-analysis',
'Emotional Design Research & User Experience Psychology',
ARRAY['emotional-design', 'user-journey', 'micro-interactions', 'error-recovery', 'user-satisfaction'],
'{"journey_phases": ["anticipation", "engagement", "resolution"], "emotional_triggers": ["micro-interactions", "feedback-systems", "error-handling"], "recovery_mechanisms": ["clear-error-messages", "undo-functionality", "help-systems"]}'::jsonb),

-- 4. Information Scent Analysis Lens
('Information Scent Analysis Lens',
'Evaluation of information foraging cues that guide user navigation decisions. Strong scent: clear, descriptive labels and visual cues that accurately predict content. Weak scent: vague or misleading navigation elements that cause user confusion. Scent trails: connected pathways that maintain user confidence throughout task flows. Information architecture assessment through card sorting validation and tree testing results.',
'ux-patterns',
'technology',
'information-architecture',
'Information Foraging Theory & IA Research',
ARRAY['information-foraging', 'navigation', 'labels', 'content-strategy', 'findability'],
'{"scent_strength": ["strong", "weak", "misleading"], "assessment_methods": ["card-sorting", "tree-testing", "first-click-testing"], "optimization_strategies": ["descriptive-labels", "breadcrumbs", "related-content"]}'::jsonb),

-- 5. Conversion Funnel Psychology Lens
('Conversion Funnel Psychology Lens',
'Behavioral analysis of user progression through conversion processes. Attention: capturing user focus through visual hierarchy and compelling value propositions. Interest: maintaining engagement through relevant content and social proof. Desire: building motivation through benefit communication and urgency creation. Action: removing friction and providing clear conversion paths. Post-conversion: reinforcing decision and building long-term relationship.',
'conversion',
'marketing',
'conversion-optimization',
'Conversion Psychology & Behavioral Economics Research',
ARRAY['conversion-funnel', 'aida', 'behavioral-economics', 'social-proof', 'friction-reduction'],
'{"funnel_stages": ["attention", "interest", "desire", "action"], "psychological_triggers": ["social-proof", "scarcity", "authority", "reciprocity"], "friction_points": ["form-complexity", "payment-process", "trust-signals"]}'::jsonb),

-- 6. Mobile-First Usability Lens
('Mobile-First Usability Lens',
'Specialized evaluation framework for mobile interface design and usability. Touch interaction design: minimum 44px touch targets, thumb-reach zones, gesture navigation patterns. Performance optimization: loading speed impact on user experience, data usage considerations. Context of use: environmental factors, one-handed usage, interrupted interactions. Progressive enhancement: core functionality on small screens expanding to larger displays.',
'ux-patterns',
'mobile',
'mobile-usability',
'Mobile UX Research & Touch Interface Studies',
ARRAY['mobile-first', 'touch-interaction', 'performance', 'progressive-enhancement', 'thumb-reach'],
'{"touch_requirements": {"min_target_size": "44px", "thumb_zones": ["easy", "hard", "natural"]}, "performance_factors": ["loading-speed", "data-usage", "battery-consumption"], "usage_contexts": ["one-handed", "interrupted", "environmental"]}'::jsonb),

-- 7. Trust and Credibility Assessment Lens
('Trust and Credibility Assessment Lens',
'Framework for evaluating elements that build or undermine user trust. Visual design credibility: professional appearance, consistent branding, quality imagery. Content credibility: accurate information, clear authorship, regular updates. Functional credibility: reliable performance, security indicators, error handling. Social credibility: testimonials, reviews, social proof elements. Institutional credibility: certifications, awards, professional associations.',
'brand',
'business',
'trust-building',
'Trust and Credibility Research & Web Psychology',
ARRAY['trust-building', 'credibility', 'social-proof', 'security', 'professional-appearance'],
'{"credibility_types": ["visual", "content", "functional", "social", "institutional"], "trust_signals": ["testimonials", "security-badges", "contact-information", "professional-imagery"], "trust_breakers": ["broken-links", "outdated-content", "poor-design", "unclear-policies"]}'::jsonb),

-- 8. Data-Driven Interface Analysis Lens
('Data-Driven Interface Analysis Lens',
'Quantitative evaluation framework using analytics and user behavior data. Engagement metrics: time on page, scroll depth, click-through rates, bounce rates. Conversion metrics: funnel completion rates, abandonment points, A/B testing results. Usability metrics: task completion rates, error rates, time to completion. Heat map analysis: attention patterns, click distributions, scroll behavior. User flow analysis: common paths, drop-off points, loop behaviors.',
'ux-patterns',
'technology',
'analytics-framework',
'Web Analytics & User Behavior Research',
ARRAY['analytics', 'metrics', 'heatmaps', 'user-flows', 'ab-testing', 'conversion-tracking'],
'{"engagement_metrics": ["time-on-page", "scroll-depth", "ctr", "bounce-rate"], "conversion_metrics": ["completion-rate", "abandonment-points", "ab-results"], "usability_metrics": ["task-completion", "error-rate", "time-to-completion"], "analysis_tools": ["heatmaps", "user-flows", "session-recordings"]}'::jsonb);
