export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      call_analysis: {
        Row: {
          active_listening_comment: string | null
          active_listening_score: number | null
          answer_completeness_comment: string | null
          answer_completeness_score: number | null
          audio_url: string | null
          burnout_signs: string | null
          call_goal: string | null
          client_nps_category: string | null
          closing_correct: boolean | null
          communication_issues: string | null
          conflict_moments: string | null
          conflict_risk_level: string | null
          conversation_duration_total: string | null
          conversation_stage_closing: string | null
          conversation_stage_greeting: string | null
          conversation_stage_request: string | null
          conversation_stage_solution: string | null
          date_created: string | null
          date_updated: string | null
          final_conclusion: string | null
          goal_achieved: boolean | null
          greeting_correct: boolean | null
          id: string
          operator_said_name: boolean | null
          operator_strength: string | null
          operator_thanked: boolean | null
          operator_tonality: string | null
          operator_weakness: string | null
          overall_score: number | null
          transcript: string | null
        }
        Insert: {
          active_listening_comment?: string | null
          active_listening_score?: number | null
          answer_completeness_comment?: string | null
          answer_completeness_score?: number | null
          audio_url?: string | null
          burnout_signs?: string | null
          call_goal?: string | null
          client_nps_category?: string | null
          closing_correct?: boolean | null
          communication_issues?: string | null
          conflict_moments?: string | null
          conflict_risk_level?: string | null
          conversation_duration_total?: string | null
          conversation_stage_closing?: string | null
          conversation_stage_greeting?: string | null
          conversation_stage_request?: string | null
          conversation_stage_solution?: string | null
          date_created?: string | null
          date_updated?: string | null
          final_conclusion?: string | null
          goal_achieved?: boolean | null
          greeting_correct?: boolean | null
          id?: string
          operator_said_name?: boolean | null
          operator_strength?: string | null
          operator_thanked?: boolean | null
          operator_tonality?: string | null
          operator_weakness?: string | null
          overall_score?: number | null
          transcript?: string | null
        }
        Update: {
          active_listening_comment?: string | null
          active_listening_score?: number | null
          answer_completeness_comment?: string | null
          answer_completeness_score?: number | null
          audio_url?: string | null
          burnout_signs?: string | null
          call_goal?: string | null
          client_nps_category?: string | null
          closing_correct?: boolean | null
          communication_issues?: string | null
          conflict_moments?: string | null
          conflict_risk_level?: string | null
          conversation_duration_total?: string | null
          conversation_stage_closing?: string | null
          conversation_stage_greeting?: string | null
          conversation_stage_request?: string | null
          conversation_stage_solution?: string | null
          date_created?: string | null
          date_updated?: string | null
          final_conclusion?: string | null
          goal_achieved?: boolean | null
          greeting_correct?: boolean | null
          id?: string
          operator_said_name?: boolean | null
          operator_strength?: string | null
          operator_thanked?: boolean | null
          operator_tonality?: string | null
          operator_weakness?: string | null
          overall_score?: number | null
          transcript?: string | null
        }
        Relationships: []
      }
      call_analysis_crm: {
        Row: {
          active_listening_comment: string | null
          active_listening_score: number | null
          analyzed_at: string | null
          answer_completeness_comment: string | null
          answer_completeness_score: number | null
          brand: string | null
          burnout_signs: string | null
          call_datetime: string
          call_goal: string | null
          call_id: string
          call_type: string | null
          client_id: string | null
          client_nps_category: string | null
          client_phone: string | null
          closing_correct: boolean | null
          communication_issues: string | null
          conflict_moments: string | null
          conflict_risk_level: string | null
          conversation_duration_total: string | null
          conversation_stage_closing: string | null
          conversation_stage_greeting: string | null
          conversation_stage_request: string | null
          conversation_stage_solution: string | null
          department: string | null
          file_name: string | null
          file_status: string | null
          file_url: string
          final_conclusion: string | null
          goal_achieved: boolean | null
          greeting_correct: boolean | null
          id: number
          operator_said_name: boolean | null
          operator_strength: string | null
          operator_thanked: boolean | null
          operator_tonality: string | null
          operator_weakness: string | null
          overall_score: number | null
          transcript: string | null
          transcript_full: string | null
          uploaded_at: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          active_listening_comment?: string | null
          active_listening_score?: number | null
          analyzed_at?: string | null
          answer_completeness_comment?: string | null
          answer_completeness_score?: number | null
          brand?: string | null
          burnout_signs?: string | null
          call_datetime: string
          call_goal?: string | null
          call_id: string
          call_type?: string | null
          client_id?: string | null
          client_nps_category?: string | null
          client_phone?: string | null
          closing_correct?: boolean | null
          communication_issues?: string | null
          conflict_moments?: string | null
          conflict_risk_level?: string | null
          conversation_duration_total?: string | null
          conversation_stage_closing?: string | null
          conversation_stage_greeting?: string | null
          conversation_stage_request?: string | null
          conversation_stage_solution?: string | null
          department?: string | null
          file_name?: string | null
          file_status?: string | null
          file_url: string
          final_conclusion?: string | null
          goal_achieved?: boolean | null
          greeting_correct?: boolean | null
          id?: number
          operator_said_name?: boolean | null
          operator_strength?: string | null
          operator_thanked?: boolean | null
          operator_tonality?: string | null
          operator_weakness?: string | null
          overall_score?: number | null
          transcript?: string | null
          transcript_full?: string | null
          uploaded_at?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          active_listening_comment?: string | null
          active_listening_score?: number | null
          analyzed_at?: string | null
          answer_completeness_comment?: string | null
          answer_completeness_score?: number | null
          brand?: string | null
          burnout_signs?: string | null
          call_datetime?: string
          call_goal?: string | null
          call_id?: string
          call_type?: string | null
          client_id?: string | null
          client_nps_category?: string | null
          client_phone?: string | null
          closing_correct?: boolean | null
          communication_issues?: string | null
          conflict_moments?: string | null
          conflict_risk_level?: string | null
          conversation_duration_total?: string | null
          conversation_stage_closing?: string | null
          conversation_stage_greeting?: string | null
          conversation_stage_request?: string | null
          conversation_stage_solution?: string | null
          department?: string | null
          file_name?: string | null
          file_status?: string | null
          file_url?: string
          final_conclusion?: string | null
          goal_achieved?: boolean | null
          greeting_correct?: boolean | null
          id?: number
          operator_said_name?: boolean | null
          operator_strength?: string | null
          operator_thanked?: boolean | null
          operator_tonality?: string | null
          operator_weakness?: string | null
          overall_score?: number | null
          transcript?: string | null
          transcript_full?: string | null
          uploaded_at?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      crm_analytics: {
        Row: {
          active_listening_done: boolean | null
          address_clarified: boolean | null
          analyzed_at: string | null
          answer_complete: boolean | null
          brand: string | null
          burnout_level: string | null
          burnout_signs: Json | null
          call_datetime: string
          call_id: string
          call_success: string | null
          call_type: string | null
          cause_clarified: boolean | null
          cause_identified: boolean | null
          client_helped: boolean | null
          client_id: string | null
          client_phone: string | null
          compliance_score: number | null
          conflict_moments: string | null
          conflict_resolved: boolean | null
          conflict_risk_score: number | null
          conversation_duration_minutes: number | null
          conversation_duration_total: string | null
          conversation_stage_closing: string | null
          conversation_stage_greeting: string | null
          conversation_stage_request: string | null
          conversation_stage_solution: string | null
          department: string | null
          file_name: string | null
          file_status: string | null
          file_url: string
          final_conclusion: string | null
          greeting_correct: boolean | null
          id: number
          is_first_contact: boolean | null
          operator_said_name: boolean | null
          operator_thanked: boolean | null
          operator_tonality: string | null
          overall_score: number | null
          quality_score: number | null
          stages_score: number | null
          tag: string | null
          transkription: string | null
          transkription_full_json: Json | null
          uploaded_at: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          active_listening_done?: boolean | null
          address_clarified?: boolean | null
          analyzed_at?: string | null
          answer_complete?: boolean | null
          brand?: string | null
          burnout_level?: string | null
          burnout_signs?: Json | null
          call_datetime: string
          call_id: string
          call_success?: string | null
          call_type?: string | null
          cause_clarified?: boolean | null
          cause_identified?: boolean | null
          client_helped?: boolean | null
          client_id?: string | null
          client_phone?: string | null
          compliance_score?: number | null
          conflict_moments?: string | null
          conflict_resolved?: boolean | null
          conflict_risk_score?: number | null
          conversation_duration_minutes?: number | null
          conversation_duration_total?: string | null
          conversation_stage_closing?: string | null
          conversation_stage_greeting?: string | null
          conversation_stage_request?: string | null
          conversation_stage_solution?: string | null
          department?: string | null
          file_name?: string | null
          file_status?: string | null
          file_url: string
          final_conclusion?: string | null
          greeting_correct?: boolean | null
          id?: number
          is_first_contact?: boolean | null
          operator_said_name?: boolean | null
          operator_thanked?: boolean | null
          operator_tonality?: string | null
          overall_score?: number | null
          quality_score?: number | null
          stages_score?: number | null
          tag?: string | null
          transkription?: string | null
          transkription_full_json?: Json | null
          uploaded_at?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          active_listening_done?: boolean | null
          address_clarified?: boolean | null
          analyzed_at?: string | null
          answer_complete?: boolean | null
          brand?: string | null
          burnout_level?: string | null
          burnout_signs?: Json | null
          call_datetime?: string
          call_id?: string
          call_success?: string | null
          call_type?: string | null
          cause_clarified?: boolean | null
          cause_identified?: boolean | null
          client_helped?: boolean | null
          client_id?: string | null
          client_phone?: string | null
          compliance_score?: number | null
          conflict_moments?: string | null
          conflict_resolved?: boolean | null
          conflict_risk_score?: number | null
          conversation_duration_minutes?: number | null
          conversation_duration_total?: string | null
          conversation_stage_closing?: string | null
          conversation_stage_greeting?: string | null
          conversation_stage_request?: string | null
          conversation_stage_solution?: string | null
          department?: string | null
          file_name?: string | null
          file_status?: string | null
          file_url?: string
          final_conclusion?: string | null
          greeting_correct?: boolean | null
          id?: number
          is_first_contact?: boolean | null
          operator_said_name?: boolean | null
          operator_thanked?: boolean | null
          operator_tonality?: string | null
          overall_score?: number | null
          quality_score?: number | null
          stages_score?: number | null
          tag?: string | null
          transkription?: string | null
          transkription_full_json?: Json | null
          uploaded_at?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          brand: string | null
          created_at: string
          id: number
          name: string
          number: string
          type: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          id?: number
          name: string
          number: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          id?: number
          name?: string
          number?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department_id: number | null
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: number | null
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: number | null
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          created_at: string
          id: number
          prompt_key: string | null
          prompt_name: string | null
          prompt_text: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          prompt_key?: string | null
          prompt_name?: string | null
          prompt_text?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          prompt_key?: string | null
          prompt_name?: string | null
          prompt_text?: string | null
        }
        Relationships: []
      }
      sales_calls_analysis: {
        Row: {
          call_duration_seconds: number | null
          client_emotion: string | null
          client_requirements: string | null
          client_warmth: string | null
          construction_count: string | null
          construction_score: number | null
          created_at: string | null
          emotion_score: number | null
          file_id: string | null
          id: string
          manager_feedback: string | null
          measurement_scheduled: boolean | null
          measurement_score: number | null
          next_contact_date: string | null
          next_contact_method: string | null
          object_score: number | null
          object_type: string | null
          skills_to_improve: string | null
          stage5_call_summary: string | null
          stage5_order_manager: string | null
          stage5_order_score: number | null
          stage5_payment_conditions: string | null
          stage5_payment_score: number | null
          stage5_personal_manager: string | null
          stage5_personal_score: number | null
          stage5_summary_score: number | null
          stage5_thanked_client: string | null
          stage5_thanks_score: number | null
          stage5_total_score: number | null
          stage6_check_score: number | null
          stage6_culture_score: number | null
          stage6_knows_phone: string | null
          stage6_knows_source: string | null
          stage6_name_score: number | null
          stage6_name_usage: string | null
          stage6_phone_score: number | null
          stage6_questions_check: string | null
          stage6_source_score: number | null
          stage6_speech_culture: string | null
          stage6_total_score: number | null
          steno: string | null
          telegram_chat_id: number | null
          telegram_file_id: string | null
          timing_score: number | null
          total_score: number | null
          transcript_text: string | null
          used_skills: string | null
          window_needed_when: string | null
        }
        Insert: {
          call_duration_seconds?: number | null
          client_emotion?: string | null
          client_requirements?: string | null
          client_warmth?: string | null
          construction_count?: string | null
          construction_score?: number | null
          created_at?: string | null
          emotion_score?: number | null
          file_id?: string | null
          id?: string
          manager_feedback?: string | null
          measurement_scheduled?: boolean | null
          measurement_score?: number | null
          next_contact_date?: string | null
          next_contact_method?: string | null
          object_score?: number | null
          object_type?: string | null
          skills_to_improve?: string | null
          stage5_call_summary?: string | null
          stage5_order_manager?: string | null
          stage5_order_score?: number | null
          stage5_payment_conditions?: string | null
          stage5_payment_score?: number | null
          stage5_personal_manager?: string | null
          stage5_personal_score?: number | null
          stage5_summary_score?: number | null
          stage5_thanked_client?: string | null
          stage5_thanks_score?: number | null
          stage5_total_score?: number | null
          stage6_check_score?: number | null
          stage6_culture_score?: number | null
          stage6_knows_phone?: string | null
          stage6_knows_source?: string | null
          stage6_name_score?: number | null
          stage6_name_usage?: string | null
          stage6_phone_score?: number | null
          stage6_questions_check?: string | null
          stage6_source_score?: number | null
          stage6_speech_culture?: string | null
          stage6_total_score?: number | null
          steno?: string | null
          telegram_chat_id?: number | null
          telegram_file_id?: string | null
          timing_score?: number | null
          total_score?: number | null
          transcript_text?: string | null
          used_skills?: string | null
          window_needed_when?: string | null
        }
        Update: {
          call_duration_seconds?: number | null
          client_emotion?: string | null
          client_requirements?: string | null
          client_warmth?: string | null
          construction_count?: string | null
          construction_score?: number | null
          created_at?: string | null
          emotion_score?: number | null
          file_id?: string | null
          id?: string
          manager_feedback?: string | null
          measurement_scheduled?: boolean | null
          measurement_score?: number | null
          next_contact_date?: string | null
          next_contact_method?: string | null
          object_score?: number | null
          object_type?: string | null
          skills_to_improve?: string | null
          stage5_call_summary?: string | null
          stage5_order_manager?: string | null
          stage5_order_score?: number | null
          stage5_payment_conditions?: string | null
          stage5_payment_score?: number | null
          stage5_personal_manager?: string | null
          stage5_personal_score?: number | null
          stage5_summary_score?: number | null
          stage5_thanked_client?: string | null
          stage5_thanks_score?: number | null
          stage5_total_score?: number | null
          stage6_check_score?: number | null
          stage6_culture_score?: number | null
          stage6_knows_phone?: string | null
          stage6_knows_source?: string | null
          stage6_name_score?: number | null
          stage6_name_usage?: string | null
          stage6_phone_score?: number | null
          stage6_questions_check?: string | null
          stage6_source_score?: number | null
          stage6_speech_culture?: string | null
          stage6_total_score?: number | null
          steno?: string | null
          telegram_chat_id?: number | null
          telegram_file_id?: string | null
          timing_score?: number | null
          total_score?: number | null
          transcript_text?: string | null
          used_skills?: string | null
          window_needed_when?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          created_at: string
          created_by: string
          department_id: number | null
          email: string
          expires_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          department_id?: number | null
          email: string
          expires_at: string
          id?: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          department_id?: number | null
          email?: string
          expires_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource: string
          resource_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource: string
          resource_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource?: string
          resource_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      user_role: "admin" | "editor" | "auditor" | "call_center" | "sales"
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
      user_role: ["admin", "editor", "auditor", "call_center", "sales"],
    },
  },
} as const
