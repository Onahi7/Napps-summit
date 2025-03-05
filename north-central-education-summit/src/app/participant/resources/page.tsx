'use client';

import { useState, useEffect } from 'react';
import {
  DocumentIcon,
  VideoCameraIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '@/app/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'image';
  url: string;
  created_at: string;
  downloads: number;
  size: number;
  category: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(resource: Resource) {
    try {
      // Increment download count
      await supabase
        .from('resources')
        .update({ downloads: resource.downloads + 1 })
        .eq('id', resource.id);

      // Download file
      window.open(resource.url, '_blank');
      await fetchResources(); // Refresh resources to update counts
    } catch (error) {
      console.error('Error downloading resource:', error);
    }
  }

  function getIconForType(type: string) {
    switch (type) {
      case 'document':
        return <DocumentIcon className="h-6 w-6" />;
      case 'video':
        return <VideoCameraIcon className="h-6 w-6" />;
      case 'image':
        return <PhotoIcon className="h-6 w-6" />;
      default:
        return <DocumentIcon className="h-6 w-6" />;
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'presentations', 'handouts', 'recordings', 'images'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
        <p className="mt-1 text-sm text-gray-600">
          Access summit materials and documents
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Input
          type="search"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Tabs
          value={selectedCategory}
          className="w-full sm:w-auto"
          onValueChange={setSelectedCategory}
        >
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="text-gray-500">
                    {getIconForType(resource.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatFileSize(resource.size)}</span>
                  <span>{resource.downloads} downloads</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    <ClockIcon className="inline h-4 w-4 mr-1" />
                    {new Date(resource.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(resource)}
                    className="flex items-center"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No resources found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
