export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
          tags?: string[] | null
          sort_order?: number
          created_at?: string
          updated_at?: string
          last_accessed?: string | null
          category?: string
        }
      }
      heirs: {
        Row: {
          id: string
          user_id: string
          inheritance_plan_id: string | null
          access_level: string
          heir_user_id: string | null
          notify_on_activation: boolean
          notification_delay_days: number
          is_active: boolean
          has_accepted: boolean
          accepted_at: string | null
          created_at: string
          updated_at: string
          invitation_code: string | null
          invitation_status: string
          invitation_expires_at: string | null
          invited_at: string | null
          rejected_at: string | null
          relationship: string | null
          notification_status: string
          notified_at: string | null
          death_confirmed_at: string | null
          full_name_encrypted: string | null
          email_encrypted: string | null
          phone_encrypted: string | null
          relationship_encrypted: string | null
          heir_type: string
        }
        Insert: {
          id?: string
          user_id: string
          inheritance_plan_id?: string | null
          access_level: string
          heir_user_id?: string | null
          notify_on_activation?: boolean
          notification_delay_days?: number
          is_active?: boolean
          has_accepted?: boolean
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
          invitation_code?: string | null
          invitation_status?: string
          invitation_expires_at?: string | null
          invited_at?: string | null
          rejected_at?: string | null
          relationship?: string | null
          notification_status?: string
          notified_at?: string | null
          death_confirmed_at?: string | null
          full_name_encrypted?: string | null
          email_encrypted?: string | null
          phone_encrypted?: string | null
          relationship_encrypted?: string | null
          heir_type?: string
        }
        Update: {
          id?: string
          user_id?: string
          inheritance_plan_id?: string | null
          access_level?: string
          heir_user_id?: string | null
          notify_on_activation?: boolean
          notification_delay_days?: number
          is_active?: boolean
          has_accepted?: boolean
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
          invitation_code?: string | null
          invitation_status?: string
          invitation_expires_at?: string | null
          invited_at?: string | null
          rejected_at?: string | null
          relationship?: string | null
          notification_status?: string
          notified_at?: string | null
          death_confirmed_at?: string | null
          full_name_encrypted?: string | null
          email_encrypted?: string | null
          phone_encrypted?: string | null
          relationship_encrypted?: string | null
          heir_type?: string
        }
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
      }
      assets: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          description: string | null
          value: number | null
          location: string | null
          ownership_type: string
          documents: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
          vault_id: string | null
          heir_ids: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          description?: string | null
          value?: number | null
          location?: string | null
          ownership_type: string
          documents?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          vault_id?: string | null
          heir_ids?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          description?: string | null
          value?: number | null
          location?: string | null
          ownership_type?: string
          documents?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          vault_id?: string | null
          heir_ids?: string[] | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          old_values: Json | null
          new_values: Json | null
          risk_level: string | null
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          old_values?: Json | null
          new_values?: Json | null
          risk_level?: string | null
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          old_values?: Json | null
          new_values?: Json | null
          risk_level?: string | null
          created_at?: string
          metadata?: Json
        }
      }
      heir_vault_access: {
        Row: {
          id: string
          heir_id: string
          vault_id: string | null
          vault_item_id: string | null
          can_view: boolean
          can_export: boolean
          can_edit: boolean
          granted_at: string
          accessed_at: string | null
          access_granted_at: string | null
          access_status: string | null
        }
        Insert: {
          id?: string
          heir_id: string
          vault_id?: string | null
          vault_item_id?: string | null
          can_view?: boolean
          can_export?: boolean
          can_edit?: boolean
          granted_at?: string
          accessed_at?: string | null
          access_granted_at?: string | null
          access_status?: string | null
        }
        Update: {
          id?: string
          heir_id?: string
          vault_id?: string | null
          vault_item_id?: string | null
          can_view?: boolean
          can_export?: boolean
          can_edit?: boolean
          granted_at?: string
          accessed_at?: string | null
          access_granted_at?: string | null
          access_status?: string | null
        }
      }
      notaries: {
        Row: {
          id: string
          user_id: string
          name: string
          firm_name: string | null
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip_code: string
          license_number: string | null
          specialization: string | null
          notes: string | null
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          firm_name?: string | null
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip_code: string
          license_number?: string | null
          specialization?: string | null
          notes?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          firm_name?: string | null
          email?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          license_number?: string | null
          specialization?: string | null
          notes?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shared_vaults: {
        Row: {
          id: string
          vault_id: string
          owner_id: string
          shared_with_user_id: string
          can_view: boolean
          can_edit: boolean
          can_delete: boolean
          can_share: boolean
          is_active: boolean
          accepted: boolean
          accepted_at: string | null
          shared_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          vault_id: string
          owner_id: string
          shared_with_user_id: string
          can_view?: boolean
          can_edit?: boolean
          can_delete?: boolean
          can_share?: boolean
          is_active?: boolean
          accepted?: boolean
          accepted_at?: string | null
          shared_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          vault_id?: string
          owner_id?: string
          shared_with_user_id?: string
          can_view?: boolean
          can_edit?: boolean
          can_delete?: boolean
          can_share?: boolean
          is_active?: boolean
          accepted?: boolean
          accepted_at?: string | null
          shared_at?: string
          expires_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_name: string
          amount: number
          currency: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancelled_at: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
          store_transaction_id: string | null
          store_product_id: string | null
          store_platform: string | null
          receipt_data: string | null
          revenuecat_customer_id: string | null
          revenuecat_product_id: string | null
          revenuecat_entitlement_id: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_name?: string
          amount?: number
          currency?: string
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          store_transaction_id?: string | null
          store_product_id?: string | null
          store_platform?: string | null
          receipt_data?: string | null
          revenuecat_customer_id?: string | null
          revenuecat_product_id?: string | null
          revenuecat_entitlement_id?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_name?: string
          amount?: number
          currency?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
          store_transaction_id?: string | null
          store_product_id?: string | null
          store_platform?: string | null
          receipt_data?: string | null
          revenuecat_customer_id?: string | null
          revenuecat_product_id?: string | null
          revenuecat_entitlement_id?: string
        }
      }
      user_activity: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          ip_address: string | null
          user_agent: string | null
          metadata: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string | null
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          device_name: string | null
          device_type: string | null
          ip_address: string | null
          user_agent: string | null
          location_city: string | null
          location_country: string | null
          is_active: boolean
          created_at: string
          last_activity: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          device_name?: string | null
          device_type?: string | null
          ip_address?: string | null
          user_agent?: string | null
          location_city?: string | null
          location_country?: string | null
          is_active?: boolean
          created_at?: string
          last_activity?: string
          expires_at: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          device_name?: string | null
          device_type?: string | null
          ip_address?: string | null
          user_agent?: string | null
          location_city?: string | null
          location_country?: string | null
          is_active?: boolean
          created_at?: string
          last_activity?: string
          expires_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
