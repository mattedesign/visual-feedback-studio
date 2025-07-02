import { KnowledgeEntry } from '@/types/vectorDatabase';

export interface RagValidationOptions {
  maxKnowledgeEntries: number;
  minRelevanceScore: number;
  requireImageRelevance: boolean;
  enableContentFiltering: boolean;
  maxContentLength: number;
}

export interface RagValidationResult {
  validatedEntries: KnowledgeEntry[];
  filteredCount: number;
  relevanceScores: Record<string, number>;
  filteringReasons: Record<string, string[]>;
  overallQuality: number;
}

export interface RagImpactAnalysis {
  hallucinationRisk: number;
  contextAlignment: number;
  knowledgeQuality: number;
  recommendations: string[];
}

class RagContentValidator {
  private readonly DEFAULT_OPTIONS: RagValidationOptions = {
    maxKnowledgeEntries: 8,
    minRelevanceScore: 0.75,
    requireImageRelevance: true,
    enableContentFiltering: true,
    maxContentLength: 500
  };

  /**
   * Validate and filter RAG content for analysis
   */
  async validateRagContent(
    knowledgeEntries: KnowledgeEntry[],
    analysisPrompt: string,
    imageUrls: string[],
    options: Partial<RagValidationOptions> = {}
  ): Promise<RagValidationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    console.log('🔍 RAG Validator: Validating knowledge content', {
      totalEntries: knowledgeEntries.length,
      options: opts
    });

    const validatedEntries: KnowledgeEntry[] = [];
    const relevanceScores: Record<string, number> = {};
    const filteringReasons: Record<string, string[]> = {};
    let filteredCount = 0;

    for (const entry of knowledgeEntries) {
      const validation = await this.validateSingleEntry(entry, analysisPrompt, opts);
      
      relevanceScores[entry.id] = validation.relevanceScore;
      
      if (validation.isValid) {
        // Apply content filtering
        const filteredEntry = this.filterEntryContent(entry, opts);
        validatedEntries.push(filteredEntry);
      } else {
        filteredCount++;
        filteringReasons[entry.id] = validation.reasons;
      }
    }

    // Sort by relevance and limit to max entries
    validatedEntries.sort((a, b) => 
      (relevanceScores[b.id] || 0) - (relevanceScores[a.id] || 0)
    );
    
    const finalEntries = validatedEntries.slice(0, opts.maxKnowledgeEntries);
    const overallQuality = this.calculateOverallQuality(finalEntries, relevanceScores);

    console.log('✅ RAG Validator: Validation complete', {
      validatedCount: finalEntries.length,
      filteredCount,
      overallQuality
    });

    return {
      validatedEntries: finalEntries,
      filteredCount,
      relevanceScores,
      filteringReasons,
      overallQuality
    };
  }

  /**
   * Analyze RAG impact on potential hallucinations
   */
  analyzeRagImpact(
    knowledgeEntries: KnowledgeEntry[],
    analysisPrompt: string
  ): RagImpactAnalysis {
    const hallucinationRisk = this.assessHallucinationRisk(knowledgeEntries, analysisPrompt);
    const contextAlignment = this.assessContextAlignment(knowledgeEntries, analysisPrompt);
    const knowledgeQuality = this.assessKnowledgeQuality(knowledgeEntries);
    const recommendations = this.generateRecommendations(hallucinationRisk, contextAlignment, knowledgeQuality);

    return {
      hallucinationRisk,
      contextAlignment,
      knowledgeQuality,
      recommendations
    };
  }

  /**
   * Generate RAG-enhanced prompt with hallucination safeguards
   */
  buildSafeRagPrompt(
    originalPrompt: string,
    validatedEntries: KnowledgeEntry[],
    ragValidation: RagValidationResult
  ): string {
    if (validatedEntries.length === 0) {
      return originalPrompt;
    }

    const safetyInstructions = this.generateSafetyInstructions(ragValidation);
    const contextSection = this.buildContextSection(validatedEntries);
    const citationInstructions = this.generateCitationInstructions();

    return `${originalPrompt}

=== RESEARCH CONTEXT SAFETY INSTRUCTIONS ===
${safetyInstructions}

=== VALIDATED RESEARCH CONTEXT ===
${contextSection}

=== CITATION REQUIREMENTS ===
${citationInstructions}

IMPORTANT: Use the research context as supporting evidence only. Focus primarily on what you can observe in the provided images.`;
  }

  /**
   * Validate a single knowledge entry
   */
  private async validateSingleEntry(
    entry: KnowledgeEntry,
    analysisPrompt: string,
    options: RagValidationOptions
  ): Promise<{ isValid: boolean; relevanceScore: number; reasons: string[] }> {
    const reasons: string[] = [];
    let relevanceScore = 0.5; // Base score

    // Check content length
    if (entry.content.length > options.maxContentLength * 2) {
      reasons.push("Content too long, may overwhelm analysis");
      relevanceScore -= 0.2;
    }

    // Check for prompt relevance
    const promptRelevance = this.calculatePromptRelevance(entry, analysisPrompt);
    relevanceScore += promptRelevance * 0.4;
    
    if (promptRelevance < 0.3) {
      reasons.push("Low relevance to analysis prompt");
    }

    // Check for generic/vague content
    const specificityScore = this.assessContentSpecificity(entry);
    relevanceScore += specificityScore * 0.3;
    
    if (specificityScore < 0.4) {
      reasons.push("Content too generic or vague");
    }

    // Check for outdated information
    const freshnessScore = this.assessContentFreshness(entry);
    relevanceScore += freshnessScore * 0.2;
    
    if (freshnessScore < 0.3) {
      reasons.push("Content may be outdated");
    }

    // Check for conflicting information
    const conflictScore = this.assessContentConflicts(entry);
    relevanceScore -= conflictScore * 0.2;
    
    if (conflictScore > 0.5) {
      reasons.push("Content contains conflicting information");
    }

    const isValid = relevanceScore >= options.minRelevanceScore && reasons.length <= 1;

    return {
      isValid,
      relevanceScore: Math.max(0, Math.min(1, relevanceScore)),
      reasons
    };
  }

  /**
   * Filter and clean entry content
   */
  private filterEntryContent(entry: KnowledgeEntry, options: RagValidationOptions): KnowledgeEntry {
    if (!options.enableContentFiltering) {
      return entry;
    }

    // Truncate content if too long
    let filteredContent = entry.content;
    if (filteredContent.length > options.maxContentLength) {
      filteredContent = filteredContent.substring(0, options.maxContentLength) + '...';
    }

    // Remove potentially problematic phrases
    const problematicPhrases = [
      'always add', 'never use', 'must have', 'should always',
      'all websites need', 'every design should'
    ];

    for (const phrase of problematicPhrases) {
      filteredContent = filteredContent.replace(new RegExp(phrase, 'gi'), '');
    }

    return {
      ...entry,
      content: filteredContent.trim()
    };
  }

  /**
   * Calculate prompt relevance
   */
  private calculatePromptRelevance(entry: KnowledgeEntry, prompt: string): number {
    const entryWords = entry.content.toLowerCase().split(/\s+/);
    const promptWords = prompt.toLowerCase().split(/\s+/);
    
    const commonWords = entryWords.filter(word => 
      word.length > 3 && promptWords.includes(word)
    );
    
    return Math.min(1, commonWords.length / Math.max(10, promptWords.length * 0.3));
  }

  /**
   * Assess content specificity
   */
  private assessContentSpecificity(entry: KnowledgeEntry): number {
    const content = entry.content.toLowerCase();
    
    const specificTerms = [
      'pixel', 'color:', 'font-size', 'margin', 'padding', 'border',
      'accessibility', 'contrast ratio', 'WCAG', 'button text',
      'navigation', 'form field', 'error message'
    ];
    
    const genericTerms = [
      'good practice', 'best way', 'should consider', 'it is important',
      'users like', 'generally', 'usually', 'often'
    ];
    
    const specificCount = specificTerms.filter(term => content.includes(term)).length;
    const genericCount = genericTerms.filter(term => content.includes(term)).length;
    
    return Math.max(0, (specificCount - genericCount * 0.5) / 5);
  }

  /**
   * Assess content freshness
   */
  private assessContentFreshness(entry: KnowledgeEntry): number {
    if (!entry.created_at) return 0.5;
    
    const age = Date.now() - new Date(entry.created_at).getTime();
    const ageInDays = age / (1000 * 60 * 60 * 24);
    
    if (ageInDays <= 30) return 1.0;
    if (ageInDays <= 90) return 0.8;
    if (ageInDays <= 365) return 0.6;
    if (ageInDays <= 730) return 0.4;
    return 0.2;
  }

  /**
   * Assess content conflicts
   */
  private assessContentConflicts(entry: KnowledgeEntry): number {
    const content = entry.content.toLowerCase();
    
    const conflictIndicators = [
      'however', 'but', 'although', 'nevertheless', 'on the other hand',
      'contrary to', 'despite', 'in contrast'
    ];
    
    const conflictCount = conflictIndicators.filter(indicator => 
      content.includes(indicator)
    ).length;
    
    return Math.min(1, conflictCount / 3);
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallQuality(
    entries: KnowledgeEntry[],
    relevanceScores: Record<string, number>
  ): number {
    if (entries.length === 0) return 0;
    
    const avgRelevance = entries.reduce((sum, entry) => 
      sum + (relevanceScores[entry.id] || 0), 0
    ) / entries.length;
    
    const diversityScore = this.calculateDiversityScore(entries);
    const coverageScore = Math.min(1, entries.length / 8);
    
    return (avgRelevance * 0.5 + diversityScore * 0.3 + coverageScore * 0.2);
  }

  /**
   * Calculate diversity score
   */
  private calculateDiversityScore(entries: KnowledgeEntry[]): number {
    const categories = new Set(entries.map(e => e.category));
    const sources = new Set(entries.map(e => e.source).filter(Boolean));
    
    return Math.min(1, (categories.size + sources.size) / 10);
  }

  /**
   * Assess hallucination risk
   */
  private assessHallucinationRisk(entries: KnowledgeEntry[], prompt: string): number {
    let risk = 0;
    
    // High knowledge volume increases hallucination risk
    risk += Math.min(0.3, entries.length / 50);
    
    // Generic content increases risk
    const avgSpecificity = entries.reduce((sum, entry) => 
      sum + this.assessContentSpecificity(entry), 0
    ) / Math.max(entries.length, 1);
    risk += (1 - avgSpecificity) * 0.4;
    
    // Conflicting information increases risk
    const avgConflict = entries.reduce((sum, entry) => 
      sum + this.assessContentConflicts(entry), 0
    ) / Math.max(entries.length, 1);
    risk += avgConflict * 0.3;
    
    return Math.min(1, risk);
  }

  /**
   * Assess context alignment
   */
  private assessContextAlignment(entries: KnowledgeEntry[], prompt: string): number {
    const avgRelevance = entries.reduce((sum, entry) => 
      sum + this.calculatePromptRelevance(entry, prompt), 0
    ) / Math.max(entries.length, 1);
    
    return avgRelevance;
  }

  /**
   * Assess knowledge quality
   */
  private assessKnowledgeQuality(entries: KnowledgeEntry[]): number {
    const avgSpecificity = entries.reduce((sum, entry) => 
      sum + this.assessContentSpecificity(entry), 0
    ) / Math.max(entries.length, 1);
    
    const avgFreshness = entries.reduce((sum, entry) => 
      sum + this.assessContentFreshness(entry), 0
    ) / Math.max(entries.length, 1);
    
    return (avgSpecificity * 0.6 + avgFreshness * 0.4);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    hallucinationRisk: number,
    contextAlignment: number,
    knowledgeQuality: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (hallucinationRisk > 0.7) {
      recommendations.push("High hallucination risk detected - reduce knowledge volume");
    }
    
    if (contextAlignment < 0.5) {
      recommendations.push("Poor context alignment - filter for more relevant knowledge");
    }
    
    if (knowledgeQuality < 0.6) {
      recommendations.push("Low knowledge quality - update knowledge base");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("RAG content quality is acceptable");
    }
    
    return recommendations;
  }

  /**
   * Generate safety instructions
   */
  private generateSafetyInstructions(ragValidation: RagValidationResult): string {
    return `
1. CONTEXT AS SUPPORT: Use research context as supporting evidence, not primary guidance.

2. VISUAL PRIORITY: What you observe in the images takes precedence over research context.

3. QUALITY SCORE: This research context has a quality score of ${Math.round(ragValidation.overallQuality * 100)}%.

4. FILTERED CONTENT: ${ragValidation.filteredCount} potentially problematic entries were filtered out.

5. NO OVER-RELIANCE: Do not let research context override your visual analysis.`;
  }

  /**
   * Build context section
   */
  private buildContextSection(entries: KnowledgeEntry[]): string {
    return entries.map((entry, index) => 
      `${index + 1}. ${entry.title}\n   ${entry.content.substring(0, 300)}...\n`
    ).join('\n');
  }

  /**
   * Generate citation instructions
   */
  private generateCitationInstructions(): string {
    return `
1. CITE SOURCES: When referencing research context, mention the source.

2. DISTINGUISH SOURCES: Clearly separate observed issues from research-backed recommendations.

3. EVIDENCE HIERARCHY: Image observation > Research context > General best practices.`;
  }
}

export const ragContentValidator = new RagContentValidator();