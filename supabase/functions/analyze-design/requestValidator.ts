
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

    // Validate image URLs
    if (requestData.imageUrls && Array.isArray(requestData.imageUrls)) {
      requestData.imageUrls.forEach((url, index) => {
        if (typeof url !== 'string' || url.trim().length === 0) {
          errors.push(`Image URL at index ${index} is invalid`);
        } else if (!this.isValidUrl(url)) {
          errors.push(`Image URL at index ${index} is not a valid URL`);
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
