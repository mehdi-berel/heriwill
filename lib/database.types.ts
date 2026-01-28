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
          beneficiaries?: string[] | null
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
          beneficiaries?: string[] | null
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
          }
        ]
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
          heir_type: string | null
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
          heir_type?: string | null
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
          heir_type?: string | null
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
          is_encrypted: boolean | null
          is_favorite: boolean | null
          is_locked: boolean | null
          is_shared: boolean | null
          last_accessed: string | null
          name: string
          settings: Json | null
          sort_order: number | null
          tags: string[] | null
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
          is_encrypted?: boolean | null
          is_favorite?: boolean | null
          is_locked?: boolean | null
          is_shared?: boolean | null
          last_accessed?: string | null
          name: string
          settings?: Json | null
          sort_order?: number | null
          tags?: string[] | null
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
          is_encrypted?: boolean | null
          is_favorite?: boolean | null
          is_locked?: boolean | null
          is_shared?: boolean | null
          last_accessed?: string | null
          name?: string
          settings?: Json | null
          sort_order?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_items: {
        Row: {
          created_at: string
          file_size: number | null
          id: string
          is_favorite: boolean | null
          item_type: Database["public"]["Enums"]["vault_item_type"]
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
        Relationships: []
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
          trusted_contact_email: string | null
          trusted_contact_heir_id: string | null
          trusted_contact_phone: string | null
          updated_at: string
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
          trusted_contact_email?: string | null
          trusted_contact_heir_id?: string | null
          trusted_contact_phone?: string | null
          updated_at?: string
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
          trusted_contact_email?: string | null
          trusted_contact_heir_id?: string | null
          trusted_contact_phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Enums: {
      access_level_type: "full" | "partial" | "view"
      vault_category_type: "delete_after_death" | "share_after_death" | "sign_off_after_death"
      vault_item_type: "password" | "document" | "video" | "image" | "note" | "crypto" | "bank" | "other"
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
