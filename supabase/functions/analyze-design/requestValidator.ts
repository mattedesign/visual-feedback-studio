
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface AnalysisRequest {
  imageUrls?: string[];
  analysisId?: string;
  analysisPrompt?: string;
  designType?: string;
  isComparative?: boolean;
  ragEnabled?: boolean;
  ragEnhanced?: boolean;
}

// Enhanced image format detection for both URLs and base64 data
interface ImageValidationResult {
  isValid: boolean;
  format: 'url' | 'base64' | 'invalid';
  mimeType?: string;
  error?: string;
}

class RequestValidator {
  validate(requestData: AnalysisRequest): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!requestData.imageUrls || !Array.isArray(requestData.imageUrls)) {
      errors.push('imageUrls is required and must be an array');
    } else if (requestData.imageUrls.length === 0) {
      errors.push('At least one image URL is required');
    } else if (requestData.imageUrls.length > 10) {
      errors.push('Maximum 10 images allowed');
    }

    // ✅ ENHANCED: Validate image data (URLs or base64)
    if (requestData.imageUrls && Array.isArray(requestData.imageUrls)) {
      requestData.imageUrls.forEach((imageData, index) => {
        if (typeof imageData !== 'string' || imageData.trim().length === 0) {
          errors.push(`Image data at index ${index} is invalid - must be a non-empty string`);
          return;
        }

        const validationResult = this.validateImageData(imageData, index);
        if (!validationResult.isValid) {
          errors.push(validationResult.error || `Image data at index ${index} is invalid`);
        }
      });
    }

    // Validate analysis ID
    if (!requestData.analysisId || typeof requestData.analysisId !== 'string') {
      errors.push('analysisId is required and must be a string');
    }

    // Validate analysis prompt
    if (!requestData.analysisPrompt || typeof requestData.analysisPrompt !== 'string') {
      errors.push('analysisPrompt is required and must be a string');
    } else if (requestData.analysisPrompt.trim().length < 10) {
      errors.push('analysisPrompt must be at least 10 characters long');
    } else if (requestData.analysisPrompt.length > 2000) {
      errors.push('analysisPrompt must be less than 2000 characters');
    }

    // Validate optional fields
    if (requestData.designType && typeof requestData.designType !== 'string') {
      errors.push('designType must be a string');
    }

    if (requestData.isComparative !== undefined && typeof requestData.isComparative !== 'boolean') {
      errors.push('isComparative must be a boolean');
    }

    if (requestData.ragEnabled !== undefined && typeof requestData.ragEnabled !== 'boolean') {
      errors.push('ragEnabled must be a boolean');
    }

    if (requestData.ragEnhanced !== undefined && typeof requestData.ragEnhanced !== 'boolean') {
      errors.push('ragEnhanced must be a boolean');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ✅ ENHANCED: Comprehensive image data validation for URLs and base64
  private validateImageData(imageData: string, index: number): ImageValidationResult {
    console.log(`🔍 Validating image data at index ${index}:`, {
      length: imageData.length,
      startsWithHttp: imageData.startsWith('http'),
      startsWithData: imageData.startsWith('data:'),
      preview: imageData.substring(0, 50) + '...'
    });

    // Check if it's a base64 data URL
    if (imageData.startsWith('data:')) {
      return this.validateBase64DataUrl(imageData, index);
    }
    
    // Check if it's a regular HTTP URL
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      return this.validateHttpUrl(imageData, index);
    }

    // Check if it's raw base64 (without data: prefix)
    if (this.isLikelyBase64(imageData)) {
      console.log(`⚠️  Image at index ${index} appears to be raw base64 without data: prefix`);
      return {
        isValid: false,
        format: 'invalid',
        error: `Image at index ${index} appears to be base64 data but is missing the "data:" prefix. Expected format: "data:image/jpeg;base64,..." or a valid HTTP URL`
      };
    }

    return {
      isValid: false,
      format: 'invalid',
      error: `Image at index ${index} must be either a valid HTTP URL or a base64 data URL starting with "data:image/"`
    };
  }

  // Validate base64 data URLs (data:image/...)
  private validateBase64DataUrl(dataUrl: string, index: number): ImageValidationResult {
    const dataUrlPattern = /^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/i;
    const match = dataUrl.match(dataUrlPattern);
    
    if (!match) {
      console.error(`❌ Invalid data URL format at index ${index}`);
      return {
        isValid: false,
        format: 'invalid',
        error: `Image at index ${index} has invalid data URL format. Expected: "data:image/{jpeg|png|webp|gif};base64,{base64data}"`
      };
    }

    const [, mimeFormat, base64Data] = match;
    const mimeType = `image/${mimeFormat.toLowerCase()}`;

    // Validate base64 data
    if (base64Data.length < 100) {
      return {
        isValid: false,
        format: 'invalid',
        error: `Image at index ${index} has suspiciously short base64 data (${base64Data.length} chars). May be corrupted.`
      };
    }

    // Check for valid base64 characters
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
      return {
        isValid: false,
        format: 'invalid',
        error: `Image at index ${index} contains invalid base64 characters`
      };
    }

    console.log(`✅ Valid base64 image at index ${index}:`, {
      mimeType,
      base64Length: base64Data.length,
      totalLength: dataUrl.length
    });

    return {
      isValid: true,
      format: 'base64',
      mimeType
    };
  }

  // Validate HTTP URLs
  private validateHttpUrl(url: string, index: number): ImageValidationResult {
    try {
      const urlObj = new URL(url);
      
      // Check protocol
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return {
          isValid: false,
          format: 'invalid',
          error: `Image URL at index ${index} must use HTTP or HTTPS protocol`
        };
      }

      // Check for common image file extensions (optional validation)
      const pathname = urlObj.pathname.toLowerCase();
      const hasImageExtension = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(pathname);
      
      if (!hasImageExtension) {
        console.warn(`⚠️  URL at index ${index} doesn't have a common image extension:`, pathname);
        // Don't fail validation for this - some URLs might not have extensions
      }

      console.log(`✅ Valid HTTP URL at index ${index}:`, {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
        hasImageExtension
      });

      return {
        isValid: true,
        format: 'url'
      };
    } catch (error) {
      return {
        isValid: false,
        format: 'invalid',
        error: `Image URL at index ${index} is not a valid URL: ${error.message}`
      };
    }
  }

  // Check if string looks like base64 data
  private isLikelyBase64(data: string): boolean {
    // Base64 strings are typically long and contain only valid base64 characters
    return data.length > 100 && /^[A-Za-z0-9+/]*={0,2}$/.test(data);
  }

  // Legacy method for backward compatibility
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const requestValidator = new RequestValidator();
