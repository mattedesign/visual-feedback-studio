
import { SearchFilters, VectorSearchOptions } from '@/types/vectorDatabase';

export class TypeAdapter {
  static searchFiltersToVectorOptions(filters?: SearchFilters): VectorSearchOptions {
    if (!filters) return {};
    
    return {
      maxResults: filters.match_count || 10,
      confidenceThreshold: filters.match_threshold || 0.7,
      categories: filters.primary_category ? [filters.primary_category] : [],
      industries: filters.industry_tags || []
    };
  }
  
  static vectorOptionsToSearchFilters(options?: VectorSearchOptions): SearchFilters {
    if (!options) return {};
    
    return {
      match_count: options.maxResults || 10,
      match_threshold: options.confidenceThreshold || 0.7,
      primary_category: options.categories?.[0],
      industry_tags: options.industries
    };
  }
}
