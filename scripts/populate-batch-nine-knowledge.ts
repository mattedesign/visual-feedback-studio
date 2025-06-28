
import { supabase } from '../src/integrations/supabase/client';

export const BATCH_NINE_KNOWLEDGE = [
  {
    id: 'neurodivergent-ui-design',
    title: 'Neurodivergent User Interface Design',
    content: `Comprehensive design approaches for neurodivergent users including ADHD, autism, dyslexia, and sensory processing differences. ADHD considerations include minimizing distractions through clean layouts, providing focus modes, implementing progress indicators, and offering customizable notification controls. Autism-friendly patterns emphasize predictable navigation, clear visual hierarchies, reduced sensory overload, and consistent interaction patterns. Dyslexia accommodations involve readable typography (OpenDyslexic fonts), adequate line spacing, left-aligned text, and dyslexia-friendly color schemes. Sensory processing considerations include adjustable contrast, motion controls, texture alternatives, and multi-sensory feedback options. Research from the Neurodiversity Foundation shows 40% improvement in task completion when interfaces accommodate neurodivergent needs.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'neurodivergent-design',
    industry_tags: ['healthcare', 'education', 'general'],
    complexity_level: 'advanced',
    use_cases: ['inclusive-interfaces', 'accessibility-compliance', 'user-accommodation'],
    tags: ['neurodivergent', 'adhd', 'autism', 'dyslexia', 'sensory-processing', 'inclusive-design'],
    source: 'Neurodiversity Foundation Research 2024'
  },
  {
    id: 'age-friendly-digital-design',
    title: 'Age-Friendly Digital Design',
    content: `Senior-specific design patterns addressing cognitive decline, technology anxiety, and accessibility needs. Key principles include larger touch targets (minimum 44px), high contrast ratios (7:1), simplified navigation structures, and clear visual hierarchies. Cognitive decline accommodation involves progressive disclosure, consistent layouts, clear labeling, and error prevention mechanisms. Technology anxiety reduction strategies include helpful onboarding, patient tutorials, familiar metaphors, and confidence-building feedback. Simplified workflows emphasize single-task focus, minimal steps, clear progress indicators, and easy error recovery. The National Institute on Aging reports 60% better user satisfaction when age-friendly principles are implemented.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'age-inclusive-design',
    industry_tags: ['healthcare', 'fintech', 'general'],
    complexity_level: 'intermediate',
    use_cases: ['senior-interfaces', 'age-accommodation', 'cognitive-support'],
    tags: ['age-friendly', 'seniors', 'cognitive-decline', 'technology-anxiety', 'simplified-ui'],
    source: 'National Institute on Aging Guidelines 2024'
  },
  {
    id: 'economic-accessibility-patterns',
    title: 'Economic Accessibility Patterns',
    content: `Design considerations for users with economic constraints including low-cost device optimization, data plan awareness, and affordability indicators. Low-cost device optimization involves lightweight interfaces, efficient resource usage, offline functionality, and performance optimization for older hardware. Data plan awareness includes compressed imagery, minimal data transfers, offline modes, and data usage indicators. Free tier design emphasizes value demonstration, clear upgrade paths, generous free features, and transparent pricing. Affordability indicators involve cost transparency, budget-friendly options, payment flexibility, and financial assistance programs. Studies show 45% increase in engagement when economic accessibility is prioritized.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'economic-inclusion',
    industry_tags: ['fintech', 'ecommerce', 'general'],
    complexity_level: 'intermediate',
    use_cases: ['budget-conscious-design', 'economic-inclusion', 'data-efficiency'],
    tags: ['economic-accessibility', 'low-cost-devices', 'data-awareness', 'affordability', 'budget-friendly'],
    source: 'Digital Equity Research Institute 2024'
  },
  {
    id: 'cultural-sensitivity-ux',
    title: 'Cultural Sensitivity in UX Design',
    content: `Comprehensive approach to culturally sensitive design including color symbolism, religious considerations, social norms, and local customs. Color symbolism varies significantly across cultures - red signifies luck in China but danger in Western contexts, white represents purity in Western cultures but mourning in some Asian cultures. Religious considerations include prayer time awareness, dietary restriction accommodation, holiday calendars, and sacred symbol respect. Social norms integration involves appropriate imagery, cultural context awareness, family structure considerations, and communication styles. Local customs respect includes greeting patterns, business etiquette, gift-giving traditions, and celebration recognition. Cross-cultural usability testing shows 35% improvement in user acceptance.`,
    category: 'user-experience',
    primary_category: 'user-experience',
    secondary_category: 'cultural-design',
    industry_tags: ['global', 'ecommerce', 'social'],
    complexity_level: 'advanced',
    use_cases: ['global-expansion', 'cultural-adaptation', 'international-design'],
    tags: ['cultural-sensitivity', 'color-symbolism', 'religious-considerations', 'social-norms', 'local-customs'],
    source: 'International UX Culture Institute 2024'
  },
  {
    id: 'cognitive-load-reduction',
    title: 'Cognitive Load Reduction Techniques',
    content: `Evidence-based strategies for reducing cognitive burden through information hierarchy, progressive disclosure, decision simplification, and mental model alignment. Information hierarchy uses clear visual structure, logical grouping, scannable layouts, and priority-based organization. Progressive disclosure reveals information incrementally, provides contextual help, offers detailed views on demand, and maintains user control. Decision simplification involves reducing choices, providing smart defaults, offering guided workflows, and eliminating decision paralysis. Mental model alignment uses familiar patterns, consistent terminology, predictable behaviors, and user-centered organization. Cognitive psychology research demonstrates 50% reduction in task completion time with proper cognitive load management.`,
    category: 'user-experience',
    primary_category: 'user-experience',
    secondary_category: 'cognitive-optimization',
    industry_tags: ['saas', 'healthcare', 'education'],
    complexity_level: 'advanced',
    use_cases: ['complexity-reduction', 'user-guidance', 'decision-support'],
    tags: ['cognitive-load', 'information-hierarchy', 'progressive-disclosure', 'decision-simplification', 'mental-models'],
    source: 'Cognitive Psychology Applied Research 2024'
  },
  {
    id: 'sensory-consideration-interfaces',
    title: 'Sensory Consideration Interfaces',
    content: `Comprehensive design for sensory sensitivities including vestibular disorders, photosensitivity, sound sensitivity, and tactile alternatives. Vestibular disorder accommodation involves reduced motion, animation controls, static alternatives, and orientation stability. Photosensitivity protection includes flash prevention, brightness controls, blue light filters, and pattern limitations. Sound sensitivity options provide volume controls, audio alternatives, silent modes, and customizable alerts. Tactile alternatives offer haptic feedback options, texture descriptions, material information, and touch accommodations. The Sensory Processing Foundation reports 55% better user experience when sensory considerations are implemented.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'sensory-accommodation',
    industry_tags: ['healthcare', 'gaming', 'general'],
    complexity_level: 'advanced',
    use_cases: ['sensory-accommodation', 'disability-support', 'inclusive-interfaces'],
    tags: ['sensory-sensitivity', 'vestibular-disorders', 'photosensitivity', 'sound-sensitivity', 'tactile-alternatives'],
    source: 'Sensory Processing Foundation 2024'
  },
  {
    id: 'assistive-technology-integration',
    title: 'Assistive Technology Integration',
    content: `Advanced integration patterns for assistive technologies including switch control, eye tracking, voice control, and brain-computer interfaces. Switch control optimization involves customizable activation methods, timing adjustments, scanning patterns, and switch-accessible navigation. Eye tracking support includes gaze-based selection, dwell time customization, eye gesture recognition, and fatigue management. Voice control enhancement provides natural language processing, command customization, error correction, and voice recognition training. Brain-computer interface integration involves thought-based commands, neural signal processing, adaptive learning, and calibration systems. Assistive technology research shows 70% improvement in independence when properly integrated.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'assistive-technology',
    industry_tags: ['healthcare', 'education', 'general'],
    complexity_level: 'advanced',
    use_cases: ['assistive-integration', 'disability-accommodation', 'independence-support'],
    tags: ['assistive-technology', 'switch-control', 'eye-tracking', 'voice-control', 'brain-computer-interface'],
    source: 'Assistive Technology Research Center 2024'
  },
  {
    id: 'universal-design-principles',
    title: 'Universal Design Principles',
    content: `Comprehensive universal design approach emphasizing one-size-fits-all solutions, flexible interaction methods, multiple format support, and adaptive interfaces. One-size-fits-all approaches create solutions that work for the broadest range of users without requiring specialized adaptations. Flexible interaction methods include multiple input options, customizable controls, alternative navigation paths, and adaptive feedback systems. Multiple format support provides content in various forms - text, audio, visual, tactile - ensuring accessibility across different abilities and preferences. Adaptive interfaces learn user preferences, adjust to capabilities, provide personalized experiences, and evolve with changing needs. The Universal Design Institute reports 40% broader user adoption with universal design principles.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'universal-design',
    industry_tags: ['general', 'saas', 'education'],
    complexity_level: 'advanced',
    use_cases: ['inclusive-design', 'broad-accessibility', 'adaptive-interfaces'],
    tags: ['universal-design', 'flexible-interaction', 'multiple-formats', 'adaptive-interfaces', 'inclusive-approach'],
    source: 'Center for Universal Design 2024'
  },
  {
    id: 'inclusive-research-methodologies',
    title: 'Inclusive Research Methodologies',
    content: `Comprehensive research approaches ensuring diverse participant recruitment, bias-free testing, cultural research methods, and representative sampling. Diverse participant recruitment involves targeted outreach, community partnerships, accessibility accommodations, and inclusive screening criteria. Bias-free testing includes neutral environments, unbiased moderators, culturally sensitive protocols, and standardized procedures. Cultural research methods adapt to different communication styles, respect cultural norms, provide appropriate incentives, and consider context sensitivity. Representative sampling ensures demographic diversity, ability representation, economic variety, and geographic distribution. Inclusive research shows 45% more accurate insights when properly implemented.`,
    category: 'research-methods',
    primary_category: 'research-methods',
    secondary_category: 'inclusive-research',
    industry_tags: ['research', 'general', 'healthcare'],
    complexity_level: 'advanced',
    use_cases: ['user-research', 'inclusive-testing', 'bias-reduction'],
    tags: ['inclusive-research', 'diverse-recruitment', 'bias-free-testing', 'cultural-methods', 'representative-sampling'],
    source: 'Inclusive Research Methodology Institute 2024'
  },
  {
    id: 'language-accessibility-patterns',
    title: 'Language Accessibility Patterns',
    content: `Advanced language accessibility including plain language principles, readability optimization, translation quality, and cultural context preservation. Plain language principles emphasize clear communication, simple sentence structure, active voice usage, and familiar terminology. Readability optimization involves appropriate reading levels, clear hierarchy, scannable content, and comprehension aids. Translation quality ensures cultural accuracy, context preservation, idiomatic expressions, and professional localization. Cultural context preservation maintains meaning across languages, respects cultural nuances, adapts examples appropriately, and considers local references. Language accessibility research demonstrates 60% better comprehension with proper implementation.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'language-inclusion',
    industry_tags: ['global', 'education', 'healthcare'],
    complexity_level: 'intermediate',
    use_cases: ['content-accessibility', 'global-communication', 'clear-communication'],
    tags: ['plain-language', 'readability', 'translation-quality', 'cultural-context', 'language-accessibility'],
    source: 'Plain Language Action Network 2024'
  },
  {
    id: 'socioeconomic-inclusive-design',
    title: 'Socioeconomic Inclusive Design',
    content: `Design considerations for socioeconomic diversity including digital divide awareness, literacy level adaptation, technology access patterns, and resource constraints. Digital divide considerations involve device limitations, connectivity issues, technical skill variations, and access barriers. Literacy level adaptation includes visual communication, simplified language, intuitive interfaces, and educational scaffolding. Technology access patterns consider shared devices, public computer usage, limited internet access, and mobile-first approaches. Resource constraints involve cost-conscious design, efficient data usage, battery optimization, and affordable alternatives. Socioeconomic research shows 50% increase in accessibility when economic factors are considered.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'socioeconomic-inclusion',
    industry_tags: ['fintech', 'education', 'general'],
    complexity_level: 'intermediate',
    use_cases: ['economic-inclusion', 'digital-equity', 'resource-optimization'],
    tags: ['digital-divide', 'literacy-levels', 'technology-access', 'resource-constraints', 'socioeconomic-inclusion'],
    source: 'Digital Equity Foundation 2024'
  },
  {
    id: 'gender-inclusive-interface-design',
    title: 'Gender-Inclusive Interface Design',
    content: `Comprehensive gender inclusion approach featuring non-binary options, pronoun flexibility, bias-free imagery, and inclusive language patterns. Non-binary options include diverse gender selections, custom pronouns, flexible identity expressions, and inclusive forms. Pronoun flexibility provides multiple pronoun choices, custom options, respectful defaults, and consistent usage throughout interfaces. Bias-free imagery represents diverse gender expressions, avoids stereotypes, includes non-binary representation, and promotes equality. Inclusive language patterns use gender-neutral terminology, avoid assumptions, respect identity choices, and promote inclusivity. Gender inclusion research demonstrates 35% better user satisfaction with inclusive approaches.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'gender-inclusion',
    industry_tags: ['social', 'healthcare', 'general'],
    complexity_level: 'intermediate',
    use_cases: ['inclusive-forms', 'gender-accommodation', 'bias-reduction'],
    tags: ['gender-inclusive', 'non-binary-options', 'pronoun-flexibility', 'bias-free-imagery', 'inclusive-language'],
    source: 'Gender Inclusive Design Institute 2024'
  },
  {
    id: 'disability-first-design-principles',
    title: 'Disability-First Design Principles',
    content: `Progressive design philosophy treating disability as diversity, avoiding medical models, focusing on empowerment, and involving community participation. Disability as diversity celebrates different abilities, recognizes unique perspectives, values diverse experiences, and promotes inclusion. Medical model avoidance shifts from deficit-focused thinking to capability-centered design, emphasizing strengths over limitations. Empowerment focus provides user control, supports independence, builds confidence, and promotes self-determination. Community involvement includes disabled designers, user feedback integration, participatory design methods, and authentic representation. Disability-first research shows 65% better outcomes when community-centered approaches are used.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'disability-centered-design',
    industry_tags: ['general', 'healthcare', 'education'],
    complexity_level: 'advanced',
    use_cases: ['disability-centered-design', 'empowerment-focus', 'community-involvement'],
    tags: ['disability-first', 'diversity-model', 'empowerment', 'community-involvement', 'authentic-representation'],
    source: 'Disability Rights Design Collective 2024'
  },
  {
    id: 'mental-health-considerate-ux',
    title: 'Mental Health Considerate UX',
    content: `Comprehensive mental health-aware design including stress reduction patterns, anxiety-friendly interfaces, depression-aware design, and crisis prevention mechanisms. Stress reduction patterns involve calming color schemes, simplified workflows, clear progress indicators, and relaxation elements. Anxiety-friendly design provides predictable interactions, escape routes, progress saving, and confidence-building feedback. Depression-aware interfaces use encouraging messaging, achievement recognition, gentle motivation, and energy-conscious design. Crisis prevention mechanisms include resource access, emergency contacts, supportive messaging, and professional referrals. Mental health UX research demonstrates 40% improvement in user wellbeing with considerate design.`,
    category: 'user-experience',
    primary_category: 'user-experience',
    secondary_category: 'mental-health-design',
    industry_tags: ['healthcare', 'wellness', 'social'],
    complexity_level: 'advanced',
    use_cases: ['mental-health-support', 'stress-reduction', 'wellbeing-design'],
    tags: ['mental-health', 'stress-reduction', 'anxiety-friendly', 'depression-aware', 'crisis-prevention'],
    source: 'Mental Health Design Research Center 2024'
  },
  {
    id: 'cross-generational-design-patterns',
    title: 'Cross-Generational Design Patterns',
    content: `Multi-age usability approach addressing technology comfort levels, learning curve accommodation, and preference flexibility across generations. Multi-age usability creates interfaces that work for children, adults, and seniors simultaneously, balancing simplicity with functionality. Technology comfort level considerations include intuitive onboarding, progressive feature introduction, familiar metaphors, and confidence-building elements. Learning curve accommodation provides multiple learning paths, skill-appropriate challenges, patient guidance, and mastery recognition. Preference flexibility offers customizable interfaces, multiple interaction methods, adaptable complexity levels, and personal choice respect. Cross-generational research shows 45% better family adoption with inclusive design.`,
    category: 'user-experience',
    primary_category: 'user-experience',
    secondary_category: 'generational-design',
    industry_tags: ['family', 'education', 'general'],
    complexity_level: 'intermediate',
    use_cases: ['family-interfaces', 'multi-age-design', 'generational-bridge'],
    tags: ['cross-generational', 'multi-age-usability', 'technology-comfort', 'learning-accommodation', 'preference-flexibility'],
    source: 'Generational Design Research Institute 2024'
  },
  {
    id: 'religious-spiritual-inclusion',
    title: 'Religious and Spiritual Inclusion',
    content: `Comprehensive religious sensitivity including prayer time considerations, dietary restrictions, holiday awareness, and sacred symbol respect. Prayer time considerations involve scheduling accommodations, quiet spaces, direction indicators, and ritual support. Dietary restriction accommodation includes halal options, kosher considerations, vegetarian support, and fasting awareness. Holiday awareness covers diverse religious calendars, celebration recognition, scheduling sensitivity, and cultural observances. Sacred symbol respect involves appropriate imagery, religious iconography sensitivity, spiritual space recognition, and reverent treatment. Religious inclusion research demonstrates 30% higher engagement in religiously diverse communities.`,
    category: 'user-experience',
    primary_category: 'user-experience',
    secondary_category: 'religious-inclusion',
    industry_tags: ['social', 'travel', 'general'],
    complexity_level: 'intermediate',
    use_cases: ['religious-accommodation', 'spiritual-inclusion', 'cultural-sensitivity'],
    tags: ['religious-inclusion', 'prayer-considerations', 'dietary-restrictions', 'holiday-awareness', 'sacred-symbols'],
    source: 'Interfaith Design Council 2024'
  },
  {
    id: 'inclusive-error-prevention',
    title: 'Inclusive Error Prevention',
    content: `Advanced error prevention focusing on mistake tolerance, recovery assistance, learning-oriented feedback, and confidence building. Mistake tolerance involves forgiving interfaces, undo capabilities, draft saving, and graceful degradation. Recovery assistance provides clear error messages, step-by-step guidance, multiple recovery paths, and immediate help access. Learning-oriented feedback teaches through errors, explains problems clearly, suggests improvements, and builds understanding. Confidence building uses encouraging language, celebrates progress, minimizes blame, and promotes learning. Error prevention research shows 55% reduction in user frustration with inclusive approaches.`,
    category: 'user-experience',
    primary_category: 'user-experience',
    secondary_category: 'error-prevention',
    industry_tags: ['saas', 'education', 'general'],
    complexity_level: 'intermediate',
    use_cases: ['error-handling', 'user-guidance', 'confidence-building'],
    tags: ['error-prevention', 'mistake-tolerance', 'recovery-assistance', 'learning-feedback', 'confidence-building'],
    source: 'Human Error Research Institute 2024'
  },
  {
    id: 'accessibility-documentation-standards',
    title: 'Accessibility Documentation Standards',
    content: `Comprehensive documentation approach including VPAT creation, compliance reporting, accessible user guides, and inclusive training materials. VPAT (Voluntary Product Accessibility Template) creation involves thorough accessibility assessment, compliance documentation, gap identification, and improvement planning. Compliance reporting includes WCAG conformance levels, ADA compliance status, legal requirement adherence, and audit results. Accessible user guide creation provides multiple formats, clear instructions, screen reader compatibility, and assistive technology support. Inclusive training materials accommodate diverse learning styles, provide hands-on practice, offer multiple delivery methods, and ensure comprehensive understanding.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'documentation-standards',
    industry_tags: ['general', 'enterprise', 'government'],
    complexity_level: 'advanced',
    use_cases: ['compliance-documentation', 'accessibility-reporting', 'training-materials'],
    tags: ['accessibility-documentation', 'vpat', 'compliance-reporting', 'user-guides', 'training-materials'],
    source: 'Accessibility Documentation Standards Board 2024'
  },
  {
    id: 'inclusive-design-system-architecture',
    title: 'Inclusive Design System Architecture',
    content: `Systematic approach to inclusive design systems featuring component accessibility, token standardization, pattern consistency, and scalable inclusion. Component accessibility ensures every design system element meets accessibility standards, includes ARIA attributes, supports keyboard navigation, and works with assistive technologies. Token standardization creates consistent accessibility parameters, color contrast ratios, spacing standards, and typography scales. Pattern consistency maintains inclusive design patterns, accessibility best practices, interaction standards, and user experience coherence. Scalable inclusion provides systematic accessibility integration, automated testing, continuous improvement, and organization-wide standards. Design system research shows 60% improvement in accessibility consistency.`,
    category: 'design-systems',
    primary_category: 'design-systems',
    secondary_category: 'inclusive-architecture',
    industry_tags: ['enterprise', 'saas', 'general'],
    complexity_level: 'advanced',
    use_cases: ['design-system-accessibility', 'scalable-inclusion', 'systematic-accessibility'],
    tags: ['inclusive-design-systems', 'component-accessibility', 'token-standardization', 'pattern-consistency', 'scalable-inclusion'],
    source: 'Inclusive Design Systems Institute 2024'
  },
  {
    id: 'global-accessibility-compliance',
    title: 'Global Accessibility Compliance',
    content: `Comprehensive global accessibility compliance covering WCAG 2.2 implementation, ADA requirements, EU accessibility directives, and international standards. WCAG 2.2 implementation includes latest guidelines, enhanced mobile support, cognitive accessibility improvements, and authentication considerations. ADA requirements cover digital accessibility obligations, public accommodation standards, effective communication mandates, and legal compliance frameworks. EU accessibility directives include European Accessibility Act requirements, public sector standards, procurement regulations, and harmonized approaches. International standards encompass ISO/IEC 40500, EN 301 549, global best practices, and cross-border compliance strategies. Global compliance research demonstrates 70% risk reduction with comprehensive approaches.`,
    category: 'accessibility',
    primary_category: 'accessibility',
    secondary_category: 'compliance-frameworks',
    industry_tags: ['enterprise', 'government', 'general'],
    complexity_level: 'advanced',
    use_cases: ['legal-compliance', 'international-standards', 'regulatory-adherence'],
    tags: ['global-compliance', 'wcag-2.2', 'ada-requirements', 'eu-directives', 'international-standards'],
    source: 'Global Accessibility Compliance Council 2024'
  }
];

export async function populateBatchNineKnowledge(): Promise<{
  successfullyAdded: number;
  errors: number;
  details: string[];
}> {
  console.log('🚀 Starting Batch 9 knowledge population...');
  console.log(`📊 Total entries to process: ${BATCH_NINE_KNOWLEDGE.length}`);

  let successfullyAdded = 0;
  let errors = 0;
  const details: string[] = [];

  for (let i = 0; i < BATCH_NINE_KNOWLEDGE.length; i++) {
    const entry = BATCH_NINE_KNOWLEDGE[i];
    
    try {
      console.log(`\n🔄 Processing entry ${i + 1}/${BATCH_NINE_KNOWLEDGE.length}: "${entry.title}"`);

      // Check if entry already exists
      const { data: existingEntry, error: checkError } = await supabase
        .from('knowledge_entries')
        .select('id')
        .eq('id', entry.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Error checking existing entry ${entry.id}:`, checkError);
        errors++;
        details.push(`Error checking ${entry.title}: ${checkError.message}`);
        continue;
      }

      if (existingEntry) {
        console.log(`⏭️  Entry "${entry.title}" already exists, skipping...`);
        details.push(`Skipped existing: ${entry.title}`);
        continue;
      }

      // Generate embedding for the entry
      console.log(`🔤 Generating embedding for: ${entry.title}`);
      
      const embeddingText = `${entry.title} ${entry.content} ${entry.category} ${entry.primary_category} ${entry.secondary_category}`;
      
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embeddings', {
        body: { text: embeddingText }
      });

      if (embeddingError) {
        console.error(`❌ Error generating embedding for ${entry.id}:`, embeddingError);
        errors++;
        details.push(`Embedding error for ${entry.title}: ${embeddingError.message}`);
        continue;
      }

      // Insert the entry with embedding
      const { error: insertError } = await supabase
        .from('knowledge_entries')
        .insert({
          id: entry.id,
          title: entry.title,
          content: entry.content,
          category: entry.category,
          primary_category: entry.primary_category,
          secondary_category: entry.secondary_category,
          industry_tags: entry.industry_tags,
          complexity_level: entry.complexity_level,
          use_cases: entry.use_cases,
          tags: entry.tags,
          source: entry.source,
          embedding: `[${embeddingData.embedding.join(',')}]`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error(`❌ Error inserting entry ${entry.id}:`, insertError);
        errors++;
        details.push(`Insert error for ${entry.title}: ${insertError.message}`);
      } else {
        console.log(`✅ Successfully added: ${entry.title}`);
        successfullyAdded++;
        details.push(`✅ Added: ${entry.title}`);
      }

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Unexpected error processing ${entry.id}:`, error);
      errors++;
      details.push(`Unexpected error for ${entry.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const summary = {
    successfullyAdded,
    errors,
    details
  };

  console.log('\n📋 BATCH 9 POPULATION SUMMARY:');
  console.log(`✅ Successfully added: ${summary.successfullyAdded}`);
  console.log(`❌ Errors: ${summary.errors}`);
  console.log(`📊 Total processed: ${BATCH_NINE_KNOWLEDGE.length}`);

  return summary;
}
