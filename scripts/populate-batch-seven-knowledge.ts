
import { supabase } from '../src/integrations/supabase/client';

export const BATCH_SEVEN_KNOWLEDGE = [
  {
    title: "Medical Device Interface Design",
    content: "FDA compliance requires rigorous usability testing and error prevention in medical device interfaces. Clinical workflow integration must minimize cognitive load while ensuring patient safety. Key principles include: clear visual hierarchy for critical information, redundant confirmation for high-risk actions, contextual help without interrupting workflow, and comprehensive audit trails. Interface design must accommodate various lighting conditions, gloved hands, and high-stress environments while maintaining accessibility standards.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "medical-devices",
    industry_tags: ["healthcare", "medical-devices", "fda-compliance", "patient-safety"],
    complexity_level: "advanced",
    use_cases: ["medical-equipment", "diagnostic-tools", "surgical-interfaces", "monitoring-systems"],
    related_patterns: ["error-prevention", "clinical-workflow", "safety-critical", "regulatory-compliance"],
    freshness_score: 95,
    application_context: {
      regulations: ["FDA 21 CFR Part 820", "IEC 62366", "ISO 14971"],
      usability_testing: "Human factors engineering required",
      error_prevention: "Failure mode analysis mandatory"
    },
    tags: ["medical-device", "fda", "usability", "clinical", "safety"]
  },
  {
    title: "Electronic Health Record UX",
    content: "EHR systems must balance comprehensive data presentation with clinical efficiency. Alert fatigue reduction strategies include intelligent filtering, contextual relevance scoring, and customizable notification preferences. Physician workflow optimization involves streamlined documentation, quick access to frequently used functions, and integration with clinical decision support tools. Design patterns should minimize clicks per task, support natural clinical reasoning flow, and provide clear visual indicators for patient status and critical information.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "electronic-records",
    industry_tags: ["healthcare", "ehr", "clinical-workflow", "physician-efficiency"],
    complexity_level: "advanced",
    use_cases: ["clinical-documentation", "patient-charts", "order-entry", "decision-support"],
    related_patterns: ["alert-management", "workflow-optimization", "data-visualization", "clinical-efficiency"],
    freshness_score: 98,
    application_context: {
      meaningful_use: "CMS requirements compliance",
      interoperability: "HL7 FHIR standards",
      clinical_workflow: "Physician efficiency metrics"
    },
    tags: ["ehr", "clinical", "workflow", "documentation", "alerts"]
  },
  {
    title: "Telehealth Platform Design",
    content: "Telehealth platforms require robust video quality optimization with automatic bandwidth adjustment and fallback options. Patient privacy must be maintained through secure connections, waiting rooms, and clear consent workflows. Prescription workflows need integration with pharmacy systems and DEA compliance for controlled substances. Insurance integration should support real-time eligibility verification and co-pay collection. Design considerations include accessibility for elderly patients, multi-device compatibility, and clear audio/video troubleshooting guidance.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "telehealth",
    industry_tags: ["healthcare", "telehealth", "video-conferencing", "remote-care"],
    complexity_level: "advanced",
    use_cases: ["virtual-consultations", "remote-monitoring", "prescription-management", "patient-intake"],
    related_patterns: ["video-optimization", "privacy-protection", "insurance-integration", "accessibility"],
    freshness_score: 99,
    application_context: {
      hipaa_compliance: "End-to-end encryption required",
      state_licensing: "Cross-state practice regulations",
      prescription_authority: "DEA requirements for telehealth"
    },
    tags: ["telehealth", "video", "privacy", "prescriptions", "remote"]
  },
  {
    title: "Mental Health App Interfaces",
    content: "Mental health applications require crisis intervention features with immediate access to emergency resources and crisis hotlines. Mood tracking interfaces should be intuitive and customizable, supporting various mood scales and triggering factors. Therapist communication features need secure messaging, appointment scheduling, and homework assignment tracking. Privacy safeguards must exceed standard requirements, including local data storage options, granular sharing controls, and clear data retention policies. Design should be calming, non-judgmental, and supportive of various mental health conditions.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "mental-health",
    industry_tags: ["healthcare", "mental-health", "crisis-intervention", "mood-tracking"],
    complexity_level: "advanced",
    use_cases: ["mood-tracking", "therapy-support", "crisis-intervention", "self-care"],
    related_patterns: ["crisis-management", "privacy-protection", "supportive-design", "therapeutic-tools"],
    freshness_score: 97,
    application_context: {
      crisis_protocols: "Immediate access to emergency resources",
      privacy_enhanced: "Higher privacy standards required",
      therapeutic_value: "Evidence-based intervention support"
    },
    tags: ["mental-health", "crisis", "therapy", "mood", "privacy"]
  },
  {
    title: "Fitness Platform UX Patterns",
    content: "Fitness platforms should integrate comprehensive workout tracking with social motivation features and progress visualization. Injury prevention measures include proper form guidance, rest day recommendations, and exercise modification suggestions. Social features must balance motivation with privacy, allowing selective sharing and supportive community interactions. Progress visualization should accommodate various fitness goals, from weight loss to strength building. Gamification elements should promote long-term adherence without creating unhealthy competition or exercise addiction.",
    category: "wellness-ux",
    primary_category: "wellness",
    secondary_category: "fitness",
    industry_tags: ["wellness", "fitness", "social-motivation", "injury-prevention"],
    complexity_level: "intermediate",
    use_cases: ["workout-tracking", "progress-monitoring", "social-fitness", "injury-prevention"],
    related_patterns: ["gamification", "social-features", "progress-tracking", "safety-measures"],
    freshness_score: 94,
    application_context: {
      injury_prevention: "Form guidance and rest recommendations",
      social_motivation: "Community features with privacy controls",
      goal_tracking: "Multiple fitness objective support"
    },
    tags: ["fitness", "workout", "social", "progress", "safety"]
  },
  {
    title: "Nutrition Tracking Applications",
    content: "Nutrition apps require efficient food logging through barcode scanning, photo recognition, and extensive food databases. Dietary restriction management should support allergies, medical conditions, and personal preferences with clear labeling and alerts. Professional consultation features need secure communication with registered dietitians and integration with meal planning tools. Macro and micronutrient tracking should provide educational context and actionable insights. Design should promote healthy relationships with food while providing accurate nutritional information.",
    category: "wellness-ux",
    primary_category: "wellness",
    secondary_category: "nutrition",
    industry_tags: ["wellness", "nutrition", "dietary-tracking", "professional-consultation"],
    complexity_level: "intermediate",
    use_cases: ["food-logging", "dietary-restrictions", "meal-planning", "professional-guidance"],
    related_patterns: ["data-input-optimization", "restriction-management", "professional-integration", "educational-content"],
    freshness_score: 96,
    application_context: {
      dietary_restrictions: "Allergy and medical condition support",
      professional_access: "Registered dietitian integration",
      food_database: "Comprehensive nutritional information"
    },
    tags: ["nutrition", "food", "dietary", "tracking", "health"]
  },
  {
    title: "Clinical Trial Management",
    content: "Clinical trial platforms require comprehensive patient recruitment with eligibility screening and informed consent workflows. Data collection must ensure regulatory compliance with FDA Good Clinical Practice guidelines and support various data types including patient-reported outcomes. Protocol adherence monitoring includes medication compliance tracking, visit scheduling, and adverse event reporting. Subject safety features need real-time monitoring, automatic alert systems, and clear escalation procedures. Design must accommodate diverse patient populations and varying technology literacy levels.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "clinical-trials",
    industry_tags: ["healthcare", "clinical-trials", "patient-recruitment", "regulatory-compliance"],
    complexity_level: "advanced",
    use_cases: ["patient-recruitment", "data-collection", "protocol-compliance", "safety-monitoring"],
    related_patterns: ["compliance-management", "data-collection", "patient-safety", "regulatory-adherence"],
    freshness_score: 93,
    application_context: {
      gcp_compliance: "FDA Good Clinical Practice requirements",
      patient_safety: "Real-time monitoring and alerts",
      data_integrity: "Audit trail and validation requirements"
    },
    tags: ["clinical-trials", "recruitment", "compliance", "safety", "data"]
  },
  {
    title: "Medical Imaging Interfaces",
    content: "Medical imaging interfaces require DICOM viewer optimization with high-resolution display capabilities, advanced manipulation tools, and efficient navigation between studies. Annotation tools should support various markup types, measurement capabilities, and collaborative review features. Diagnostic workflows must accommodate radiologist reading patterns, integrate with reporting systems, and provide comparison capabilities across multiple time points. Performance optimization is critical for large image datasets while maintaining diagnostic image quality standards.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "medical-imaging",
    industry_tags: ["healthcare", "medical-imaging", "dicom", "radiology"],
    complexity_level: "advanced",
    use_cases: ["image-viewing", "diagnostic-reporting", "collaboration", "measurement-tools"],
    related_patterns: ["high-performance", "collaboration-tools", "measurement-interface", "diagnostic-workflow"],
    freshness_score: 91,
    application_context: {
      dicom_standards: "Medical imaging data format compliance",
      diagnostic_quality: "High-resolution display requirements",
      radiologist_workflow: "Efficient reading and reporting patterns"
    },
    tags: ["medical-imaging", "dicom", "radiology", "diagnostics", "collaboration"]
  },
  {
    title: "Pharmacy Management Systems",
    content: "Pharmacy systems require streamlined prescription processing with automated drug interaction checking, insurance verification, and inventory management. Patient counseling features should provide drug information, side effect warnings, and administration instructions in accessible formats. Insurance verification must be real-time with prior authorization workflow support and formulary checking. Inventory management includes automated reordering, expiration date tracking, and controlled substance monitoring with DEA compliance features.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "pharmacy",
    industry_tags: ["healthcare", "pharmacy", "prescription-processing", "inventory-management"],
    complexity_level: "advanced",
    use_cases: ["prescription-processing", "patient-counseling", "inventory-tracking", "insurance-verification"],
    related_patterns: ["workflow-automation", "compliance-monitoring", "patient-education", "inventory-optimization"],
    freshness_score: 89,
    application_context: {
      drug_interactions: "Automated safety checking required",
      dea_compliance: "Controlled substance tracking",
      patient_safety: "Counseling and education requirements"
    },
    tags: ["pharmacy", "prescriptions", "inventory", "compliance", "safety"]
  },
  {
    title: "Healthcare Analytics Dashboards",
    content: "Healthcare analytics dashboards must present population health metrics with clear visualization of outcome trends, quality indicators, and cost analysis. Data visualization should accommodate various stakeholder needs from administrators to clinicians, with role-based access and customizable views. Quality indicators require benchmark comparisons, statistical significance testing, and actionable insight generation. Cost analysis features should integrate with revenue cycle management and support value-based care reporting requirements.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "analytics",
    industry_tags: ["healthcare", "analytics", "population-health", "quality-metrics"],
    complexity_level: "advanced",
    use_cases: ["population-health", "quality-reporting", "cost-analysis", "outcome-tracking"],
    related_patterns: ["data-visualization", "role-based-access", "benchmark-comparison", "insight-generation"],
    freshness_score: 92,
    application_context: {
      population_health: "Community health outcome tracking",
      value_based_care: "Quality and cost outcome reporting",
      regulatory_reporting: "CMS and quality measure compliance"
    },
    tags: ["analytics", "population-health", "quality", "outcomes", "reporting"]
  },
  {
    title: "Patient Engagement Platforms",
    content: "Patient engagement platforms require intuitive appointment scheduling with provider availability, automated reminders, and rescheduling capabilities. Medication reminders should be customizable with dosage tracking, refill notifications, and adherence reporting. Care plan tracking must accommodate various chronic conditions with goal setting, progress monitoring, and care team communication. Family involvement features need appropriate privacy controls, shared access permissions, and caregiver-specific interfaces for pediatric and elderly care.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "patient-engagement",
    industry_tags: ["healthcare", "patient-engagement", "care-coordination", "medication-adherence"],
    complexity_level: "intermediate",
    use_cases: ["appointment-management", "medication-tracking", "care-planning", "family-involvement"],
    related_patterns: ["scheduling-optimization", "reminder-systems", "care-coordination", "family-access"],
    freshness_score: 96,
    application_context: {
      medication_adherence: "Tracking and reminder systems",
      care_coordination: "Multi-provider communication",
      family_engagement: "Appropriate privacy and access controls"
    },
    tags: ["patient-engagement", "appointments", "medication", "care-plans", "family"]
  },
  {
    title: "Medical Emergency Systems",
    content: "Emergency medical systems require sophisticated triage algorithms with automated severity assessment and resource allocation optimization. Communication protocols must support multi-agency coordination, real-time status updates, and chain of custody documentation. Documentation workflows need rapid data entry capabilities, voice-to-text integration, and automated report generation for regulatory compliance. Resource tracking includes ambulance dispatch, hospital bed availability, and specialist consultation coordination with real-time updates.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "emergency-systems",
    industry_tags: ["healthcare", "emergency-medicine", "triage", "resource-allocation"],
    complexity_level: "advanced",
    use_cases: ["emergency-triage", "resource-coordination", "communication-protocols", "documentation"],
    related_patterns: ["triage-algorithms", "resource-optimization", "multi-agency-coordination", "rapid-documentation"],
    freshness_score: 88,
    application_context: {
      triage_protocols: "Automated severity assessment",
      resource_coordination: "Real-time availability tracking",
      regulatory_compliance: "Emergency documentation requirements"
    },
    tags: ["emergency", "triage", "coordination", "documentation", "resources"]
  },
  {
    title: "Rehabilitation Therapy Apps",
    content: "Rehabilitation therapy applications require precise exercise prescription with video demonstrations, progression tracking, and modification capabilities for different ability levels. Progress tracking should accommodate various recovery metrics including range of motion, strength measurements, and functional assessments. Therapist supervision features need secure communication, exercise review capabilities, and remote monitoring with alert systems for concerning patterns. Motivation features should support long-term adherence through goal setting, achievement recognition, and peer support networks.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "rehabilitation",
    industry_tags: ["healthcare", "rehabilitation", "physical-therapy", "exercise-prescription"],
    complexity_level: "intermediate",
    use_cases: ["exercise-prescription", "progress-tracking", "therapist-supervision", "patient-motivation"],
    related_patterns: ["exercise-guidance", "progress-monitoring", "remote-supervision", "motivation-systems"],
    freshness_score: 90,
    application_context: {
      exercise_prescription: "Customized therapy programs",
      progress_monitoring: "Objective outcome measurement",
      therapist_oversight: "Professional supervision and guidance"
    },
    tags: ["rehabilitation", "therapy", "exercise", "progress", "supervision"]
  },
  {
    title: "Healthcare Payment Processing",
    content: "Healthcare payment systems require transparent billing with detailed explanation of benefits, insurance claim processing, and patient responsibility calculation. Payment plan options should accommodate various financial situations with automated payment scheduling and financial hardship considerations. Insurance verification must be real-time with prior authorization support and appeals process management. Financial assistance programs need eligibility screening, application processing, and ongoing qualification monitoring with clear patient communication throughout the process.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "payment-processing",
    industry_tags: ["healthcare", "billing", "insurance", "financial-assistance"],
    complexity_level: "advanced",
    use_cases: ["billing-transparency", "payment-plans", "insurance-processing", "financial-assistance"],
    related_patterns: ["transparent-billing", "flexible-payment", "insurance-integration", "assistance-programs"],
    freshness_score: 87,
    application_context: {
      billing_transparency: "Clear cost breakdown and explanation",
      financial_assistance: "Hardship program management",
      insurance_integration: "Real-time verification and processing"
    },
    tags: ["billing", "payments", "insurance", "financial", "assistance"]
  },
  {
    title: "Medical Research Platforms",
    content: "Medical research platforms require comprehensive data collection with support for various study types, electronic data capture, and real-time validation. Statistical analysis tools should accommodate common research methodologies with automated report generation and publication-ready outputs. Collaboration features need secure data sharing, multi-site coordination, and version control for research protocols. Publication workflows must support manuscript preparation, journal submission requirements, and research data archiving with long-term accessibility standards.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "medical-research",
    industry_tags: ["healthcare", "medical-research", "data-collection", "statistical-analysis"],
    complexity_level: "advanced",
    use_cases: ["data-collection", "statistical-analysis", "research-collaboration", "publication-support"],
    related_patterns: ["data-capture", "analysis-tools", "collaboration-platform", "publication-workflow"],
    freshness_score: 85,
    application_context: {
      data_integrity: "Research-grade data collection and validation",
      collaboration: "Multi-site research coordination",
      publication: "Journal submission and archiving requirements"
    },
    tags: ["research", "data-collection", "analysis", "collaboration", "publication"]
  },
  {
    title: "Healthcare Supply Chain UX",
    content: "Healthcare supply chain systems require comprehensive inventory tracking with automated reordering, expiration date management, and cost optimization algorithms. Procurement workflows should integrate with clinical usage patterns, regulatory compliance requirements, and vendor management systems. Cost optimization features need spend analysis, contract management, and value-based purchasing decision support. Integration with clinical systems ensures supplies are available when needed while minimizing waste and controlling costs through usage pattern analysis.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "supply-chain",
    industry_tags: ["healthcare", "supply-chain", "inventory-management", "cost-optimization"],
    complexity_level: "advanced",
    use_cases: ["inventory-tracking", "procurement-management", "cost-optimization", "clinical-integration"],
    related_patterns: ["inventory-automation", "procurement-workflow", "cost-analysis", "clinical-integration"],
    freshness_score: 83,
    application_context: {
      inventory_management: "Automated tracking and reordering",
      cost_optimization: "Spend analysis and contract management",
      clinical_integration: "Usage pattern alignment"
    },
    tags: ["supply-chain", "inventory", "procurement", "cost", "optimization"]
  },
  {
    title: "Medical Education Interfaces",
    content: "Medical education platforms require immersive simulation training with realistic patient scenarios, assessment tools, and performance tracking. Case study presentations should support multimedia content, interactive decision trees, and outcome analysis. Assessment tools need various question types, adaptive testing capabilities, and competency-based evaluation. Continuing education tracking must accommodate various professional requirements, credit management, and certification maintenance with automated reporting to regulatory bodies.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "medical-education",
    industry_tags: ["healthcare", "medical-education", "simulation-training", "competency-assessment"],
    complexity_level: "advanced",
    use_cases: ["simulation-training", "case-studies", "competency-assessment", "continuing-education"],
    related_patterns: ["simulation-interface", "assessment-tools", "competency-tracking", "education-management"],
    freshness_score: 86,
    application_context: {
      simulation_training: "Realistic patient scenario training",
      competency_assessment: "Skills-based evaluation systems",
      continuing_education: "Professional requirement tracking"
    },
    tags: ["medical-education", "simulation", "assessment", "competency", "training"]
  },
  {
    title: "Healthcare Compliance Management",
    content: "Healthcare compliance systems require comprehensive HIPAA compliance monitoring with audit trail generation, policy management, and training tracking. Risk assessment tools should identify compliance gaps, generate corrective action plans, and monitor remediation progress. Training management must accommodate various roles with customized content, completion tracking, and competency verification. Audit preparation features need document organization, evidence collection, and regulatory reporting capabilities with automated compliance score calculation.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "compliance",
    industry_tags: ["healthcare", "compliance", "hipaa", "risk-management"],
    complexity_level: "advanced",
    use_cases: ["hipaa-compliance", "risk-assessment", "training-management", "audit-preparation"],
    related_patterns: ["compliance-monitoring", "risk-assessment", "training-systems", "audit-management"],
    freshness_score: 84,
    application_context: {
      hipaa_compliance: "Privacy and security requirement management",
      risk_assessment: "Compliance gap identification",
      audit_preparation: "Regulatory readiness management"
    },
    tags: ["compliance", "hipaa", "risk", "training", "audit"]
  },
  {
    title: "Chronic Disease Management",
    content: "Chronic disease management platforms require comprehensive monitoring tools with patient-reported outcomes, vital sign integration, and symptom tracking. Medication adherence features should include automated reminders, side effect reporting, and dosage adjustment communications with healthcare providers. Lifestyle tracking must accommodate diet, exercise, and behavioral factors with educational content and goal-setting capabilities. Caregiver communication features need appropriate access controls, emergency notifications, and care plan coordination with multiple family members and healthcare providers.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "chronic-disease",
    industry_tags: ["healthcare", "chronic-disease", "patient-monitoring", "care-coordination"],
    complexity_level: "intermediate",
    use_cases: ["symptom-monitoring", "medication-adherence", "lifestyle-tracking", "caregiver-coordination"],
    related_patterns: ["monitoring-systems", "adherence-tools", "lifestyle-integration", "caregiver-communication"],
    freshness_score: 94,
    application_context: {
      chronic_care: "Long-term condition management",
      medication_adherence: "Treatment compliance support",
      caregiver_involvement: "Family and professional coordination"
    },
    tags: ["chronic-disease", "monitoring", "adherence", "lifestyle", "caregivers"]
  },
  {
    title: "Healthcare Interoperability UX",
    content: "Healthcare interoperability platforms require seamless data exchange with HL7 FHIR standards compliance, system integration capabilities, and workflow continuity across multiple healthcare systems. Data mapping tools should handle various formats, ensure semantic interoperability, and maintain data integrity during transfers. Workflow integration must accommodate different system capabilities, user authentication across platforms, and consistent user experience despite backend complexity. Standards compliance monitoring ensures ongoing adherence to evolving healthcare data exchange requirements.",
    category: "healthcare-ux",
    primary_category: "healthcare",
    secondary_category: "interoperability",
    industry_tags: ["healthcare", "interoperability", "hl7-fhir", "data-exchange"],
    complexity_level: "advanced",
    use_cases: ["data-exchange", "system-integration", "workflow-continuity", "standards-compliance"],
    related_patterns: ["data-integration", "workflow-unification", "standards-compliance", "seamless-experience"],
    freshness_score: 81,
    application_context: {
      hl7_fhir: "Healthcare data exchange standards",
      interoperability: "Cross-system data sharing",
      workflow_continuity: "Seamless user experience across systems"
    },
    tags: ["interoperability", "hl7", "fhir", "integration", "standards"]
  }
];

export async function populateBatchSevenKnowledge() {
  console.log('🏥 Starting Batch 7: Specialized Healthcare & Wellness Knowledge Population...');
  console.log(`📊 Total entries to process: ${BATCH_SEVEN_KNOWLEDGE.length}`);
  
  let successfullyAdded = 0;
  let errors = 0;
  
  for (const [index, entry] of BATCH_SEVEN_KNOWLEDGE.entries()) {
    try {
      console.log(`🔄 Processing entry ${index + 1}/${BATCH_SEVEN_KNOWLEDGE.length}: ${entry.title}`);
      
      // Check if entry already exists
      const { data: existingEntry, error: checkError } = await supabase
        .from('knowledge_entries')
        .select('id')
        .eq('title', entry.title)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Error checking existing entry for "${entry.title}":`, checkError);
        errors++;
        continue;
      }

      if (existingEntry) {
        console.log(`⏭️  Entry "${entry.title}" already exists, skipping...`);
        continue;
      }

      // Insert the entry
      const { error: insertError } = await supabase
        .from('knowledge_entries')
        .insert({
          title: entry.title,
          content: entry.content,
          category: entry.category,
          primary_category: entry.primary_category,
          secondary_category: entry.secondary_category,
          industry_tags: entry.industry_tags,
          complexity_level: entry.complexity_level,
          use_cases: entry.use_cases,
          related_patterns: entry.related_patterns,
          freshness_score: entry.freshness_score,
          application_context: entry.application_context,
          tags: entry.tags,
          source: 'Batch 7 - Healthcare & Wellness Expansion'
        });

      if (insertError) {
        console.error(`❌ Error inserting "${entry.title}":`, insertError);
        errors++;
      } else {
        console.log(`✅ Successfully added: ${entry.title}`);
        successfullyAdded++;
      }
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Unexpected error processing "${entry.title}":`, error);
      errors++;
    }
  }
  
  console.log('\n🎉 Batch 7 Healthcare & Wellness Knowledge Population Completed!');
  console.log(`✅ Successfully added: ${successfullyAdded} entries`);
  console.log(`❌ Errors encountered: ${errors} entries`);
  console.log(`📈 Success rate: ${((successfullyAdded / BATCH_SEVEN_KNOWLEDGE.length) * 100).toFixed(1)}%`);
  
  return {
    total: BATCH_SEVEN_KNOWLEDGE.length,
    successfullyAdded,
    errors,
    successRate: (successfullyAdded / BATCH_SEVEN_KNOWLEDGE.length) * 100
  };
}
