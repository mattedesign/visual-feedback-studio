// helpers/injectMetadata.ts
// This file handles all the smart detection and context injection

interface ScreenMetadata {
  screen_id: string;
  screen_name: string;
  platform: 'Web' | 'iOS' | 'Android' | 'Desktop';
  screen_type?: string;
  user_goal?: string;
  vision_metadata?: {
    labels: string[];
    confidence: number;
  };
}

interface VisionAPIResponse {
  labels: string[];
  text: string[];
  objects: Array<{
    name: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  colors: {
    dominant: string[];
    palette: string[];
  };
}

interface EnrichedVisionData {
  labels: string[];
  contextualTags: string[];
  textDensity: 'low' | 'medium' | 'high';
  layoutType: 'single-column' | 'multi-column';
  hasHeroSection: boolean;
  primaryColors: string[];
  formComplexity?: 'simple' | 'complex';
}

/**
 * Injects metadata and vision data into the analysis prompt template
 */
export function injectMetadata(
  promptTemplate: string,
  metadata: ScreenMetadata,
  visionData?: VisionAPIResponse
): string {
  const enrichedMetadata = {
    ...metadata,
    vision_metadata: {
      labels: visionData?.labels || metadata.vision_metadata?.labels || [],
      confidence: metadata.vision_metadata?.confidence || 0
    }
  };

  let prompt = promptTemplate;
  
  // Simple replacements
  prompt = prompt.replace(/\{\{screen_id\}\}/g, enrichedMetadata.screen_id);
  prompt = prompt.replace(/\{\{screen_name\}\}/g, enrichedMetadata.screen_name);
  prompt = prompt.replace(/\{\{platform\}\}/g, enrichedMetadata.platform);
  prompt = prompt.replace(/\{\{screen_type\}\}/g, enrichedMetadata.screen_type || 'auto-detect');
  prompt = prompt.replace(/\{\{user_goal\}\}/g, enrichedMetadata.user_goal || 'Improve user experience');
  
  // Complex replacements
  prompt = prompt.replace(
    /\{\{vision_metadata\.labels\}\}/g, 
    JSON.stringify(enrichedMetadata.vision_metadata.labels)
  );
  
  return prompt;
}

/**
 * Automatically detects screen type based on visual elements and text
 */
export function detectScreenType(
  visionLabels: string[],
  textContent: string[]
): string {
  const screenTypePatterns = {
    'checkout': {
      keywords: ['cart', 'total', 'payment', 'shipping', 'checkout', 'order'],
      weight: 0
    },
    'dashboard': {
      keywords: ['metrics', 'analytics', 'chart', 'graph', 'statistics', 'overview'],
      weight: 0
    },
    'form': {
      keywords: ['input', 'field', 'submit', 'required', 'email', 'password', 'register'],
      weight: 0
    },
    'landing': {
      keywords: ['hero', 'cta', 'features', 'pricing', 'testimonial', 'get started'],
      weight: 0
    },
    'profile': {
      keywords: ['profile', 'avatar', 'settings', 'account', 'preferences', 'bio'],
      weight: 0
    },
    'feed': {
      keywords: ['posts', 'timeline', 'updates', 'comments', 'likes', 'share'],
      weight: 0
    },
    'search': {
      keywords: ['results', 'filter', 'sort', 'query', 'found', 'search'],
      weight: 0
    },
    'onboarding': {
      keywords: ['welcome', 'setup', 'step', 'next', 'skip', 'get started'],
      weight: 0
    },
    'settings': {
      keywords: ['settings', 'preferences', 'options', 'configuration', 'toggle', 'enable'],
      weight: 0
    },
    'error': {
      keywords: ['error', '404', 'not found', 'oops', 'wrong', 'failed'],
      weight: 0
    }
  };

  const allText = [...visionLabels, ...textContent].map(t => t.toLowerCase());

  Object.entries(screenTypePatterns).forEach(([type, pattern]) => {
    pattern.weight = pattern.keywords.reduce((weight, keyword) => {
      const matches = allText.filter(text => text.includes(keyword)).length;
      return weight + matches;
    }, 0);
  });

  const detectedType = Object.entries(screenTypePatterns)
    .sort((a, b) => b[1].weight - a[1].weight)[0][0];

  return screenTypePatterns[detectedType].weight > 0 ? detectedType : 'generic';
}

/**
 * Enriches metadata with additional context based on screen type
 */
export function enrichMetadataWithContext(
  metadata: ScreenMetadata,
  screenType: string
): ScreenMetadata {
  const contextEnrichments: Record<string, Partial<ScreenMetadata>> = {
    'checkout': {
      user_goal: metadata.user_goal || 'Complete purchase with confidence and ease'
    },
    'dashboard': {
      user_goal: metadata.user_goal || 'Quickly understand data and make informed decisions'
    },
    'form': {
      user_goal: metadata.user_goal || 'Complete form accurately with minimal effort'
    },
    'landing': {
      user_goal: metadata.user_goal || 'Understand value proposition and take action'
    },
    'profile': {
      user_goal: metadata.user_goal || 'View and manage personal information'
    },
    'settings': {
      user_goal: metadata.user_goal || 'Customize experience to personal preferences'
    }
  };

  return {
    ...metadata,
    screen_type: screenType,
    ...contextEnrichments[screenType]
  };
}

/**
 * Main function to prepare a complete analysis request
 */
export async function prepareAnalysisRequest(
  imageUrl: string,
  metadata: ScreenMetadata,
  visionData: VisionAPIResponse,
  promptTemplate: string
): Promise<{
  prompt: string;
  enrichedMetadata: ScreenMetadata;
}> {
  const screenType = detectScreenType(visionData.labels, visionData.text);
  const enrichedMetadata = enrichMetadataWithContext(metadata, screenType);
  const prompt = injectMetadata(promptTemplate, enrichedMetadata, visionData);
  
  return {
    prompt,
    enrichedMetadata
  };
}

/**
 * Validates that the analysis response matches expected schema
 */
export function validateAnalysisResponse(response: any): boolean {
  const requiredFields = [
    'screen_id',
    'screen_name',
    'overall_score',
    'issues',
    'strengths',
    'top_recommendations'
  ];
  
  const hasRequiredFields = requiredFields.every(field => field in response);
  if (!hasRequiredFields) return false;
  
  if (!Array.isArray(response.issues)) return false;
  
  const issuesValid = response.issues.every((issue: any) => {
    const issueFields = ['id', 'level', 'severity', 'category', 'description', 'impact', 'suggested_fix'];
    const hasFields = issueFields.every(field => field in issue);
    const hasValidConfidence = issue.confidence >= 0 && issue.confidence <= 1;
    return hasFields && hasValidConfidence;
  });
  
  return issuesValid;
}

/**
 * Enriches Vision API data with contextual understanding
 */
export function enrichVisionData(visionResponse: VisionAPIResponse): EnrichedVisionData {
  const textCount = visionResponse.text.join(' ').split(' ').length;
  const hasMultipleColumns = visionResponse.objects.filter(o => 
    o.name.toLowerCase() === 'text' || o.name.toLowerCase() === 'textblock'
  ).length > 3;
  
  const enriched: EnrichedVisionData = {
    labels: visionResponse.labels,
    contextualTags: [],
    textDensity: textCount > 200 ? 'high' : textCount > 50 ? 'medium' : 'low',
    layoutType: hasMultipleColumns ? 'multi-column' : 'single-column',
    hasHeroSection: visionResponse.labels.some(l => 
      l.toLowerCase().includes('hero') || 
      l.toLowerCase().includes('banner') ||
      l.toLowerCase().includes('header')
    ),
    primaryColors: visionResponse.colors.dominant.slice(0, 3),
    formComplexity: undefined
  };

  // Add contextual tags based on heuristics
  if (enriched.textDensity === 'high' && enriched.layoutType === 'multi-column') {
    enriched.contextualTags.push('complex-form');
    enriched.formComplexity = 'complex';
  }

  if (enriched.hasHeroSection && enriched.textDensity === 'low') {
    enriched.contextualTags.push('landing-page');
  }

  if (visionResponse.labels.some(l => 
    l.toLowerCase().includes('chart') || 
    l.toLowerCase().includes('graph') ||
    l.toLowerCase().includes('dashboard')
  )) {
    enriched.contextualTags.push('data-visualization');
  }

  if (visionResponse.labels.some(l => 
    l.toLowerCase().includes('table') || 
    l.toLowerCase().includes('list')
  )) {
    enriched.contextualTags.push('data-heavy');
  }

  return enriched;
}