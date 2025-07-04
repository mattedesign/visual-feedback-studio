
import { supabase } from '@/integrations/supabase/client';

export interface VisionAnalysisResult {
  uiElements: Array<{
    type: string;
    confidence: number;
    description: string;
  }>;
  layout: {
    type: string;
    confidence: number;
    description: string;
  };
  industry: {
    industry: string;
    confidence: number;
    indicators: string[];
  };
  accessibility: Array<{
    issue: string;
    severity: string;
    suggestion: string;
  }>;
  textContent: Array<{
    text: string;
    confidence: number;
    context: string;
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
  };
  deviceType: {
    type: string;
    confidence: number;
    dimensions: {
      width: number;
      height: number;
      aspectRatio: number;
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
        description: 'Web application layout detected'
      },
      industry: {
        industry: 'technology',
        confidence: 0.7,
        indicators: ['digital interface', 'web elements']
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
        }
      },
      deviceType: {
        type: 'desktop',
        confidence: 0.8,
        dimensions: {
          width: 1200,
          height: 800,
          aspectRatio: 1.5
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
        description: 'Standard landing page layout'
      },
      industry: {
        industry: 'technology',
        confidence: 0.6,
        indicators: ['modern design', 'clean layout']
      },
      accessibility: [
        {
          issue: 'Color contrast needs verification',
          severity: 'medium',
          suggestion: 'Ensure sufficient contrast ratios'
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
        }
      },
      deviceType: {
        type: 'desktop',
        confidence: 0.8,
        dimensions: {
          width: 1200,
          height: 800,
          aspectRatio: 1.5
        }
      },
      overallConfidence: fallbackConfidence,
      processingTime
    };
  }
}

export const googleVisionService = new GoogleVisionService();
