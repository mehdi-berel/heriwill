export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'basic' | 'pro' | 'lifetime'
          subscription_status: 'active' | 'cancelled' | 'expired'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      beneficiaries: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          relationship: string | null
          address: string | null
          notes: string | null
          verification_method: 'email' | 'phone' | 'id_document' | 'other'
          verification_status: 'pending' | 'verified' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['beneficiaries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['beneficiaries']['Insert']>
      }
      digital_assets: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'social_media' | 'email' | 'cloud_storage' | 'crypto_wallet' | 'domain' | 'bank_account' | 'subscription' | 'other'
          url: string | null
          username: string | null
          encrypted_password: string | null
          notes: string | null
          beneficiary_id: string | null
          instructions: string | null
          status: 'active' | 'inactive' | 'archived'
          created_at: string
          updated_at: string
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
  }
}
