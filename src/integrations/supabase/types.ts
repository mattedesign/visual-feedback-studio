export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          ai_model_used: string | null
          analysis_completed_at: string | null
          analysis_prompt: string | null
          business_goals: string[] | null
          business_impact_score: number | null
          cancelled_at: string | null
          competitive_position_score: number | null
          confidence_threshold: number | null
          created_at: string
          description: string | null
          design_type: string | null
          enhanced_metadata: Json | null
          failure_reason: string | null
          id: string
          implementation_timeline_weeks: number | null
          knowledge_sources_used: number | null
          last_retry_at: string | null
          pattern_tracking_enabled: boolean | null
          retry_count: number | null
          revenue_confidence_level: number | null
          revenue_potential_annual: number | null
          screen_detection_metadata: Json | null
          status: string
          target_audience: string | null
          timeout_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model_used?: string | null
          analysis_completed_at?: string | null
          analysis_prompt?: string | null
          business_goals?: string[] | null
          business_impact_score?: number | null
          cancelled_at?: string | null
          competitive_position_score?: number | null
          confidence_threshold?: number | null
          created_at?: string
          description?: string | null
          design_type?: string | null
          enhanced_metadata?: Json | null
          failure_reason?: string | null
          id?: string
          implementation_timeline_weeks?: number | null
          knowledge_sources_used?: number | null
          last_retry_at?: string | null
          pattern_tracking_enabled?: boolean | null
          retry_count?: number | null
          revenue_confidence_level?: number | null
          revenue_potential_annual?: number | null
          screen_detection_metadata?: Json | null
          status?: string
          target_audience?: string | null
          timeout_at?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model_used?: string | null
          analysis_completed_at?: string | null
          analysis_prompt?: string | null
          business_goals?: string[] | null
          business_impact_score?: number | null
          cancelled_at?: string | null
          competitive_position_score?: number | null
          confidence_threshold?: number | null
          created_at?: string
          description?: string | null
          design_type?: string | null
          enhanced_metadata?: Json | null
          failure_reason?: string | null
          id?: string
          implementation_timeline_weeks?: number | null
          knowledge_sources_used?: number | null
          last_retry_at?: string | null
          pattern_tracking_enabled?: boolean | null
          retry_count?: number | null
          revenue_confidence_level?: number | null
          revenue_potential_annual?: number | null
          screen_detection_metadata?: Json | null
          status?: string
          target_audience?: string | null
          timeout_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analysis_results: {
        Row: {
          ai_model_used: string | null
          analysis_context: string | null
          analysis_id: string
          annotations: Json
          cancelled_by_user: boolean | null
          confidence_metadata: Json | null
          confidence_weights: Json | null
          created_at: string
          design_tokens_extracted: Json | null
          enhanced_business_metrics: Json | null
          enhanced_context: Json | null
          enhanced_prompt_data: Json | null
          error_details: Json | null
          google_vision_data: Json | null
          id: string
          images: string[]
          knowledge_sources_used: number | null
          pattern_violations: Json | null
          perplexity_competitive_data: Json | null
          perplexity_enhanced: boolean | null
          perplexity_research_data: Json | null
          perplexity_trend_data: Json | null
          pipeline_stage: string | null
          processing_stages: Json | null
          processing_time_ms: number | null
          quality_scores: Json | null
          research_citations: string[] | null
          responsive_analysis: Json | null
          screen_type_detected: string | null
          stage_timing: Json | null
          synthesis_metadata: Json | null
          timeout_occurred: boolean | null
          total_annotations: number | null
          triage_classification: Json | null
          updated_at: string
          user_id: string
          validation_status: string | null
          vision_enrichment_data: Json | null
          visual_intelligence: Json | null
          well_done_data: Json | null
        }
        Insert: {
          ai_model_used?: string | null
          analysis_context?: string | null
          analysis_id: string
          annotations?: Json
          cancelled_by_user?: boolean | null
          confidence_metadata?: Json | null
          confidence_weights?: Json | null
          created_at?: string
          design_tokens_extracted?: Json | null
          enhanced_business_metrics?: Json | null
          enhanced_context?: Json | null
          enhanced_prompt_data?: Json | null
          error_details?: Json | null
          google_vision_data?: Json | null
          id?: string
          images?: string[]
          knowledge_sources_used?: number | null
          pattern_violations?: Json | null
          perplexity_competitive_data?: Json | null
          perplexity_enhanced?: boolean | null
          perplexity_research_data?: Json | null
          perplexity_trend_data?: Json | null
          pipeline_stage?: string | null
          processing_stages?: Json | null
          processing_time_ms?: number | null
          quality_scores?: Json | null
          research_citations?: string[] | null
          responsive_analysis?: Json | null
          screen_type_detected?: string | null
          stage_timing?: Json | null
          synthesis_metadata?: Json | null
          timeout_occurred?: boolean | null
          total_annotations?: number | null
          triage_classification?: Json | null
          updated_at?: string
          user_id: string
          validation_status?: string | null
          vision_enrichment_data?: Json | null
          visual_intelligence?: Json | null
          well_done_data?: Json | null
        }
        Update: {
          ai_model_used?: string | null
          analysis_context?: string | null
          analysis_id?: string
          annotations?: Json
          cancelled_by_user?: boolean | null
          confidence_metadata?: Json | null
          confidence_weights?: Json | null
          created_at?: string
          design_tokens_extracted?: Json | null
          enhanced_business_metrics?: Json | null
          enhanced_context?: Json | null
          enhanced_prompt_data?: Json | null
          error_details?: Json | null
          google_vision_data?: Json | null
          id?: string
          images?: string[]
          knowledge_sources_used?: number | null
          pattern_violations?: Json | null
          perplexity_competitive_data?: Json | null
          perplexity_enhanced?: boolean | null
          perplexity_research_data?: Json | null
          perplexity_trend_data?: Json | null
          pipeline_stage?: string | null
          processing_stages?: Json | null
          processing_time_ms?: number | null
          quality_scores?: Json | null
          research_citations?: string[] | null
          responsive_analysis?: Json | null
          screen_type_detected?: string | null
          stage_timing?: Json | null
          synthesis_metadata?: Json | null
          timeout_occurred?: boolean | null
          total_annotations?: number | null
          triage_classification?: Json | null
          updated_at?: string
          user_id?: string
          validation_status?: string | null
          vision_enrichment_data?: Json | null
          visual_intelligence?: Json | null
          well_done_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_session_images: {
        Row: {
          created_at: string | null
          filename: string | null
          id: string
          position: number | null
          session_id: string | null
          storage_url: string
        }
        Insert: {
          created_at?: string | null
          filename?: string | null
          id?: string
          position?: number | null
          session_id?: string | null
          storage_url: string
        }
        Update: {
          created_at?: string | null
          filename?: string | null
          id?: string
          position?: number | null
          session_id?: string | null
          storage_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_session_images_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_sessions: {
        Row: {
          claude_results: Json | null
          created_at: string | null
          id: string
          images: Json | null
          model_config: Json | null
          multimodel_results: Json | null
          status: string | null
          updated_at: string | null
          user_context: string | null
          user_id: string | null
          vision_results: Json | null
        }
        Insert: {
          claude_results?: Json | null
          created_at?: string | null
          id?: string
          images?: Json | null
          model_config?: Json | null
          multimodel_results?: Json | null
          status?: string | null
          updated_at?: string | null
          user_context?: string | null
          user_id?: string | null
          vision_results?: Json | null
        }
        Update: {
          claude_results?: Json | null
          created_at?: string | null
          id?: string
          images?: Json | null
          model_config?: Json | null
          multimodel_results?: Json | null
          status?: string | null
          updated_at?: string | null
          user_context?: string | null
          user_id?: string | null
          vision_results?: Json | null
        }
        Relationships: []
      }
      analysis_stage_logs: {
        Row: {
          analysis_result_id: string
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_data: Json | null
          id: string
          input_data: Json | null
          metadata: Json | null
          output_data: Json | null
          stage_name: string
          stage_status: string
          started_at: string
          updated_at: string
        }
        Insert: {
          analysis_result_id: string
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_data?: Json | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          output_data?: Json | null
          stage_name: string
          stage_status?: string
          started_at?: string
          updated_at?: string
        }
        Update: {
          analysis_result_id?: string
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_data?: Json | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          output_data?: Json | null
          stage_name?: string
          stage_status?: string
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_stage_logs_analysis_result_id_fkey"
            columns: ["analysis_result_id"]
            isOneToOne: false
            referencedRelation: "analysis_results"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json
          rate_limit_per_hour: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json
          rate_limit_per_hour?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json
          rate_limit_per_hour?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown | null
          method: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown | null
          method: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          method?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_patterns: {
        Row: {
          created_at: string
          description: string
          effectiveness_score: number | null
          embedding: string | null
          examples: Json | null
          id: string
          industry: string | null
          pattern_name: string
          pattern_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          effectiveness_score?: number | null
          embedding?: string | null
          examples?: Json | null
          id?: string
          industry?: string | null
          pattern_name: string
          pattern_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          effectiveness_score?: number | null
          embedding?: string | null
          examples?: Json | null
          id?: string
          industry?: string | null
          pattern_name?: string
          pattern_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      contextual_solutions: {
        Row: {
          context_adapted_implementation: Json
          created_at: string | null
          expected_impact: Json
          id: string
          last_updated: string | null
          problem_specific_guidance: Json
          problem_statement_ids: string[]
          recommendation: string
          stakeholder_communication: Json
          success_rate: number | null
          title: string
          traditional_ux_issues: string[] | null
          usage_count: number | null
        }
        Insert: {
          context_adapted_implementation?: Json
          created_at?: string | null
          expected_impact?: Json
          id?: string
          last_updated?: string | null
          problem_specific_guidance?: Json
          problem_statement_ids: string[]
          recommendation: string
          stakeholder_communication?: Json
          success_rate?: number | null
          title: string
          traditional_ux_issues?: string[] | null
          usage_count?: number | null
        }
        Update: {
          context_adapted_implementation?: Json
          created_at?: string | null
          expected_impact?: Json
          id?: string
          last_updated?: string | null
          problem_specific_guidance?: Json
          problem_statement_ids?: string[]
          recommendation?: string
          stakeholder_communication?: Json
          success_rate?: number | null
          title?: string
          traditional_ux_issues?: string[] | null
          usage_count?: number | null
        }
        Relationships: []
      }
      credit_usage: {
        Row: {
          created_at: string
          credits_consumed: number
          id: string
          operation_type: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credits_consumed: number
          id?: string
          operation_type: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credits_consumed?: number
          id?: string
          operation_type?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_usage_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "figmant_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      figmant_analysis_results: {
        Row: {
          ai_model_used: string | null
          business_impact_enhanced: Json | null
          claude_analysis: Json
          confidence_metadata: Json | null
          confidence_scores: Json | null
          context_id: string | null
          created_at: string
          enhanced_business_metrics: Json | null
          enhanced_context: Json | null
          enhanced_metadata_tracking: Json | null
          google_vision_summary: Json | null
          id: string
          implementation_timeline: Json | null
          pattern_analysis_data: Json | null
          pattern_violations: Json | null
          processing_time_ms: number | null
          prototype_count: number | null
          prototype_generation_completed_at: string | null
          prototype_generation_started_at: string | null
          prototype_generation_status: string | null
          screen_type_detected: string | null
          session_id: string | null
          severity_breakdown: Json | null
          user_id: string | null
        }
        Insert: {
          ai_model_used?: string | null
          business_impact_enhanced?: Json | null
          claude_analysis: Json
          confidence_metadata?: Json | null
          confidence_scores?: Json | null
          context_id?: string | null
          created_at?: string
          enhanced_business_metrics?: Json | null
          enhanced_context?: Json | null
          enhanced_metadata_tracking?: Json | null
          google_vision_summary?: Json | null
          id?: string
          implementation_timeline?: Json | null
          pattern_analysis_data?: Json | null
          pattern_violations?: Json | null
          processing_time_ms?: number | null
          prototype_count?: number | null
          prototype_generation_completed_at?: string | null
          prototype_generation_started_at?: string | null
          prototype_generation_status?: string | null
          screen_type_detected?: string | null
          session_id?: string | null
          severity_breakdown?: Json | null
          user_id?: string | null
        }
        Update: {
          ai_model_used?: string | null
          business_impact_enhanced?: Json | null
          claude_analysis?: Json
          confidence_metadata?: Json | null
          confidence_scores?: Json | null
          context_id?: string | null
          created_at?: string
          enhanced_business_metrics?: Json | null
          enhanced_context?: Json | null
          enhanced_metadata_tracking?: Json | null
          google_vision_summary?: Json | null
          id?: string
          implementation_timeline?: Json | null
          pattern_analysis_data?: Json | null
          pattern_violations?: Json | null
          processing_time_ms?: number | null
          prototype_count?: number | null
          prototype_generation_completed_at?: string | null
          prototype_generation_started_at?: string | null
          prototype_generation_status?: string | null
          screen_type_detected?: string | null
          session_id?: string | null
          severity_breakdown?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "figmant_analysis_results_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "figmant_user_contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "figmant_analysis_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "figmant_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      figmant_analysis_sessions: {
        Row: {
          business_goals: string[] | null
          confidence_threshold: number | null
          created_at: string
          design_type: string | null
          id: string
          industry: string | null
          pattern_tracking_enabled: boolean | null
          screen_detection_metadata: Json | null
          status: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          business_goals?: string[] | null
          confidence_threshold?: number | null
          created_at?: string
          design_type?: string | null
          id?: string
          industry?: string | null
          pattern_tracking_enabled?: boolean | null
          screen_detection_metadata?: Json | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          business_goals?: string[] | null
          confidence_threshold?: number | null
          created_at?: string
          design_type?: string | null
          id?: string
          industry?: string | null
          pattern_tracking_enabled?: boolean | null
          screen_detection_metadata?: Json | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      figmant_applied_solutions: {
        Row: {
          analysis_id: string | null
          applied_at: string
          category: string
          complexity_level: string | null
          created_at: string
          id: string
          impact_rating: number | null
          solution_description: string | null
          solution_name: string
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          applied_at?: string
          category: string
          complexity_level?: string | null
          created_at?: string
          id?: string
          impact_rating?: number | null
          solution_description?: string | null
          solution_name: string
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          applied_at?: string
          category?: string
          complexity_level?: string | null
          created_at?: string
          id?: string
          impact_rating?: number | null
          solution_description?: string | null
          solution_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "figmant_applied_solutions_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "figmant_analysis_results"
            referencedColumns: ["id"]
          },
        ]
      }
      figmant_conversation_history: {
        Row: {
          content: string
          created_at: string
          id: string
          message_order: number
          metadata: Json | null
          model_used: string | null
          processing_time_ms: number | null
          role: string
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_order: number
          metadata?: Json | null
          model_used?: string | null
          processing_time_ms?: number | null
          role: string
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_order?: number
          metadata?: Json | null
          model_used?: string | null
          processing_time_ms?: number | null
          role?: string
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "figmant_conversation_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "figmant_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      figmant_design_patterns: {
        Row: {
          category: string
          created_at: string
          description: string | null
          frequency_count: number | null
          id: string
          last_seen_at: string | null
          pattern_name: string
          trend_direction: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          frequency_count?: number | null
          id?: string
          last_seen_at?: string | null
          pattern_name: string
          trend_direction?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          frequency_count?: number | null
          id?: string
          last_seen_at?: string | null
          pattern_name?: string
          trend_direction?: string | null
        }
        Relationships: []
      }
      figmant_detailed_issues: {
        Row: {
          analysis_id: string | null
          category: string
          coordinates: Json | null
          created_at: string
          id: string
          impact_level: string | null
          is_resolved: boolean | null
          issue_description: string | null
          issue_title: string
          resolved_at: string | null
          severity: string | null
          suggested_solution: string | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          category: string
          coordinates?: Json | null
          created_at?: string
          id?: string
          impact_level?: string | null
          is_resolved?: boolean | null
          issue_description?: string | null
          issue_title: string
          resolved_at?: string | null
          severity?: string | null
          suggested_solution?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          category?: string
          coordinates?: Json | null
          created_at?: string
          id?: string
          impact_level?: string | null
          is_resolved?: boolean | null
          issue_description?: string | null
          issue_title?: string
          resolved_at?: string | null
          severity?: string | null
          suggested_solution?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "figmant_detailed_issues_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "figmant_analysis_results"
            referencedColumns: ["id"]
          },
        ]
      }
      figmant_holistic_analyses: {
        Row: {
          analysis_id: string | null
          created_at: string
          id: string
          identified_problems: Json | null
          solution_approaches: Json | null
          vision_insights: Json | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          id?: string
          identified_problems?: Json | null
          solution_approaches?: Json | null
          vision_insights?: Json | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          id?: string
          identified_problems?: Json | null
          solution_approaches?: Json | null
          vision_insights?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "figmant_holistic_analyses_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: true
            referencedRelation: "figmant_analysis_results"
            referencedColumns: ["id"]
          },
        ]
      }
      figmant_holistic_prototypes: {
        Row: {
          analysis_id: string | null
          component_code: string | null
          created_at: string
          description: string | null
          expected_impact: Json | null
          generation_metadata: Json | null
          id: string
          key_changes: Json | null
          solution_type: Database["public"]["Enums"]["figmant_solution_type"]
          title: string
        }
        Insert: {
          analysis_id?: string | null
          component_code?: string | null
          created_at?: string
          description?: string | null
          expected_impact?: Json | null
          generation_metadata?: Json | null
          id?: string
          key_changes?: Json | null
          solution_type: Database["public"]["Enums"]["figmant_solution_type"]
          title: string
        }
        Update: {
          analysis_id?: string | null
          component_code?: string | null
          created_at?: string
          description?: string | null
          expected_impact?: Json | null
          generation_metadata?: Json | null
          id?: string
          key_changes?: Json | null
          solution_type?: Database["public"]["Enums"]["figmant_solution_type"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "figmant_holistic_prototypes_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "figmant_analysis_results"
            referencedColumns: ["id"]
          },
        ]
      }
      figmant_issue_categories: {
        Row: {
          category_name: string
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
        }
        Insert: {
          category_name: string
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
        }
        Update: {
          category_name?: string
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
        }
        Relationships: []
      }
      figmant_prototype_metrics: {
        Row: {
          analysis_id: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          event_type: string
          id: string
          metadata: Json | null
          prototype_id: string | null
          solution_type: string | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          prototype_id?: string | null
          solution_type?: string | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          prototype_id?: string | null
          solution_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "figmant_prototype_metrics_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "figmant_analysis_results"
            referencedColumns: ["id"]
          },
        ]
      }
      figmant_session_images: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          google_vision_data: Json | null
          id: string
          session_id: string | null
          upload_order: number | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          google_vision_data?: Json | null
          id?: string
          session_id?: string | null
          upload_order?: number | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          google_vision_data?: Json | null
          id?: string
          session_id?: string | null
          upload_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "figmant_session_images_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "figmant_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      figmant_solution_metrics: {
        Row: {
          created_at: string
          downloaded: boolean | null
          id: string
          implemented: boolean | null
          prototype_id: string | null
          reported_impact: Json | null
          user_rating: number | null
        }
        Insert: {
          created_at?: string
          downloaded?: boolean | null
          id?: string
          implemented?: boolean | null
          prototype_id?: string | null
          reported_impact?: Json | null
          user_rating?: number | null
        }
        Update: {
          created_at?: string
          downloaded?: boolean | null
          id?: string
          implemented?: boolean | null
          prototype_id?: string | null
          reported_impact?: Json | null
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "figmant_solution_metrics_prototype_id_fkey"
            columns: ["prototype_id"]
            isOneToOne: false
            referencedRelation: "figmant_holistic_prototypes"
            referencedColumns: ["id"]
          },
        ]
      }
      figmant_trending_improvements: {
        Row: {
          category: string
          created_at: string
          frequency_count: number | null
          id: string
          improvement_type: string
          last_updated_at: string
          time_period: string | null
          trend_direction: string | null
          trend_percentage: number | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          frequency_count?: number | null
          id?: string
          improvement_type: string
          last_updated_at?: string
          time_period?: string | null
          trend_direction?: string | null
          trend_percentage?: number | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          frequency_count?: number | null
          id?: string
          improvement_type?: string
          last_updated_at?: string
          time_period?: string | null
          trend_direction?: string | null
          trend_percentage?: number | null
          user_id?: string
        }
        Relationships: []
      }
      figmant_user_contexts: {
        Row: {
          admired_companies: string[] | null
          brand_guidelines: Json | null
          business_type:
            | Database["public"]["Enums"]["figmant_business_type"]
            | null
          created_at: string
          current_metrics: Json | null
          design_constraints: string[] | null
          design_type: Database["public"]["Enums"]["figmant_design_type"] | null
          id: string
          primary_goal:
            | Database["public"]["Enums"]["figmant_primary_goal"]
            | null
          session_id: string | null
          specific_challenges: Json | null
          target_audience: string | null
        }
        Insert: {
          admired_companies?: string[] | null
          brand_guidelines?: Json | null
          business_type?:
            | Database["public"]["Enums"]["figmant_business_type"]
            | null
          created_at?: string
          current_metrics?: Json | null
          design_constraints?: string[] | null
          design_type?:
            | Database["public"]["Enums"]["figmant_design_type"]
            | null
          id?: string
          primary_goal?:
            | Database["public"]["Enums"]["figmant_primary_goal"]
            | null
          session_id?: string | null
          specific_challenges?: Json | null
          target_audience?: string | null
        }
        Update: {
          admired_companies?: string[] | null
          brand_guidelines?: Json | null
          business_type?:
            | Database["public"]["Enums"]["figmant_business_type"]
            | null
          created_at?: string
          current_metrics?: Json | null
          design_constraints?: string[] | null
          design_type?:
            | Database["public"]["Enums"]["figmant_design_type"]
            | null
          id?: string
          primary_goal?:
            | Database["public"]["Enums"]["figmant_primary_goal"]
            | null
          session_id?: string | null
          specific_challenges?: Json | null
          target_audience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "figmant_user_contexts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "figmant_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      figmant_visual_prototypes: {
        Row: {
          after_css: string
          after_html: string
          analysis_id: string
          before_css: string | null
          before_html: string | null
          business_impact: string | null
          category: string
          created_at: string | null
          hotspot_height: number
          hotspot_type: string
          hotspot_width: number
          hotspot_x: number
          hotspot_y: number
          id: string
          implementation_notes: Json | null
          interactive_css: string | null
          interactive_html: string | null
          interactive_js: string | null
          issue_id: string
          key_changes: Json | null
          mobile_css: string | null
          mobile_html: string | null
          summary: string
          title: string
          updated_at: string | null
        }
        Insert: {
          after_css: string
          after_html: string
          analysis_id: string
          before_css?: string | null
          before_html?: string | null
          business_impact?: string | null
          category: string
          created_at?: string | null
          hotspot_height: number
          hotspot_type?: string
          hotspot_width: number
          hotspot_x: number
          hotspot_y: number
          id?: string
          implementation_notes?: Json | null
          interactive_css?: string | null
          interactive_html?: string | null
          interactive_js?: string | null
          issue_id: string
          key_changes?: Json | null
          mobile_css?: string | null
          mobile_html?: string | null
          summary: string
          title: string
          updated_at?: string | null
        }
        Update: {
          after_css?: string
          after_html?: string
          analysis_id?: string
          before_css?: string | null
          before_html?: string | null
          business_impact?: string | null
          category?: string
          created_at?: string | null
          hotspot_height?: number
          hotspot_type?: string
          hotspot_width?: number
          hotspot_x?: number
          hotspot_y?: number
          id?: string
          implementation_notes?: Json | null
          interactive_css?: string | null
          interactive_html?: string | null
          interactive_js?: string | null
          issue_id?: string
          key_changes?: Json | null
          mobile_css?: string | null
          mobile_html?: string | null
          summary?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "figmant_visual_prototypes_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "figmant_analysis_results"
            referencedColumns: ["id"]
          },
        ]
      }
      goblin_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          badge_emoji: string | null
          id: string
          share_token: string | null
          times_shared: number | null
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          badge_emoji?: string | null
          id?: string
          share_token?: string | null
          times_shared?: number | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          badge_emoji?: string | null
          id?: string
          share_token?: string | null
          times_shared?: number | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      goblin_analysis_images: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          screen_type: string | null
          session_id: string | null
          upload_order: number | null
          vision_metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          screen_type?: string | null
          session_id?: string | null
          upload_order?: number | null
          vision_metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          screen_type?: string | null
          session_id?: string | null
          upload_order?: number | null
          vision_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "goblin_analysis_images_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "goblin_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      goblin_analysis_results: {
        Row: {
          annotations: Json | null
          created_at: string | null
          goblin_gripe_level: string | null
          id: string
          model_metadata: Json | null
          persona_feedback: Json
          priority_matrix: Json | null
          processing_time_ms: number | null
          session_id: string | null
          synthesis_summary: string | null
        }
        Insert: {
          annotations?: Json | null
          created_at?: string | null
          goblin_gripe_level?: string | null
          id?: string
          model_metadata?: Json | null
          persona_feedback: Json
          priority_matrix?: Json | null
          processing_time_ms?: number | null
          session_id?: string | null
          synthesis_summary?: string | null
        }
        Update: {
          annotations?: Json | null
          created_at?: string | null
          goblin_gripe_level?: string | null
          id?: string
          model_metadata?: Json | null
          persona_feedback?: Json
          priority_matrix?: Json | null
          processing_time_ms?: number | null
          session_id?: string | null
          synthesis_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goblin_analysis_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "goblin_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      goblin_analysis_sessions: {
        Row: {
          analysis_mode: string
          confidence_level: number | null
          created_at: string | null
          goal_description: string | null
          id: string
          persona_type: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis_mode?: string
          confidence_level?: number | null
          created_at?: string | null
          goal_description?: string | null
          id?: string
          persona_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_mode?: string
          confidence_level?: number | null
          created_at?: string | null
          goal_description?: string | null
          id?: string
          persona_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      goblin_industry_benchmarks: {
        Row: {
          average_score: number
          dimension: string
          id: string
          industry: string
          top_10_percent_score: number
          updated_at: string | null
        }
        Insert: {
          average_score: number
          dimension: string
          id?: string
          industry: string
          top_10_percent_score: number
          updated_at?: string | null
        }
        Update: {
          average_score?: number
          dimension?: string
          id?: string
          industry?: string
          top_10_percent_score?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      goblin_maturity_scores: {
        Row: {
          accessibility_score: number | null
          clarity_score: number | null
          created_at: string | null
          delight_score: number | null
          id: string
          maturity_level: string | null
          overall_score: number
          percentile_rank: number | null
          performance_score: number | null
          previous_score: number | null
          score_change: number | null
          session_id: string | null
          streak_days: number | null
          usability_score: number | null
          user_id: string | null
        }
        Insert: {
          accessibility_score?: number | null
          clarity_score?: number | null
          created_at?: string | null
          delight_score?: number | null
          id?: string
          maturity_level?: string | null
          overall_score: number
          percentile_rank?: number | null
          performance_score?: number | null
          previous_score?: number | null
          score_change?: number | null
          session_id?: string | null
          streak_days?: number | null
          usability_score?: number | null
          user_id?: string | null
        }
        Update: {
          accessibility_score?: number | null
          clarity_score?: number | null
          created_at?: string | null
          delight_score?: number | null
          id?: string
          maturity_level?: string | null
          overall_score?: number
          percentile_rank?: number | null
          performance_score?: number | null
          previous_score?: number | null
          score_change?: number | null
          session_id?: string | null
          streak_days?: number | null
          usability_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goblin_maturity_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "goblin_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      goblin_refinement_history: {
        Row: {
          content: string
          conversation_stage: string | null
          created_at: string | null
          id: string
          message_order: number
          metadata: Json | null
          model_used: string | null
          parsed_problems: Json | null
          processing_time_ms: number | null
          reasoning: string | null
          refinement_score: number | null
          role: string
          session_id: string
          suggested_fixes: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_stage?: string | null
          created_at?: string | null
          id?: string
          message_order: number
          metadata?: Json | null
          model_used?: string | null
          parsed_problems?: Json | null
          processing_time_ms?: number | null
          reasoning?: string | null
          refinement_score?: number | null
          role: string
          session_id: string
          suggested_fixes?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_stage?: string | null
          created_at?: string | null
          id?: string
          message_order?: number
          metadata?: Json | null
          model_used?: string | null
          parsed_problems?: Json | null
          processing_time_ms?: number | null
          reasoning?: string | null
          refinement_score?: number | null
          role?: string
          session_id?: string
          suggested_fixes?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goblin_refinement_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "goblin_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      goblin_roadmap_items: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string
          difficulty: string | null
          dimension: string
          estimated_impact: number | null
          id: string
          priority: number
          session_id_completed: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description: string
          difficulty?: string | null
          dimension: string
          estimated_impact?: number | null
          id?: string
          priority: number
          session_id_completed?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string
          difficulty?: string | null
          dimension?: string
          estimated_impact?: number | null
          id?: string
          priority?: number
          session_id_completed?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_entries: {
        Row: {
          application_context: Json | null
          category: string
          complexity_level: string | null
          content: string
          created_at: string
          element_type: string | null
          embedding: string | null
          freshness_score: number | null
          id: string
          industry: string | null
          industry_tags: string[] | null
          metadata: Json | null
          perplexity_last_validated: string | null
          perplexity_sources: Json | null
          perplexity_validated: boolean | null
          perplexity_validation_score: number | null
          primary_category: string | null
          related_patterns: string[] | null
          secondary_category: string | null
          source: string | null
          tags: string[] | null
          title: string
          updated_at: string
          use_cases: string[] | null
        }
        Insert: {
          application_context?: Json | null
          category: string
          complexity_level?: string | null
          content: string
          created_at?: string
          element_type?: string | null
          embedding?: string | null
          freshness_score?: number | null
          id?: string
          industry?: string | null
          industry_tags?: string[] | null
          metadata?: Json | null
          perplexity_last_validated?: string | null
          perplexity_sources?: Json | null
          perplexity_validated?: boolean | null
          perplexity_validation_score?: number | null
          primary_category?: string | null
          related_patterns?: string[] | null
          secondary_category?: string | null
          source?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          use_cases?: string[] | null
        }
        Update: {
          application_context?: Json | null
          category?: string
          complexity_level?: string | null
          content?: string
          created_at?: string
          element_type?: string | null
          embedding?: string | null
          freshness_score?: number | null
          id?: string
          industry?: string | null
          industry_tags?: string[] | null
          metadata?: Json | null
          perplexity_last_validated?: string | null
          perplexity_sources?: Json | null
          perplexity_validated?: boolean | null
          perplexity_validation_score?: number | null
          primary_category?: string | null
          related_patterns?: string[] | null
          secondary_category?: string | null
          source?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          use_cases?: string[] | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          analysis_complete: boolean
          analysis_error: boolean
          created_at: string
          email_notifications: boolean
          id: string
          marketing_emails: boolean
          system_updates: boolean
          updated_at: string
          user_id: string
          weekly_digest: boolean
        }
        Insert: {
          analysis_complete?: boolean
          analysis_error?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          marketing_emails?: boolean
          system_updates?: boolean
          updated_at?: string
          user_id: string
          weekly_digest?: boolean
        }
        Update: {
          analysis_complete?: boolean
          analysis_error?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          marketing_emails?: boolean
          system_updates?: boolean
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean
        }
        Relationships: []
      }
      pipeline_configurations: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          stages: Json
          thresholds: Json
          updated_at: string
          version: number
          weights: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          stages?: Json
          thresholds?: Json
          updated_at?: string
          version?: number
          weights?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          stages?: Json
          thresholds?: Json
          updated_at?: string
          version?: number
          weights?: Json
        }
        Relationships: []
      }
      privacy_preferences: {
        Row: {
          analytics_tracking: boolean
          created_at: string
          data_sharing: boolean
          id: string
          improve_product: boolean
          public_profile: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_tracking?: boolean
          created_at?: string
          data_sharing?: boolean
          id?: string
          improve_product?: boolean
          public_profile?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_tracking?: boolean
          created_at?: string
          data_sharing?: boolean
          id?: string
          improve_product?: boolean
          public_profile?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      problem_statements: {
        Row: {
          category: string
          context_refinement_questions: string[]
          created_at: string | null
          id: string
          implied_context: Json
          last_updated: string | null
          statement: string
          targeted_solutions: string[]
          traditional_ux_issues: string[] | null
          usage_count: number | null
        }
        Insert: {
          category: string
          context_refinement_questions?: string[]
          created_at?: string | null
          id?: string
          implied_context?: Json
          last_updated?: string | null
          statement: string
          targeted_solutions?: string[]
          traditional_ux_issues?: string[] | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          context_refinement_questions?: string[]
          created_at?: string | null
          id?: string
          implied_context?: Json
          last_updated?: string | null
          statement?: string
          targeted_solutions?: string[]
          traditional_ux_issues?: string[] | null
          usage_count?: number | null
        }
        Relationships: []
      }
      product_features: {
        Row: {
          created_at: string
          feature_key: string
          feature_value: Json
          id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feature_key: string
          feature_value?: Json
          id?: string
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feature_key?: string
          feature_value?: Json
          id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_features_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          analyses_limit: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_monthly: number | null
          price_yearly: number | null
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          analyses_limit?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          analyses_limit?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          automation_preferences: Json | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          super_admin: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          automation_preferences?: Json | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          super_admin?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          automation_preferences?: Json | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          super_admin?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          requests_count: number
          user_id: string | null
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          requests_count?: number
          user_id?: string | null
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          requests_count?: number
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          analyses_limit: number | null
          analyses_used: number | null
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analyses_limit?: number | null
          analyses_used?: number | null
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analyses_limit?: number | null
          analyses_used?: number | null
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      uploaded_files: {
        Row: {
          analysis_id: string
          created_at: string
          figma_url: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          original_url: string | null
          public_url: string | null
          storage_path: string
          upload_type: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          analysis_id: string
          created_at?: string
          figma_url?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          original_url?: string | null
          public_url?: string | null
          storage_path: string
          upload_type?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          analysis_id?: string
          created_at?: string
          figma_url?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          original_url?: string | null
          public_url?: string | null
          storage_path?: string
          upload_type?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_problem_statements: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          extracted_context: Json | null
          id: string
          implementation_feedback: string | null
          matched_problem_statement_id: string | null
          original_statement: string
          refinement_answers: Json | null
          satisfaction_score: number | null
          user_id: string | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          extracted_context?: Json | null
          id?: string
          implementation_feedback?: string | null
          matched_problem_statement_id?: string | null
          original_statement: string
          refinement_answers?: Json | null
          satisfaction_score?: number | null
          user_id?: string | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          extracted_context?: Json | null
          id?: string
          implementation_feedback?: string | null
          matched_problem_statement_id?: string | null
          original_statement?: string
          refinement_answers?: Json | null
          satisfaction_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_problem_statements_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_problem_statements_matched_problem_statement_id_fkey"
            columns: ["matched_problem_statement_id"]
            isOneToOne: false
            referencedRelation: "problem_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          analyses_limit: number | null
          analyses_used: number | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string | null
          product_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analyses_limit?: number | null
          analyses_used?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          product_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analyses_limit?: number | null
          analyses_used?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          product_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configs: {
        Row: {
          api_key_id: string
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          last_triggered_at: string | null
          retry_count: number
          secret: string
          timeout_seconds: number
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          api_key_id: string
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          retry_count?: number
          secret: string
          timeout_seconds?: number
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          api_key_id?: string
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          retry_count?: number
          secret?: string
          timeout_seconds?: number
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_configs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      analysis_health: {
        Row: {
          avg_duration_seconds: number | null
          count: number | null
          last_hour_count: number | null
          latest_created: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      cancel_analysis: {
        Args: { analysis_id: string; user_id: string }
        Returns: boolean
      }
      check_analysis_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_api_rate_limit: {
        Args: { p_api_key_id: string; p_rate_limit: number }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_user_id: string
          p_endpoint: string
          p_limit_per_minute?: number
        }
        Returns: boolean
      }
      clear_prototypes_for_analysis: {
        Args: { p_analysis_id: string }
        Returns: number
      }
      emergency_cleanup_stuck_analyses: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_analysis_usage: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      initialize_user_subscription: {
        Args: { p_user_id: string }
        Returns: string
      }
      is_super_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      log_api_usage: {
        Args: {
          p_api_key_id: string
          p_endpoint: string
          p_method: string
          p_status_code: number
          p_response_time_ms?: number
          p_request_size_bytes?: number
          p_response_size_bytes?: number
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: undefined
      }
      match_knowledge: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          filter_category?: string
        }
        Returns: {
          id: string
          title: string
          content: string
          category: string
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
          similarity: number
        }[]
      }
      match_patterns: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          filter_industry?: string
          filter_pattern_type?: string
        }
        Returns: {
          id: string
          pattern_name: string
          description: string
          industry: string
          pattern_type: string
          examples: Json
          effectiveness_score: number
          similarity: number
        }[]
      }
      reset_stuck_analyses: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_trending_improvements: {
        Args: {
          p_user_id: string
          p_category: string
          p_improvement_type: string
        }
        Returns: undefined
      }
      validate_api_key: {
        Args: { p_key_hash: string }
        Returns: {
          api_key_id: string
          user_id: string
          permissions: Json
          rate_limit_per_hour: number
          is_valid: boolean
        }[]
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      figmant_business_type:
        | "saas"
        | "ecommerce"
        | "marketplace"
        | "content"
        | "other"
      figmant_design_type:
        | "landing-page"
        | "dashboard"
        | "onboarding"
        | "checkout"
        | "other"
      figmant_primary_goal:
        | "increase-conversions"
        | "improve-engagement"
        | "reduce-churn"
        | "simplify-ux"
        | "other"
      figmant_solution_type: "conservative" | "balanced" | "innovative"
      user_role:
        | "designer"
        | "developer"
        | "marketing"
        | "business"
        | "product"
        | "executive"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      figmant_business_type: [
        "saas",
        "ecommerce",
        "marketplace",
        "content",
        "other",
      ],
      figmant_design_type: [
        "landing-page",
        "dashboard",
        "onboarding",
        "checkout",
        "other",
      ],
      figmant_primary_goal: [
        "increase-conversions",
        "improve-engagement",
        "reduce-churn",
        "simplify-ux",
        "other",
      ],
      figmant_solution_type: ["conservative", "balanced", "innovative"],
      user_role: [
        "designer",
        "developer",
        "marketing",
        "business",
        "product",
        "executive",
        "other",
      ],
    },
  },
} as const
