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
          created_at: string
          description: string | null
          design_type: string | null
          failure_reason: string | null
          id: string
          implementation_timeline_weeks: number | null
          knowledge_sources_used: number | null
          last_retry_at: string | null
          retry_count: number | null
          revenue_confidence_level: number | null
          revenue_potential_annual: number | null
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
          created_at?: string
          description?: string | null
          design_type?: string | null
          failure_reason?: string | null
          id?: string
          implementation_timeline_weeks?: number | null
          knowledge_sources_used?: number | null
          last_retry_at?: string | null
          retry_count?: number | null
          revenue_confidence_level?: number | null
          revenue_potential_annual?: number | null
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
          created_at?: string
          description?: string | null
          design_type?: string | null
          failure_reason?: string | null
          id?: string
          implementation_timeline_weeks?: number | null
          knowledge_sources_used?: number | null
          last_retry_at?: string | null
          retry_count?: number | null
          revenue_confidence_level?: number | null
          revenue_potential_annual?: number | null
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
          confidence_weights: Json | null
          created_at: string
          enhanced_context: Json | null
          enhanced_prompt_data: Json | null
          error_details: Json | null
          google_vision_data: Json | null
          id: string
          images: string[]
          knowledge_sources_used: number | null
          perplexity_competitive_data: Json | null
          perplexity_enhanced: boolean | null
          perplexity_research_data: Json | null
          perplexity_trend_data: Json | null
          pipeline_stage: string | null
          processing_stages: Json | null
          processing_time_ms: number | null
          quality_scores: Json | null
          research_citations: string[] | null
          stage_timing: Json | null
          synthesis_metadata: Json | null
          timeout_occurred: boolean | null
          total_annotations: number | null
          updated_at: string
          user_id: string
          validation_status: string | null
          visual_intelligence: Json | null
          well_done_data: Json | null
        }
        Insert: {
          ai_model_used?: string | null
          analysis_context?: string | null
          analysis_id: string
          annotations?: Json
          cancelled_by_user?: boolean | null
          confidence_weights?: Json | null
          created_at?: string
          enhanced_context?: Json | null
          enhanced_prompt_data?: Json | null
          error_details?: Json | null
          google_vision_data?: Json | null
          id?: string
          images?: string[]
          knowledge_sources_used?: number | null
          perplexity_competitive_data?: Json | null
          perplexity_enhanced?: boolean | null
          perplexity_research_data?: Json | null
          perplexity_trend_data?: Json | null
          pipeline_stage?: string | null
          processing_stages?: Json | null
          processing_time_ms?: number | null
          quality_scores?: Json | null
          research_citations?: string[] | null
          stage_timing?: Json | null
          synthesis_metadata?: Json | null
          timeout_occurred?: boolean | null
          total_annotations?: number | null
          updated_at?: string
          user_id: string
          validation_status?: string | null
          visual_intelligence?: Json | null
          well_done_data?: Json | null
        }
        Update: {
          ai_model_used?: string | null
          analysis_context?: string | null
          analysis_id?: string
          annotations?: Json
          cancelled_by_user?: boolean | null
          confidence_weights?: Json | null
          created_at?: string
          enhanced_context?: Json | null
          enhanced_prompt_data?: Json | null
          error_details?: Json | null
          google_vision_data?: Json | null
          id?: string
          images?: string[]
          knowledge_sources_used?: number | null
          perplexity_competitive_data?: Json | null
          perplexity_enhanced?: boolean | null
          perplexity_research_data?: Json | null
          perplexity_trend_data?: Json | null
          pipeline_stage?: string | null
          processing_stages?: Json | null
          processing_time_ms?: number | null
          quality_scores?: Json | null
          research_citations?: string[] | null
          stage_timing?: Json | null
          synthesis_metadata?: Json | null
          timeout_occurred?: boolean | null
          total_annotations?: number | null
          updated_at?: string
          user_id?: string
          validation_status?: string | null
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
      check_rate_limit: {
        Args: {
          p_user_id: string
          p_endpoint: string
          p_limit_per_minute?: number
        }
        Returns: boolean
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
