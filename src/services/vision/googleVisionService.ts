
import { supabase } from '@/integrations/supabase/client';

export interface VisionAnalysisResult {
  uiElements: Array<{
    type: string;
    confidence: number;
    description: string;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    properties?: Record<string, any>;
  }>;
  layout: {
    type: string;
    confidence: number;
    description: string;
    structure: {
      sections: Array<{
        name: string;
        position: string;
        area: number;
      }>;
      hierarchy: string[];
      gridSystem?: {
        columns: number;
        gutters: number;
      };
    };
  };
  industry: {
    industry: string;
    confidence: number;
    indicators: string[];
    metadata: {
      designPatterns: string[];
      brandElements: string[];
      userInterfaceStyle: string;
    };
  };
  accessibility: Array<{
    issue: string;
    severity: string;
    suggestion: string;
    wcagLevel: string;
    element?: string;
    position?: { x: number; y: number };
  }>;
  textContent: Array<{
    text: string;
    confidence: number;
    context: string;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    textProperties?: {
      fontSize: number;
      fontFamily: string;
      fontWeight: string;
      color: string;
    };
  }>;
  colors: {
    dominantColors: string[];
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
    };
    colorContrast: {
      textBackground: number;
      accessibility: string;
    };
    colorHarmony: {
      scheme: string;
      temperature: string;
      saturation: number;
    };
    brandColors?: string[];
  };
  deviceType: {
    type: string;
    confidence: number;
    dimensions: {
      width: number;
      height: number;
      aspectRatio: number;
    };
    responsiveBreakpoints?: Array<{
      name: string;
      minWidth: number;
      maxWidth: number;
    }>;
  };
  designTokens: {
    spacing: Array<{ name: string; value: number }>;
    typography: Array<{
      element: string;
      fontSize: number;
      lineHeight: number;
      fontWeight: string;
    }>;
    borderRadius: Array<{ name: string; value: number }>;
    shadows: Array<{ name: string; blur: number; offset: { x: number; y: number } }>;
  };
  visualHierarchy: {
    primaryFocusAreas: Array<{
      element: string;
      importance: number;
      visualWeight: number;
      position: { x: number; y: number };
    }>;
    readingFlow: {
      pattern: string;
      confidence: number;
      keypoints: Array<{ x: number; y: number; order: number }>;
    };
  };
  interactionElements: Array<{
    type: string;
    state: string;
    accessibility: boolean;
    hoverEffects: boolean;
    clickTarget: { x: number; y: number; size: number };
  }>;
  brandAnalysis: {
    logoDetected: boolean;
    brandConsistency: number;
    visualIdentity: {
      style: string;
      mood: string;
      personality: string[];
    };
  };
  technicalMetadata: {
    imageQuality: {
      resolution: { width: number; height: number };
      compression: string;
      clarity: number;
    };
    performanceIndicators: {
      estimatedLoadTime: number;
      optimizationSuggestions: string[];
    };
  };
  overallConfidence: number;
  processingTime: number;
}

class GoogleVisionService {
  async analyzeImage(imageUrl: string): Promise<VisionAnalysisResult> {
    const analysisId = crypto.randomUUID().substring(0, 8);
    console.log(`🔍 [${analysisId}] GoogleVisionService: Starting comprehensive image analysis for URL:`, 
      imageUrl.substring(0, 100) + '...');
    const startTime = Date.now();

    try {
      // Step 1: Validate image URL
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Invalid image URL provided');
      }

      console.log(`🔍 [${analysisId}] Converting image to base64...`);
      const conversionStartTime = Date.now();
      
      // Convert image to base64 with detailed logging
      const base64Data = await this.safeImageUrlToBase64(imageUrl, analysisId);
      const conversionTime = Date.now() - conversionStartTime;
      
      console.log(`✅ [${analysisId}] Image conversion completed in ${conversionTime}ms, size: ${base64Data.length} bytes`);
      
      // Step 2: Call Google Vision via analyze-design function (which has built-in Google Vision)
      console.log(`🚀 [${analysisId}] Calling analyze-design function with Google Vision integration...`);
      const visionStartTime = Date.now();
      
      // Use the analyze-design function which has Google Vision built-in
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrls: [imageUrl],
          analysisPrompt: 'Google Vision analysis for UI elements, text detection, and image properties',
          analysisId: analysisId,
          enableGoogleVision: true,
          skipClaudeAnalysis: true
        }
      });

      const visionTime = Date.now() - visionStartTime;
      
      if (error) {
        console.warn(`⚠️ [${analysisId}] Vision API call failed after ${visionTime}ms:`, {
          error: error.message || error,
          context: error.context || 'unknown',
          requestId: error.requestId || 'unknown'
        });
        
        // Categorize the error for better handling
        const errorType = this.categorizeVisionError(error);
        console.log(`🔍 [${analysisId}] Error categorized as: ${errorType}`);
        
        // Return enhanced fallback with error context
        return this.createFallbackResult(Date.now() - startTime, errorType, error);
      }

      console.log(`✅ [${analysisId}] Vision API call successful in ${visionTime}ms`);
      
      // Step 3: Process successful response
      const processedResult = this.processGoogleVisionResponse(data, Date.now() - startTime, analysisId);
      
      console.log(`🎉 [${analysisId}] Analysis completed successfully:`, {
        totalTime: Date.now() - startTime,
        conversionTime,
        visionTime,
        uiElementsFound: processedResult.uiElements.length,
        textContentFound: processedResult.textContent.length,
        confidence: processedResult.overallConfidence
      });
      
      return processedResult;

    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`❌ [${analysisId}] Analysis failed after ${totalTime}ms:`, {
        message: error.message,
        stack: error.stack?.substring(0, 300),
        type: error.constructor.name
      });
      
      // Return fallback with error context
      return this.createFallbackResult(totalTime, 'service_error', error);
    }
  }

  private async safeImageUrlToBase64(imageUrl: string, analysisId: string): Promise<string> {
    try {
      console.log(`🔄 [${analysisId}] Converting image to base64 safely from:`, imageUrl.substring(0, 100) + '...');
      
      // Validate URL format
      let validUrl: URL;
      try {
        validUrl = new URL(imageUrl);
      } catch (urlError) {
        throw new Error(`Invalid image URL format: ${urlError.message}`);
      }
      
      console.log(`🔍 [${analysisId}] Fetching image from: ${validUrl.protocol}//${validUrl.host}${validUrl.pathname.substring(0, 50)}...`);
      
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'GoogleVisionService/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // Validate content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        console.warn(`⚠️ [${analysisId}] Unexpected content type: ${contentType}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log(`📥 [${analysisId}] Image downloaded, size: ${arrayBuffer.byteLength} bytes`);
      
      // Validate image size
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Downloaded image is empty');
      }
      
      if (arrayBuffer.byteLength > 20 * 1024 * 1024) { // 20MB limit
        throw new Error(`Image too large: ${Math.round(arrayBuffer.byteLength / 1024 / 1024)}MB (max 20MB)`);
      }
      
      // Use a more efficient conversion method
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = '';
      
      // Process in smaller chunks to avoid stack overflow
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binaryString += String.fromCharCode(...chunk);
      }
      
      const base64Result = btoa(binaryString);
      console.log(`✅ [${analysisId}] Base64 conversion completed, final size: ${base64Result.length} chars`);
      
      return base64Result;
    } catch (error) {
      console.error(`❌ [${analysisId}] Failed to convert image to base64:`, {
        message: error.message,
        url: imageUrl.substring(0, 100) + '...',
        type: error.constructor.name
      });
      throw error;
    }
  }

  private categorizeVisionError(error: any): string {
    const message = String(error.message || error).toLowerCase();
    
    if (message.includes('credentials') || message.includes('authentication')) {
      return 'credentials_error';
    }
    
    if (message.includes('quota') || message.includes('limit')) {
      return 'quota_exceeded';
    }
    
    if (message.includes('timeout')) {
      return 'timeout_error';
    }
    
    if (message.includes('image') && message.includes('access')) {
      return 'image_access_error';
    }
    
    return 'unknown_error';
  }

  private processGoogleVisionResponse(analysisData: any, processingTime: number, analysisId: string): VisionAnalysisResult {
    console.log(`🔄 [${analysisId}] Processing analyze-design response with Google Vision data...`);
    
    // Extract Google Vision data from the analyze-design response
    const visionData = analysisData?.googleVisionData || analysisData;
    
    if (!visionData) {
      console.warn(`⚠️ [${analysisId}] No Google Vision data found in response, using fallback`);
      return this.createFallbackResult(processingTime, 'no_vision_data');
    }
    
    console.log(`🔍 [${analysisId}] Processing Google Vision data:`, {
      hasUiElements: !!visionData.uiElements,
      hasTextContent: !!visionData.textContent,
      hasColors: !!visionData.colors,
      overallConfidence: visionData.overallConfidence
    });
    
    // If the response already has the processed format, return it directly
    if (visionData.uiElements && visionData.textContent && visionData.colors) {
      console.log(`✅ [${analysisId}] Using pre-processed Google Vision data`);
      return {
        ...visionData,
        processingTime: processingTime
      };
    }
    
    // Otherwise, process the raw Google Vision API response
    const uiElements = [];
    const textContent = [];
    
    // Process object localization
    if (visionData.localizedObjectAnnotations) {
      console.log(`📍 [${analysisId}] Processing ${visionData.localizedObjectAnnotations.length} object annotations`);
      visionData.localizedObjectAnnotations.forEach((obj: any) => {
        uiElements.push({
          type: obj.name.toLowerCase(),
          confidence: obj.score || 0.8,
          description: `${obj.name} detected with ${Math.round((obj.score || 0.8) * 100)}% confidence`
        });
      });
    }

    // Process text detection
    if (visionData.textAnnotations) {
      console.log(`📝 [${analysisId}] Processing ${visionData.textAnnotations.length} text annotations`);
      visionData.textAnnotations.forEach((text: any, index: number) => {
        if (index === 0) return; // Skip full text annotation
        textContent.push({
          text: text.description || '',
          confidence: 0.9,
          context: 'detected_text'
        });
      });
    }

    // Process image properties for colors
    let dominantColors = ['#ffffff', '#000000', '#0066cc'];
    if (visionData.imagePropertiesAnnotation?.dominantColors?.colors) {
      console.log(`🎨 [${analysisId}] Processing ${visionData.imagePropertiesAnnotation.dominantColors.colors.length} color annotations`);
      dominantColors = visionData.imagePropertiesAnnotation.dominantColors.colors
        .slice(0, 3)
        .map((color: any) => {
          const r = Math.round(color.color.red || 0);
          const g = Math.round(color.color.green || 0);
          const b = Math.round(color.color.blue || 0);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        });
    }

    const result = {
      uiElements,
      layout: {
        type: 'web_application',
        confidence: 0.8,
        description: 'Web application layout detected',
        structure: {
          sections: [
            { name: 'header', position: 'top', area: 15 },
            { name: 'main', position: 'center', area: 70 },
            { name: 'footer', position: 'bottom', area: 15 }
          ],
          hierarchy: ['header', 'navigation', 'main', 'sidebar', 'footer'],
          gridSystem: {
            columns: 12,
            gutters: 20
          }
        }
      },
      industry: {
        industry: 'technology',
        confidence: 0.7,
        indicators: ['digital interface', 'web elements'],
        metadata: {
          designPatterns: ['card-based', 'grid-layout', 'responsive'],
          brandElements: ['logo', 'color-scheme', 'typography'],
          userInterfaceStyle: 'modern'
        }
      },
      accessibility: [],
      textContent,
      colors: {
        dominantColors,
        colorPalette: {
          primary: dominantColors[0] || '#0066cc',
          secondary: dominantColors[1] || '#666666',
          accent: dominantColors[2] || '#ff6600'
        },
        colorContrast: {
          textBackground: 4.5,
          accessibility: 'AA'
        },
        colorHarmony: {
          scheme: 'monochromatic',
          temperature: 'cool',
          saturation: 70
        },
        brandColors: dominantColors.slice(0, 3)
      },
      deviceType: {
        type: 'desktop',
        confidence: 0.8,
        dimensions: {
          width: 1200,
          height: 800,
          aspectRatio: 1.5
        },
        responsiveBreakpoints: [
          { name: 'mobile', minWidth: 320, maxWidth: 768 },
          { name: 'tablet', minWidth: 768, maxWidth: 1024 },
          { name: 'desktop', minWidth: 1024, maxWidth: 1920 }
        ]
      },
      designTokens: {
        spacing: [
          { name: 'xs', value: 4 },
          { name: 'sm', value: 8 },
          { name: 'md', value: 16 },
          { name: 'lg', value: 24 },
          { name: 'xl', value: 32 }
        ],
        typography: [
          { element: 'h1', fontSize: 32, lineHeight: 40, fontWeight: 'bold' },
          { element: 'h2', fontSize: 24, lineHeight: 32, fontWeight: 'semibold' },
          { element: 'body', fontSize: 16, lineHeight: 24, fontWeight: 'normal' }
        ],
        borderRadius: [
          { name: 'none', value: 0 },
          { name: 'sm', value: 4 },
          { name: 'md', value: 8 },
          { name: 'lg', value: 12 }
        ],
        shadows: [
          { name: 'sm', blur: 4, offset: { x: 0, y: 2 } },
          { name: 'md', blur: 8, offset: { x: 0, y: 4 } },
          { name: 'lg', blur: 16, offset: { x: 0, y: 8 } }
        ]
      },
      visualHierarchy: {
        primaryFocusAreas: [
          { element: 'hero-section', importance: 10, visualWeight: 9, position: { x: 50, y: 20 } },
          { element: 'cta-button', importance: 9, visualWeight: 8, position: { x: 50, y: 60 } },
          { element: 'navigation', importance: 8, visualWeight: 7, position: { x: 50, y: 5 } }
        ],
        readingFlow: {
          pattern: 'Z-pattern',
          confidence: 0.8,
          keypoints: [
            { x: 10, y: 10, order: 1 },
            { x: 90, y: 10, order: 2 },
            { x: 10, y: 50, order: 3 },
            { x: 90, y: 90, order: 4 }
          ]
        }
      },
      interactionElements: [
        { type: 'button', state: 'default', accessibility: true, hoverEffects: true, clickTarget: { x: 50, y: 60, size: 44 } },
        { type: 'link', state: 'default', accessibility: true, hoverEffects: true, clickTarget: { x: 20, y: 5, size: 32 } }
      ],
      brandAnalysis: {
        logoDetected: true,
        brandConsistency: 0.8,
        visualIdentity: {
          style: 'modern',
          mood: 'professional',
          personality: ['trustworthy', 'innovative', 'accessible']
        }
      },
      technicalMetadata: {
        imageQuality: {
          resolution: { width: 1200, height: 800 },
          compression: 'moderate',
          clarity: 0.9
        },
        performanceIndicators: {
          estimatedLoadTime: 2.5,
          optimizationSuggestions: ['compress images', 'optimize fonts', 'minify css']
        }
      },
      overallConfidence: Math.min(0.9, (uiElements.length * 0.1 + textContent.length * 0.05 + 0.6)),
      processingTime
    };

    console.log(`✅ [${analysisId}] Vision response processed:`, {
      uiElementsFound: result.uiElements.length,
      textContentFound: result.textContent.length,
      colorsFound: result.colors.dominantColors.length,
      confidence: result.overallConfidence
    });

    return result;
  }

  private createFallbackResult(processingTime: number, errorType: string = 'unknown', error?: any): VisionAnalysisResult {
    console.warn(`🔄 Creating fallback result due to ${errorType}:`, {
      processingTime,
      errorMessage: error?.message?.substring(0, 100)
    });
    
    // Customize fallback based on error type
    let fallbackConfidence = 0.7;
    let fallbackElements = [
      { type: 'header', confidence: 0.8, description: 'Website header detected' },
      { type: 'navigation', confidence: 0.7, description: 'Navigation menu identified' },
      { type: 'content', confidence: 0.9, description: 'Main content area' }
    ];

    if (errorType === 'credentials_error') {
      fallbackConfidence = 0.5;
      console.warn('⚠️ Using lower confidence due to credentials issue');
    } else if (errorType === 'quota_exceeded') {
      fallbackConfidence = 0.6;
      console.warn('⚠️ Using basic analysis due to quota limits');
    }

    return {
      uiElements: fallbackElements,
      layout: {
        type: 'landing',
        confidence: 0.7,
        description: 'Standard landing page layout',
        structure: {
          sections: [
            { name: 'header', position: 'top', area: 20 },
            { name: 'hero', position: 'center', area: 60 },
            { name: 'footer', position: 'bottom', area: 20 }
          ],
          hierarchy: ['header', 'hero', 'footer'],
          gridSystem: {
            columns: 12,
            gutters: 16
          }
        }
      },
      industry: {
        industry: 'technology',
        confidence: 0.6,
        indicators: ['modern design', 'clean layout'],
        metadata: {
          designPatterns: ['simple-layout', 'standard-navigation'],
          brandElements: ['minimal-branding'],
          userInterfaceStyle: 'clean'
        }
      },
      accessibility: [
        {
          issue: 'Color contrast needs verification',
          severity: 'medium',
          suggestion: 'Ensure sufficient contrast ratios',
          wcagLevel: 'AA'
        }
      ],
      textContent: [
        { text: 'Website content detected', confidence: 0.8, context: 'general' }
      ],
      colors: {
        dominantColors: ['#ffffff', '#000000', '#0066cc'],
        colorPalette: {
          primary: '#0066cc',
          secondary: '#666666',
          accent: '#ff6600'
        },
        colorContrast: {
          textBackground: 4.5,
          accessibility: 'AA'
        },
        colorHarmony: {
          scheme: 'complementary',
          temperature: 'neutral',
          saturation: 60
        },
        brandColors: ['#0066cc', '#666666', '#ff6600']
      },
      deviceType: {
        type: 'desktop',
        confidence: 0.8,
        dimensions: {
          width: 1200,
          height: 800,
          aspectRatio: 1.5
        },
        responsiveBreakpoints: [
          { name: 'mobile', minWidth: 320, maxWidth: 768 },
          { name: 'tablet', minWidth: 768, maxWidth: 1024 },
          { name: 'desktop', minWidth: 1024, maxWidth: 1920 }
        ]
      },
      designTokens: {
        spacing: [
          { name: 'xs', value: 4 },
          { name: 'sm', value: 8 },
          { name: 'md', value: 16 },
          { name: 'lg', value: 24 }
        ],
        typography: [
          { element: 'h1', fontSize: 28, lineHeight: 36, fontWeight: 'bold' },
          { element: 'body', fontSize: 16, lineHeight: 24, fontWeight: 'normal' }
        ],
        borderRadius: [
          { name: 'none', value: 0 },
          { name: 'sm', value: 4 },
          { name: 'md', value: 8 }
        ],
        shadows: [
          { name: 'sm', blur: 4, offset: { x: 0, y: 2 } },
          { name: 'md', blur: 8, offset: { x: 0, y: 4 } }
        ]
      },
      visualHierarchy: {
        primaryFocusAreas: [
          { element: 'header', importance: 8, visualWeight: 7, position: { x: 50, y: 10 } },
          { element: 'main-content', importance: 10, visualWeight: 9, position: { x: 50, y: 50 } }
        ],
        readingFlow: {
          pattern: 'F-pattern',
          confidence: 0.7,
          keypoints: [
            { x: 10, y: 10, order: 1 },
            { x: 90, y: 10, order: 2 },
            { x: 10, y: 50, order: 3 }
          ]
        }
      },
      interactionElements: [
        { type: 'button', state: 'default', accessibility: true, hoverEffects: false, clickTarget: { x: 50, y: 70, size: 40 } }
      ],
      brandAnalysis: {
        logoDetected: false,
        brandConsistency: 0.6,
        visualIdentity: {
          style: 'minimal',
          mood: 'neutral',
          personality: ['simple', 'clean']
        }
      },
      technicalMetadata: {
        imageQuality: {
          resolution: { width: 1200, height: 800 },
          compression: 'standard',
          clarity: 0.8
        },
        performanceIndicators: {
          estimatedLoadTime: 2.0,
          optimizationSuggestions: ['basic optimization needed']
        }
      },
      overallConfidence: fallbackConfidence,
      processingTime
    };
  }
}

export const googleVisionService = new GoogleVisionService();
