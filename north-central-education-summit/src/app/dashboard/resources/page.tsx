'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/app/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUploader } from '@/components/FileUploader';

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  created_at: string;
  event_id: string;
  events: {
    title: string;
  };
}

export default function ResourcesPage() {
  const { user, profile } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        // First get the events the user is registered for
        const { data: registrations, error: regError } = await supabase
          .from('registrations')
          .select('event_id')
          .eq('user_id', user.id);

        if (regError) throw regError;

        // Get all events for filtering
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, title');

        if (eventsError) throw eventsError;
        setEvents(eventsData || []);

        // Get resources
        let query = supabase
          .from('resources')
          .select(`
            *,
            events (
              title
            )
          `)
          .order('created_at', { ascending: false });

        // If user is not an admin, only show resources for their registered events
        if (profile?.role !== 'admin' && registrations) {
          const eventIds = registrations.map(reg => reg.event_id);
          query = query.in('event_id', eventIds);
        }

        const { data, error } = await query;

        if (error) throw error;
        setResources(data || []);
      } catch (err: any) {
        console.error('Error fetching resources:', err);
        setError(err.message || 'Failed to load resources');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, profile]);

  const handleFileUpload = async (file: File, eventId: string, title: string, description: string) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `resources/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      // Create resource record in the database
      const { error: dbError } = await supabase
        .from('resources')
        .insert([{
          title,
          description,
          file_url: publicUrl,
          file_type: fileExt,
          event_id: eventId,
        }]);

      if (dbError) throw dbError;

      // Refresh resources list
      const { data: newResources, error: fetchError } = await supabase
        .from('resources')
        .select(`
          *,
          events (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setResources(newResources || []);

    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      // Extract file name from URL
      const fileName = resource.file_url.split('/').pop() || 'download';

      // Fetch the file
      const response = await fetch(resource.file_url);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      setError(err.message || 'Failed to download file');
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.events.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEvent = selectedEvent === 'all' || resource.event_id === selectedEvent;
    
    return matchesSearch && matchesEvent;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <p className="font-medium">Error loading resources</p>
        <p className="text-sm">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-100 text-red-800 hover:bg-red-200"
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-600">
          Access materials and resources for your registered events
        </p>
      </div>

      {/* Upload Section (Admin Only) */}
      {profile?.role === 'admin' && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload New Resource</h2>
          <FileUploader
            onUpload={handleFileUpload}
            events={events}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="md:w-1/4">
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h3 className="text-sm font-medium text-gray-900">No resources found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedEvent !== 'all' 
              ? 'Try adjusting your filters'
              : 'Resources will appear here once they are available'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{resource.title}</h3>
                  <p className="text-sm text-indigo-600 mt-1">{resource.events.title}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {resource.file_type.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mt-2">{resource.description}</p>
              
              <Button
                onClick={() => handleDownload(resource)}
                className="mt-4 w-full"
                variant="outline"
              >
                Download
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
