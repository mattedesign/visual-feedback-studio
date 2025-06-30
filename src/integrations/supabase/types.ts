export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analyses: {
        Row: {
          ai_model_used: string | null
          analysis_completed_at: string | null
          analysis_prompt: string | null
          business_goals: string[] | null
          business_impact_score: number | null
          competitive_position_score: number | null
          created_at: string
          description: string | null
          design_type: string | null
          id: string
          implementation_timeline_weeks: number | null
          knowledge_sources_used: number | null
          revenue_confidence_level: number | null
          revenue_potential_annual: number | null
          status: string
          target_audience: string | null
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
          competitive_position_score?: number | null
          created_at?: string
          description?: string | null
          design_type?: string | null
          id?: string
          implementation_timeline_weeks?: number | null
          knowledge_sources_used?: number | null
          revenue_confidence_level?: number | null
          revenue_potential_annual?: number | null
          status?: string
          target_audience?: string | null
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
          competitive_position_score?: number | null
          created_at?: string
          description?: string | null
          design_type?: string | null
          id?: string
          implementation_timeline_weeks?: number | null
          knowledge_sources_used?: number | null
          revenue_confidence_level?: number | null
          revenue_potential_annual?: number | null
          status?: string
          target_audience?: string | null
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
          created_at: string
          enhanced_context: Json | null
          id: string
          images: string[]
          knowledge_sources_used: number | null
          processing_time_ms: number | null
          research_citations: string[] | null
          total_annotations: number | null
          updated_at: string
          user_id: string
          well_done_data: Json | null
        }
        Insert: {
          ai_model_used?: string | null
          analysis_context?: string | null
          analysis_id: string
          annotations?: Json
          created_at?: string
          enhanced_context?: Json | null
          id?: string
          images?: string[]
          knowledge_sources_used?: number | null
          processing_time_ms?: number | null
          research_citations?: string[] | null
          total_annotations?: number | null
          updated_at?: string
          user_id: string
          well_done_data?: Json | null
        }
        Update: {
          ai_model_used?: string | null
          analysis_context?: string | null
          analysis_id?: string
          annotations?: Json
          created_at?: string
          enhanced_context?: Json | null
          id?: string
          images?: string[]
          knowledge_sources_used?: number | null
          processing_time_ms?: number | null
          research_citations?: string[] | null
          total_annotations?: number | null
          updated_at?: string
          user_id?: string
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
      user_subscriptions: {
        Row: {
          analyses_limit: number | null
          analyses_used: number | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string | null
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
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      check_analysis_limit: {
        Args: { p_user_id: string }
        Returns: boolean
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
