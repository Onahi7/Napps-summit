'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/app/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const NORTHERN_STATES = [
  'Benue',
  'Kogi',
  'Kwara',
  'Nasarawa',
  'Niger',
  'Plateau',
  'Federal Capital Territory'
];

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    state: '',
    chapter: '',
    passport_url: '',
  });
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        state: profile.state || '',
        chapter: profile.chapter || '',
        passport_url: profile.passport_url || '',
      });
    }
  }, [profile]);

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.includes('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should be less than 5MB');
        return;
      }
      setPassportFile(file);
    }
  };

  const validateProfileData = (data: typeof formData) => {
    const errors: Partial<Record<keyof typeof formData, string>> = {};
  
    // Full name validation
    if (!data.full_name.trim()) {
      errors.full_name = 'Full name is required';
    } else if (data.full_name.length < 3) {
      errors.full_name = 'Full name must be at least 3 characters';
    }

    // Phone validation
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!data.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // State validation
    if (!data.state) {
      errors.state = 'State is required';
    } else if (!NORTHERN_STATES.includes(data.state)) {
      errors.state = 'Please select a valid northern state';
    }

    // Chapter validation
    if (!data.chapter.trim()) {
      errors.chapter = 'Chapter is required';
    }

    // Passport validation
    if (!data.passport_url && !passportFile) {
      errors.passport_url = 'Passport photograph is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      const { isValid, errors } = validateProfileData(formData);
      if (!isValid) {
        setValidationErrors(errors);
        setIsLoading(false);
        return;
      }

      // Upload passport if new file is selected
      let passportUrl = formData.passport_url;
      if (passportFile) {
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('passports')
          .upload(`${user?.id}-${Date.now()}.jpg`, passportFile, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;
        passportUrl = uploadData.path;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          state: formData.state,
          chapter: formData.chapter,
          passport_url: passportUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Show success message
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        variant: 'success',
      });

    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      toast({
        title: 'Error',
        description: err.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
        <p className="text-gray-600">
          Please provide your information to proceed with event registration
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <Input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          {validationErrors.full_name && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.full_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          {validationErrors.phone && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          >
            <option value="">Select a state</option>
            {NORTHERN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {validationErrors.state && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.state}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chapter *
          </label>
          <Input
            type="text"
            value={formData.chapter}
            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
            required
          />
          {validationErrors.chapter && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.chapter}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passport Photograph *
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {formData.passport_url && (
              <img
                src={formData.passport_url}
                alt="Passport"
                className="h-20 w-20 rounded-full object-cover"
              />
            )}
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
              <span>{formData.passport_url ? 'Change Photo' : 'Upload Photo'}</span>
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handlePassportUpload}
              />
            </label>
          </div>
          {validationErrors.passport_url && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.passport_url}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            JPG, PNG, GIF up to 5MB
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </div>
  );
}
