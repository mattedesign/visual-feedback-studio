
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  industry?: string;
  element_type?: string;
  primary_category?: string;
  secondary_category?: string;
  industry_tags?: string[];
  complexity_level?: string;
  use_cases?: string[];
}

interface MigrationResult {
  id: string;
  title: string;
  originalCategory: string;
  newPrimaryCategory: string;
  newSecondaryCategory: string;
  newIndustryTags: string[];
  newComplexityLevel: string;
  newUseCases: string[];
  success: boolean;
  error?: string;
}

class CategoryMigrationExecutor {
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { text }
      });

      if (error) {
        console.error('Error generating embedding:', error);
        throw error;
      }

      return data.embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  private async classifyEntry(entry: KnowledgeEntry): Promise<{
    primary_category: string;
    secondary_category: string;
    industry_tags: string[];
    complexity_level: string;
    use_cases: string[];
  }> {
    const prompt = `
Analyze this UX/design knowledge entry and classify it into a hierarchical structure:

Title: ${entry.title}
Content: ${entry.content}
Current Category: ${entry.category}
Current Tags: ${entry.tags?.join(', ') || 'None'}
Industry: ${entry.industry || 'Not specified'}
Element Type: ${entry.element_type || 'Not specified'}

Please provide ONLY a JSON response with this exact structure:

{
  "primary_category": "one of: design-systems, user-experience, visual-design, accessibility, conversion-optimization, mobile-ux, analytics-insights, research-methods, prototyping-tools, brand-identity",
  "secondary_category": "specific subcategory within the primary category",
  "industry_tags": ["array of relevant industries like ecommerce, saas, healthcare, fintech, education, etc."],
  "complexity_level": "one of: basic, intermediate, advanced",
  "use_cases": ["array of practical use cases or applications"]
}

Base your classification on the content and context. For primary_category, choose the most relevant from the provided options.
`;

    try {
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { text: prompt }
      });

      // Since we don't have a dedicated classification function, we'll use a simple mapping based on content analysis
      const contentLower = `${entry.title} ${entry.content}`.toLowerCase();
      
      let primary_category = 'user-experience'; // default
      let secondary_category = 'general';
      let complexity_level = 'intermediate'; // default
      
      // Determine primary category based on content keywords
      if (contentLower.includes('design system') || contentLower.includes('component') || contentLower.includes('pattern')) {
        primary_category = 'design-systems';
        secondary_category = 'component-patterns';
      } else if (contentLower.includes('accessibility') || contentLower.includes('a11y') || contentLower.includes('screen reader')) {
        primary_category = 'accessibility';
        secondary_category = 'wcag-compliance';
      } else if (contentLower.includes('conversion') || contentLower.includes('cro') || contentLower.includes('optimize')) {
        primary_category = 'conversion-optimization';
        secondary_category = 'landing-pages';
      } else if (contentLower.includes('mobile') || contentLower.includes('responsive') || contentLower.includes('touch')) {
        primary_category = 'mobile-ux';
        secondary_category = 'responsive-design';
      } else if (contentLower.includes('visual') || contentLower.includes('color') || contentLower.includes('typography')) {
        primary_category = 'visual-design';
        secondary_category = 'ui-elements';
      } else if (contentLower.includes('research') || contentLower.includes('user test') || contentLower.includes('survey')) {
        primary_category = 'research-methods';
        secondary_category = 'user-testing';
      } else if (contentLower.includes('prototype') || contentLower.includes('figma') || contentLower.includes('sketch')) {
        primary_category = 'prototyping-tools';
        secondary_category = 'design-tools';
      } else if (contentLower.includes('brand') || contentLower.includes('logo') || contentLower.includes('identity')) {
        primary_category = 'brand-identity';
        secondary_category = 'brand-guidelines';
      } else if (contentLower.includes('analytics') || contentLower.includes('metrics') || contentLower.includes('data')) {
        primary_category = 'analytics-insights';
        secondary_category = 'user-behavior';
      }

      // Determine complexity level
      if (contentLower.includes('basic') || contentLower.includes('beginner') || contentLower.includes('introduction')) {
        complexity_level = 'basic';
      } else if (contentLower.includes('advanced') || contentLower.includes('expert') || contentLower.includes('complex')) {
        complexity_level = 'advanced';
      }

      // Extract industry tags based on content and existing data
      const industry_tags: string[] = [];
      if (entry.industry) industry_tags.push(entry.industry.toLowerCase());
      
      // Add industry tags based on content analysis
      if (contentLower.includes('ecommerce') || contentLower.includes('e-commerce') || contentLower.includes('shop')) {
        industry_tags.push('ecommerce');
      }
      if (contentLower.includes('saas') || contentLower.includes('software')) {
        industry_tags.push('saas');
      }
      if (contentLower.includes('healthcare') || contentLower.includes('medical')) {
        industry_tags.push('healthcare');
      }
      if (contentLower.includes('fintech') || contentLower.includes('finance') || contentLower.includes('banking')) {
        industry_tags.push('fintech');
      }
      if (contentLower.includes('education') || contentLower.includes('learning')) {
        industry_tags.push('education');
      }

      // Remove duplicates
      const uniqueIndustryTags = [...new Set(industry_tags)];

      // Generate use cases based on content
      const use_cases: string[] = [];
      if (contentLower.includes('button') || contentLower.includes('cta')) {
        use_cases.push('button-design');
      }
      if (contentLower.includes('form') || contentLower.includes('input')) {
        use_cases.push('form-optimization');
      }
      if (contentLower.includes('navigation') || contentLower.includes('menu')) {
        use_cases.push('navigation-design');
      }
      if (contentLower.includes('landing') || contentLower.includes('homepage')) {
        use_cases.push('landing-page-optimization');
      }
      if (contentLower.includes('checkout') || contentLower.includes('cart')) {
        use_cases.push('checkout-optimization');
      }

      // Default use case if none found
      if (use_cases.length === 0) {
        use_cases.push('ui-improvement');
      }

      return {
        primary_category,
        secondary_category,
        industry_tags: uniqueIndustryTags,
        complexity_level,
        use_cases
      };
    } catch (error) {
      console.error('Error classifying entry:', error);
      // Return default classification
      return {
        primary_category: 'user-experience',
        secondary_category: 'general',
        industry_tags: entry.industry ? [entry.industry.toLowerCase()] : [],
        complexity_level: 'intermediate',
        use_cases: ['ui-improvement']
      };
    }
  }

  async executeMigration(): Promise<{
    totalEntries: number;
    successfulMigrations: number;
    failedMigrations: number;
    results: MigrationResult[];
  }> {
    console.log('🚀 Starting category migration...');

    try {
      // Fetch all knowledge entries
      const { data: entries, error: fetchError } = await supabase
        .from('knowledge_entries')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching knowledge entries:', fetchError);
        throw fetchError;
      }

      if (!entries || entries.length === 0) {
        console.log('No knowledge entries found to migrate.');
        return {
          totalEntries: 0,
          successfulMigrations: 0,
          failedMigrations: 0,
          results: []
        };
      }

      console.log(`📊 Found ${entries.length} knowledge entries to migrate`);

      const results: MigrationResult[] = [];
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        console.log(`\n🔄 Processing entry ${i + 1}/${entries.length}: "${entry.title}"`);

        try {
          // Skip if already migrated (has primary_category)
          if (entry.primary_category) {
            console.log(`⏭️  Entry already migrated, skipping...`);
            results.push({
              id: entry.id,
              title: entry.title,
              originalCategory: entry.category,
              newPrimaryCategory: entry.primary_category,
              newSecondaryCategory: entry.secondary_category || '',
              newIndustryTags: entry.industry_tags || [],
              newComplexityLevel: entry.complexity_level || 'intermediate',
              newUseCases: entry.use_cases || [],
              success: true
            });
            successCount++;
            continue;
          }

          // Classify the entry
          const classification = await this.classifyEntry(entry);

          // Generate new embedding with enhanced content
          const enhancedContent = `${entry.title} ${entry.content} ${classification.primary_category} ${classification.secondary_category}`;
          const newEmbedding = await this.generateEmbedding(enhancedContent);

          // Update the entry in the database
          const { error: updateError } = await supabase
            .from('knowledge_entries')
            .update({
              primary_category: classification.primary_category,
              secondary_category: classification.secondary_category,
              industry_tags: classification.industry_tags,
              complexity_level: classification.complexity_level,
              use_cases: classification.use_cases,
              embedding: `[${newEmbedding.join(',')}]`,
              updated_at: new Date().toISOString()
            })
            .eq('id', entry.id);

          if (updateError) {
            console.error(`❌ Failed to update entry ${entry.id}:`, updateError);
            results.push({
              id: entry.id,
              title: entry.title,
              originalCategory: entry.category,
              newPrimaryCategory: classification.primary_category,
              newSecondaryCategory: classification.secondary_category,
              newIndustryTags: classification.industry_tags,
              newComplexityLevel: classification.complexity_level,
              newUseCases: classification.use_cases,
              success: false,
              error: updateError.message
            });
            failCount++;
          } else {
            console.log(`✅ Successfully migrated: ${classification.primary_category} > ${classification.secondary_category}`);
            results.push({
              id: entry.id,
              title: entry.title,
              originalCategory: entry.category,
              newPrimaryCategory: classification.primary_category,
              newSecondaryCategory: classification.secondary_category,
              newIndustryTags: classification.industry_tags,
              newComplexityLevel: classification.complexity_level,
              newUseCases: classification.use_cases,
              success: true
            });
            successCount++;
          }

          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ Error processing entry ${entry.id}:`, error);
          results.push({
            id: entry.id,
            title: entry.title,
            originalCategory: entry.category,
            newPrimaryCategory: 'user-experience',
            newSecondaryCategory: 'general',
            newIndustryTags: [],
            newComplexityLevel: 'intermediate',
            newUseCases: ['ui-improvement'],
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          failCount++;
        }
      }

      const summary = {
        totalEntries: entries.length,
        successfulMigrations: successCount,
        failedMigrations: failCount,
        results
      };

      console.log('\n📋 MIGRATION SUMMARY:');
      console.log(`Total entries: ${summary.totalEntries}`);
      console.log(`✅ Successful migrations: ${summary.successfulMigrations}`);
      console.log(`❌ Failed migrations: ${summary.failedMigrations}`);

      return summary;

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
}

// Execute the migration
async function runMigration() {
  const migrator = new CategoryMigrationExecutor();
  
  try {
    const result = await migrator.executeMigration();
    
    console.log('\n🎉 Migration completed!');
    console.log('\n📊 DETAILED RESULTS:');
    
    // Group results by primary category
    const categoryGroups = result.results.reduce((acc, result) => {
      const key = result.newPrimaryCategory;
      if (!acc[key]) acc[key] = [];
      acc[key].push(result);
      return acc;
    }, {} as Record<string, MigrationResult[]>);

    Object.entries(categoryGroups).forEach(([category, results]) => {
      console.log(`\n📂 ${category.toUpperCase()}:`);
      results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`  ${status} ${result.title}`);
        console.log(`     ${result.originalCategory} → ${result.newPrimaryCategory} > ${result.newSecondaryCategory}`);
        console.log(`     Industries: [${result.newIndustryTags.join(', ')}]`);
        console.log(`     Complexity: ${result.newComplexityLevel}`);
        console.log(`     Use Cases: [${result.newUseCases.join(', ')}]`);
        if (!result.success && result.error) {
          console.log(`     Error: ${result.error}`);
        }
      });
    });

    return result;
  } catch (error) {
    console.error('❌ Migration execution failed:', error);
    throw error;
  }
}

// Export for use in other scripts
export { CategoryMigrationExecutor, runMigration };

// Auto-execute if running directly
if (typeof window === 'undefined') {
  runMigration().catch(console.error);
}
