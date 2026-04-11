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
          agent_speech_speed_words_all_call_mean: number | null
          analyzed_at: string | null
          answer_complete: boolean | null
          brand: string | null
          burnout_level: number | null
          burnout_signs: string | null
          call_datetime: string
          call_id: string
          call_success: string | null
          call_type: string | null
          cause_clarified: boolean | null
          cause_identified: boolean | null
          client_emotion_negative: number | null
          client_emotion_neutral: number | null
          client_emotion_positive: number | null
          client_helped: boolean | null
          client_id: string | null
          client_phone: string | null
          client_speech_duration: number | null
          client_speech_rate: number | null
          client_words_count: number | null
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
          csi_score: number | null
          customer_emo_score_mean: number | null
          customer_emo_score_weighted_by_speech_length_mean: number | null
          customer_emotion_neg_speech_time_percentage: number | null
          customer_emotion_pos_speech_time_percentage: number | null
          customer_emotion_pos_utt_percentage: number | null
          department: string | null
          dialog_agent_speech_percentage: number | null
          dialog_anybody_speech_length_percentage: number | null
          dialog_customer_speech_length_percentage: number | null
          dialog_customer_speech_percentage: number | null
          dialog_interruptions_in_agent_speech_percentage: number | null
          dialog_silence_length_percentage: number | null
          emotion_stress_index: number | null
          fcr_score: number | null
          file_name: string | null
          file_status: string | null
          file_url: string
          final_conclusion: string | null
          greeting_correct: boolean | null
          id: number
          interruptions_client: number | null
          interruptions_operator: number | null
          is_first_contact: boolean | null
          operator_emotion_negative: number | null
          operator_emotion_neutral: number | null
          operator_emotion_positive: number | null
          operator_said_name: boolean | null
          operator_speech_duration: number | null
          operator_speech_rate: number | null
          operator_thanked: boolean | null
          operator_tonality: string | null
          operator_words_count: number | null
          overall_score: number | null
          percentage_speech_client: number | null
          percentage_speech_operator: number | null
          quality_score: number | null
          speech_ratio_operator_client: number | null
          stages_score: number | null
          tag: string | null
          transcription_crm: Json | null
          transkription: string | null
          transkription_full_json: Json | null
          updated_at: string | null
          uploaded_at: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          active_listening_done?: boolean | null
          address_clarified?: boolean | null
          agent_speech_speed_words_all_call_mean?: number | null
          analyzed_at?: string | null
          answer_complete?: boolean | null
          brand?: string | null
          burnout_level?: number | null
          burnout_signs?: string | null
          call_datetime: string
          call_id: string
          call_success?: string | null
          call_type?: string | null
          cause_clarified?: boolean | null
          cause_identified?: boolean | null
          client_emotion_negative?: number | null
          client_emotion_neutral?: number | null
          client_emotion_positive?: number | null
          client_helped?: boolean | null
          client_id?: string | null
          client_phone?: string | null
          client_speech_duration?: number | null
          client_speech_rate?: number | null
          client_words_count?: number | null
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
          csi_score?: number | null
          customer_emo_score_mean?: number | null
          customer_emo_score_weighted_by_speech_length_mean?: number | null
          customer_emotion_neg_speech_time_percentage?: number | null
          customer_emotion_pos_speech_time_percentage?: number | null
          customer_emotion_pos_utt_percentage?: number | null
          department?: string | null
          dialog_agent_speech_percentage?: number | null
          dialog_anybody_speech_length_percentage?: number | null
          dialog_customer_speech_length_percentage?: number | null
          dialog_customer_speech_percentage?: number | null
          dialog_interruptions_in_agent_speech_percentage?: number | null
          dialog_silence_length_percentage?: number | null
          emotion_stress_index?: number | null
          fcr_score?: number | null
          file_name?: string | null
          file_status?: string | null
          file_url: string
          final_conclusion?: string | null
          greeting_correct?: boolean | null
          id?: number
          interruptions_client?: number | null
          interruptions_operator?: number | null
          is_first_contact?: boolean | null
          operator_emotion_negative?: number | null
          operator_emotion_neutral?: number | null
          operator_emotion_positive?: number | null
          operator_said_name?: boolean | null
          operator_speech_duration?: number | null
          operator_speech_rate?: number | null
          operator_thanked?: boolean | null
          operator_tonality?: string | null
          operator_words_count?: number | null
          overall_score?: number | null
          percentage_speech_client?: number | null
          percentage_speech_operator?: number | null
          quality_score?: number | null
          speech_ratio_operator_client?: number | null
          stages_score?: number | null
          tag?: string | null
          transcription_crm?: Json | null
          transkription?: string | null
          transkription_full_json?: Json | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          active_listening_done?: boolean | null
          address_clarified?: boolean | null
          agent_speech_speed_words_all_call_mean?: number | null
          analyzed_at?: string | null
          answer_complete?: boolean | null
          brand?: string | null
          burnout_level?: number | null
          burnout_signs?: string | null
          call_datetime?: string
          call_id?: string
          call_success?: string | null
          call_type?: string | null
          cause_clarified?: boolean | null
          cause_identified?: boolean | null
          client_emotion_negative?: number | null
          client_emotion_neutral?: number | null
          client_emotion_positive?: number | null
          client_helped?: boolean | null
          client_id?: string | null
          client_phone?: string | null
          client_speech_duration?: number | null
          client_speech_rate?: number | null
          client_words_count?: number | null
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
          csi_score?: number | null
          customer_emo_score_mean?: number | null
          customer_emo_score_weighted_by_speech_length_mean?: number | null
          customer_emotion_neg_speech_time_percentage?: number | null
          customer_emotion_pos_speech_time_percentage?: number | null
          customer_emotion_pos_utt_percentage?: number | null
          department?: string | null
          dialog_agent_speech_percentage?: number | null
          dialog_anybody_speech_length_percentage?: number | null
          dialog_customer_speech_length_percentage?: number | null
          dialog_customer_speech_percentage?: number | null
          dialog_interruptions_in_agent_speech_percentage?: number | null
          dialog_silence_length_percentage?: number | null
          emotion_stress_index?: number | null
          fcr_score?: number | null
          file_name?: string | null
          file_status?: string | null
          file_url?: string
          final_conclusion?: string | null
          greeting_correct?: boolean | null
          id?: number
          interruptions_client?: number | null
          interruptions_operator?: number | null
          is_first_contact?: boolean | null
          operator_emotion_negative?: number | null
          operator_emotion_neutral?: number | null
          operator_emotion_positive?: number | null
          operator_said_name?: boolean | null
          operator_speech_duration?: number | null
          operator_speech_rate?: number | null
          operator_thanked?: boolean | null
          operator_tonality?: string | null
          operator_words_count?: number | null
          overall_score?: number | null
          percentage_speech_client?: number | null
          percentage_speech_operator?: number | null
          quality_score?: number | null
          speech_ratio_operator_client?: number | null
          stages_score?: number | null
          tag?: string | null
          transcription_crm?: Json | null
          transkription?: string | null
          transkription_full_json?: Json | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string | null
          user_name?: string
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
        Relationships: []
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
