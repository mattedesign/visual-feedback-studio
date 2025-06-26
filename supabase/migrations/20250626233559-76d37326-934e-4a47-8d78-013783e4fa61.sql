
-- First, update the category check constraint to include the new 'emotional-design' category
ALTER TABLE public.knowledge_entries 
DROP CONSTRAINT IF EXISTS knowledge_entries_category_check;

ALTER TABLE public.knowledge_entries 
ADD CONSTRAINT knowledge_entries_category_check 
CHECK (category IN ('ux', 'visual', 'accessibility', 'conversion', 'brand', 'ecommerce-patterns', 'ux-research', 'ux-patterns', 'saas-patterns', 'fintech-patterns', 'conversion-research', 'brand-psychology', 'audience-specific', 'emotional-design'));

-- Insert the 18 emotional design and brand personality entries
INSERT INTO public.knowledge_entries (title, content, category, industry, element_type, source, tags, metadata) VALUES

-- 1. Playful Design Psychology Implementation
('Playful Design Psychology Implementation',
'Rounded fonts create friendliness (Fredoka One for headers, Nunito for body). Micro-interactions add delight: button bounces, hover animations, loading spinners with personality. Color vibrancy through saturated palettes (orange #FF6B35, teal #17A2B8, purple #6F42C1). Illustration style over photography. Copy tone matching with contractions, emoji, exclamation points. Asymmetrical layouts suggest spontaneity.',
'emotional-design',
'design',
'brand-personality',
'Emotional Design Research & Brand Psychology',
ARRAY['playful', 'rounded-fonts', 'micro-interactions', 'vibrancy', 'illustration', 'copy-tone'],
'{"primary_fonts": ["Fredoka One", "Nunito"], "color_palette": {"orange": "#FF6B35", "teal": "#17A2B8", "purple": "#6F42C1"}, "interactions": ["button-bounces", "hover-animations", "personality-spinners"], "layout_style": "asymmetrical", "content_style": "illustration-over-photography"}'::jsonb),

-- 2. Professional Design Psychology Implementation
('Professional Design Psychology Implementation',
'Grid adherence signals organization and reliability. Conservative color palettes (navy #1E3A5F, gray #6C757D, white #FFFFFF). Sans-serif hierarchy (Helvetica, Arial, or Roboto). Minimal ornamentation and decoration. Business photography over illustrations. Formal copy tone without contractions. Symmetrical layouts suggest stability and trustworthiness.',
'emotional-design',
'business',
'brand-personality',
'Professional Design Psychology Research',
ARRAY['professional', 'grid', 'conservative', 'sans-serif', 'business', 'formal', 'symmetrical'],
'{"primary_fonts": ["Helvetica", "Arial", "Roboto"], "color_palette": {"navy": "#1E3A5F", "gray": "#6C757D", "white": "#FFFFFF"}, "layout_principles": ["grid-adherence", "symmetrical"], "content_style": "business-photography", "copy_tone": "formal-no-contractions"}'::jsonb),

-- 3. Trustworthy Design Pattern Implementation
('Trustworthy Design Pattern Implementation',
'Blue color psychology builds trust (#0056B3 for primary actions). Testimonial design with photos and attribution. Certification badges prominently displayed. Contact information visible in header/footer. Transparency through clear pricing, policies, and processes. Security indicators (SSL badges, privacy statements). Consistent branding across all touchpoints.',
'emotional-design',
'business',
'trust-building',
'Trust Design Research & Psychology',
ARRAY['trustworthy', 'blue-psychology', 'testimonials', 'certifications', 'contact', 'transparency', 'security'],
'{"primary_color": "#0056B3", "trust_elements": ["testimonials-with-photos", "certification-badges", "visible-contact"], "transparency_features": ["clear-pricing", "visible-policies"], "security_indicators": ["ssl-badges", "privacy-statements"]}'::jsonb),

-- 4. Innovative Design Psychology Implementation
('Innovative Design Psychology Implementation',
'Asymmetrical layouts break conventions and suggest forward-thinking. Experimental typography mixing serif and sans-serif (Inter with accent fonts like Space Grotesk). Bleeding-edge color combinations (#00D4FF cyan, #FF006E magenta, gradients). CSS animations and transforms create cutting-edge feel. Beta/preview labels embrace experimental nature. Dark mode preference signals tech-forward approach.',
'emotional-design',
'technology',
'innovation-signaling',
'Innovation Design Psychology Research',
ARRAY['innovative', 'asymmetrical', 'experimental', 'bleeding-edge', 'gradients', 'dark-mode', 'beta'],
'{"typography_mix": ["Inter", "Space Grotesk"], "color_palette": {"cyan": "#00D4FF", "magenta": "#FF006E"}, "layout_style": "asymmetrical-convention-breaking", "effects": ["css-animations", "transforms"], "innovation_signals": ["beta-labels", "dark-mode-preference"]}'::jsonb),

-- 5. Calm & Minimal Design Psychology Implementation
('Calm & Minimal Design Psychology Implementation',
'Muted color palettes reduce cognitive load (sage #87A96B, soft gray #F5F5F5, cream #FAF9F6). Abundant whitespace creates breathing room. Simple sans-serif fonts (Source Sans Pro, Open Sans). Single-column layouts minimize decision fatigue. Subtle drop shadows and gentle gradients. Copy written in present tense with short sentences. Meditation and wellness imagery.',
'emotional-design',
'wellness',
'minimal-calm',
'Calm Design Psychology & Wellness UX',
ARRAY['calm', 'minimal', 'muted-palettes', 'whitespace', 'single-column', 'wellness', 'meditation'],
'{"color_palette": {"sage": "#87A96B", "soft_gray": "#F5F5F5", "cream": "#FAF9F6"}, "typography": ["Source Sans Pro", "Open Sans"], "layout_principles": ["abundant-whitespace", "single-column"], "visual_effects": ["subtle-shadows", "gentle-gradients"], "content_style": "wellness-meditation-imagery"}'::jsonb),

-- 6. Energetic Design Psychology Implementation
('Energetic Design Psychology Implementation',
'High-energy color combinations (electric blue #007FFF, vibrant orange #FF4500, lime green #32CD32). Movement through CSS animations, parallax scrolling, and hover effects. Bold, condensed fonts for headers (Oswald, Bebas Neue). Action-oriented copy with power verbs and urgency. Diagonal elements and dynamic angles. Sports and action photography. Fast-loading micro-interactions.',
'emotional-design',
'sports',
'high-energy',
'Energetic Design Psychology Research',
ARRAY['energetic', 'bright-colors', 'movement', 'bold-fonts', 'action-oriented', 'diagonal', 'sports'],
'{"color_palette": {"electric_blue": "#007FFF", "vibrant_orange": "#FF4500", "lime_green": "#32CD32"}, "typography": ["Oswald", "Bebas Neue"], "animation_types": ["css-animations", "parallax-scrolling", "hover-effects"], "layout_elements": ["diagonal-elements", "dynamic-angles"], "content_style": "sports-action-photography"}'::jsonb),

-- 7. Sophisticated Design Pattern Implementation
('Sophisticated Design Pattern Implementation',
'Editorial typography hierarchy with serif fonts (Playfair Display, Georgia) for elegance. Refined color palette (charcoal #36454F, gold #D4AF37, off-white #F8F8FF). Magazine-style layouts with sophisticated grid systems. High-quality photography with professional styling. Thoughtful microcopy and long-form content. Subtle animations that feel purposeful rather than playful.',
'emotional-design',
'luxury',
'editorial-sophistication',
'Sophisticated Design & Editorial Psychology',
ARRAY['sophisticated', 'editorial', 'serif-fonts', 'refined', 'magazine-style', 'high-quality', 'purposeful'],
'{"typography": ["Playfair Display", "Georgia"], "color_palette": {"charcoal": "#36454F", "gold": "#D4AF37", "off_white": "#F8F8FF"}, "layout_style": "magazine-grid-systems", "content_quality": "professional-styling", "animation_approach": "purposeful-not-playful"}'::jsonb),

-- 8. Friendly Design Psychology Implementation
('Friendly Design Psychology Implementation',
'Rounded corners throughout interface suggest approachability. Warm color palette (coral #FF7F7F, peach #FFCBA4, soft yellow #FFF8DC). Handwritten or rounded fonts (Caveat, Quicksand). Conversational copy tone with "you" and "we" language. Smiling faces in photography. Gentle hover states and friendly error messages. Community-focused messaging.',
'emotional-design',
'community',
'approachable-friendly',
'Friendly Design Psychology Research',
ARRAY['friendly', 'rounded-corners', 'warm-colors', 'handwritten-fonts', 'conversational', 'smiling-faces', 'community'],
'{"visual_elements": "rounded-corners-throughout", "color_palette": {"coral": "#FF7F7F", "peach": "#FFCBA4", "soft_yellow": "#FFF8DC"}, "typography": ["Caveat", "Quicksand"], "copy_approach": "conversational-you-we-language", "photography_style": "smiling-faces", "interaction_tone": "gentle-friendly-errors"}'::jsonb),

-- 9. Serious Design Pattern Implementation
('Serious Design Pattern Implementation',
'Angular geometric elements convey authority and precision. Formal color scheme (deep blue #003366, steel gray #708090, black #000000). Corporate fonts (Times New Roman, Helvetica Bold). Structured layouts with clear hierarchy. Professional headshots and business imagery. Formal language without humor. Sharp edges and precise alignment throughout interface.',
'emotional-design',
'corporate',
'authority-precision',
'Serious Design Psychology & Corporate Authority',
ARRAY['serious', 'angular', 'formal', 'corporate-fonts', 'structured', 'professional', 'sharp-edges'],
'{"visual_style": "angular-geometric-elements", "color_palette": {"deep_blue": "#003366", "steel_gray": "#708090", "black": "#000000"}, "typography": ["Times New Roman", "Helvetica Bold"], "layout_approach": "structured-clear-hierarchy", "content_style": "professional-headshots-business", "language_tone": "formal-no-humor"}'::jsonb),

-- 10. Creative Design Psychology Implementation
('Creative Design Psychology Implementation',
'Artistic expression through unconventional layouts and experimental typography. Creative color combinations (magenta #FF1493, turquoise #40E0D0, bright yellow #FFFF00). Mixed media elements combining photos, illustrations, and graphics. Playful interactions that surprise users. Creative industry imagery and artistic photography. Copy that tells stories and evokes emotion.',
'emotional-design',
'creative',
'artistic-expression',
'Creative Design Psychology & Artistic Expression',
ARRAY['creative', 'unconventional', 'experimental', 'artistic', 'mixed-media', 'storytelling', 'emotional'],
'{"layout_approach": "unconventional-experimental", "color_palette": {"magenta": "#FF1493", "turquoise": "#40E0D0", "bright_yellow": "#FFFF00"}, "content_style": "mixed-media-photos-illustrations", "interaction_design": "surprising-playful", "photography_style": "artistic-creative-industry", "copy_strategy": "storytelling-emotion-evoking"}'::jsonb),

-- 11. Reliable Design Pattern Implementation
('Reliable Design Pattern Implementation',
'Consistent design patterns build user confidence. Systematic color usage (blue #1E40AF for primary, gray #6B7280 for secondary). Standard UI patterns and familiar layouts. Clear navigation hierarchy. Dependable fonts (Arial, Helvetica, system fonts). Predictable interactions and standard button placements. Service industry imagery suggesting reliability and consistency.',
'emotional-design',
'service',
'consistency-reliability',
'Reliable Design Psychology & User Confidence',
ARRAY['reliable', 'consistent', 'systematic', 'standard-patterns', 'familiar', 'predictable', 'service'],
'{"design_approach": "consistent-patterns", "color_system": {"primary": "#1E40AF", "secondary": "#6B7280"}, "typography": ["Arial", "Helvetica", "system-fonts"], "layout_style": "familiar-standard-patterns", "interaction_design": "predictable-standard-placements", "imagery_style": "service-industry-reliability"}'::jsonb),

-- 12. Modern Design Psychology Implementation
('Modern Design Psychology Implementation',
'Clean lines and contemporary aesthetics. Modern color palette (electric purple #8B5CF6, bright teal #06B6D4, pure white #FFFFFF). Contemporary fonts (Inter, Poppins, system-ui). Flat design with subtle depth through shadows. Mobile-first responsive approach. Tech-forward imagery and clean product photography. Concise, direct copy without unnecessary words.',
'emotional-design',
'technology',
'contemporary-clean',
'Modern Design Psychology & Contemporary Aesthetics',
ARRAY['modern', 'clean-lines', 'contemporary', 'flat-design', 'mobile-first', 'tech-forward', 'concise'],
'{"visual_style": "clean-lines-contemporary", "color_palette": {"electric_purple": "#8B5CF6", "bright_teal": "#06B6D4", "pure_white": "#FFFFFF"}, "typography": ["Inter", "Poppins", "system-ui"], "design_approach": "flat-with-subtle-depth", "responsive_strategy": "mobile-first", "content_style": "tech-forward-clean-product-photography"}'::jsonb),

-- 13. Traditional Design Pattern Implementation
('Traditional Design Pattern Implementation',
'Classic design elements honoring heritage and established practices. Traditional color palette (burgundy #800020, forest green #228B22, cream #F5F5DC). Serif fonts suggesting tradition (Times, Garamond, Baskerville). Formal layouts with classical proportions. Heritage imagery and traditional photography. Respectful, formal language emphasizing history and experience.',
'emotional-design',
'heritage',
'classical-traditional',
'Traditional Design Psychology & Heritage Values',
ARRAY['traditional', 'classic', 'heritage', 'serif-fonts', 'formal-layouts', 'classical', 'respectful'],
'{"design_philosophy": "classic-heritage-elements", "color_palette": {"burgundy": "#800020", "forest_green": "#228B22", "cream": "#F5F5DC"}, "typography": ["Times", "Garamond", "Baskerville"], "layout_approach": "formal-classical-proportions", "imagery_style": "heritage-traditional-photography", "language_tone": "respectful-formal-history-focused"}'::jsonb),

-- 14. Bold Design Psychology Implementation
('Bold Design Psychology Implementation',
'High contrast design makes strong statements. Bold color combinations (electric red #FF073A, jet black #000000, bright white #FFFFFF). Heavy, impactful fonts (Impact, Bebas Neue, Montserrat Black). Large typography and dramatic scale differences. Strong call-to-action buttons and decisive language. Confident imagery with strong subjects and dramatic lighting.',
'emotional-design',
'marketing',
'high-contrast-impact',
'Bold Design Psychology & Strong Statements',
ARRAY['bold', 'high-contrast', 'impactful', 'heavy-fonts', 'dramatic', 'decisive', 'confident'],
'{"design_strategy": "high-contrast-strong-statements", "color_palette": {"electric_red": "#FF073A", "jet_black": "#000000", "bright_white": "#FFFFFF"}, "typography": ["Impact", "Bebas Neue", "Montserrat Black"], "scale_approach": "large-typography-dramatic-differences", "cta_style": "strong-decisive-language", "imagery_approach": "confident-dramatic-lighting"}'::jsonb),

-- 15. Subtle Design Pattern Implementation
('Subtle Design Pattern Implementation',
'Understated elegance through refined restraint. Muted color palette (dove gray #696969, soft beige #F5F5DC, powder blue #B0E0E6). Elegant, readable fonts (Source Serif Pro, Lato Light). Gentle transitions and minimal effects. Sophisticated imagery with soft lighting. Refined copy that suggests rather than states. Quality over quantity approach to design elements.',
'emotional-design',
'luxury',
'understated-elegance',
'Subtle Design Psychology & Refined Restraint',
ARRAY['subtle', 'understated', 'refined', 'elegant', 'gentle', 'sophisticated', 'quality'],
'{"design_philosophy": "understated-elegance-restraint", "color_palette": {"dove_gray": "#696969", "soft_beige": "#F5F5DC", "powder_blue": "#B0E0E6"}, "typography": ["Source Serif Pro", "Lato Light"], "interaction_design": "gentle-transitions-minimal-effects", "imagery_style": "sophisticated-soft-lighting", "copy_approach": "suggests-rather-than-states"}'::jsonb),

-- 16. Warm Design Psychology Implementation
('Warm Design Psychology Implementation',
'Earth tones create welcoming, comfortable feelings. Warm color palette (terracotta #E2725B, golden yellow #FFD700, warm brown #8B4513). Organic shapes and natural textures. Cozy, rounded fonts (Nunito, Comfortaa). Natural imagery with warm lighting. Conversational, inviting copy tone. Soft shadows and warm gradient overlays throughout interface.',
'emotional-design',
'lifestyle',
'earth-tones-comfort',
'Warm Design Psychology & Comfort Creation',
ARRAY['warm', 'earth-tones', 'welcoming', 'organic-shapes', 'natural', 'cozy', 'inviting'],
'{"emotional_goal": "welcoming-comfortable-feelings", "color_palette": {"terracotta": "#E2725B", "golden_yellow": "#FFD700", "warm_brown": "#8B4513"}, "visual_elements": "organic-shapes-natural-textures", "typography": ["Nunito", "Comfortaa"], "imagery_approach": "natural-warm-lighting", "copy_tone": "conversational-inviting"}'::jsonb),

-- 17. Cool Design Psychology Implementation
('Cool Design Psychology Implementation',
'Cool color temperature creates calm, focused atmosphere. Cool palette (steel blue #4682B4, cool gray #A9A9A9, ice blue #F0F8FF). Clean, minimal fonts (Roboto, Open Sans). Spacious layouts with plenty of breathing room. Technology and urban imagery. Professional, clear communication. Subtle blue-tinted shadows and cool-temperature lighting effects.',
'emotional-design',
'technology',
'cool-calm-focus',
'Cool Design Psychology & Calm Focus',
ARRAY['cool', 'calm-focused', 'minimal', 'spacious', 'technology', 'professional', 'blue-tinted'],
'{"emotional_goal": "calm-focused-atmosphere", "color_palette": {"steel_blue": "#4682B4", "cool_gray": "#A9A9A9", "ice_blue": "#F0F8FF"}, "typography": ["Roboto", "Open Sans"], "layout_approach": "spacious-breathing-room", "imagery_style": "technology-urban", "communication_tone": "professional-clear", "lighting_effects": "blue-tinted-shadows-cool-temperature"}'::jsonb),

-- 18. Luxurious Design Pattern Implementation
('Luxurious Design Pattern Implementation',
'Premium materials and generous spacing signal luxury. Rich color palette (deep gold #B8860B, midnight black #191970, pearl white #F8F8F8). Elegant serif fonts (Didot, Bodoni, Cormorant Garamond). Abundant whitespace and sophisticated layouts. High-end product photography with perfect lighting. Exclusive language and premium messaging. Subtle premium animations and refined micro-interactions.',
'emotional-design',
'luxury',
'premium-materials',
'Luxurious Design Psychology & Premium Signaling',
ARRAY['luxurious', 'premium', 'generous-spacing', 'rich-colors', 'elegant-serif', 'exclusive', 'refined'],
'{"luxury_signals": "premium-materials-generous-spacing", "color_palette": {"deep_gold": "#B8860B", "midnight_black": "#191970", "pearl_white": "#F8F8F8"}, "typography": ["Didot", "Bodoni", "Cormorant Garamond"], "layout_philosophy": "abundant-whitespace-sophisticated", "photography_style": "high-end-perfect-lighting", "messaging_tone": "exclusive-premium", "interaction_design": "subtle-premium-animations-refined-micro-interactions"}'::jsonb);
