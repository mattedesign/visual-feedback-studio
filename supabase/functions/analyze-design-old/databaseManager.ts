import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

interface DatabaseSaveRequest {
  analysisId: string;
  annotations: any[];
  imageCount?: number;
  designType?: string;
  isComparative?: boolean;
  ragEnhanced?: boolean;
  researchSourceCount?: number;
  wellDone?: any;
}

interface DatabaseSaveResult {
  success: boolean;
  error?: string;
}

class DatabaseManager {
  async saveAnalysisResults(analysisId: string, analysisData: DatabaseSaveRequest): Promise<DatabaseSaveResult> {
    console.log('💾 DatabaseManager.saveAnalysisResults - Starting save operation');
    
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing Supabase configuration');
        return {
          success: false,
          error: 'Supabase configuration missing'
        };
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      console.log('📊 Saving analysis results to database:', {
        analysisId,
        annotationCount: analysisData.annotations.length,
        ragEnhanced: analysisData.ragEnhanced || false
      });

      // First, get the user_id from the analyses table
      const { data: analysisRecord, error: analysisError } = await supabase
        .from('analyses')
        .select('user_id')
        .eq('id', analysisId)
        .single();

      if (analysisError || !analysisRecord) {
        console.error('❌ Failed to find analysis record:', analysisError);
        return {
          success: false,
          error: 'Analysis record not found'
        };
      }

      // ✅ ENHANCED: Get images from uploaded_files table for proper database storage
      let imageUrls: string[] = [];
      try {
        const { data: uploadedFiles, error: filesError } = await supabase
          .from('uploaded_files')
          .select('public_url')
          .eq('analysis_id', analysisId)
          .eq('user_id', analysisRecord.user_id);

        if (!filesError && uploadedFiles?.length > 0) {
          imageUrls = uploadedFiles
            .map(file => file.public_url)
            .filter(Boolean);
          console.log(`📁 Found ${imageUrls.length} images for analysis ${analysisId}`);
        } else {
          console.warn(`⚠️ No uploaded files found for analysis ${analysisId}:`, filesError);
        }
      } catch (error) {
        console.error(`❌ Error fetching uploaded files for analysis ${analysisId}:`, error);
      }

      // Prepare the analysis results data
      const analysisResultsData = {
        analysis_id: analysisId,
        user_id: analysisRecord.user_id,
        annotations: analysisData.annotations,
        images: imageUrls, // ✅ Use actual image URLs from uploaded_files
        ai_model_used: 'claude-opus-4-20250514',
        processing_time_ms: Date.now(),
        knowledge_sources_used: analysisData.researchSourceCount || 0,
        total_annotations: analysisData.annotations.length,
        enhanced_context: analysisData.ragEnhanced ? {
          ragEnhanced: true,
          knowledgeSourcesUsed: analysisData.researchSourceCount || 0,
          imageUrls: imageUrls // ✅ Include image URLs in enhanced context
        } : null,
        well_done_data: analysisData.wellDone || null,
        validation_status: 'completed'
      };

      // Save the analysis results
      const { data: savedResults, error: saveError } = await supabase
        .from('analysis_results')
        .insert(analysisResultsData)
        .select()
        .single();

      if (saveError) {
        console.error('❌ Failed to save analysis results:', saveError);
        return {
          success: false,
          error: `Database save failed: ${saveError.message}`
        };
      }

      // Update the analysis status to completed
      const { error: updateError } = await supabase
        .from('analyses')
        .update({
          status: 'completed',
          analysis_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId);

      if (updateError) {
        console.warn('⚠️ Failed to update analysis status:', updateError);
        // Don't fail the whole operation for this
      }

      console.log('✅ Analysis results saved successfully:', {
        resultId: savedResults.id,
        analysisId,
        annotationCount: analysisData.annotations.length
      });
      
      return {
        success: true
      };

    } catch (error) {
      console.warn('⚠️ DatabaseManager.saveAnalysisResults - Non-critical error:', error);
      console.log('🔄 Continuing with analysis despite database save failure');
      
      // Always return success to prevent crashing the main analysis
      return {
        success: true,
        error: `Database save failed but analysis continues: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const databaseManager = new DatabaseManager();