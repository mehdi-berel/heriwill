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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          beneficiaries: string[] | null
          created_at: string
          description: string | null
          documents: string[] | null
          id: string
          location: string | null
          name: string
          notes: string | null
          ownership_type: string
          type: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          beneficiaries?: string[] | null
          created_at?: string
          description?: string | null
          documents?: string[] | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          ownership_type: string
          type: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          beneficiaries?: string[] | null
          created_at?: string
          description?: string | null
          documents?: string[] | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          ownership_type?: string
          type?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      heirs: {
        Row: {
          accepted_at: string | null
          access_level: Database["public"]["Enums"]["access_level_type"]
          created_at: string
          death_confirmed_at: string | null
          email_encrypted: string | null
          full_name_encrypted: string | null
          has_accepted: boolean | null
          heir_public_key: string | null
          heir_user_id: string | null
          id: string
          inheritance_plan_id: string | null
          invitation_code: string | null
          invitation_expires_at: string | null
          invitation_status: string | null
          invited_at: string | null
          is_active: boolean | null
          notification_delay_days: number | null
          notification_status: string | null
          notified_at: string | null
          notify_on_activation: boolean | null
          phone_encrypted: string | null
          rejected_at: string | null
          relationship: string | null
          relationship_encrypted: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          access_level: Database["public"]["Enums"]["access_level_type"]
          created_at?: string
          death_confirmed_at?: string | null
          email_encrypted?: string | null
          full_name_encrypted?: string | null
          has_accepted?: boolean | null
          heir_public_key?: string | null
          heir_user_id?: string | null
          id?: string
          inheritance_plan_id?: string | null
          invitation_code?: string | null
          invitation_expires_at?: string | null
          invitation_status?: string | null
          invited_at?: string | null
          is_active?: boolean | null
          notification_delay_days?: number | null
          notification_status?: string | null
          notified_at?: string | null
          notify_on_activation?: boolean | null
          phone_encrypted?: string | null
          rejected_at?: string | null
          relationship?: string | null
          relationship_encrypted?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          access_level?: Database["public"]["Enums"]["access_level_type"]
          created_at?: string
          death_confirmed_at?: string | null
          email_encrypted?: string | null
          full_name_encrypted?: string | null
          has_accepted?: boolean | null
          heir_public_key?: string | null
          heir_user_id?: string | null
          id?: string
          inheritance_plan_id?: string | null
          invitation_code?: string | null
          invitation_expires_at?: string | null
          invitation_status?: string | null
          invited_at?: string | null
          is_active?: boolean | null
          notification_delay_days?: number | null
          notification_status?: string | null
          notified_at?: string | null
          notify_on_activation?: boolean | null
          phone_encrypted?: string | null
          rejected_at?: string | null
          relationship?: string | null
          relationship_encrypted?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      beneficiaries: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          relationship: string | null
          updated_at: string | null
          user_id: string
          verification_method: string | null
          verification_status: string | null
        }
        Insert: Omit<Database['public']['Tables']['beneficiaries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['beneficiaries']['Insert']>
      }
      digital_assets: {
        Row: {
          beneficiary_id: string | null
          created_at: string | null
          encrypted_password: string | null
          id: string
          instructions: string | null
          name: string
          notes: string | null
          status: string | null
          type: string
          updated_at: string | null
          url: string | null
          user_id: string
          username: string | null
        }
        Insert: Omit<Database['public']['Tables']['digital_assets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['digital_assets']['Insert']>
      }
      legacy_instructions: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          instruction_type: 'general' | 'social_media' | 'financial' | 'family' | 'business' | 'other'
          is_public: boolean
          beneficiary_id: string | null
          status: 'draft' | 'published' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['legacy_instructions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['legacy_instructions']['Insert']>
      }
    }
    Enums: {
      access_level_type: "full" | "partial" | "view"
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  TableName extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][TableName] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<
  TableName extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][TableName] extends {
  Insert: infer I
}
  ? I
  : never

export type TablesUpdate<
  TableName extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][TableName] extends {
  Update: infer U
}
  ? U
  : never