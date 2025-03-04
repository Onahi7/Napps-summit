import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { logger } from '@/utils/logger';

export interface Configuration {
  id: string;
  key: string;
  value: any;
  description: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

class ConfigurationService {
  private supabase = createClientComponentClient<Database>();
  private cache: Map<string, { value: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getConfiguration(key: string): Promise<any> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    try {
      const { data, error } = await this.supabase
        .from('configurations')
        .select('value')
        .eq('key', key)
        .single();

      if (error) throw error;

      // Update cache
      this.cache.set(key, {
        value: data.value,
        timestamp: Date.now(),
      });

      return data.value;
    } catch (error) {
      logger.error('Error fetching configuration', { key, error });
      throw error;
    }
  }

  async getAllConfigurations(): Promise<Configuration[]> {
    try {
      const { data, error } = await this.supabase
        .from('configurations')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching all configurations', { error });
      throw error;
    }
  }

  async getPublicConfigurations(): Promise<Configuration[]> {
    try {
      const { data, error } = await this.supabase
        .from('configurations')
        .select('*')
        .eq('is_public', true)
        .order('category', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching public configurations', { error });
      throw error;
    }
  }

  async updateConfiguration(
    id: string,
    updates: Partial<Configuration>,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('configurations')
        .update({
          ...updates,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Clear cache for this configuration
      const config = await this.getConfigurationById(id);
      if (config) {
        this.cache.delete(config.key);
      }
    } catch (error) {
      logger.error('Error updating configuration', { id, updates, error });
      throw error;
    }
  }

  private async getConfigurationById(id: string): Promise<Configuration | null> {
    try {
      const { data, error } = await this.supabase
        .from('configurations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error fetching configuration by id', { id, error });
      return null;
    }
  }

  // Helper method to get multiple configurations at once
  async getConfigurations(keys: string[]): Promise<Record<string, any>> {
    try {
      const { data, error } = await this.supabase
        .from('configurations')
        .select('key, value')
        .in('key', keys);

      if (error) throw error;

      return (data || []).reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      logger.error('Error fetching multiple configurations', { keys, error });
      throw error;
    }
  }
}

export const configurationService = new ConfigurationService();
