
import { supabase } from '../src/integrations/supabase/client';

export const BATCH_EIGHT_KNOWLEDGE = [
  {
    title: "Mobile-First Banking for Developing Markets",
    content: "Design banking interfaces optimized for emerging markets with USSD integration for feature phones, low-literacy visual interfaces using icons and colors, agent banking workflows for human-assisted transactions, and microfinance UX patterns. Include progressive disclosure, voice guidance options, and simplified navigation flows that work across device capabilities.",
    source: "Emerging Markets Banking UX Research",
    category: "fintech",
    primary_category: "financial_interfaces",
    secondary_category: "mobile_banking",
    industry_tags: ["banking", "emerging_markets", "microfinance", "fintech"],
    complexity_level: "advanced",
    use_cases: ["mobile banking", "agent banking", "microfinance", "USSD interfaces"],
    application_context: {
      deviceTypes: ["feature_phones", "basic_smartphones"],
      connectivity: ["low_bandwidth", "intermittent"],
      literacy: ["low_literacy", "icon_based"],
      accessibility: ["voice_guidance", "high_contrast"]
    },
    tags: ["mobile-first", "ussd", "agent-banking", "microfinance", "low-literacy"]
  },
  {
    title: "Offline-First Application Design",
    content: "Create applications that function seamlessly offline with robust data synchronization, conflict resolution strategies, progressive enhancement patterns, and clear connectivity indicators. Implement local storage optimization, background sync queues, and user feedback for sync status while maintaining data integrity.",
    source: "Offline-First Design Patterns",
    category: "ux",
    primary_category: "architecture_patterns",
    secondary_category: "offline_design",
    industry_tags: ["web_development", "mobile_apps", "emerging_markets"],
    complexity_level: "advanced",
    use_cases: ["offline apps", "data sync", "progressive enhancement", "connectivity handling"],
    application_context: {
      connectivity: ["offline", "intermittent", "low_bandwidth"],
      storage: ["local_storage", "indexed_db", "cache_api"],
      sync: ["background_sync", "conflict_resolution"]
    },
    tags: ["offline-first", "data-sync", "progressive-enhancement", "connectivity"]
  },
  {
    title: "Low-Bandwidth Optimization UX",
    content: "Optimize interfaces for low-bandwidth environments with aggressive image compression, strategic lazy loading, text-heavy content prioritization, and data usage tracking. Include bandwidth-aware content delivery, progressive image loading, and user controls for data consumption management.",
    source: "Low-Bandwidth UX Guidelines",
    category: "performance",
    primary_category: "optimization",
    secondary_category: "bandwidth_optimization",
    industry_tags: ["emerging_markets", "mobile_web", "performance"],
    complexity_level: "intermediate",
    use_cases: ["low bandwidth", "data savings", "mobile optimization", "emerging markets"],
    application_context: {
      bandwidth: ["2g", "3g", "limited_data"],
      optimization: ["image_compression", "lazy_loading", "text_priority"],
      tracking: ["data_usage", "bandwidth_detection"]
    },
    tags: ["low-bandwidth", "optimization", "data-savings", "mobile-web"]
  },
  {
    title: "Multilingual Interface Patterns",
    content: "Design interfaces supporting multiple languages with RTL language support, dynamic text expansion handling, cultural color considerations, and font optimization across scripts. Include locale-aware formatting, cultural adaptation patterns, and efficient font loading strategies for global audiences.",
    source: "Global Localization UX Standards",
    category: "globalization",
    primary_category: "internationalization",
    secondary_category: "multilingual_design",
    industry_tags: ["globalization", "localization", "accessibility"],
    complexity_level: "advanced",
    use_cases: ["multilingual apps", "RTL support", "cultural adaptation", "global products"],
    application_context: {
      languages: ["rtl_support", "text_expansion", "script_variety"],
      cultural: ["color_meanings", "layout_preferences", "content_adaptation"],
      technical: ["font_optimization", "locale_formatting"]
    },
    tags: ["multilingual", "rtl", "internationalization", "cultural-design"]
  },
  {
    title: "Cryptocurrency Adoption Interfaces",
    content: "Design cryptocurrency interfaces focused on user education and security with intuitive wallet onboarding, clear transaction education, comprehensive security awareness training, and regulatory compliance indicators. Include progressive disclosure of complex concepts and trust-building elements for mainstream adoption.",
    source: "Cryptocurrency UX Research",
    category: "fintech",
    primary_category: "cryptocurrency",
    secondary_category: "adoption_interfaces",
    industry_tags: ["cryptocurrency", "blockchain", "fintech", "security"],
    complexity_level: "advanced",
    use_cases: ["crypto wallets", "transaction education", "security training", "adoption"],
    application_context: {
      education: ["progressive_disclosure", "concept_simplification"],
      security: ["private_key_management", "transaction_verification"],
      compliance: ["regulatory_indicators", "risk_warnings"]
    },
    tags: ["cryptocurrency", "wallet-ux", "security-education", "blockchain"]
  },
  {
    title: "Digital Payment Integration",
    content: "Implement comprehensive digital payment systems with QR code payment optimization, NFC interaction patterns, robust transaction verification flows, and multi-layered fraud prevention. Include payment method discovery, transaction status feedback, and security confidence building.",
    source: "Digital Payment System Design",
    category: "fintech",
    primary_category: "payment_systems",
    secondary_category: "digital_payments",
    industry_tags: ["payments", "fintech", "mobile_commerce", "security"],
    complexity_level: "advanced",
    use_cases: ["QR payments", "NFC payments", "fraud prevention", "transaction verification"],
    application_context: {
      payment_methods: ["qr_codes", "nfc", "biometric_auth"],
      security: ["fraud_detection", "transaction_verification"],
      feedback: ["payment_status", "receipt_generation"]
    },
    tags: ["digital-payments", "qr-codes", "nfc", "fraud-prevention"]
  },
  {
    title: "Remittance Service Design",
    content: "Create user-friendly remittance platforms with streamlined cross-border transfer workflows, transparent compliance processes, clear fee structures, and robust recipient verification systems. Include exchange rate transparency, transfer tracking, and cultural considerations for global money transfer services.",
    source: "Remittance Service UX Analysis",
    category: "fintech",
    primary_category: "financial_services",
    secondary_category: "remittances",
    industry_tags: ["remittances", "cross_border", "fintech", "compliance"],
    complexity_level: "advanced",
    use_cases: ["money transfer", "compliance workflows", "recipient verification", "fee transparency"],
    application_context: {
      compliance: ["kyc_verification", "regulatory_requirements"],
      transparency: ["fee_breakdown", "exchange_rates", "transfer_tracking"],
      verification: ["recipient_identity", "transfer_confirmation"]
    },
    tags: ["remittances", "cross-border", "compliance", "transparency"]
  },
  {
    title: "Microfinance Platform UX",
    content: "Design microfinance platforms with simplified credit assessment interfaces, intuitive repayment tracking, group lending coordination tools, and integrated financial literacy education. Include trust-building elements, community features, and progress visualization for financial inclusion goals.",
    source: "Microfinance Digital Platforms",
    category: "fintech",
    primary_category: "financial_inclusion",
    secondary_category: "microfinance",
    industry_tags: ["microfinance", "financial_inclusion", "emerging_markets"],
    complexity_level: "intermediate",
    use_cases: ["credit assessment", "repayment tracking", "group lending", "financial education"],
    application_context: {
      assessment: ["simplified_forms", "alternative_scoring"],
      tracking: ["repayment_schedules", "progress_visualization"],
      community: ["group_features", "peer_support"]
    },
    tags: ["microfinance", "financial-inclusion", "group-lending", "credit-assessment"]
  },
  {
    title: "Agricultural Extension Services",
    content: "Develop agricultural platforms providing farmer education, crop advisory services, weather integration, and market price information. Include visual crop identification, seasonal planning tools, pest management guidance, and connection to agricultural experts and markets.",
    source: "Agricultural Technology UX Research",
    category: "agriculture",
    primary_category: "agricultural_tech",
    secondary_category: "extension_services",
    industry_tags: ["agriculture", "agtech", "farmer_support", "rural_technology"],
    complexity_level: "intermediate",
    use_cases: ["farmer education", "crop advisory", "weather integration", "market information"],
    application_context: {
      education: ["visual_guides", "seasonal_planning", "best_practices"],
      advisory: ["crop_health", "pest_management", "harvest_timing"],
      market: ["price_information", "buyer_connections"]
    },
    tags: ["agriculture", "farmer-education", "crop-advisory", "agtech"]
  },
  {
    title: "Digital Identity Solutions",
    content: "Create secure digital identity systems with biometric enrollment processes, document verification workflows, privacy protection measures, and government integration capabilities. Include user consent management, identity verification levels, and cross-platform compatibility for official identification systems.",
    source: "Digital Identity System Design",
    category: "identity",
    primary_category: "digital_identity",
    secondary_category: "verification_systems",
    industry_tags: ["digital_identity", "government", "security", "privacy"],
    complexity_level: "advanced",
    use_cases: ["biometric enrollment", "document verification", "identity management", "government services"],
    application_context: {
      biometrics: ["fingerprint", "facial_recognition", "iris_scanning"],
      verification: ["document_scanning", "liveness_detection"],
      privacy: ["consent_management", "data_minimization"]
    },
    tags: ["digital-identity", "biometrics", "verification", "privacy"]
  },
  {
    title: "E-Commerce for Emerging Markets",
    content: "Design e-commerce platforms optimized for emerging markets with cash-on-delivery integration, hyperlocal delivery coordination, trust-building mechanisms, and flexible payment options. Include seller verification, product authenticity indicators, and community-based trust systems.",
    source: "Emerging Markets E-Commerce UX",
    category: "e-commerce",
    primary_category: "marketplace_design",
    secondary_category: "emerging_markets",
    industry_tags: ["e_commerce", "emerging_markets", "payments", "logistics"],
    complexity_level: "intermediate",
    use_cases: ["cash on delivery", "hyperlocal delivery", "trust building", "seller verification"],
    application_context: {
      payments: ["cash_on_delivery", "mobile_money", "installments"],
      delivery: ["hyperlocal", "pickup_points", "flexible_scheduling"],
      trust: ["seller_ratings", "product_verification", "community_reviews"]
    },
    tags: ["e-commerce", "emerging-markets", "cash-on-delivery", "trust-systems"]
  },
  {
    title: "Educational Technology for Global South",
    content: "Develop educational platforms for the Global South with offline content delivery, local language support, low-cost device optimization, and teacher training integration. Include adaptive learning paths, community engagement features, and progress tracking that works across connectivity challenges.",
    source: "EdTech Global South Research",
    category: "education",
    primary_category: "educational_technology",
    secondary_category: "global_south",
    industry_tags: ["education", "edtech", "global_south", "accessibility"],
    complexity_level: "intermediate",
    use_cases: ["offline education", "local languages", "teacher training", "adaptive learning"],
    application_context: {
      offline: ["content_caching", "progressive_sync"],
      localization: ["local_languages", "cultural_content"],
      devices: ["low_cost_optimization", "battery_efficiency"]
    },
    tags: ["edtech", "global-south", "offline-education", "local-languages"]
  },
  {
    title: "Healthcare Access Platforms",
    content: "Create healthcare platforms enabling telemedicine for rural areas, health worker interfaces, diagnostic support tools, and supply chain tracking. Include symptom assessment, appointment scheduling, medication management, and integration with local health infrastructure.",
    source: "Rural Healthcare Technology",
    category: "healthcare",
    primary_category: "telemedicine",
    secondary_category: "rural_healthcare",
    industry_tags: ["healthcare", "telemedicine", "rural_health", "diagnostics"],
    complexity_level: "advanced",
    use_cases: ["telemedicine", "health worker tools", "diagnostic support", "supply chain"],
    application_context: {
      telemedicine: ["video_consultation", "symptom_assessment"],
      diagnostics: ["decision_support", "image_analysis"],
      supply_chain: ["inventory_tracking", "distribution_management"]
    },
    tags: ["healthcare", "telemedicine", "rural-health", "diagnostics"]
  },
  {
    title: "Digital Government Services",
    content: "Design citizen-centric digital government platforms with streamlined service delivery, document digitization workflows, corruption reduction mechanisms, and transparency tools. Include multi-channel access, progress tracking, and citizen feedback systems for public service delivery.",
    source: "Digital Government UX Guidelines",
    category: "government",
    primary_category: "digital_government",
    secondary_category: "citizen_services",
    industry_tags: ["government", "public_services", "digitization", "transparency"],
    complexity_level: "advanced",
    use_cases: ["citizen services", "document digitization", "transparency", "service delivery"],
    application_context: {
      services: ["multi_channel", "progress_tracking", "status_updates"],
      transparency: ["process_visibility", "decision_tracking"],
      digitization: ["document_scanning", "workflow_automation"]
    },
    tags: ["digital-government", "citizen-services", "transparency", "digitization"]
  },
  {
    title: "Energy Access Management",
    content: "Develop energy management platforms with solar payment systems, grid monitoring interfaces, usage optimization tools, and community sharing mechanisms. Include pay-as-you-go energy models, consumption tracking, and maintenance scheduling for distributed energy systems.",
    source: "Energy Access Technology Design",
    category: "energy",
    primary_category: "energy_management",
    secondary_category: "access_systems",
    industry_tags: ["energy", "solar", "grid_management", "sustainability"],
    complexity_level: "intermediate",
    use_cases: ["solar payments", "grid monitoring", "usage optimization", "community sharing"],
    application_context: {
      payments: ["pay_as_you_go", "mobile_money_integration"],
      monitoring: ["consumption_tracking", "system_health"],
      sharing: ["community_grids", "peer_to_peer_energy"]
    },
    tags: ["energy-access", "solar-payments", "grid-monitoring", "sustainability"]
  },
  {
    title: "Water and Sanitation Monitoring",
    content: "Create water and sanitation management systems with quality tracking, distribution management, maintenance scheduling, and community reporting features. Include sensor data integration, anomaly detection, and citizen engagement tools for water infrastructure management.",
    source: "Water Management System UX",
    category: "utilities",
    primary_category: "water_management",
    secondary_category: "monitoring_systems",
    industry_tags: ["water", "sanitation", "utilities", "infrastructure"],
    complexity_level: "intermediate",
    use_cases: ["quality tracking", "distribution management", "maintenance", "community reporting"],
    application_context: {
      monitoring: ["sensor_integration", "quality_metrics", "flow_tracking"],
      maintenance: ["predictive_maintenance", "work_order_management"],
      community: ["citizen_reporting", "feedback_systems"]
    },
    tags: ["water-management", "quality-tracking", "maintenance", "community-reporting"]
  },
  {
    title: "Transportation Optimization",
    content: "Design transportation platforms for informal transit with route planning, shared mobility coordination, safety features, and integrated payment systems. Include real-time tracking, capacity management, and community-based safety reporting for urban mobility solutions.",
    source: "Urban Transportation UX Research",
    category: "transportation",
    primary_category: "mobility_platforms",
    secondary_category: "informal_transit",
    industry_tags: ["transportation", "mobility", "urban_planning", "safety"],
    complexity_level: "intermediate",
    use_cases: ["route planning", "shared mobility", "safety features", "payment integration"],
    application_context: {
      planning: ["route_optimization", "multi_modal_planning"],
      safety: ["real_time_tracking", "emergency_features", "community_reporting"],
      payments: ["integrated_payments", "fare_calculation"]
    },
    tags: ["transportation", "route-planning", "shared-mobility", "safety"]
  },
  {
    title: "Digital Marketplace Design",
    content: "Create comprehensive digital marketplaces with streamlined vendor onboarding, efficient product cataloging, robust trust systems, and fair dispute resolution mechanisms. Include seller tools, buyer protection, and community-driven quality assurance for sustainable marketplace ecosystems.",
    source: "Digital Marketplace UX Patterns",
    category: "e-commerce",
    primary_category: "marketplace_platforms",
    secondary_category: "vendor_management",
    industry_tags: ["marketplace", "e_commerce", "vendor_management", "trust_systems"],
    complexity_level: "advanced",
    use_cases: ["vendor onboarding", "product cataloging", "trust systems", "dispute resolution"],
    application_context: {
      onboarding: ["seller_verification", "capability_assessment"],
      cataloging: ["bulk_upload", "category_management", "quality_control"],
      trust: ["rating_systems", "verification_badges", "community_moderation"]
    },
    tags: ["marketplace", "vendor-onboarding", "trust-systems", "dispute-resolution"]
  },
  {
    title: "Financial Inclusion Tools",
    content: "Develop financial inclusion platforms with alternative credit scoring, digital savings groups, insurance microproducts, and integrated financial education. Include behavioral insights, gamification elements, and progressive financial capability building for underserved populations.",
    source: "Financial Inclusion Technology",
    category: "fintech",
    primary_category: "financial_inclusion",
    secondary_category: "alternative_finance",
    industry_tags: ["financial_inclusion", "alternative_credit", "microinsurance", "savings"],
    complexity_level: "advanced",
    use_cases: ["credit scoring", "savings groups", "microinsurance", "financial education"],
    application_context: {
      scoring: ["alternative_data", "behavioral_analysis", "machine_learning"],
      savings: ["group_savings", "goal_setting", "automated_savings"],
      education: ["progressive_learning", "gamification", "practical_exercises"]
    },
    tags: ["financial-inclusion", "alternative-credit", "savings-groups", "microinsurance"]
  },
  {
    title: "Disaster Response Platforms",
    content: "Create comprehensive disaster response systems with emergency communication, resource coordination, evacuation planning, and recovery tracking. Include offline functionality, multi-language support, and integration with emergency services for effective crisis management.",
    source: "Disaster Response Technology",
    category: "emergency",
    primary_category: "disaster_response",
    secondary_category: "crisis_management",
    industry_tags: ["emergency", "disaster_response", "crisis_management", "public_safety"],
    complexity_level: "advanced",
    use_cases: ["emergency communication", "resource coordination", "evacuation planning", "recovery tracking"],
    application_context: {
      communication: ["offline_messaging", "broadcast_alerts", "multi_channel"],
      coordination: ["resource_mapping", "volunteer_management", "logistics"],
      planning: ["evacuation_routes", "shelter_management", "capacity_planning"]
    },
    tags: ["disaster-response", "emergency-communication", "crisis-management", "recovery"]
  }
];

export async function populateBatchEightKnowledge() {
  console.log('🚀 Starting Batch 8 knowledge population (Emerging Markets & Global Patterns)...');
  
  let successfullyAdded = 0;
  let errors = 0;

  for (const entry of BATCH_EIGHT_KNOWLEDGE) {
    try {
      // Check if entry already exists
      const { data: existing, error: checkError } = await supabase
        .from('knowledge_entries')
        .select('id')
        .eq('title', entry.title)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`Error checking existing entry "${entry.title}":`, checkError);
        errors++;
        continue;
      }

      if (existing) {
        console.log(`⏭️  Entry already exists: ${entry.title}`);
        continue;
      }

      const { error } = await supabase
        .from('knowledge_entries')
        .insert(entry);
      
      if (error) {
        console.error(`❌ Error inserting entry "${entry.title}":`, error);
        errors++;
      } else {
        console.log(`✅ Added: ${entry.title}`);
        successfullyAdded++;
      }
    } catch (error) {
      console.error(`❌ Unexpected error with entry "${entry.title}":`, error);
      errors++;
    }
  }
  
  console.log(`🎉 Batch 8 population completed!`);
  console.log(`✅ Successfully added: ${successfullyAdded} entries`);
  console.log(`❌ Errors: ${errors}`);
  
  return { successfullyAdded, errors, total: BATCH_EIGHT_KNOWLEDGE.length };
}
