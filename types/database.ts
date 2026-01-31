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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          emergency_contact_email: string | null
          emergency_contact_phone: string | null
          is_active: boolean
          account_locked: boolean
          created_at: string
          updated_at: string
          last_login: string | null
          email_verified: boolean
          subscription_tier: string
          subscription_status: string
          subscription_expires_at: string | null
          global_trigger_method: string
          global_trigger_settings: Json
          global_scheduled_date: string | null
          trusted_contact_email: string | null
          trusted_contact_phone: string | null
          last_activity: string
          last_reminder_sent_at: string | null
          trusted_contact_heir_id: string | null
          locked_until: string | null
          failed_login_attempts: number
          inheritance_triggered: boolean
          inheritance_triggered_at: string | null
          user_type: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          emergency_contact_email?: string | null
          emergency_contact_phone?: string | null
          is_active?: boolean
          account_locked?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
          email_verified?: boolean
          subscription_tier?: string
          subscription_status?: string
          subscription_expires_at?: string | null
          global_trigger_method?: string
          global_trigger_settings?: Json
          global_scheduled_date?: string | null
          trusted_contact_email?: string | null
          trusted_contact_phone?: string | null
          last_activity?: string
          last_reminder_sent_at?: string | null
          trusted_contact_heir_id?: string | null
          locked_until?: string | null
          failed_login_attempts?: number
          inheritance_triggered?: boolean
          inheritance_triggered_at?: string | null
          user_type?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          emergency_contact_email?: string | null
          emergency_contact_phone?: string | null
          is_active?: boolean
          account_locked?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
          email_verified?: boolean
          subscription_tier?: string
          subscription_status?: string
          subscription_expires_at?: string | null
          global_trigger_method?: string
          global_trigger_settings?: Json
          global_scheduled_date?: string | null
          trusted_contact_email?: string | null
          trusted_contact_phone?: string | null
          last_activity?: string
          last_reminder_sent_at?: string | null
          trusted_contact_heir_id?: string | null
          locked_until?: string | null
          failed_login_attempts?: number
          inheritance_triggered?: boolean
          inheritance_triggered_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      vaults: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          settings: Json
          access_control: Json
          death_settings: Json
          is_encrypted: boolean
          is_locked: boolean
          is_shared: boolean
          is_favorite: boolean
          is_active: boolean
          tags: string[] | null
          sort_order: number
          created_at: string
          updated_at: string
          last_accessed: string | null
          category: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          settings?: Json
          access_control?: Json
          death_settings?: Json
          is_encrypted?: boolean
          is_locked?: boolean
          is_shared?: boolean
          is_favorite?: boolean
          is_active?: boolean
          tags?: string[] | null
          sort_order?: number
          created_at?: string
          updated_at?: string
          last_accessed?: string | null
          category?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          settings?: Json
          access_control?: Json
          death_settings?: Json
          is_encrypted?: boolean
          is_locked?: boolean
          is_shared?: boolean
          is_favorite?: boolean
          is_active?: boolean
          tags?: string[] | null
          sort_order?: number
          created_at?: string
          updated_at?: string
          last_accessed?: string | null
          category?: string
        }
        Relationships: []
      }
      inheritance_plans: {
        Row: {
          id: string
          user_id: string
          plan_name: string
          plan_type: string
          is_active: boolean
          is_triggered: boolean
          triggered_at: string | null
          instructions_encrypted: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_name: string
          plan_type: string
          is_active?: boolean
          is_triggered?: boolean
          triggered_at?: string | null
          instructions_encrypted?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_name?: string
          plan_type?: string
          is_active?: boolean
          is_triggered?: boolean
          triggered_at?: string | null
          instructions_encrypted?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      inheritance_triggers: {
        Row: {
          id: string
          inheritance_plan_id: string
          user_id: string
          trigger_metadata: Json | null
          status: string
          requires_verification: boolean
          verification_code: string | null
          verified_at: string | null
          verified_by: string | null
          triggered_at: string
          completed_at: string | null
          cancelled_at: string | null
          trigger_reason: string | null
        }
        Insert: {
          id?: string
          inheritance_plan_id: string
          user_id: string
          trigger_metadata?: Json | null
          status?: string
          requires_verification?: boolean
          verification_code?: string | null
          verified_at?: string | null
          verified_by?: string | null
          triggered_at?: string
          completed_at?: string | null
          cancelled_at?: string | null
          trigger_reason?: string | null
        }
        Update: {
          id?: string
          inheritance_plan_id?: string
          user_id?: string
          trigger_metadata?: Json | null
          status?: string
          requires_verification?: boolean
          verification_code?: string | null
          verified_at?: string | null
          verified_by?: string | null
          triggered_at?: string
          completed_at?: string | null
          cancelled_at?: string | null
          trigger_reason?: string | null
        }
        Relationships: []
      }
      vault_items: {
        Row: {
          id: string
          vault_id: string
          user_id: string
          item_type: string
          storage_path: string
          storage_bucket: string
          file_size: number | null
          title_encrypted: string
          tags: string[] | null
          is_favorite: boolean
          password_strength: number | null
          password_last_changed: string | null
          requires_password_change: boolean
          created_at: string
          updated_at: string
          last_accessed: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          vault_id: string
          user_id: string
          item_type: string
          storage_path: string
          storage_bucket?: string
          file_size?: number | null
          title_encrypted: string
          tags?: string[] | null
          is_favorite?: boolean
          password_strength?: number | null
          password_last_changed?: string | null
          requires_password_change?: boolean
          created_at?: string
          updated_at?: string
          last_accessed?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          vault_id?: string
          user_id?: string
          item_type?: string
          storage_path?: string
          storage_bucket?: string
          file_size?: number | null
          title_encrypted?: string
          tags?: string[] | null
          is_favorite?: boolean
          password_strength?: number | null
          password_last_changed?: string | null
          requires_password_change?: boolean
          created_at?: string
          updated_at?: string
          last_accessed?: string | null
          metadata?: Json
        }
        Relationships: []
      }
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

type DefaultSchema = Database["public"]

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