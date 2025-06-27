
-- First, update the category check constraint to include the new 'conversion-psychology' category
ALTER TABLE public.knowledge_entries 
DROP CONSTRAINT IF EXISTS knowledge_entries_category_check;

ALTER TABLE public.knowledge_entries 
ADD CONSTRAINT knowledge_entries_category_check 
CHECK (category IN ('ux', 'visual', 'accessibility', 'conversion', 'brand', 'ecommerce-patterns', 'ux-research', 'ux-patterns', 'saas-patterns', 'fintech-patterns', 'conversion-research', 'brand-psychology', 'audience-specific', 'emotional-design', 'conversion-psychology'));

-- Now insert the 10 conversion psychology and behavioral design entries
INSERT INTO public.knowledge_entries (title, content, category, industry, element_type, source, tags, metadata) VALUES

-- 1. Checkout Flow Psychology & Optimization
('Checkout Flow Psychology & Optimization',
'Progress indicators reduce abandonment by 23% (linear progress bars outperform step indicators). Optional fields moved below-the-fold or into collapsible sections. Trust signals near CTA: security badges, guarantees, reviews. Promo code field hidden under "Have a code?" link to prevent searching behavior. Mobile sticky CTA button maintains accessibility. Remove site navigation during checkout to eliminate distractions and create funnel focus. Guest checkout option prominently displayed reduces friction by 45%.',
'conversion-psychology',
'ecommerce',
'checkout-optimization',
'Checkout Psychology Research & UX Analytics',
ARRAY['checkout', 'progress', 'trust-signals', 'mobile-checkout', 'distraction', 'guest-checkout'],
'{"abandonment_reduction": "23%", "guest_checkout_impact": "45%", "progress_bar_type": "linear-outperforms-steps", "trust_signal_placement": "near-CTA", "mobile_optimization": "sticky-button", "navigation_strategy": "remove-during-checkout"}'::jsonb),

-- 2. Pricing Page Psychology & Choice Architecture
('Pricing Page Psychology & Choice Architecture',
'Anchoring effects through premium option placement establishes value perception. Most popular badge on middle tier increases selection by 34% through social proof and decision simplification. Feature highlighting through checkmarks and visual emphasis guides attention. Social proof testimonials near pricing tiers build confidence. Trial emphasis over free plans increases conversion intent. Value-based pricing copy ("Save $200/year" vs "$16.67/month") leverages loss aversion. Annual billing incentives clearly displayed with percentage savings.',
'conversion-psychology',
'saas',
'pricing-strategy',
'Pricing Psychology & Choice Architecture Research',
ARRAY['pricing', 'anchoring', 'choice-architecture', 'social-proof', 'trials', 'value-based'],
'{"popular_badge_impact": "34%", "anchoring_strategy": "premium-placement", "copy_strategy": "value-based-loss-aversion", "social_proof_placement": "near-tiers", "trial_emphasis": "over-free-plans", "billing_incentive": "percentage-savings-display"}'::jsonb),

-- 3. Landing Page Conversion Psychology & Value Proposition Clarity
('Landing Page Conversion Psychology & Value Proposition Clarity',
'Hero section should communicate value within 8 seconds using clarity over creativity. Benefit-focused headlines outperform feature-focused by 28%. Social proof above-the-fold (customer logos, user counts, ratings) builds immediate credibility. Single primary CTA reduces decision paralysis by 42%. Video testimonials increase conversion by 86% when placed prominently. Benefit-oriented bullet points with icons improve comprehension. Pain-point addressing copy connects emotionally before presenting solutions.',
'conversion-psychology',
'marketing',
'landing-page-optimization',
'Landing Page Psychology & Value Proposition Research',
ARRAY['landing-page', 'value-proposition', 'hero-section', 'social-proof', 'decision-paralysis', 'testimonials'],
'{"communication_window": "8-seconds", "benefit_vs_feature_lift": "28%", "single_cta_impact": "42%", "video_testimonial_impact": "86%", "headline_strategy": "benefits-over-features", "social_proof_placement": "above-fold"}'::jsonb),

-- 4. Onboarding Flow Psychology & Motivation Maintenance
('Onboarding Flow Psychology & Motivation Maintenance',
'Progress visualization maintains engagement through completion psychology. Quick wins within first session build momentum and confidence. Feature introduction follows progressive disclosure to prevent overwhelm. Gamification elements (badges, completion percentages) increase engagement by 67%. Empty state guidance provides clear next actions. Celebration moments after key milestones maintain motivation. Optional advanced features prevent cognitive overload. Exit intent detection offers help or simplified paths.',
'conversion-psychology',
'saas',
'onboarding-optimization',
'Onboarding Psychology & User Activation Research',
ARRAY['onboarding', 'progress-visualization', 'quick-wins', 'gamification', 'progressive-disclosure', 'motivation'],
'{"gamification_impact": "67%", "completion_psychology": "progress-visualization", "momentum_strategy": "quick-wins-first-session", "disclosure_approach": "progressive", "motivation_maintenance": "celebration-moments", "overload_prevention": "optional-advanced-features"}'::jsonb),

-- 5. Trust Building Design Patterns for Conversions
('Trust Building Design Patterns for Conversions',
'Security badges increase conversion by 19% when placed near forms and CTAs. Customer testimonials with photos and specific details outperform generic reviews by 56%. Money-back guarantees reduce purchase anxiety and increase trials by 31%. Contact information visibility (phone, address, live chat) builds legitimacy. Industry certifications and awards prominently displayed. "As seen in" media mentions create authority. Real-time user activity ("5 people viewing this") creates urgency without being pushy.',
'conversion-psychology',
'business',
'trust-building',
'Trust Psychology & Conversion Research',
ARRAY['trust-building', 'security-badges', 'testimonials', 'guarantees', 'contact-visibility', 'certifications'],
'{"security_badge_impact": "19%", "photo_testimonial_lift": "56%", "guarantee_trial_increase": "31%", "trust_signals": ["security", "testimonials", "guarantees", "contact", "certifications"], "authority_building": "media-mentions", "urgency_creation": "real-time-activity"}'::jsonb),

-- 6. Form Optimization Psychology Beyond Field Reduction
('Form Optimization Psychology Beyond Field Reduction',
'Multi-step forms increase completion by 35% when progress is shown. Smart field validation provides real-time feedback without frustration. Auto-complete and smart defaults reduce cognitive load. Contextual help tooltips prevent abandonment at difficult fields. Error messages should be constructive, not punitive. Field grouping creates logical flow. Single-column layouts outperform multi-column by 23%. Optional field labeling ("optional" vs required indicators) sets proper expectations.',
'conversion-psychology',
'technology',
'form-optimization',
'Form Psychology & User Experience Research',
ARRAY['form-optimization', 'multi-step', 'validation', 'auto-complete', 'error-messages', 'field-grouping'],
'{"multi_step_improvement": "35%", "layout_preference": "single-column", "single_vs_multi_column": "23%", "validation_approach": "real-time-non-frustrating", "help_strategy": "contextual-tooltips", "error_tone": "constructive-not-punitive"}'::jsonb),

-- 7. CTA Psychology & Action-Oriented Design
('CTA Psychology & Action-Oriented Design',
'Action-oriented CTA copy increases clicks by 49% ("Get My Free Report" vs "Submit"). Color psychology: orange and red create urgency, blue builds trust, green suggests safety. Size and contrast ensure visibility without overwhelming design. Placement follows natural reading patterns (F-pattern for web). Urgency words (limited, exclusive, instant) increase action when authentic. First-person copy ("Start My Trial") outperforms second-person by 38%. White space around CTAs improves focus.',
'conversion-psychology',
'marketing',
'cta-optimization',
'CTA Psychology & Action Design Research',
ARRAY['cta-optimization', 'action-oriented', 'color-psychology', 'urgency', 'first-person', 'white-space'],
'{"action_copy_improvement": "49%", "first_vs_second_person": "38%", "color_psychology": {"orange": "urgency", "red": "urgency", "blue": "trust", "green": "safety"}, "placement_strategy": "f-pattern-reading", "urgency_approach": "authentic-words", "focus_technique": "white-space-around"}'::jsonb),

-- 8. Social Proof Placement & Authenticity Signals
('Social Proof Placement & Authenticity Signals',
'Customer count displays ("Join 50,000+ users") increase signup by 27% when specific and current. Review placement near decision points maximizes impact. Photo testimonials with full names and companies increase credibility by 64%. Real-time social activity creates FOMO without pressure. Industry-specific testimonials resonate stronger than generic praise. Video testimonials convert 85% better than text. Star ratings above 4.0 optimal (perfect 5.0 seems fake). Recent review timestamps maintain relevance.',
'conversion-psychology',
'business',
'social-proof-optimization',
'Social Proof Psychology & Authenticity Research',
ARRAY['social-proof', 'customer-count', 'testimonials', 'reviews', 'authenticity', 'video-testimonials'],
'{"customer_count_impact": "27%", "photo_testimonial_lift": "64%", "video_vs_text": "85%", "optimal_rating": "4.0-4.8", "perfect_rating_perception": "fake", "timestamp_importance": "recent-relevance", "placement_strategy": "near-decision-points"}'::jsonb),

-- 9. Urgency Creation Without Dark Patterns
('Urgency Creation Without Dark Patterns',
'Authentic scarcity (limited stock, enrollment periods) increases conversion by 31% without manipulative tactics. Countdown timers for genuine deadlines create urgency. "Limited spots available" works when truthful and specific. Seasonal offers with clear end dates. Early bird pricing with transparent timelines. Waitlist psychology when capacity truly limited. Time-sensitive bonuses that expire. Progress indicators for limited-time offers show remaining time/spots without pressure tactics.',
'conversion-psychology',
'marketing',
'urgency-optimization',
'Ethical Urgency & Scarcity Psychology Research',
ARRAY['urgency', 'scarcity', 'countdown-timers', 'limited-spots', 'seasonal-offers', 'waitlist'],
'{"authentic_scarcity_impact": "31%", "urgency_tactics": ["limited-stock", "enrollment-periods", "countdown-timers", "limited-spots"], "seasonal_strategy": "clear-end-dates", "waitlist_psychology": "true-capacity-limits", "bonus_approach": "time-sensitive-expiration", "ethical_approach": "no-dark-patterns"}'::jsonb),

-- 10. Mobile Conversion Optimization for Touch Interfaces
('Mobile Conversion Optimization for Touch Interfaces',
'Touch targets minimum 44px for easy tapping. Thumb-friendly navigation zones (bottom third of screen). One-handed operation optimization for common actions. Swipe gestures for form navigation and product browsing. Mobile-specific CTAs: "Tap to Call" buttons. Auto-zoom disabled on form fields prevents user frustration. Sticky elements (CTAs, navigation) maintain accessibility during scroll. Mobile-first checkout with Apple Pay/Google Pay integration. Large, contrasting buttons for primary actions. Simplified mobile forms with mobile keyboards optimized.',
'conversion-psychology',
'mobile',
'touch-interface-optimization',
'Mobile UX & Touch Interface Psychology Research',
ARRAY['mobile-conversion', 'touch-targets', 'thumb-friendly', 'one-handed', 'swipe-gestures', 'mobile-payments'],
'{"min_touch_target": "44px", "optimal_zone": "bottom-third-screen", "operation_focus": "one-handed", "gesture_usage": ["swipe-navigation", "product-browsing"], "mobile_cta": "tap-to-call", "form_optimization": "auto-zoom-disabled", "payment_integration": ["apple-pay", "google-pay"], "button_design": "large-contrasting"}'::jsonb);
