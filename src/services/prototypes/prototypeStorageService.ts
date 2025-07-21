import { supabase } from '@/integrations/supabase/client';
import type { VisualPrototype } from '@/types/analysis';

export class PrototypeStorageService {
  /**
   * Store generated prototypes in database
   */
  static async storePrototypes(prototypes: VisualPrototype[]): Promise<void> {
    console.log(`💾 Storing ${prototypes.length} prototypes in database`);
    
    try {
      // Prepare data for database insertion
      const prototypeRecords = prototypes.map(prototype => ({
        analysis_id: prototype.analysisId,
        issue_id: prototype.issueId,
        title: prototype.title,
        category: prototype.category,
        
        // Hotspot positioning
        hotspot_x: prototype.hotspot.x,
        hotspot_y: prototype.hotspot.y,
        hotspot_width: prototype.hotspot.width, 
        hotspot_height: prototype.hotspot.height,
        hotspot_type: prototype.hotspot.type,
        
        // Code variations
        before_html: prototype.improvement.beforeCode.html,
        before_css: prototype.improvement.beforeCode.css,
        after_html: prototype.improvement.afterCode.html,
        after_css: prototype.improvement.afterCode.css,
        interactive_html: prototype.improvement.interactiveDemo.html,
        interactive_css: prototype.improvement.interactiveDemo.css,
        interactive_js: prototype.improvement.interactiveDemo.js,
        mobile_html: prototype.improvement.mobileResponsive.html,
        mobile_css: prototype.improvement.mobileResponsive.css,
        
        // Explanations
        summary: prototype.explanation.summary,
        key_changes: prototype.explanation.keyChanges,
        business_impact: prototype.explanation.businessImpact,
        implementation_notes: prototype.explanation.implementationNotes
      }));
      
      // Insert prototypes
      const { error: insertError } = await supabase
        .from('figmant_visual_prototypes')
        .insert(prototypeRecords);
      
      if (insertError) {
        throw new Error(`Failed to insert prototypes: ${insertError.message}`);
      }
      
      // Update analysis status
      if (prototypes.length > 0) {
        const analysisId = prototypes[0].analysisId;
        const { error: updateError } = await supabase
          .from('figmant_analysis_results')
          .update({
            prototype_generation_status: 'completed',
            prototype_generation_completed_at: new Date().toISOString(),
            prototype_count: prototypes.length
          })
          .eq('id', analysisId);
        
        if (updateError) {
          console.warn('Failed to update analysis prototype status:', updateError);
        }
      }
      
      console.log(`✅ Successfully stored ${prototypes.length} prototypes`);
      
    } catch (error) {
      console.error('❌ Prototype storage failed:', error);
      throw error;
    }
  }
  
  /**
   * Retrieve prototypes for an analysis
   */
  static async getPrototypesByAnalysisId(analysisId: string): Promise<VisualPrototype[]> {
    try {
      const { data, error } = await supabase
        .from('figmant_visual_prototypes')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw new Error(`Failed to fetch prototypes: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Transform database records back to VisualPrototype objects
      const prototypes: VisualPrototype[] = data.map(record => ({
        id: record.id,
        analysisId: record.analysis_id,
        issueId: record.issue_id,
        title: record.title,
        category: record.category,
        
        hotspot: {
          x: record.hotspot_x,
          y: record.hotspot_y,
          width: record.hotspot_width,
          height: record.hotspot_height,
          type: record.hotspot_type
        },
        
        improvement: {
          beforeCode: {
            html: record.before_html || '',
            css: record.before_css || ''
          },
          afterCode: {
            html: record.after_html,
            css: record.after_css
          },
          interactiveDemo: {
            html: record.interactive_html || record.after_html,
            css: record.interactive_css || record.after_css,
            js: record.interactive_js || ''
          },
          mobileResponsive: {
            html: record.mobile_html || record.after_html,
            css: record.mobile_css || record.after_css
          }
        },
        
        explanation: {
          summary: record.summary,
          keyChanges: record.key_changes || [],
          businessImpact: record.business_impact || '',
          implementationNotes: record.implementation_notes || []
        },
        
        createdAt: record.created_at
      }));
      
      console.log(`📖 Retrieved ${prototypes.length} prototypes for analysis ${analysisId}`);
      
      return prototypes;
      
    } catch (error) {
      console.error('❌ Failed to retrieve prototypes:', error);
      throw error;
    }
  }
  
  /**
   * Update analysis status when prototype generation starts
   */
  static async markPrototypeGenerationStarted(analysisId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('figmant_analysis_results')
        .update({
          prototype_generation_status: 'in_progress',
          prototype_generation_started_at: new Date().toISOString()
        })
        .eq('id', analysisId);
      
      if (error) {
        console.warn('Failed to update prototype generation start status:', error);
      }
    } catch (error) {
      console.warn('Failed to mark prototype generation started:', error);
    }
  }
}