'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';
import { Database } from '@/types/supabase';

interface Configuration {
  id: string;
  key: string;
  value: any;
  description: string;
  category: string;
  is_public: boolean;
}

export default function ConfigurationsPage() {
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClientComponentClient<Database>();

  // Group configurations by category
  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, Configuration[]>);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  async function fetchConfigurations() {
    try {
      const { data, error } = await supabase
        .from('configurations')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (err) {
      logger.error('Error fetching configurations', { error: err });
      setError('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  }

  async function updateConfiguration(config: Configuration) {
    try {
      const { error } = await supabase
        .from('configurations')
        .update({
          value: config.value,
          is_public: config.is_public,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', config.id);

      if (error) throw error;
      
      await fetchConfigurations();
      setEditingConfig(null);
    } catch (err) {
      logger.error('Error updating configuration', { error: err });
      setError('Failed to update configuration');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">System Configurations</h1>

      {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 capitalize">
            {category} Settings
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Setting
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Public
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categoryConfigs.map((config) => (
                  <tr key={config.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {config.key}
                      </div>
                      <div className="text-sm text-gray-500">
                        {config.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingConfig?.id === config.id ? (
                        <textarea
                          className="w-full p-2 border rounded"
                          value={typeof editingConfig.value === 'object' 
                            ? JSON.stringify(editingConfig.value, null, 2)
                            : editingConfig.value}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            value: e.target.value
                          })}
                        />
                      ) : (
                        <pre className="text-sm">
                          {typeof config.value === 'object'
                            ? JSON.stringify(config.value, null, 2)
                            : config.value}
                        </pre>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingConfig?.id === config.id ? (
                        <input
                          type="checkbox"
                          checked={editingConfig.is_public}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig,
                            is_public: e.target.checked
                          })}
                          className="h-4 w-4 text-blue-600"
                        />
                      ) : (
                        <span className={config.is_public ? 'text-green-600' : 'text-red-600'}>
                          {config.is_public ? 'Yes' : 'No'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingConfig?.id === config.id ? (
                        <div className="space-x-2">
                          <button
                            onClick={() => updateConfiguration(editingConfig)}
                            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingConfig(null)}
                            className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingConfig(config)}
                          className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
