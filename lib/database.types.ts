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
          created_at: string
          description: string | null
          documents: string[] | null
          heir_ids: string[] | null
          id: string
          location: string | null
          name: string
          notes: string | null
          ownership_type: string
          type: string
          updated_at: string
          user_id: string
          value: number | null
          vault_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          documents?: string[] | null
          heir_ids?: string[] | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          ownership_type: string
          type: string
          updated_at?: string
          user_id: string
          value?: number | null
          vault_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          documents?: string[] | null
          heir_ids?: string[] | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          ownership_type?: string
          type?: string
          updated_at?: string
          user_id?: string
          value?: number | null
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          risk_level: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          risk_level?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          risk_level?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      heirs: {
        Row: {
          accepted_at: string | null
          created_at: string
          email_encrypted: string | null
          full_name_encrypted: string | null
          has_accepted: boolean | null
          heir_type: string | null
          heir_user_id: string | null
          id: string
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
          created_at?: string
          email_encrypted?: string | null
          full_name_encrypted?: string | null
          has_accepted?: boolean | null
          heir_type?: string | null
          heir_user_id?: string | null
          id?: string
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
          created_at?: string
          email_encrypted?: string | null
          full_name_encrypted?: string | null
          has_accepted?: boolean | null
          heir_type?: string | null
          heir_user_id?: string | null
          id?: string
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
        Relationships: [
          {
            foreignKeyName: "heirs_heir_user_id_fkey"
            columns: ["heir_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heirs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inheritance_triggers: {
        Row: {
          cancelled_at: string | null
          completed_at: string | null
          id: string
          requires_verification: boolean | null
          status: Database["public"]["Enums"]["trigger_status_type"]
          trigger_metadata: Json | null
          trigger_reason: string | null
          triggered_at: string
          user_id: string
          verification_code: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          cancelled_at?: string | null
          completed_at?: string | null
          id?: string
          requires_verification?: boolean | null
          status?: Database["public"]["Enums"]["trigger_status_type"]
          trigger_metadata?: Json | null
          trigger_reason?: string | null
          triggered_at?: string
          user_id: string
          verification_code?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          cancelled_at?: string | null
          completed_at?: string | null
          id?: string
          requires_verification?: boolean | null
          status?: Database["public"]["Enums"]["trigger_status_type"]
          trigger_metadata?: Json | null
          trigger_reason?: string | null
          triggered_at?: string
          user_id?: string
          verification_code?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inheritance_triggers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inheritance_triggers_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      legal: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: string
          file_size: number | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          template_file_path: string | null
          template_file_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          template_file_path?: string | null
          template_file_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          template_file_path?: string | null
          template_file_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notaries: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string
          firm_name: string | null
          id: string
          is_primary: boolean | null
          license_number: string | null
          name: string
          notes: string | null
          phone: string
          specialization: string | null
          state: string
          updated_at: string
          user_id: string
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email: string
          firm_name?: string | null
          id?: string
          is_primary?: boolean | null
          license_number?: string | null
          name: string
          notes?: string | null
          phone: string
          specialization?: string | null
          state: string
          updated_at?: string
          user_id: string
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string
          firm_name?: string | null
          id?: string
          is_primary?: boolean | null
          license_number?: string | null
          name?: string
          notes?: string | null
          phone?: string
          specialization?: string | null
          state?: string
          updated_at?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "notaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          action_url: string | null
          action_label: string | null
          is_read: boolean
          is_archived: boolean
          priority: string
          metadata: Json
          created_at: string
          read_at: string | null
          archived_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          action_url?: string | null
          action_label?: string | null
          is_read?: boolean
          is_archived?: boolean
          priority?: string
          metadata?: Json
          created_at?: string
          read_at?: string | null
          archived_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          action_url?: string | null
          action_label?: string | null
          is_read?: boolean
          is_archived?: boolean
          priority?: string
          metadata?: Json
          created_at?: string
          read_at?: string | null
          archived_at?: string | null
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_vaults: {
        Row: {
          accepted: boolean | null
          accepted_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          owner_id: string
          shared_at: string
          shared_with_user_id: string
          vault_id: string
        }
        Insert: {
          accepted?: boolean | null
          accepted_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_id: string
          shared_at?: string
          shared_with_user_id: string
          vault_id: string
        }
        Update: {
          accepted?: boolean | null
          accepted_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_id?: string
          shared_at?: string
          shared_with_user_id?: string
          vault_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_vaults_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_vaults_shared_with_user_id_fkey"
            columns: ["shared_with_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_vaults_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_locked: boolean | null
          avatar_url: string | null
          created_at: string
          email: string
          email_verified: boolean | null
          emergency_contact_email: string | null
          emergency_contact_phone: string | null
          failed_login_attempts: number | null
          full_name: string | null
          global_scheduled_date: string | null
          global_trigger_method: string | null
          global_trigger_settings: Json | null
          id: string
          is_active: boolean | null
          last_activity: string | null
          last_login: string | null
          last_reminder_sent_at: string | null
          locked_until: string | null
          subscription_expires_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trusted_contact_heir_id: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          account_locked?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email: string
          email_verified?: boolean | null
          emergency_contact_email?: string | null
          emergency_contact_phone?: string | null
          failed_login_attempts?: number | null
          full_name?: string | null
          global_scheduled_date?: string | null
          global_trigger_method?: string | null
          global_trigger_settings?: Json | null
          id: string
          is_active?: boolean | null
          last_activity?: string | null
          last_login?: string | null
          last_reminder_sent_at?: string | null
          locked_until?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trusted_contact_heir_id?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          account_locked?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          email_verified?: boolean | null
          emergency_contact_email?: string | null
          emergency_contact_phone?: string | null
          failed_login_attempts?: number | null
          full_name?: string | null
          global_scheduled_date?: string | null
          global_trigger_method?: string | null
          global_trigger_settings?: Json | null
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          last_login?: string | null
          last_reminder_sent_at?: string | null
          locked_until?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trusted_contact_heir_id?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_trusted_contact_heir_id_fkey"
            columns: ["trusted_contact_heir_id"]
            isOneToOne: false
            referencedRelation: "heirs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          device_name: string | null
          device_type: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string
          location_city: string | null
          location_country: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string
          location_city?: string | null
          location_country?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string
          location_city?: string | null
          location_country?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_items: {
        Row: {
          created_at: string
          file_size: number | null
          id: string
          is_favorite: boolean | null
          item_type: Database["public"]["Enums"]["vault_item_type"]
          last_accessed: string | null
          metadata: Json | null
          password_last_changed: string | null
          password_strength: number | null
          requires_password_change: boolean | null
          storage_bucket: string
          storage_path: string
          tags: string[] | null
          title_encrypted: string
          updated_at: string
          user_id: string
          vault_id: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          id?: string
          is_favorite?: boolean | null
          item_type: Database["public"]["Enums"]["vault_item_type"]
          last_accessed?: string | null
          metadata?: Json | null
          password_last_changed?: string | null
          password_strength?: number | null
          requires_password_change?: boolean | null
          storage_bucket?: string
          storage_path: string
          tags?: string[] | null
          title_encrypted: string
          updated_at?: string
          user_id: string
          vault_id: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          id?: string
          is_favorite?: boolean | null
          item_type?: Database["public"]["Enums"]["vault_item_type"]
          last_accessed?: string | null
          metadata?: Json | null
          password_last_changed?: string | null
          password_strength?: number | null
          requires_password_change?: boolean | null
          storage_bucket?: string
          storage_path?: string
          tags?: string[] | null
          title_encrypted?: string
          updated_at?: string
          user_id?: string
          vault_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_items_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      vaults: {
        Row: {
          access_control: Json | null
          category: string
          color: string | null
          created_at: string
          death_settings: Json | null
          description: string | null
          icon: string | null
          id: string
          is_locked: boolean | null
          is_shared: boolean | null
          last_accessed: string | null
          name: string
          settings: Json | null
          sort_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_control?: Json | null
          category?: string
          color?: string | null
          created_at?: string
          death_settings?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_locked?: boolean | null
          is_shared?: boolean | null
          last_accessed?: string | null
          name: string
          settings?: Json | null
          sort_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_control?: Json | null
          category?: string
          color?: string | null
          created_at?: string
          death_settings?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_locked?: boolean | null
          is_shared?: boolean | null
          last_accessed?: string | null
          name?: string
          settings?: Json | null
          sort_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaults_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_inactivity_triggers: { Args: never; Returns: undefined }
      check_scheduled_triggers: { Args: never; Returns: undefined }
      cleanup_expired_invitations: { Args: never; Returns: number }
      confirm_heir_death: { Args: { p_heir_id: string }; Returns: Json }
      confirm_trusted_contact_death: {
        Args: { p_heir_id: string }
        Returns: Json
      }
      delete_user_account: {
        Args: { user_id_to_delete: string }
        Returns: Json
      }
      generate_invitation_code: { Args: never; Returns: string }
      get_heir_vaults: {
        Args: { heir_uuid: string }
        Returns: {
          can_edit: boolean
          can_export: boolean
          can_view: boolean
          owner_email: string
          vault_category: string
          vault_id: string
          vault_name: string
        }[]
      }
      get_vault_heirs: {
        Args: { vault_uuid: string }
        Returns: {
          access_status: string
          can_edit: boolean
          can_export: boolean
          can_view: boolean
          heir_email: string
          heir_id: string
          heir_name: string
          relationship: string
        }[]
      }
      mark_expired_invitations: { Args: never; Returns: number }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
          p_action_url?: string
          p_action_label?: string
          p_priority?: string
          p_metadata?: Json
        }
        Returns: string
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      archive_notification: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
    }
    Enums: {
      access_level_type: "full" | "partial" | "view"
      alert_type:
        | "failed_login"
        | "suspicious_activity"
        | "data_breach"
        | "weak_password"
        | "compromised_password"
        | "unauthorized_access"
        | "new_device"
        | "location_change"
      inheritance_plan_type:
        | "full_access"
        | "partial_access"
        | "view_only"
        | "destroy"
      severity_type: "info" | "warning" | "critical"
      trigger_reason_type:
        | "inactivity"
        | "manual"
        | "scheduled"
        | "emergency_contact"
      trigger_status_type:
        | "pending"
        | "processing"
        | "completed"
        | "cancelled"
        | "failed"
      two_fa_method_type: "totp" | "sms" | "email" | "hardware_key"
      vault_category_type:
        | "delete_after_death"
        | "share_after_death"
        | "sign_off_after_death"
      vault_item_type:
        | "password"
        | "document"
        | "video"
        | "image"
        | "note"
        | "crypto"
        | "bank"
        | "other"
        | "legal"
        | "assets"
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
      access_level_type: ["full", "partial", "view"],
      alert_type: [
        "failed_login",
        "suspicious_activity",
        "data_breach",
        "weak_password",
        "compromised_password",
        "unauthorized_access",
        "new_device",
        "location_change",
      ],
      inheritance_plan_type: [
        "full_access",
        "partial_access",
        "view_only",
        "destroy",
      ],
      severity_type: ["info", "warning", "critical"],
      trigger_reason_type: [
        "inactivity",
        "manual",
        "scheduled",
        "emergency_contact",
      ],
      trigger_status_type: [
        "pending",
        "processing",
        "completed",
        "cancelled",
        "failed",
      ],
      two_fa_method_type: ["totp", "sms", "email", "hardware_key"],
      vault_category_type: [
        "delete_after_death",
        "share_after_death",
        "sign_off_after_death",
      ],
      vault_item_type: [
        "password",
        "document",
        "video",
        "image",
        "note",
        "crypto",
        "bank",
        "other",
        "legal",
        "assets",
      ],
    },
  },
} as const
