import { supabase } from '@/lib/supabase';

export type GlobalTriggerMethod = 
  | 'inactivity' 
  | 'manual_trigger' 
  | 'scheduled'
  | 'trusted_contact'
  | 'heir_notification';

export interface GlobalTriggerSettings {
  global_trigger_method: GlobalTriggerMethod;
  global_trigger_settings: {
    inactivity_days?: number;
    reminder_enabled?: boolean;
    reminder_days_before?: number;
    heir_notification_frequency?: number;
    heir_verification_threshold?: number;
    confirmed_heir_ids?: string[];
    last_notification_sent?: string;
  };
  global_scheduled_date?: string | null;
  trusted_contact_heir_id?: string | null;
  last_activity?: string | null;
}

/**
 * Save global trigger method and settings for a user
 * Stores directly in users table following sign-off project architecture
 */
export async function saveGlobalTrigger(
  userId: string,
  settings: Partial<GlobalTriggerSettings>
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {};
    
    if (settings.global_trigger_method) {
      updateData.global_trigger_method = settings.global_trigger_method;
    }
    if (settings.global_trigger_settings) {
      updateData.global_trigger_settings = settings.global_trigger_settings;
    }
    if (settings.global_scheduled_date !== undefined) {
      updateData.global_scheduled_date = settings.global_scheduled_date;
    }
    if (settings.trusted_contact_heir_id !== undefined) {
      updateData.trusted_contact_heir_id = settings.trusted_contact_heir_id;
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Error saving global trigger:', error);
      throw error;
    }

    console.log('Global trigger saved successfully:', updateData);
  } catch (error) {
    console.error('Error in saveGlobalTrigger:', error);
    throw error;
  }
}

/**
 * Get global trigger settings for a user
 */
export async function getGlobalTrigger(
  userId: string
): Promise<GlobalTriggerSettings | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('global_trigger_method, global_trigger_settings, global_scheduled_date, trusted_contact_heir_id, last_activity')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching global trigger:', error);
      throw error;
    }

    const triggerData = data as {
      global_trigger_method?: GlobalTriggerMethod;
      global_trigger_settings?: Record<string, unknown>;
      global_scheduled_date?: string | null;
      trusted_contact_heir_id?: string | null;
      last_activity?: string | null;
    };

    if (!triggerData?.global_trigger_method) {
      return null;
    }

    return {
      global_trigger_method: triggerData.global_trigger_method as GlobalTriggerMethod,
      global_trigger_settings: triggerData.global_trigger_settings || { inactivity_days: 90 },
      global_scheduled_date: triggerData.global_scheduled_date,
      trusted_contact_heir_id: triggerData.trusted_contact_heir_id,
      last_activity: triggerData.last_activity,
    };
  } catch (error) {
    console.error('Error in getGlobalTrigger:', error);
    return null;
  }
}

/**
 * Delete global trigger (deactivate)
 */
export async function deleteGlobalTrigger(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        global_trigger_method: null,
        global_trigger_settings: null,
        global_scheduled_date: null,
        trusted_contact_heir_id: null,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error deleting global trigger:', error);
      throw error;
    }

    console.log('Global trigger deleted successfully');
  } catch (error) {
    console.error('Error in deleteGlobalTrigger:', error);
    throw error;
  }
}

/**
 * Check if global trigger conditions are met
 * This would be called by a background job/cron
 */
export async function checkGlobalTriggerConditions(userId: string): Promise<boolean> {
  try {
    const globalTrigger = await getGlobalTrigger(userId);
    if (!globalTrigger) {
      return false;
    }

    const { global_trigger_method, global_trigger_settings, global_scheduled_date, last_activity } = globalTrigger;

    switch (global_trigger_method) {
      case 'inactivity':
        if (last_activity) {
          const lastActivityDate = new Date(last_activity);
          const daysSinceActivity = Math.floor(
            (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const threshold = global_trigger_settings?.inactivity_days || 90;
          return daysSinceActivity >= threshold;
        }
        break;

      case 'scheduled':
        if (global_scheduled_date) {
          const scheduledDate = new Date(global_scheduled_date);
          return Date.now() >= scheduledDate.getTime();
        }
        break;

      case 'manual_trigger':
        return false;

      default:
        return false;
    }

    return false;
  } catch (error) {
    console.error('Error checking trigger conditions:', error);
    return false;
  }
}

/**
 * Update last activity timestamp
 */
export async function updateLastActivity(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last activity:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateLastActivity:', error);
    throw error;
  }
}

/**
 * Record an heir's confirmation of user death
 */
export async function recordHeirDeathConfirmation(
  userId: string,
  heirId: string
): Promise<{ confirmed: boolean; triggered: boolean; confirmationProgress: number }> {
  try {
    // Get current trigger settings
    const globalTrigger = await getGlobalTrigger(userId);
    if (!globalTrigger || globalTrigger.global_trigger_method !== 'heir_notification') {
      throw new Error('Heir notification method not configured');
    }

    const { global_trigger_settings } = globalTrigger;
    const confirmedHeirIds = global_trigger_settings.confirmed_heir_ids || [];
    
    // Add this heir if not already confirmed
    if (!confirmedHeirIds.includes(heirId)) {
      confirmedHeirIds.push(heirId);
    }

    // Get total number of heirs
    const { data: heirsData } = await supabase
      .from('heirs')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);

    const totalHeirs = heirsData?.length || 0;
    const confirmationProgress = totalHeirs > 0 ? (confirmedHeirIds.length / totalHeirs) * 100 : 0;
    const threshold = global_trigger_settings.heir_verification_threshold || 75;
    const triggered = confirmationProgress >= threshold;

    // Update the settings
    await saveGlobalTrigger(userId, {
      global_trigger_settings: {
        ...global_trigger_settings,
        confirmed_heir_ids: confirmedHeirIds,
      },
    });

    return {
      confirmed: true,
      triggered,
      confirmationProgress,
    };
  } catch (error) {
    console.error('Error recording heir confirmation:', error);
    throw error;
  }
}

/**
 * Confirm trusted contact death
 */
export async function confirmTrustedContactDeath(
  heirId: string
): Promise<{ success: boolean; triggered: boolean; message?: string }> {
  try {
    // Get the heir's user_id
    const { data: heirData } = await supabase
      .from('heirs')
      .select('user_id')
      .eq('id', heirId)
      .single();

    if (!heirData) {
      throw new Error('Heir not found');
    }

    const userId = heirData.user_id;

    // Verify this heir is the trusted contact
    const globalTrigger = await getGlobalTrigger(userId);
    if (!globalTrigger || globalTrigger.trusted_contact_heir_id !== heirId) {
      return {
        success: false,
        triggered: false,
        message: 'You are not authorized as the trusted contact',
      };
    }

    // Trigger would happen here - for now just return success
    return {
      success: true,
      triggered: true,
      message: 'Death confirmed by trusted contact',
    };
  } catch (error) {
    console.error('Error confirming trusted contact death:', error);
    throw error;
  }
}
