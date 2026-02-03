import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { logger } from '@/lib/utils/logger';

type UserUpdate = Database['public']['Tables']['users']['Update'];

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
    const updateData: UserUpdate = {};
    
    if (settings.global_trigger_method) {
      updateData.global_trigger_method = settings.global_trigger_method as Database['public']['Tables']['users']['Update']['global_trigger_method'];
    }
    if (settings.global_trigger_settings) {
      updateData.global_trigger_settings = settings.global_trigger_settings as unknown as Database['public']['Tables']['users']['Update']['global_trigger_settings'];
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
      logger.error('Error saving global trigger', error, { userId });
      throw error;
    }

    logger.info('Global trigger saved successfully', { userId, updateData });
  } catch (error) {
    logger.error('Error in saveGlobalTrigger', error, { userId });
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
      logger.error('Error fetching global trigger', error, { userId });
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
    logger.error('Error in getGlobalTrigger', error, { userId });
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
      global_trigger_method: null as Database['public']['Tables']['users']['Update']['global_trigger_method'],
      global_trigger_settings: null as Database['public']['Tables']['users']['Update']['global_trigger_settings'],
      global_scheduled_date: null as Database['public']['Tables']['users']['Update']['global_scheduled_date'],
      trusted_contact_heir_id: null as Database['public']['Tables']['users']['Update']['trusted_contact_heir_id']
    })
    .eq('id', userId);

    if (error) {
      logger.error('Error deleting global trigger', error, { userId });
      throw error;
    }

    logger.info('Global trigger deleted successfully', { userId });
  } catch (error) {
    logger.error('Error in deleteGlobalTrigger', error, { userId });
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
    logger.error('Error checking trigger conditions', error, { userId });
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
      logger.error('Error updating last activity', error, { userId });
      throw error;
    }
  } catch (error) {
    logger.error('Error in updateLastActivity', error, { userId });
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

    // Get total number of active heirs who have accepted
    const { data: heirsData } = await supabase
      .from('heirs')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('has_accepted', true);

    const totalHeirs = heirsData?.length || 0;
    const confirmationProgress = totalHeirs > 0 ? (confirmedHeirIds.length / totalHeirs) * 100 : 0;
    
    // If only 1 heir: 1 confirmation triggers inheritance
    // If multiple heirs: ALL confirmations required (100%)
    const triggered = totalHeirs === 1 
      ? confirmedHeirIds.length >= 1 
      : confirmationProgress >= 100;

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
    logger.error('Error recording heir confirmation', error);
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

    const userId = (heirData as { user_id: string }).user_id;

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
    logger.error('Error confirming trusted contact death', error);
    throw error;
  }
}
