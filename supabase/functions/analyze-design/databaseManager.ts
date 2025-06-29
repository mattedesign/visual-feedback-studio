
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface SaveAnalysisData {
  annotations: any[];
  imageCount: number;
  designType: string;
  isComparative: boolean;
  ragEnhanced: boolean;
  researchSourceCount: number;
}

class DatabaseManager {
  private supabase;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase configuration missing');
      throw new Error('Supabase configuration not found');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async saveAnalysisResults(analysisId: string, data: SaveAnalysisData): Promise<void> {
    console.log('💾 DatabaseManager.saveAnalysisResults - Starting save:', {
      analysisId,
      annotationCount: data.annotations.length,
      imageCount: data.imageCount,
      ragEnhanced: data.ragEnhanced
    });

    try {
      // Update the analysis record with results
      const { error: updateError } = await this.supabase
        .from('design_analyses')
        .update({
          annotations: data.annotations,
          status: 'completed',
          image_count: data.imageCount,
          design_type: data.designType,
          is_comparative: data.isComparative,
          rag_enhanced: data.ragEnhanced,
          research_source_count: data.researchSourceCount,
          completed_at: new Date().toISOString()
        })
        .eq('id', analysisId);

      if (updateError) {
        console.error('❌ Database update failed:', updateError);
        throw new Error(`Database save failed: ${updateError.message}`);
      }

      console.log('✅ Analysis results saved to database successfully');

    } catch (error) {
      console.error('❌ DatabaseManager.saveAnalysisResults - Error:', error);
      throw error;
    }
  }
}

export const databaseManager = new DatabaseManager();
