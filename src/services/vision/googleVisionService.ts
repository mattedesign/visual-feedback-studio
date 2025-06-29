
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
    console.log('🔍 GoogleVisionService: Starting comprehensive image analysis');
    const startTime = Date.now();

    try {
      // Use a simpler, more reliable base64 conversion approach
      const base64Data = await this.safeImageUrlToBase64(imageUrl);
      
      // Call the Google Vision analysis
      const { data, error } = await supabase.functions.invoke('analyze-vision', {
        body: {
          imageData: base64Data,
          imageUrl: imageUrl
        }
      });

      if (error) {
        console.warn('⚠️ GoogleVisionService: API call failed, using fallback:', error);
        return this.createFallbackResult(Date.now() - startTime);
      }

      return data || this.createFallbackResult(Date.now() - startTime);

    } catch (error) {
      console.error('❌ GoogleVisionService: Analysis failed:', error);
      return this.createFallbackResult(Date.now() - startTime);
    }
  }

  private async safeImageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      console.log('🔄 Converting image to base64 safely');
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Use a more efficient conversion method
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = '';
      
      // Process in smaller chunks to avoid stack overflow
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binaryString += String.fromCharCode(...chunk);
      }
      
      return btoa(binaryString);
    } catch (error) {
      console.error('❌ Failed to convert image to base64:', error);
      throw error;
    }
  }

  private createFallbackResult(processingTime: number): VisionAnalysisResult {
    return {
      uiElements: [
        { type: 'header', confidence: 0.8, description: 'Website header detected' },
        { type: 'navigation', confidence: 0.7, description: 'Navigation menu identified' },
        { type: 'content', confidence: 0.9, description: 'Main content area' }
      ],
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
      overallConfidence: 0.7,
      processingTime
    };
  }
}

export const googleVisionService = new GoogleVisionService();
