/**
 * Database Types for Heriwill SaaS
 * Generated from schema.sql
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
          subscription_tier: 'free' | 'premium' | 'pro'
          subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
          subscription_expires_at: string | null
          global_trigger_method: 'inactivity' | 'death_certificate' | 'manual_trigger' | 'scheduled' | 'trusted_contact' | 'heir_notification' | null
          global_trigger_settings: Json | null
          global_scheduled_date: string | null
          trusted_contact_email: string | null
          trusted_contact_phone: string | null
          last_activity: string
          last_reminder_sent_at: string | null
          trusted_contact_heir_id: string | null
          locked_until: string | null
          failed_login_attempts: number
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at' | 'last_activity' | 'is_active' | 'account_locked' | 'email_verified' | 'failed_login_attempts'>
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      vaults: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: 'delete_after_death' | 'share_after_death' | 'sign_off_after_death'
          icon: string | null
          color: string | null
          settings: Json | null
          access_control: Json | null
          death_settings: Json | null
          is_encrypted: boolean
          is_locked: boolean
          is_shared: boolean
          is_favorite: boolean
          tags: string[] | null
          sort_order: number
          created_at: string
          updated_at: string
          last_accessed: string | null
        }
        Insert: Omit<Database['public']['Tables']['vaults']['Row'], 'id' | 'created_at' | 'updated_at' | 'last_accessed' | 'is_encrypted' | 'is_locked' | 'is_shared' | 'is_favorite' | 'sort_order'>
        Update: Partial<Database['public']['Tables']['vaults']['Row']>
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
          metadata: Json | null
        }
        Insert: Omit<Database['public']['Tables']['vault_items']['Row'], 'id' | 'created_at' | 'updated_at' | 'last_accessed' | 'is_favorite' | 'requires_password_change'>
        Update: Partial<Database['public']['Tables']['vault_items']['Row']>
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
          invitation_status: 'pending' | 'accepted' | 'rejected' | 'expired'
          invitation_expires_at: string | null
          invited_at: string
          rejected_at: string | null
          relationship: string | null
          notification_status: string
          notified_at: string | null
          death_confirmed_at: string | null
          full_name_encrypted: string | null
          email_encrypted: string | null
          phone_encrypted: string | null
          relationship_encrypted: string | null
          heir_type: 'family' | 'friend' | 'professional' | 'organization'
        }
        Insert: Omit<Database['public']['Tables']['heirs']['Row'], 'id' | 'created_at' | 'updated_at' | 'invited_at' | 'is_active' | 'has_accepted' | 'notification_delay_days' | 'notify_on_activation'>
        Update: Partial<Database['public']['Tables']['heirs']['Row']>
      }
      assets: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'real_estate' | 'vehicle' | 'bank_account' | 'investment' | 'insurance' | 'personal_property' | 'business' | 'other'
          description: string | null
          value: number | null
          location: string | null
          ownership_type: 'sole' | 'joint' | 'tenants_in_common' | 'community_property'
          documents: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
          vault_id: string | null
          heir_ids: string[] | null
        }
        Insert: Omit<Database['public']['Tables']['assets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['assets']['Row']>
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
        Insert: Omit<Database['public']['Tables']['inheritance_plans']['Row'], 'id' | 'created_at' | 'updated_at' | 'is_active' | 'is_triggered'>
        Update: Partial<Database['public']['Tables']['inheritance_plans']['Row']>
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
          access_granted_at: string
          access_status: 'granted' | 'revoked'
        }
        Insert: Omit<Database['public']['Tables']['heir_vault_access']['Row'], 'id' | 'granted_at' | 'access_granted_at'>
        Update: Partial<Database['public']['Tables']['heir_vault_access']['Row']>
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
        Insert: Omit<Database['public']['Tables']['notaries']['Row'], 'id' | 'created_at' | 'updated_at' | 'is_primary'>
        Update: Partial<Database['public']['Tables']['notaries']['Row']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_name: string
          amount: number | null
          currency: string
          status: 'active' | 'cancelled' | 'past_due' | 'paused'
          current_period_start: string | null
          current_period_end: string | null
          cancelled_at: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
          store_transaction_id: string | null
          store_product_id: string | null
          store_platform: string | null
          receipt_data: string | null
          revenuecat_customer_id: string | null
          revenuecat_product_id: string | null
          revenuecat_entitlement_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>
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
        Insert: Omit<Database['public']['Tables']['shared_vaults']['Row'], 'id' | 'shared_at' | 'is_active' | 'accepted'>
        Update: Partial<Database['public']['Tables']['shared_vaults']['Row']>
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
        Insert: Omit<Database['public']['Tables']['inheritance_triggers']['Row'], 'id' | 'triggered_at'>
        Update: Partial<Database['public']['Tables']['inheritance_triggers']['Row']>
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: 'vault' | 'vault_item' | 'inheritance_plan' | 'heir' | 'user' | 'shared_vault'
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          old_values: Json | null
          new_values: Json | null
          risk_level: 'low' | 'medium' | 'high' | 'critical' | null
          created_at: string
          metadata: Json | null
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Row']>
      }
      user_activity: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['user_activity']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_activity']['Row']>
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
        Insert: Omit<Database['public']['Tables']['user_sessions']['Row'], 'id' | 'created_at' | 'last_activity' | 'is_active'>
        Update: Partial<Database['public']['Tables']['user_sessions']['Row']>
      }
      digital_assets: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          url: string | null
          username: string | null
          encrypted_password: string | null
          notes: string | null
          beneficiary_id: string | null
          instructions: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['digital_assets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['digital_assets']['Row']>
      }
      user_wills: {
        Row: {
          id: string
          user_id: string
          testament_title: string | null
          testament_content: string | null
          special_instructions: string | null
          digital_assets_instructions: string | null
          personal_messages: string | null
          primary_beneficiaries: string | null
          contingent_beneficiaries: string | null
          specific_bequests: string | null
          residuary_clause: string | null
          distribution_instructions: string | null
          executor_name: string | null
          executor_email: string | null
          executor_phone: string | null
          executor_relationship: string | null
          alternate_executor_name: string | null
          alternate_executor_email: string | null
          alternate_executor_phone: string | null
          executor_powers: string | null
          executor_compensation: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_wills']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_wills']['Row']>
      }
      user_wishes: {
        Row: {
          id: string
          user_id: string
          burial_type: string | null
          burial_location: string | null
          burial_instructions: string | null
          funeral_type: string | null
          funeral_location: string | null
          funeral_instructions: string | null
          funeral_music: string | null
          funeral_readings: string | null
          funeral_flowers: string | null
          funeral_donations: string | null
          funeral_guests: string | null
          funeral_home_name: string | null
          funeral_home_contact: string | null
          funeral_home_phone: string | null
          funeral_home_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_wishes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_wishes']['Row']>
      }
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
