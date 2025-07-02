import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface GoogleVisionRequest {
  imageUrls: string[];
  features?: string[];
  maxResults?: number;
}

interface GoogleVisionResponse {
  success: boolean;
  results?: GoogleVisionResult[];
  error?: string;
}

interface GoogleVisionResult {
  imageUrl: string;
  textAnnotations: any[];
  labelAnnotations: any[];
  faceAnnotations: any[];
  objectAnnotations: any[];
  webDetection: any;
  imageProperties: any;
  dominantColors: any[];
  visualElements: {
    buttons: any[];
    forms: any[];
    navigation: any[];
    content: any[];
  };
  safetyAnnotations: any[];
}

class GoogleVisionAnalyzer {
  private apiKey: string;

  constructor() {
    this.apiKey = Deno.env.get('GOOGLE_VISION_API_KEY') || '';
    if (!this.apiKey) {
      console.warn('⚠️ Google Vision API key not found. Using mock data.');
    }
  }

  /**
   * Analyze multiple images with Google Vision API
   */
  async analyzeImages(imageUrls: string[], features: string[] = []): Promise<GoogleVisionResult[]> {
    const defaultFeatures = [
      'TEXT_DETECTION',
      'LABEL_DETECTION',
      'FACE_DETECTION',
      'OBJECT_LOCALIZATION',
      'WEB_DETECTION',
      'IMAGE_PROPERTIES',
      'SAFE_SEARCH_DETECTION'
    ];

    const featuresToUse = features.length > 0 ? features : defaultFeatures;
    const results: GoogleVisionResult[] = [];

    for (const imageUrl of imageUrls) {
      try {
        console.log('🔍 Analyzing image with Google Vision:', imageUrl.substring(0, 100));
        
        if (!this.apiKey) {
          // Return mock data if no API key
          results.push(this.createMockVisionResult(imageUrl));
          continue;
        }

        const result = await this.analyzeImage(imageUrl, featuresToUse);
        results.push(result);
        
        console.log('✅ Google Vision analysis completed for image');
        
      } catch (error) {
        console.error('❌ Google Vision analysis failed for image:', error);
        // Add error result but continue with other images
        results.push({
          imageUrl,
          textAnnotations: [],
          labelAnnotations: [],
          faceAnnotations: [],
          objectAnnotations: [],
          webDetection: {},
          imageProperties: {},
          dominantColors: [],
          visualElements: { buttons: [], forms: [], navigation: [], content: [] },
          safetyAnnotations: []
        });
      }
    }

    return results;
  }

  /**
   * Analyze a single image with Google Vision API
   */
  private async analyzeImage(imageUrl: string, features: string[]): Promise<GoogleVisionResult> {
    const requestBody = {
      requests: [{
        image: {
          source: { imageUri: imageUrl }
        },
        features: features.map(feature => ({
          type: feature,
          maxResults: 50
        }))
      }]
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const annotation = data.responses[0];

    if (annotation.error) {
      throw new Error(`Google Vision API error: ${annotation.error.message}`);
    }

    return this.processVisionAnnotation(imageUrl, annotation);
  }

  /**
   * Process raw Google Vision annotation into structured result
   */
  private processVisionAnnotation(imageUrl: string, annotation: any): GoogleVisionResult {
    // Extract dominant colors
    const dominantColors = annotation.imagePropertiesAnnotation?.dominantColors?.colors || [];
    
    // Process text annotations to identify UI elements
    const textAnnotations = annotation.textAnnotations || [];
    const visualElements = this.extractVisualElements(textAnnotations, annotation.localizedObjectAnnotations || []);

    return {
      imageUrl,
      textAnnotations,
      labelAnnotations: annotation.labelAnnotations || [],
      faceAnnotations: annotation.faceAnnotations || [],
      objectAnnotations: annotation.localizedObjectAnnotations || [],
      webDetection: annotation.webDetection || {},
      imageProperties: annotation.imagePropertiesAnnotation || {},
      dominantColors: dominantColors.map((c: any) => ({
        color: this.rgbToHex(c.color),
        score: c.score,
        pixelFraction: c.pixelFraction
      })),
      visualElements,
      safetyAnnotations: annotation.safeSearchAnnotation ? [annotation.safeSearchAnnotation] : []
    };
  }

  /**
   * Extract UI elements from text and object annotations
   */
  private extractVisualElements(textAnnotations: any[], objectAnnotations: any[]): {
    buttons: any[];
    forms: any[];
    navigation: any[];
    content: any[];
  } {
    const buttons: any[] = [];
    const forms: any[] = [];
    const navigation: any[] = [];
    const content: any[] = [];

    // Analyze object annotations for UI elements
    objectAnnotations.forEach(obj => {
      const name = obj.name.toLowerCase();
      const boundingBox = obj.boundingPoly;
      
      if (name.includes('button') || name.includes('link')) {
        buttons.push({
          text: obj.name,
          boundingBox,
          confidence: obj.score
        });
      } else if (name.includes('form') || name.includes('input') || name.includes('textbox')) {
        forms.push({
          type: obj.name,
          boundingBox,
          confidence: obj.score
        });
      } else if (name.includes('menu') || name.includes('navigation') || name.includes('nav')) {
        navigation.push({
          type: obj.name,
          boundingBox,
          confidence: obj.score
        });
      } else {
        content.push({
          type: obj.name,
          boundingBox,
          confidence: obj.score
        });
      }
    });

    // Analyze text annotations for UI patterns
    textAnnotations.forEach((text, index) => {
      if (index === 0) return; // Skip full text annotation
      
      const description = text.description.toLowerCase();
      const boundingBox = text.boundingPoly;
      
      // Identify button-like text
      if (this.isButtonText(description)) {
        buttons.push({
          text: text.description,
          boundingBox,
          confidence: 0.8,
          source: 'text_analysis'
        });
      }
      
      // Identify navigation elements
      else if (this.isNavigationText(description)) {
        navigation.push({
          text: text.description,
          boundingBox,
          confidence: 0.7,
          source: 'text_analysis'
        });
      }
      
      // Other content
      else {
        content.push({
          text: text.description,
          boundingBox,
          confidence: 0.6,
          source: 'text_analysis'
        });
      }
    });

    return { buttons, forms, navigation, content };
  }

  /**
   * Check if text looks like a button
   */
  private isButtonText(text: string): boolean {
    const buttonKeywords = [
      'click', 'submit', 'send', 'save', 'delete', 'edit', 'view', 'download',
      'buy', 'purchase', 'add', 'remove', 'login', 'signup', 'register',
      'search', 'filter', 'sort', 'next', 'previous', 'back', 'continue'
    ];
    
    return buttonKeywords.some(keyword => text.includes(keyword)) ||
           (text.length < 20 && /^[A-Z][a-z]+( [A-Z][a-z]+)*$/.test(text.trim()));
  }

  /**
   * Check if text looks like navigation
   */
  private isNavigationText(text: string): boolean {
    const navKeywords = [
      'home', 'about', 'contact', 'services', 'products', 'blog', 'news',
      'help', 'support', 'faq', 'terms', 'privacy', 'menu', 'navigation'
    ];
    
    return navKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Convert RGB to hex color
   */
  private rgbToHex(color: any): string {
    const r = Math.round(color.red || 0);
    const g = Math.round(color.green || 0);
    const b = Math.round(color.blue || 0);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Create mock vision result for testing
   */
  private createMockVisionResult(imageUrl: string): GoogleVisionResult {
    return {
      imageUrl,
      textAnnotations: [
        {
          description: 'Sample button text',
          boundingPoly: { vertices: [{ x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 150 }, { x: 100, y: 150 }] }
        }
      ],
      labelAnnotations: [
        { description: 'Website', score: 0.95 },
        { description: 'User interface', score: 0.89 }
      ],
      faceAnnotations: [],
      objectAnnotations: [
        {
          name: 'Button',
          score: 0.85,
          boundingPoly: { vertices: [{ x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 150 }, { x: 100, y: 150 }] }
        }
      ],
      webDetection: {
        webEntities: [
          { description: 'Web design', score: 0.8 }
        ]
      },
      imageProperties: {
        dominantColors: {
          colors: [
            { color: { red: 255, green: 255, blue: 255 }, score: 0.4, pixelFraction: 0.5 },
            { color: { red: 0, green: 123, blue: 255 }, score: 0.3, pixelFraction: 0.2 }
          ]
        }
      },
      dominantColors: [
        { color: '#ffffff', score: 0.4, pixelFraction: 0.5 },
        { color: '#007bff', score: 0.3, pixelFraction: 0.2 }
      ],
      visualElements: {
        buttons: [
          { text: 'Sample Button', boundingBox: {}, confidence: 0.8, source: 'mock' }
        ],
        forms: [],
        navigation: [
          { text: 'Home', boundingBox: {}, confidence: 0.7, source: 'mock' }
        ],
        content: [
          { text: 'Welcome to our website', boundingBox: {}, confidence: 0.6, source: 'mock' }
        ]
      },
      safetyAnnotations: []
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Google Vision analysis request received');
    
    const { imageUrls, features, maxResults }: GoogleVisionRequest = await req.json();
    
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request: imageUrls array is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📊 Starting Google Vision analysis:', {
      imageCount: imageUrls.length,
      features: features || 'default',
      maxResults
    });

    const analyzer = new GoogleVisionAnalyzer();
    const results = await analyzer.analyzeImages(imageUrls, features || []);

    console.log('✅ Google Vision analysis completed:', {
      processedImages: results.length,
      totalTextElements: results.reduce((sum, r) => sum + r.textAnnotations.length, 0),
      totalLabels: results.reduce((sum, r) => sum + r.labelAnnotations.length, 0),
      totalObjects: results.reduce((sum, r) => sum + r.objectAnnotations.length, 0)
    });

    const response: GoogleVisionResponse = {
      success: true,
      results
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Google Vision analysis error:', error);
    
    const response: GoogleVisionResponse = {
      success: false,
      error: error.message
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
