// ✅ NEW: Image URL validation and healing utility
export interface ImageValidationResult {
  isValid: boolean;
  isAccessible: boolean;
  healedUrl?: string;
  error?: string;
}

/**
 * Validates and attempts to heal image URLs for better reliability
 */
export class ImageUrlValidator {
  
  /**
   * Check if an image URL is accessible and valid
   */
  static async validateImageUrl(url: string): Promise<ImageValidationResult> {
    console.log('🔍 Validating image URL:', url.substring(0, 80) + '...');
    
    if (!url || typeof url !== 'string') {
      return { isValid: false, isAccessible: false, error: 'Invalid URL format' };
    }

    try {
      // Basic URL format validation
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, isAccessible: false, error: 'Invalid protocol' };
      }

      // Check if image is accessible
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const isImage = contentType?.startsWith('image/') || false;
        
        console.log('✅ Image URL validation successful:', {
          url: url.substring(0, 80) + '...',
          status: response.status,
          contentType,
          isImage
        });

        return {
          isValid: true,
          isAccessible: true,
          healedUrl: url
        };
      } else {
        console.warn('⚠️ Image URL not accessible:', {
          url: url.substring(0, 80) + '...',
          status: response.status,
          statusText: response.statusText
        });

        // Attempt to heal the URL
        const healedUrl = this.attemptUrlHealing(url);
        if (healedUrl && healedUrl !== url) {
          console.log('🔧 Attempting URL healing:', healedUrl);
          return await this.validateImageUrl(healedUrl);
        }

        return {
          isValid: true, // URL format is valid
          isAccessible: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      console.error('❌ Image URL validation failed:', error);
      
      // Attempt to heal the URL on error
      const healedUrl = this.attemptUrlHealing(url);
      if (healedUrl && healedUrl !== url) {
        console.log('🔧 Attempting URL healing after error:', healedUrl);
        try {
          return await this.validateImageUrl(healedUrl);
        } catch (healError) {
          console.error('❌ URL healing also failed:', healError);
        }
      }

      return {
        isValid: false,
        isAccessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Attempt to heal common URL issues
   */
  private static attemptUrlHealing(url: string): string | null {
    console.log('🔧 Attempting to heal URL:', url);

    // Common healing strategies
    const healingStrategies = [
      // Remove trailing slashes or extra characters
      (url: string) => url.replace(/\/$/, ''),
      
      // Fix double slashes in path
      (url: string) => url.replace(/([^:]\/)\/+/g, '$1'),
      
      // Ensure HTTPS for known secure domains
      (url: string) => {
        if (url.startsWith('http://') && (url.includes('supabase.co') || url.includes('cloudinary.com'))) {
          return url.replace('http://', 'https://');
        }
        return url;
      },

      // Fix common Supabase storage URL issues
      (url: string) => {
        if (url.includes('supabase.co') && !url.includes('/storage/v1/object/public/')) {
          const parts = url.split('/');
          const bucketIndex = parts.findIndex(part => part === 'analysis-images' || part === 'analysis-files');
          if (bucketIndex > 0) {
            const baseUrl = parts.slice(0, bucketIndex - 1).join('/');
            const bucketAndPath = parts.slice(bucketIndex).join('/');
            return `${baseUrl}/storage/v1/object/public/${bucketAndPath}`;
          }
        }
        return url;
      }
    ];

    for (const strategy of healingStrategies) {
      try {
        const healed = strategy(url);
        if (healed !== url) {
          console.log('🔧 URL healing strategy applied:', {
            original: url.substring(0, 50) + '...',
            healed: healed.substring(0, 50) + '...'
          });
          return healed;
        }
      } catch (error) {
        console.error('❌ URL healing strategy failed:', error);
      }
    }

    return null;
  }

  /**
   * Validate multiple image URLs and return results
   */
  static async validateImageUrls(urls: string[]): Promise<ImageValidationResult[]> {
    console.log(`🔍 Validating ${urls.length} image URLs...`);
    
    const results = await Promise.all(
      urls.map(url => this.validateImageUrl(url))
    );

    const summary = {
      total: results.length,
      valid: results.filter(r => r.isValid).length,
      accessible: results.filter(r => r.isAccessible).length,
      healed: results.filter(r => r.healedUrl && r.healedUrl !== urls[results.indexOf(r)]).length
    };

    console.log('📊 Image URL validation summary:', summary);
    return results;
  }
}