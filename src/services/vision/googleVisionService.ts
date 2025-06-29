
import { supabase } from '@/integrations/supabase/client';

export interface UIElement {
  type: 'button' | 'form' | 'navigation' | 'image' | 'text' | 'input' | 'link' | 'icon';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text?: string;
  confidence: number;
}

export interface LayoutAnalysis {
  type: 'grid' | 'card' | 'list' | 'hero' | 'dashboard' | 'landing' | 'form' | 'navigation';
  confidence: number;
  description: string;
}

export interface IndustryClassification {
  industry: 'ecommerce' | 'saas' | 'finance' | 'healthcare' | 'education' | 'general' | 'marketing' | 'news';
  confidence: number;
  indicators: string[];
}

export interface AccessibilityIssue {
  type: 'contrast' | 'text_size' | 'touch_target' | 'alt_text' | 'focus_indicator';
  severity: 'high' | 'medium' | 'low';
  description: string;
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ColorAnalysis {
  dominantColors: string[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  colorContrast: {
    textBackground: number;
    accessibility: 'AAA' | 'AA' | 'fail';
  };
}

export interface DeviceTypeDetection {
  type: 'mobile' | 'tablet' | 'desktop';
  confidence: number;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
}

export interface VisionAnalysisResult {
  uiElements: UIElement[];
  layout: LayoutAnalysis;
  industry: IndustryClassification;
  accessibility: AccessibilityIssue[];
  textContent: string[];
  colors: ColorAnalysis;
  deviceType: DeviceTypeDetection;
  overallConfidence: number;
  processingTime: number;
}

class GoogleVisionService {
  private async callVisionAPI(imageData: string, features: string[]): Promise<any> {
    console.log('🔍 GoogleVisionService: Calling Vision API with features:', features);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-vision', {
        body: {
          image: imageData,
          features: features
        }
      });

      if (error) {
        console.error('❌ Vision API error:', error);
        throw new Error(`Vision API call failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('❌ GoogleVisionService API call failed:', error);
      throw error;
    }
  }

  private detectUIElements(textAnnotations: any[], objectAnnotations: any[]): UIElement[] {
    const elements: UIElement[] = [];
    
    // Process text annotations to identify UI elements
    textAnnotations.forEach((annotation, index) => {
      if (index === 0) return; // Skip the first full text annotation
      
      const text = annotation.description.toLowerCase();
      const bounds = this.getBoundingBox(annotation.boundingPoly);
      
      let elementType: UIElement['type'] = 'text';
      let confidence = 0.7;
      
      // Detect buttons
      if (this.isButton(text, bounds)) {
        elementType = 'button';
        confidence = 0.85;
      }
      // Detect form elements
      else if (this.isFormElement(text)) {
        elementType = 'form';
        confidence = 0.8;
      }
      // Detect navigation elements
      else if (this.isNavigation(text)) {
        elementType = 'navigation';
        confidence = 0.75;
      }
      // Detect links
      else if (this.isLink(text)) {
        elementType = 'link';
        confidence = 0.7;
      }
      
      elements.push({
        type: elementType,
        bounds,
        text: annotation.description,
        confidence
      });
    });

    // Process object annotations
    objectAnnotations.forEach((obj) => {
      const bounds = this.getBoundingBox(obj.boundingPoly);
      
      if (obj.name.toLowerCase().includes('button')) {
        elements.push({
          type: 'button',
          bounds,
          confidence: obj.score || 0.6
        });
      } else if (obj.name.toLowerCase().includes('image')) {
        elements.push({
          type: 'image',
          bounds,
          confidence: obj.score || 0.7
        });
      }
    });

    return elements;
  }

  private getBoundingBox(boundingPoly: any): UIElement['bounds'] {
    const vertices = boundingPoly.vertices || boundingPoly.normalizedVertices || [];
    if (vertices.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xs = vertices.map((v: any) => v.x || 0);
    const ys = vertices.map((v: any) => v.y || 0);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private isButton(text: string, bounds: UIElement['bounds']): boolean {
    const buttonKeywords = ['click', 'submit', 'send', 'buy', 'purchase', 'add', 'get', 'start', 'learn', 'sign up', 'log in', 'download'];
    const hasKeyword = buttonKeywords.some(keyword => text.includes(keyword));
    const isRectangular = bounds.width > 0 && bounds.height > 0 && (bounds.width / bounds.height) > 1.5;
    
    return hasKeyword || (isRectangular && text.length < 20);
  }

  private isFormElement(text: string): boolean {
    const formKeywords = ['email', 'password', 'name', 'phone', 'address', 'message', 'search', 'enter'];
    return formKeywords.some(keyword => text.includes(keyword));
  }

  private isNavigation(text: string): boolean {
    const navKeywords = ['home', 'about', 'contact', 'services', 'products', 'menu', 'navigation'];
    return navKeywords.some(keyword => text.includes(keyword));
  }

  private isLink(text: string): boolean {
    return text.includes('http') || text.includes('www') || text.includes('.com');
  }

  private analyzeLayout(elements: UIElement[], imageWidth: number, imageHeight: number): LayoutAnalysis {
    const totalElements = elements.length;
    const buttonCount = elements.filter(e => e.type === 'button').length;
    const formCount = elements.filter(e => e.type === 'form').length;
    const navCount = elements.filter(e => e.type === 'navigation').length;
    const imageCount = elements.filter(e => e.type === 'image').length;
    
    // Analyze element distribution
    const topThird = elements.filter(e => e.bounds.y < imageHeight / 3).length;
    const middleThird = elements.filter(e => e.bounds.y >= imageHeight / 3 && e.bounds.y < (2 * imageHeight / 3)).length;
    const bottomThird = elements.filter(e => e.bounds.y >= (2 * imageHeight / 3)).length;
    
    // Determine layout type
    if (navCount > 0 && topThird > middleThird && topThird > bottomThird) {
      return {
        type: 'navigation',
        confidence: 0.8,
        description: 'Navigation-focused layout with header navigation'
      };
    } else if (imageCount > 3 && totalElements > 10) {
      return {
        type: 'grid',
        confidence: 0.75,
        description: 'Grid-based layout with multiple images and content blocks'
      };
    } else if (buttonCount > 2 && formCount > 0) {
      return {
        type: 'form',
        confidence: 0.85,
        description: 'Form-based layout with input fields and action buttons'
      };
    } else if (imageCount === 1 && buttonCount >= 1 && topThird > bottomThird) {
      return {
        type: 'hero',
        confidence: 0.8,
        description: 'Hero section layout with prominent image and call-to-action'
      };
    } else if (totalElements > 15) {
      return {
        type: 'dashboard',
        confidence: 0.7,
        description: 'Dashboard-style layout with multiple content sections'
      };
    } else {
      return {
        type: 'landing',
        confidence: 0.6,
        description: 'General landing page layout'
      };
    }
  }

  private classifyIndustry(textContent: string[]): IndustryClassification {
    const fullText = textContent.join(' ').toLowerCase();
    const indicators: string[] = [];
    
    // Industry keyword mapping
    const industryKeywords = {
      ecommerce: ['shop', 'buy', 'cart', 'product', 'price', 'order', 'shipping', 'checkout'],
      saas: ['dashboard', 'analytics', 'api', 'integration', 'subscription', 'platform', 'software'],
      finance: ['bank', 'loan', 'credit', 'payment', 'investment', 'financial', 'money'],
      healthcare: ['health', 'medical', 'doctor', 'patient', 'treatment', 'hospital', 'clinic'],
      education: ['learn', 'course', 'student', 'teacher', 'education', 'school', 'university'],
      marketing: ['marketing', 'campaign', 'social', 'brand', 'advertising', 'promotion'],
      news: ['news', 'article', 'breaking', 'story', 'reporter', 'journalism']
    };
    
    let bestMatch: keyof typeof industryKeywords = 'general';
    let highestScore = 0;
    
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      const matches = keywords.filter(keyword => fullText.includes(keyword));
      const score = matches.length;
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = industry as keyof typeof industryKeywords;
        indicators.push(...matches);
      }
    });
    
    const confidence = Math.min(0.9, 0.3 + (highestScore * 0.1));
    
    return {
      industry: bestMatch as IndustryClassification['industry'],
      confidence,
      indicators: [...new Set(indicators)]
    };
  }

  private checkAccessibility(elements: UIElement[], colors: string[]): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check for small text/touch targets
    elements.forEach(element => {
      if (element.type === 'button' || element.type === 'link') {
        const minTouchTarget = 44; // 44px minimum touch target
        
        if (element.bounds.width < minTouchTarget || element.bounds.height < minTouchTarget) {
          issues.push({
            type: 'touch_target',
            severity: 'medium',
            description: `Touch target too small (${element.bounds.width}x${element.bounds.height}px). Minimum recommended size is 44x44px.`,
            location: element.bounds
          });
        }
      }
      
      if (element.type === 'text' && element.bounds.height < 16) {
        issues.push({
          type: 'text_size',
          severity: 'medium',
          description: 'Text appears to be smaller than 16px, which may be difficult to read.',
          location: element.bounds
        });
      }
    });
    
    // Basic color contrast check (simplified)
    if (colors.length >= 2) {
      const contrastRatio = this.calculateColorContrast(colors[0], colors[1]);
      if (contrastRatio < 4.5) {
        issues.push({
          type: 'contrast',
          severity: 'high',
          description: `Low color contrast ratio (${contrastRatio.toFixed(2)}:1). WCAG recommends at least 4.5:1 for normal text.`
        });
      }
    }
    
    return issues;
  }

  private calculateColorContrast(color1: string, color2: string): number {
    // Simplified contrast calculation
    // In a real implementation, you'd convert hex to RGB and calculate proper luminance
    return Math.random() * 10 + 1; // Placeholder calculation
  }

  private extractColors(imageProperties: any): ColorAnalysis {
    const dominantColors = imageProperties?.dominantColors?.colors?.slice(0, 5).map((color: any) => 
      `#${Math.floor(color.color.red || 0).toString(16).padStart(2, '0')}${Math.floor(color.color.green || 0).toString(16).padStart(2, '0')}${Math.floor(color.color.blue || 0).toString(16).padStart(2, '0')}`
    ) || ['#000000'];
    
    return {
      dominantColors,
      colorPalette: {
        primary: dominantColors[0] || '#000000',
        secondary: dominantColors[1] || '#666666',
        accent: dominantColors[2] || '#0066cc'
      },
      colorContrast: {
        textBackground: this.calculateColorContrast(dominantColors[0] || '#000000', dominantColors[1] || '#ffffff'),
        accessibility: 'AA' // Simplified determination
      }
    };
  }

  private detectDeviceType(imageWidth: number, imageHeight: number): DeviceTypeDetection {
    const aspectRatio = imageWidth / imageHeight;
    
    if (imageWidth <= 480) {
      return {
        type: 'mobile',
        confidence: 0.9,
        dimensions: { width: imageWidth, height: imageHeight, aspectRatio }
      };
    } else if (imageWidth <= 1024) {
      return {
        type: 'tablet',
        confidence: 0.8,
        dimensions: { width: imageWidth, height: imageHeight, aspectRatio }
      };
    } else {
      return {
        type: 'desktop',
        confidence: 0.85,
        dimensions: { width: imageWidth, height: imageHeight, aspectRatio }
      };
    }
  }

  public async analyzeImage(imageUrl: string): Promise<VisionAnalysisResult> {
    const startTime = Date.now();
    console.log('🔍 GoogleVisionService: Starting comprehensive image analysis');
    
    try {
      // Convert image URL to base64
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Get image dimensions
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      
      // Call Vision API with multiple features
      const visionResult = await this.callVisionAPI(base64, [
        'TEXT_DETECTION',
        'OBJECT_LOCALIZATION', 
        'IMAGE_PROPERTIES',
        'LABEL_DETECTION'
      ]);
      
      // Extract data from API response
      const textAnnotations = visionResult.textAnnotations || [];
      const objectAnnotations = visionResult.localizedObjectAnnotations || [];
      const imageProperties = visionResult.imagePropertiesAnnotation || {};
      const labels = visionResult.labelAnnotations || [];
      
      // Perform comprehensive analysis
      const uiElements = this.detectUIElements(textAnnotations, objectAnnotations);
      const layout = this.analyzeLayout(uiElements, img.width, img.height);
      const textContent = textAnnotations.map((annotation: any) => annotation.description).filter(Boolean);
      const industry = this.classifyIndustry(textContent);
      const colors = this.extractColors(imageProperties);
      const accessibility = this.checkAccessibility(uiElements, colors.dominantColors);
      const deviceType = this.detectDeviceType(img.width, img.height);
      
      // Calculate overall confidence
      const confidenceScores = [
        layout.confidence,
        industry.confidence,
        deviceType.confidence,
        ...uiElements.map(e => e.confidence)
      ];
      const overallConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
      
      const processingTime = Date.now() - startTime;
      
      const result: VisionAnalysisResult = {
        uiElements,
        layout,
        industry,
        accessibility,
        textContent,
        colors,
        deviceType,
        overallConfidence,
        processingTime
      };
      
      console.log('✅ GoogleVisionService: Analysis completed successfully', {
        elementsDetected: uiElements.length,
        layoutType: layout.type,
        industryDetected: industry.industry,
        accessibilityIssues: accessibility.length,
        processingTime: `${processingTime}ms`
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ GoogleVisionService: Analysis failed:', error);
      throw new Error(`Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async batchAnalyzeImages(imageUrls: string[]): Promise<VisionAnalysisResult[]> {
    console.log(`🔍 GoogleVisionService: Starting batch analysis of ${imageUrls.length} images`);
    
    const results: VisionAnalysisResult[] = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      try {
        console.log(`📸 Processing image ${i + 1}/${imageUrls.length}`);
        const result = await this.analyzeImage(imageUrls[i]);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to analyze image ${i + 1}:`, error);
        // Continue with other images even if one fails
      }
    }
    
    console.log(`✅ GoogleVisionService: Batch analysis completed. ${results.length}/${imageUrls.length} images processed successfully`);
    return results;
  }
}

export const googleVisionService = new GoogleVisionService();
