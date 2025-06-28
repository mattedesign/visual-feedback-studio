
import { supabase } from '../src/integrations/supabase/client';

export const BATCH_FIVE_KNOWLEDGE = [
  // Manufacturing & Industrial UX (12 entries)
  {
    id: 'manufacturing-factory-floor-interface',
    title: 'Factory Floor Interface Design',
    content: 'Design interfaces for manufacturing environments that prioritize real-time machine monitoring, production dashboards, and critical safety alerts. Consider industrial-grade displays, glove-friendly touch interactions, and high-contrast visuals for factory lighting conditions. Integrate with manufacturing execution systems (MES) and ensure compliance with industrial safety standards like OSHA. Include predictive maintenance alerts, production KPIs, and emergency shutdown procedures.',
    category: 'manufacturing',
    primary_category: 'industrial-ux',
    secondary_category: 'factory-operations',
    industry_tags: ['manufacturing', 'industrial', 'factory-automation', 'safety'],
    complexity_level: 'advanced',
    use_cases: ['production-monitoring', 'safety-management', 'equipment-control'],
    related_patterns: ['real-time-dashboards', 'alert-systems', 'industrial-hmi'],
    freshness_score: 0.95,
    application_context: {
      environment: 'industrial',
      users: 'factory-operators',
      constraints: 'safety-critical',
      regulations: ['OSHA', 'ISO-13849']
    }
  },
  {
    id: 'manufacturing-quality-control-ux',
    title: 'Quality Control Management UX',
    content: 'Design quality control interfaces that streamline inspection workflows, defect tracking, and statistical process control (SPC). Implement barcode/QR code scanning, photo capture for defects, and integration with measurement devices. Include real-time SPC charts, trend analysis, and automated alerts for out-of-control conditions. Ensure compliance with quality standards like ISO 9001 and industry-specific regulations. Support both desktop and mobile workflows for shop floor inspections.',
    category: 'manufacturing',
    primary_category: 'quality-management',
    secondary_category: 'inspection-systems',
    industry_tags: ['quality-control', 'manufacturing', 'spc', 'inspection'],
    complexity_level: 'advanced',
    use_cases: ['defect-tracking', 'spc-monitoring', 'inspection-workflows'],
    related_patterns: ['data-collection', 'statistical-dashboards', 'mobile-inspection'],
    freshness_score: 0.92,
    application_context: {
      environment: 'manufacturing',
      users: 'quality-inspectors',
      constraints: 'compliance-critical',
      regulations: ['ISO-9001', 'FDA-CFR-21']
    }
  },
  {
    id: 'manufacturing-supply-chain-visibility',
    title: 'Supply Chain Visibility Dashboards',
    content: 'Create comprehensive supply chain dashboards that provide end-to-end visibility of inventory, supplier performance, and logistics operations. Include real-time tracking of shipments, supplier scorecards, inventory levels across multiple locations, and predictive analytics for demand forecasting. Integrate with ERP systems, EDI transactions, and IoT sensors for container tracking. Support multi-tier supplier management and risk assessment tools.',
    category: 'manufacturing',
    primary_category: 'supply-chain',
    secondary_category: 'logistics-management',
    industry_tags: ['supply-chain', 'logistics', 'inventory', 'erp-integration'],
    complexity_level: 'expert',
    use_cases: ['inventory-tracking', 'supplier-management', 'logistics-optimization'],
    related_patterns: ['real-time-tracking', 'predictive-analytics', 'multi-location-dashboards'],
    freshness_score: 0.88,
    application_context: {
      environment: 'enterprise',
      users: 'supply-chain-managers',
      constraints: 'global-operations',
      regulations: ['customs-compliance', 'trade-regulations']
    }
  },
  {
    id: 'manufacturing-predictive-maintenance',
    title: 'Predictive Maintenance Interfaces',
    content: 'Design predictive maintenance systems that combine IoT sensor data, machine learning algorithms, and maintenance workflows. Display equipment health scores, vibration analysis, temperature trends, and failure probability predictions. Include maintenance scheduling tools, work order generation, and spare parts inventory management. Integrate with CMMS systems and provide mobile access for maintenance technicians. Support multiple maintenance strategies: reactive, preventive, and predictive.',
    category: 'manufacturing',
    primary_category: 'asset-management',
    secondary_category: 'maintenance-systems',
    industry_tags: ['predictive-maintenance', 'iot', 'cmms', 'asset-management'],
    complexity_level: 'expert',
    use_cases: ['equipment-monitoring', 'maintenance-scheduling', 'failure-prediction'],
    related_patterns: ['iot-dashboards', 'ml-insights', 'maintenance-workflows'],
    freshness_score: 0.94,
    application_context: {
      environment: 'industrial',
      users: 'maintenance-technicians',
      constraints: 'uptime-critical',
      regulations: ['equipment-safety-standards']
    }
  },
  {
    id: 'manufacturing-execution-systems',
    title: 'Manufacturing Execution Systems UX',
    content: 'Design MES interfaces that manage work orders, resource allocation, and real-time production tracking. Include production scheduling, labor management, material tracking, and quality data collection. Provide real-time visibility into production status, equipment utilization, and performance metrics. Integrate with ERP systems for seamless data flow and support paperless manufacturing initiatives. Include genealogy tracking for traceability requirements.',
    category: 'manufacturing',
    primary_category: 'production-management',
    secondary_category: 'mes-systems',
    industry_tags: ['mes', 'production-control', 'work-orders', 'traceability'],
    complexity_level: 'expert',
    use_cases: ['production-tracking', 'resource-allocation', 'quality-integration'],
    related_patterns: ['real-time-production', 'resource-management', 'traceability-systems'],
    freshness_score: 0.90,
    application_context: {
      environment: 'manufacturing',
      users: 'production-managers',
      constraints: 'real-time-critical',
      regulations: ['traceability-requirements', 'quality-standards']
    }
  },
  {
    id: 'industrial-iot-control-panels',
    title: 'Industrial IoT Control Panels',
    content: 'Design IoT control interfaces for industrial environments that visualize sensor data, enable remote equipment control, and manage alarm systems. Include real-time data streams, historical trending, alarm prioritization, and automated response systems. Ensure cybersecurity compliance with industrial protocols like OPC-UA and support edge computing architectures. Provide mobile access for remote monitoring and emergency response capabilities.',
    category: 'manufacturing',
    primary_category: 'iot-systems',
    secondary_category: 'industrial-control',
    industry_tags: ['industrial-iot', 'scada', 'remote-control', 'cybersecurity'],
    complexity_level: 'expert',
    use_cases: ['sensor-monitoring', 'remote-control', 'alarm-management'],
    related_patterns: ['iot-dashboards', 'alarm-systems', 'remote-monitoring'],
    freshness_score: 0.96,
    application_context: {
      environment: 'industrial',
      users: 'control-engineers',
      constraints: 'security-critical',
      regulations: ['cybersecurity-frameworks', 'industrial-standards']
    }
  },
  {
    id: 'warehouse-management-ux',
    title: 'Warehouse Management UX',
    content: 'Create warehouse management interfaces that optimize inventory location, pick/pack operations, and shipping coordination. Include barcode scanning, RF gun integration, voice-directed picking, and automated sorting systems. Provide real-time inventory visibility, slotting optimization, and labor management tools. Support multiple warehouse configurations: distribution centers, fulfillment centers, and cross-docking facilities. Include integration with transportation management systems.',
    category: 'manufacturing',
    primary_category: 'warehouse-operations',
    secondary_category: 'inventory-management',
    industry_tags: ['warehouse-management', 'inventory-control', 'logistics', 'automation'],
    complexity_level: 'advanced',
    use_cases: ['inventory-tracking', 'pick-pack-optimization', 'shipping-coordination'],
    related_patterns: ['barcode-scanning', 'voice-picking', 'automated-sorting'],
    freshness_score: 0.89,
    application_context: {
      environment: 'warehouse',
      users: 'warehouse-operators',
      constraints: 'efficiency-critical',
      regulations: ['safety-standards', 'labor-regulations']
    }
  },
  {
    id: 'cad-cam-interface-patterns',
    title: 'CAD/CAM Interface Patterns',
    content: 'Design CAD/CAM interfaces that support 3D modeling, manufacturing process planning, and collaborative design workflows. Include version control systems, design review tools, and manufacturing feasibility analysis. Support parametric modeling, simulation capabilities, and toolpath generation. Integrate with PLM systems and provide cloud-based collaboration for distributed teams. Include specialized tools for different manufacturing processes: machining, 3D printing, and sheet metal fabrication.',
    category: 'manufacturing',
    primary_category: 'design-tools',
    secondary_category: 'engineering-software',
    industry_tags: ['cad-cam', 'plm', '3d-modeling', 'manufacturing-design'],
    complexity_level: 'expert',
    use_cases: ['3d-modeling', 'manufacturing-planning', 'design-collaboration'],
    related_patterns: ['3d-visualization', 'version-control', 'collaborative-design'],
    freshness_score: 0.87,
    application_context: {
      environment: 'engineering',
      users: 'design-engineers',
      constraints: 'precision-critical',
      regulations: ['design-standards', 'manufacturing-specifications']
    }
  },
  {
    id: 'production-planning-dashboards',
    title: 'Production Planning Dashboards',
    content: 'Design production planning interfaces that optimize capacity planning, scheduling, and bottleneck identification. Include finite capacity scheduling, what-if scenario analysis, and resource constraint management. Provide visual scheduling tools like Gantt charts, resource loading graphs, and critical path analysis. Integrate with demand forecasting and support multiple planning horizons: daily, weekly, and monthly. Include exception management and automated rescheduling capabilities.',
    category: 'manufacturing',
    primary_category: 'production-planning',
    secondary_category: 'scheduling-systems',
    industry_tags: ['production-planning', 'capacity-management', 'scheduling', 'optimization'],
    complexity_level: 'expert',
    use_cases: ['capacity-planning', 'schedule-optimization', 'bottleneck-analysis'],
    related_patterns: ['gantt-charts', 'resource-loading', 'scenario-analysis'],
    freshness_score: 0.91,
    application_context: {
      environment: 'manufacturing',
      users: 'production-planners',
      constraints: 'optimization-critical',
      regulations: ['production-standards', 'efficiency-requirements']
    }
  },
  {
    id: 'safety-management-systems',
    title: 'Safety Management Systems UX',
    content: 'Create safety management interfaces that handle incident reporting, training tracking, and compliance monitoring. Include near-miss reporting, accident investigation workflows, and corrective action tracking. Provide safety training management, certification tracking, and competency assessments. Support multiple safety standards: OSHA, ISO 45001, and industry-specific requirements. Include safety audit tools, risk assessment matrices, and emergency response procedures.',
    category: 'manufacturing',
    primary_category: 'safety-management',
    secondary_category: 'compliance-systems',
    industry_tags: ['safety-management', 'osha-compliance', 'incident-reporting', 'training'],
    complexity_level: 'advanced',
    use_cases: ['incident-reporting', 'training-tracking', 'compliance-monitoring'],
    related_patterns: ['incident-workflows', 'training-management', 'compliance-tracking'],
    freshness_score: 0.93,
    application_context: {
      environment: 'industrial',
      users: 'safety-managers',
      constraints: 'compliance-critical',
      regulations: ['OSHA', 'ISO-45001', 'industry-safety-standards']
    }
  },
  {
    id: 'equipment-operator-interfaces',
    title: 'Equipment Operator Interfaces (HMI)',
    content: 'Design human-machine interfaces for industrial equipment that prioritize operator safety, efficiency, and ease of use. Include touch screen optimization for industrial environments, considering glove operation, vibration resistance, and harsh lighting conditions. Implement alarm management hierarchies, process visualization, and intuitive control layouts. Support multiple operator skill levels and provide contextual help systems. Ensure compliance with HMI design standards and ergonomic guidelines.',
    category: 'manufacturing',
    primary_category: 'hmi-design',
    secondary_category: 'operator-interfaces',
    industry_tags: ['hmi', 'operator-interface', 'industrial-design', 'ergonomics'],
    complexity_level: 'advanced',
    use_cases: ['equipment-control', 'process-monitoring', 'operator-guidance'],
    related_patterns: ['touch-optimization', 'alarm-hierarchies', 'process-visualization'],
    freshness_score: 0.88,
    application_context: {
      environment: 'industrial',
      users: 'equipment-operators',
      constraints: 'safety-critical',
      regulations: ['hmi-standards', 'ergonomic-guidelines']
    }
  },
  {
    id: 'manufacturing-analytics-platforms',
    title: 'Manufacturing Analytics Platforms',
    content: 'Design analytics platforms that track Overall Equipment Effectiveness (OEE), cost analysis, and performance benchmarking. Include real-time production metrics, downtime analysis, and quality performance indicators. Provide predictive analytics for demand forecasting, capacity planning, and maintenance optimization. Support multi-plant comparisons, drill-down capabilities, and automated reporting. Integrate with various data sources: MES, ERP, quality systems, and IoT sensors.',
    category: 'manufacturing',
    primary_category: 'manufacturing-analytics',
    secondary_category: 'performance-management',
    industry_tags: ['oee', 'manufacturing-analytics', 'performance-metrics', 'benchmarking'],
    complexity_level: 'expert',
    use_cases: ['oee-tracking', 'cost-analysis', 'performance-benchmarking'],
    related_patterns: ['analytics-dashboards', 'performance-metrics', 'predictive-analytics'],
    freshness_score: 0.92,
    application_context: {
      environment: 'manufacturing',
      users: 'plant-managers',
      constraints: 'data-driven-decisions',
      regulations: ['performance-standards', 'financial-reporting']
    }
  },

  // Agriculture & AgTech (8 entries)
  {
    id: 'farm-management-dashboards',
    title: 'Farm Management Dashboards',
    content: 'Design comprehensive farm management interfaces that integrate crop monitoring, weather data, and equipment tracking. Include field mapping with GPS coordinates, crop health monitoring using satellite imagery and drone data, and weather integration for irrigation and planting decisions. Provide livestock tracking, feed management, and veterinary record keeping. Support multiple farm types: row crops, orchards, livestock, and mixed operations. Include financial tracking and compliance reporting tools.',
    category: 'agriculture',
    primary_category: 'farm-management',
    secondary_category: 'agricultural-operations',
    industry_tags: ['agriculture', 'farm-management', 'crop-monitoring', 'livestock'],
    complexity_level: 'advanced',
    use_cases: ['crop-monitoring', 'weather-integration', 'equipment-tracking'],
    related_patterns: ['gis-mapping', 'weather-dashboards', 'livestock-tracking'],
    freshness_score: 0.94,
    application_context: {
      environment: 'agricultural',
      users: 'farmers',
      constraints: 'weather-dependent',
      regulations: ['agricultural-compliance', 'environmental-regulations']
    }
  },
  {
    id: 'precision-agriculture-interfaces',
    title: 'Precision Agriculture Interfaces',
    content: 'Create precision agriculture systems that support GPS-guided equipment, variable rate application, and detailed field mapping. Include soil sampling integration, yield mapping, and prescription map generation. Support autonomous equipment control, swath guidance, and application rate optimization. Integrate with farm management software and provide real-time field data collection. Include drone integration for crop scouting and aerial imagery analysis.',
    category: 'agriculture',
    primary_category: 'precision-agriculture',
    secondary_category: 'gps-guidance',
    industry_tags: ['precision-agriculture', 'gps-guidance', 'variable-rate', 'field-mapping'],
    complexity_level: 'expert',
    use_cases: ['gps-guidance', 'variable-rate-application', 'field-mapping'],
    related_patterns: ['gps-tracking', 'variable-rate-control', 'precision-mapping'],
    freshness_score: 0.96,
    application_context: {
      environment: 'agricultural',
      users: 'precision-agriculture-specialists',
      constraints: 'gps-dependent',
      regulations: ['pesticide-regulations', 'environmental-protection']
    }
  },
  {
    id: 'livestock-management-ux',
    title: 'Livestock Management UX',
    content: 'Design livestock management systems that track animal health, breeding records, and feed management. Include individual animal identification using RFID tags, health monitoring with wearable sensors, and breeding program management. Provide vaccination scheduling, veterinary record keeping, and regulatory compliance tracking. Support multiple livestock types: cattle, swine, poultry, and sheep. Include feed cost optimization and performance analytics.',
    category: 'agriculture',
    primary_category: 'livestock-management',
    secondary_category: 'animal-health',
    industry_tags: ['livestock', 'animal-health', 'breeding-records', 'feed-management'],
    complexity_level: 'advanced',
    use_cases: ['animal-health-tracking', 'breeding-records', 'feed-management'],
    related_patterns: ['rfid-tracking', 'health-monitoring', 'breeding-management'],
    freshness_score: 0.91,
    application_context: {
      environment: 'agricultural',
      users: 'livestock-managers',
      constraints: 'animal-welfare',
      regulations: ['animal-welfare-standards', 'food-safety-regulations']
    }
  },
  {
    id: 'agricultural-marketplace-design',
    title: 'Agricultural Marketplace Design',
    content: 'Create agricultural marketplace platforms that facilitate commodity trading, price discovery, and contract management. Include real-time commodity pricing, futures contract integration, and quality specification matching. Support both spot market and contract farming arrangements. Provide buyer-seller matching, logistics coordination, and payment processing. Include market analysis tools, price forecasting, and risk management features. Support multiple commodities: grains, livestock, specialty crops.',
    category: 'agriculture',
    primary_category: 'agricultural-trading',
    secondary_category: 'commodity-markets',
    industry_tags: ['agricultural-marketplace', 'commodity-trading', 'price-discovery', 'contracts'],
    complexity_level: 'expert',
    use_cases: ['commodity-trading', 'price-discovery', 'contract-management'],
    related_patterns: ['marketplace-design', 'trading-platforms', 'contract-management'],
    freshness_score: 0.89,
    application_context: {
      environment: 'agricultural',
      users: 'commodity-traders',
      constraints: 'price-volatility',
      regulations: ['commodity-trading-regulations', 'financial-compliance']
    }
  },
  {
    id: 'irrigation-control-systems',
    title: 'Irrigation Control Systems',
    content: 'Design irrigation control interfaces that monitor soil moisture, automate watering schedules, and optimize water usage. Include soil moisture sensor integration, weather-based irrigation scheduling, and water flow monitoring. Support multiple irrigation methods: drip, sprinkler, and flood irrigation. Provide water usage analytics, cost optimization, and regulatory compliance reporting. Include remote monitoring capabilities and emergency shutoff controls.',
    category: 'agriculture',
    primary_category: 'irrigation-management',
    secondary_category: 'water-management',
    industry_tags: ['irrigation', 'water-management', 'soil-moisture', 'automation'],
    complexity_level: 'advanced',
    use_cases: ['soil-moisture-monitoring', 'automated-watering', 'water-optimization'],
    related_patterns: ['sensor-monitoring', 'automated-control', 'water-analytics'],
    freshness_score: 0.93,
    application_context: {
      environment: 'agricultural',
      users: 'irrigation-managers',
      constraints: 'water-conservation',
      regulations: ['water-rights', 'environmental-regulations']
    }
  },
  {
    id: 'crop-planning-rotation-tools',
    title: 'Crop Planning and Rotation Tools',
    content: 'Create crop planning interfaces that support seasonal planning, yield prediction, and sustainability tracking. Include crop rotation planning, soil health monitoring, and nutrient management. Provide planting calendars, harvest scheduling, and field history tracking. Support sustainable agriculture practices, cover crop planning, and organic certification requirements. Include economic analysis tools and market price integration for crop selection optimization.',
    category: 'agriculture',
    primary_category: 'crop-planning',
    secondary_category: 'sustainable-agriculture',
    industry_tags: ['crop-planning', 'crop-rotation', 'yield-prediction', 'sustainability'],
    complexity_level: 'advanced',
    use_cases: ['seasonal-planning', 'yield-prediction', 'sustainability-tracking'],
    related_patterns: ['planning-calendars', 'rotation-scheduling', 'sustainability-metrics'],
    freshness_score: 0.90,
    application_context: {
      environment: 'agricultural',
      users: 'crop-planners',
      constraints: 'seasonal-cycles',
      regulations: ['organic-standards', 'environmental-compliance']
    }
  },
  {
    id: 'agricultural-compliance-reporting',
    title: 'Agricultural Compliance Reporting',
    content: 'Design compliance reporting systems for agricultural operations that track organic certification, pesticide applications, and audit preparation. Include chemical application records, field treatment logs, and buffer zone management. Support multiple certification programs: USDA Organic, GlobalGAP, and Fair Trade. Provide automated reporting generation, audit trail maintenance, and inspector access portals. Include worker safety training records and equipment calibration tracking.',
    category: 'agriculture',
    primary_category: 'agricultural-compliance',
    secondary_category: 'certification-management',
    industry_tags: ['agricultural-compliance', 'organic-certification', 'pesticide-tracking', 'audits'],
    complexity_level: 'advanced',
    use_cases: ['organic-certification', 'pesticide-tracking', 'audit-preparation'],
    related_patterns: ['compliance-tracking', 'audit-systems', 'certification-management'],
    freshness_score: 0.87,
    application_context: {
      environment: 'agricultural',
      users: 'compliance-managers',
      constraints: 'regulatory-compliance',
      regulations: ['USDA-organic', 'pesticide-regulations', 'worker-safety']
    }
  },
  {
    id: 'farm-equipment-fleet-management',
    title: 'Farm Equipment Fleet Management',
    content: 'Create farm equipment management systems that handle maintenance scheduling, GPS tracking, and usage analytics. Include equipment maintenance records, service scheduling, and parts inventory management. Provide fuel consumption tracking, operator performance monitoring, and equipment utilization reports. Support seasonal equipment management and rental coordination. Include integration with equipment telematics and diagnostic systems for predictive maintenance.',
    category: 'agriculture',
    primary_category: 'equipment-management',
    secondary_category: 'fleet-operations',
    industry_tags: ['farm-equipment', 'fleet-management', 'maintenance-scheduling', 'gps-tracking'],
    complexity_level: 'advanced',
    use_cases: ['maintenance-scheduling', 'gps-tracking', 'usage-analytics'],
    related_patterns: ['fleet-tracking', 'maintenance-systems', 'usage-analytics'],
    freshness_score: 0.92,
    application_context: {
      environment: 'agricultural',
      users: 'equipment-managers',
      constraints: 'seasonal-operations',
      regulations: ['equipment-safety', 'operator-licensing']
    }
  },

  // Real Estate & PropTech (10 entries)
  {
    id: 'property-search-discovery-ux',
    title: 'Property Search and Discovery UX',
    content: 'Design property search interfaces that optimize map-based search, filter systems, and virtual tour integration. Include advanced search filters for price, location, property features, and school districts. Provide interactive map views with property clustering, street view integration, and neighborhood information. Support saved searches, price alerts, and comparison tools. Include mortgage calculator integration and affordability analysis. Optimize for both desktop and mobile experiences.',
    category: 'real-estate',
    primary_category: 'property-search',
    secondary_category: 'discovery-systems',
    industry_tags: ['real-estate', 'property-search', 'map-based-search', 'virtual-tours'],
    complexity_level: 'advanced',
    use_cases: ['property-search', 'map-navigation', 'virtual-tours'],
    related_patterns: ['map-based-search', 'filter-systems', 'virtual-navigation'],
    freshness_score: 0.94,
    application_context: {
      environment: 'real-estate',
      users: 'property-buyers',
      constraints: 'mobile-first',
      regulations: ['fair-housing-laws', 'real-estate-disclosure']
    }
  },
  {
    id: 'real-estate-crm-interfaces',
    title: 'Real Estate CRM Interfaces',
    content: 'Create real estate CRM systems that manage lead generation, client communication, and transaction tracking. Include lead scoring, automated follow-up campaigns, and client relationship management. Provide transaction pipeline management, document storage, and commission tracking. Support multiple communication channels: email, SMS, and social media. Include market analysis tools, comparative market analysis (CMA) generation, and client portal access.',
    category: 'real-estate',
    primary_category: 'real-estate-crm',
    secondary_category: 'client-management',
    industry_tags: ['real-estate-crm', 'lead-management', 'transaction-tracking', 'client-communication'],
    complexity_level: 'advanced',
    use_cases: ['lead-management', 'client-communication', 'transaction-tracking'],
    related_patterns: ['crm-systems', 'pipeline-management', 'communication-tools'],
    freshness_score: 0.91,
    application_context: {
      environment: 'real-estate',
      users: 'real-estate-agents',
      constraints: 'relationship-focused',
      regulations: ['real-estate-licensing', 'privacy-laws']
    }
  },
  {
    id: 'property-management-dashboards',
    title: 'Property Management Dashboards',
    content: 'Design property management interfaces that handle tenant communication, maintenance requests, and financial reporting. Include rent collection tracking, lease management, and tenant screening workflows. Provide maintenance request systems, vendor management, and work order tracking. Support multiple property types: residential, commercial, and mixed-use. Include financial reporting, vacancy tracking, and ROI analysis tools.',
    category: 'real-estate',
    primary_category: 'property-management',
    secondary_category: 'tenant-services',
    industry_tags: ['property-management', 'tenant-communication', 'maintenance-requests', 'financial-reporting'],
    complexity_level: 'advanced',
    use_cases: ['tenant-communication', 'maintenance-management', 'financial-tracking'],
    related_patterns: ['tenant-portals', 'maintenance-workflows', 'financial-dashboards'],
    freshness_score: 0.89,
    application_context: {
      environment: 'property-management',
      users: 'property-managers',
      constraints: 'tenant-satisfaction',
      regulations: ['landlord-tenant-laws', 'housing-regulations']
    }
  },
  {
    id: 'commercial-real-estate-platforms',
    title: 'Commercial Real Estate Platforms',
    content: 'Create commercial real estate platforms that support space planning, lease management, and market analytics. Include tenant representation tools, space requirements analysis, and lease negotiation support. Provide market research capabilities, comparable property analysis, and investment analysis tools. Support multiple property types: office, retail, industrial, and mixed-use. Include CAD integration for space planning and 3D visualization tools.',
    category: 'real-estate',
    primary_category: 'commercial-real-estate',
    secondary_category: 'space-planning',
    industry_tags: ['commercial-real-estate', 'space-planning', 'lease-management', 'market-analytics'],
    complexity_level: 'expert',
    use_cases: ['space-planning', 'lease-management', 'market-analysis'],
    related_patterns: ['space-visualization', 'lease-tracking', 'market-dashboards'],
    freshness_score: 0.92,
    application_context: {
      environment: 'commercial-real-estate',
      users: 'commercial-brokers',
      constraints: 'complex-transactions',
      regulations: ['commercial-real-estate-laws', 'zoning-regulations']
    }
  },
  {
    id: 'virtual-property-tour-design',
    title: 'Virtual Property Tour Design',
    content: 'Design virtual property tour interfaces that provide immersive 360° navigation, interactive hotspots, and mobile optimization. Include floor plan integration, room-to-room navigation, and measurement tools. Support multiple media types: 360° photos, video tours, and 3D models. Provide virtual staging capabilities, furniture placement tools, and lighting adjustments. Include accessibility features and multi-language support for international buyers.',
    category: 'real-estate',
    primary_category: 'virtual-tours',
    secondary_category: 'immersive-experiences',
    industry_tags: ['virtual-tours', '360-navigation', 'interactive-hotspots', 'mobile-optimization'],
    complexity_level: 'advanced',
    use_cases: ['360-navigation', 'interactive-tours', 'virtual-staging'],
    related_patterns: ['360-viewers', 'interactive-media', 'virtual-staging'],
    freshness_score: 0.95,
    application_context: {
      environment: 'real-estate',
      users: 'property-viewers',
      constraints: 'immersive-experience',
      regulations: ['accessibility-standards', 'privacy-considerations']
    }
  },
  {
    id: 'real-estate-investment-analysis',
    title: 'Real Estate Investment Analysis',
    content: 'Create real estate investment analysis tools that provide ROI calculators, market comparisons, and risk assessments. Include cash flow analysis, cap rate calculations, and property valuation models. Provide market trend analysis, neighborhood comparisons, and investment portfolio tracking. Support multiple investment strategies: buy-and-hold, fix-and-flip, and commercial investments. Include tax implication analysis and financing option comparisons.',
    category: 'real-estate',
    primary_category: 'investment-analysis',
    secondary_category: 'financial-modeling',
    industry_tags: ['real-estate-investment', 'roi-calculators', 'market-analysis', 'risk-assessment'],
    complexity_level: 'expert',
    use_cases: ['roi-calculation', 'market-comparison', 'risk-assessment'],
    related_patterns: ['financial-calculators', 'investment-dashboards', 'risk-analysis'],
    freshness_score: 0.88,
    application_context: {
      environment: 'real-estate',
      users: 'real-estate-investors',
      constraints: 'financial-accuracy',
      regulations: ['investment-disclosure', 'financial-regulations']
    }
  },
  {
    id: 'property-valuation-tools',
    title: 'Property Valuation Tools',
    content: 'Design property valuation interfaces that utilize automated valuation models (AVMs), comparable analysis, and market trends. Include multiple valuation approaches: sales comparison, cost approach, and income approach. Provide comparable property analysis, market adjustment factors, and confidence intervals. Support professional appraisal workflows and regulatory compliance requirements. Include integration with MLS data and public records.',
    category: 'real-estate',
    primary_category: 'property-valuation',
    secondary_category: 'automated-valuation',
    industry_tags: ['property-valuation', 'automated-valuation', 'comparable-analysis', 'market-trends'],
    complexity_level: 'expert',
    use_cases: ['automated-valuation', 'comparable-analysis', 'market-trending'],
    related_patterns: ['valuation-models', 'comparable-systems', 'trend-analysis'],
    freshness_score: 0.90,
    application_context: {
      environment: 'real-estate',
      users: 'appraisers',
      constraints: 'valuation-accuracy',
      regulations: ['appraisal-standards', 'uspap-compliance']
    }
  },
  {
    id: 'construction-project-management',
    title: 'Construction Project Management UX',
    content: 'Create construction project management interfaces that track timelines, budgets, and contractor coordination. Include project scheduling with Gantt charts, resource allocation, and critical path analysis. Provide budget tracking, change order management, and cost variance analysis. Support document management, blueprint access, and field reporting tools. Include safety compliance tracking and quality control inspections.',
    category: 'real-estate',
    primary_category: 'construction-management',
    secondary_category: 'project-coordination',
    industry_tags: ['construction-management', 'project-scheduling', 'budget-tracking', 'contractor-coordination'],
    complexity_level: 'expert',
    use_cases: ['project-scheduling', 'budget-management', 'contractor-coordination'],
    related_patterns: ['project-timelines', 'budget-tracking', 'resource-management'],
    freshness_score: 0.93,
    application_context: {
      environment: 'construction',
      users: 'project-managers',
      constraints: 'timeline-critical',
      regulations: ['building-codes', 'safety-regulations']
    }
  },
  {
    id: 'smart-building-control-systems',
    title: 'Smart Building Control Systems',
    content: 'Design smart building interfaces that manage HVAC systems, security integration, and energy monitoring. Include automated climate control, lighting management, and access control systems. Provide energy usage analytics, sustainability reporting, and cost optimization tools. Support IoT device integration, predictive maintenance, and emergency response systems. Include tenant comfort management and building performance optimization.',
    category: 'real-estate',
    primary_category: 'smart-buildings',
    secondary_category: 'building-automation',
    industry_tags: ['smart-buildings', 'hvac-control', 'security-integration', 'energy-monitoring'],
    complexity_level: 'expert',
    use_cases: ['hvac-management', 'security-integration', 'energy-monitoring'],
    related_patterns: ['iot-dashboards', 'automated-control', 'energy-analytics'],
    freshness_score: 0.96,
    application_context: {
      environment: 'smart-buildings',
      users: 'building-managers',
      constraints: 'energy-efficiency',
      regulations: ['energy-codes', 'security-standards']
    }
  },
  {
    id: 'real-estate-document-management',
    title: 'Real Estate Document Management',
    content: 'Create document management systems for real estate that handle contract storage, e-signature integration, and compliance tracking. Include transaction document workflows, disclosure management, and deadline tracking. Provide secure document sharing, version control, and audit trails. Support multiple document types: contracts, disclosures, inspections, and appraisals. Include integration with MLS systems and transaction management platforms.',
    category: 'real-estate',
    primary_category: 'document-management',
    secondary_category: 'transaction-documents',
    industry_tags: ['document-management', 'e-signatures', 'contract-storage', 'compliance-tracking'],
    complexity_level: 'advanced',
    use_cases: ['contract-management', 'e-signature-workflows', 'compliance-tracking'],
    related_patterns: ['document-workflows', 'e-signature-systems', 'compliance-tracking'],
    freshness_score: 0.87,
    application_context: {
      environment: 'real-estate',
      users: 'transaction-coordinators',
      constraints: 'compliance-critical',
      regulations: ['real-estate-disclosure-laws', 'e-signature-regulations']
    }
  },

  // Advanced Enterprise Patterns (12 entries)
  {
    id: 'enterprise-resource-planning-ux',
    title: 'Enterprise Resource Planning UX',
    content: 'Design ERP interfaces that integrate multiple business modules, workflow automation, and role-based access control. Include financial management, supply chain, human resources, and customer relationship modules. Provide customizable dashboards, automated workflow routing, and exception handling. Support multi-company structures, multi-currency operations, and global localization. Include advanced reporting tools, business intelligence integration, and audit trail capabilities.',
    category: 'enterprise',
    primary_category: 'erp-systems',
    secondary_category: 'business-integration',
    industry_tags: ['erp', 'business-integration', 'workflow-automation', 'role-based-access'],
    complexity_level: 'expert',
    use_cases: ['business-integration', 'workflow-automation', 'multi-module-access'],
    related_patterns: ['modular-systems', 'workflow-engines', 'role-management'],
    freshness_score: 0.89,
    application_context: {
      environment: 'enterprise',
      users: 'business-users',
      constraints: 'integration-critical',
      regulations: ['financial-compliance', 'data-governance']
    }
  },
  {
    id: 'business-intelligence-dashboards',
    title: 'Business Intelligence Dashboards',
    content: 'Create business intelligence interfaces that provide data visualization, drill-down capabilities, and automated insights. Include interactive charts, pivot tables, and self-service analytics tools. Provide real-time data updates, scheduled report generation, and alert systems. Support multiple data sources, ETL processes, and data warehousing integration. Include mobile access, collaborative features, and embedded analytics capabilities.',
    category: 'enterprise',
    primary_category: 'business-intelligence',
    secondary_category: 'data-visualization',
    industry_tags: ['business-intelligence', 'data-visualization', 'automated-insights', 'self-service-analytics'],
    complexity_level: 'expert',
    use_cases: ['data-visualization', 'drill-down-analysis', 'automated-insights'],
    related_patterns: ['analytics-dashboards', 'data-exploration', 'insight-generation'],
    freshness_score: 0.94,
    application_context: {
      environment: 'enterprise',
      users: 'business-analysts',
      constraints: 'data-driven-decisions',
      regulations: ['data-privacy', 'reporting-standards']
    }
  },
  {
    id: 'enterprise-search-interfaces',
    title: 'Enterprise Search Interfaces',
    content: 'Design enterprise search systems that provide federated search, relevance ranking, and security filtering. Include content indexing across multiple systems, personalized search results, and faceted search navigation. Provide advanced search operators, saved searches, and search analytics. Support multiple content types: documents, emails, databases, and web content. Include AI-powered search suggestions and natural language query processing.',
    category: 'enterprise',
    primary_category: 'enterprise-search',
    secondary_category: 'information-retrieval',
    industry_tags: ['enterprise-search', 'federated-search', 'relevance-ranking', 'security-filtering'],
    complexity_level: 'expert',
    use_cases: ['federated-search', 'content-discovery', 'knowledge-retrieval'],
    related_patterns: ['search-interfaces', 'faceted-navigation', 'ai-search'],
    freshness_score: 0.92,
    application_context: {
      environment: 'enterprise',
      users: 'knowledge-workers',
      constraints: 'security-filtered',
      regulations: ['data-classification', 'access-control']
    }
  },
  {
    id: 'workflow-automation-design',
    title: 'Workflow Automation Design',
    content: 'Create workflow automation interfaces that support process modeling, approval chains, and exception handling. Include visual workflow designers, business rule engines, and integration capabilities. Provide workflow monitoring, performance analytics, and optimization recommendations. Support human-in-the-loop processes, automated decision making, and escalation procedures. Include version control, testing environments, and deployment management.',
    category: 'enterprise',
    primary_category: 'workflow-automation',
    secondary_category: 'process-management',
    industry_tags: ['workflow-automation', 'process-modeling', 'approval-chains', 'exception-handling'],
    complexity_level: 'expert',
    use_cases: ['process-automation', 'approval-workflows', 'exception-management'],
    related_patterns: ['workflow-designers', 'rule-engines', 'process-monitoring'],
    freshness_score: 0.91,
    application_context: {
      environment: 'enterprise',
      users: 'process-managers',
      constraints: 'automation-critical',
      regulations: ['process-compliance', 'audit-trails']
    }
  },
  {
    id: 'multi-tenant-saas-architecture',
    title: 'Multi-Tenant SaaS Architecture UX',
    content: 'Design multi-tenant SaaS interfaces that provide tenant isolation, custom branding, and feature flagging. Include tenant-specific customization, white-label capabilities, and scalable resource allocation. Provide tenant administration tools, usage analytics, and subscription management. Support multiple deployment models: shared, dedicated, and hybrid tenancy. Include data isolation, security boundaries, and compliance frameworks.',
    category: 'enterprise',
    primary_category: 'saas-architecture',
    secondary_category: 'multi-tenancy',
    industry_tags: ['multi-tenant-saas', 'tenant-isolation', 'custom-branding', 'feature-flagging'],
    complexity_level: 'expert',
    use_cases: ['tenant-management', 'custom-branding', 'feature-control'],
    related_patterns: ['tenant-isolation', 'customization-engines', 'feature-flags'],
    freshness_score: 0.95,
    application_context: {
      environment: 'saas',
      users: 'tenant-administrators',
      constraints: 'multi-tenant-security',
      regulations: ['data-isolation', 'privacy-compliance']
    }
  },
  {
    id: 'enterprise-integration-platforms',
    title: 'Enterprise Integration Platforms',
    content: 'Create enterprise integration interfaces that manage API connections, data mapping, and error handling. Include visual integration designers, transformation tools, and monitoring dashboards. Provide connectivity to multiple systems: cloud, on-premise, and hybrid environments. Support multiple integration patterns: point-to-point, hub-and-spoke, and event-driven architecture. Include security management, performance optimization, and troubleshooting tools.',
    category: 'enterprise',
    primary_category: 'integration-platforms',
    secondary_category: 'system-connectivity',
    industry_tags: ['enterprise-integration', 'api-management', 'data-mapping', 'error-handling'],
    complexity_level: 'expert',
    use_cases: ['api-management', 'data-transformation', 'system-integration'],
    related_patterns: ['integration-designers', 'api-gateways', 'data-pipelines'],
    freshness_score: 0.93,
    application_context: {
      environment: 'enterprise',
      users: 'integration-architects',
      constraints: 'system-reliability',
      regulations: ['data-governance', 'security-standards']
    }
  },
  {
    id: 'compliance-management-systems',
    title: 'Compliance Management Systems UX',
    content: 'Design compliance management interfaces that track regulatory requirements, audit trails, and policy management. Include compliance framework mapping, risk assessment tools, and remediation tracking. Provide policy distribution, training management, and attestation workflows. Support multiple regulatory frameworks: SOX, GDPR, HIPAA, and industry-specific requirements. Include automated compliance monitoring, exception reporting, and regulatory change management.',
    category: 'enterprise',
    primary_category: 'compliance-management',
    secondary_category: 'regulatory-tracking',
    industry_tags: ['compliance-management', 'regulatory-tracking', 'audit-trails', 'policy-management'],
    complexity_level: 'expert',
    use_cases: ['regulatory-tracking', 'audit-preparation', 'policy-management'],
    related_patterns: ['compliance-dashboards', 'audit-systems', 'policy-workflows'],
    freshness_score: 0.90,
    application_context: {
      environment: 'enterprise',
      users: 'compliance-officers',
      constraints: 'regulatory-compliance',
      regulations: ['sox', 'gdpr', 'hipaa', 'industry-regulations']
    }
  },
  {
    id: 'enterprise-mobile-app-design',
    title: 'Enterprise Mobile App Design',
    content: 'Create enterprise mobile applications that support offline capabilities, security protocols, and device management. Include mobile-first design patterns, touch-optimized interfaces, and responsive layouts. Provide offline data synchronization, secure authentication, and remote wipe capabilities. Support multiple platforms: iOS, Android, and cross-platform frameworks. Include enterprise app store distribution, mobile device management integration, and security compliance.',
    category: 'enterprise',
    primary_category: 'enterprise-mobile',
    secondary_category: 'mobile-security',
    industry_tags: ['enterprise-mobile', 'offline-capability', 'mobile-security', 'device-management'],
    complexity_level: 'advanced',
    use_cases: ['offline-functionality', 'secure-access', 'device-management'],
    related_patterns: ['offline-sync', 'mobile-security', 'device-controls'],
    freshness_score: 0.94,
    application_context: {
      environment: 'enterprise-mobile',
      users: 'mobile-workers',
      constraints: 'security-critical',
      regulations: ['mobile-security-standards', 'data-protection']
    }
  },
  {
    id: 'change-management-interfaces',
    title: 'Change Management Interfaces',
    content: 'Design change management systems that handle version control, rollback procedures, and impact analysis. Include change request workflows, approval processes, and deployment coordination. Provide change tracking, risk assessment, and communication tools. Support multiple change types: emergency, standard, and normal changes. Include change calendar management, conflict detection, and post-implementation reviews.',
    category: 'enterprise',
    primary_category: 'change-management',
    secondary_category: 'deployment-control',
    industry_tags: ['change-management', 'version-control', 'rollback-procedures', 'impact-analysis'],
    complexity_level: 'advanced',
    use_cases: ['change-tracking', 'deployment-management', 'risk-assessment'],
    related_patterns: ['change-workflows', 'version-systems', 'deployment-pipelines'],
    freshness_score: 0.88,
    application_context: {
      environment: 'enterprise',
      users: 'change-managers',
      constraints: 'risk-management',
      regulations: ['change-control-standards', 'audit-requirements']
    }
  },
  {
    id: 'enterprise-analytics-platforms',
    title: 'Enterprise Analytics Platforms',
    content: 'Create enterprise analytics platforms that provide self-service analytics, data governance, and collaboration tools. Include data preparation tools, statistical analysis capabilities, and machine learning integration. Provide data lineage tracking, quality monitoring, and metadata management. Support multiple user types: business users, data analysts, and data scientists. Include collaborative features, sharing capabilities, and embedded analytics.',
    category: 'enterprise',
    primary_category: 'enterprise-analytics',
    secondary_category: 'self-service-analytics',
    industry_tags: ['enterprise-analytics', 'self-service-analytics', 'data-governance', 'collaboration-tools'],
    complexity_level: 'expert',
    use_cases: ['self-service-analytics', 'data-collaboration', 'advanced-analytics'],
    related_patterns: ['analytics-workbench', 'data-governance', 'ml-platforms'],
    freshness_score: 0.96,
    application_context: {
      environment: 'enterprise',
      users: 'data-professionals',
      constraints: 'data-governance',
      regulations: ['data-quality-standards', 'privacy-regulations']
    }
  },
  {
    id: 'knowledge-management-systems',
    title: 'Knowledge Management Systems UX',
    content: 'Design knowledge management interfaces that organize content, optimize search, and locate expertise. Include knowledge base creation, content lifecycle management, and collaborative authoring tools. Provide expertise location systems, community features, and knowledge sharing incentives. Support multiple content types: documents, videos, wikis, and discussion forums. Include AI-powered content recommendations, semantic search, and knowledge graphs.',
    category: 'enterprise',
    primary_category: 'knowledge-management',
    secondary_category: 'content-organization',
    industry_tags: ['knowledge-management', 'content-organization', 'expertise-location', 'collaborative-authoring'],
    complexity_level: 'advanced',
    use_cases: ['knowledge-sharing', 'expertise-location', 'content-management'],
    related_patterns: ['knowledge-bases', 'expert-systems', 'content-discovery'],
    freshness_score: 0.89,
    application_context: {
      environment: 'enterprise',
      users: 'knowledge-workers',
      constraints: 'knowledge-sharing',
      regulations: ['intellectual-property', 'content-governance']
    }
  },
  {
    id: 'digital-workplace-platforms',
    title: 'Digital Workplace Platforms',
    content: 'Create digital workplace interfaces that integrate employee portals, collaboration tools, and productivity tracking. Include unified communications, document collaboration, and social networking features. Provide employee self-service tools, HR integration, and performance management. Support remote work capabilities, virtual collaboration, and digital wellness features. Include personalization engines, notification management, and productivity analytics.',
    category: 'enterprise',
    primary_category: 'digital-workplace',
    secondary_category: 'employee-experience',
    industry_tags: ['digital-workplace', 'employee-portals', 'collaboration-tools', 'productivity-tracking'],
    complexity_level: 'advanced',
    use_cases: ['employee-engagement', 'remote-collaboration', 'productivity-enhancement'],
    related_patterns: ['employee-portals', 'collaboration-spaces', 'productivity-tools'],
    freshness_score: 0.92,
    application_context: {
      environment: 'enterprise',
      users: 'employees',
      constraints: 'user-experience-focused',
      regulations: ['employee-privacy', 'workplace-standards']
    }
  }
];

export const populateBatchFiveKnowledge = async (): Promise<{
  successfullyAdded: number;
  errors: number;
  details: string[];
}> => {
  console.log('🚀 Starting Batch 5 knowledge population...');
  console.log(`📊 Processing ${BATCH_FIVE_KNOWLEDGE.length} specialized B2B industry entries`);
  
  let successfullyAdded = 0;
  let errors = 0;
  const details: string[] = [];

  try {
    for (const entry of BATCH_FIVE_KNOWLEDGE) {
      try {
        console.log(`📝 Processing: ${entry.title}`);
        
        const { error } = await supabase
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
            related_patterns: entry.related_patterns,
            freshness_score: entry.freshness_score,
            application_context: entry.application_context,
            source: 'Batch 5 - Specialized B2B Industries & Advanced Enterprise',
            tags: entry.industry_tags
          });

        if (error) {
          console.error(`❌ Error inserting ${entry.title}:`, error);
          errors++;
          details.push(`Error with ${entry.title}: ${error.message}`);
        } else {
          console.log(`✅ Successfully added: ${entry.title}`);
          successfullyAdded++;
          details.push(`Added: ${entry.title} (${entry.category})`);
        }
        
        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (entryError) {
        console.error(`❌ Exception processing ${entry.title}:`, entryError);
        errors++;
        details.push(`Exception with ${entry.title}: ${entryError instanceof Error ? entryError.message : 'Unknown error'}`);
      }
    }

    console.log(`🎉 Batch 5 population completed!`);
    console.log(`📈 Successfully added: ${successfullyAdded} entries`);
    console.log(`❌ Errors encountered: ${errors} entries`);
    
    // Log category breakdown
    const categoryBreakdown = BATCH_FIVE_KNOWLEDGE.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 Category breakdown:', categoryBreakdown);

    return {
      successfullyAdded,
      errors,
      details
    };

  } catch (error) {
    console.error('💥 Fatal error during Batch 5 population:', error);
    throw error;
  }
};
