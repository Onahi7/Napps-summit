'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  DocumentCheckIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  QrCodeIcon,
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  event_id: string;
  type: 'participation' | 'achievement' | 'completion';
  issued_date: string;
  expiry_date?: string;
  verification_code: string;
  status: 'issued' | 'revoked';
  metadata: {
    grade?: string;
    score?: number;
    hours_completed?: number;
  };
  event: {
    title: string;
    organizer: string;
    start_date: string;
    end_date: string;
  };
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          event:events (
            title,
            organizer,
            start_date,
            end_date
          )
        `)
        .order('issued_date', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(certificate: Certificate) {
    try {
      // In a real app, this would generate and download the certificate PDF
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  }

  async function handleShare(certificate: Certificate) {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${certificate.event.title} Certificate`,
          text: `Check out my certificate from ${certificate.event.title}!`,
          url: `https://yourdomain.com/verify/${certificate.verification_code}`,
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(
          `https://yourdomain.com/verify/${certificate.verification_code}`
        );
        toast.success('Certificate link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      toast.error('Failed to share certificate');
    }
  }

  function getCertificateTypeIcon(type: string) {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'completion':
        return '🎓';
      default:
        return '📜';
    }
  }

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
        <h1 className="text-2xl font-semibold text-gray-900">My Certificates</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and download your earned certificates
        </p>
      </div>

      <div className="space-y-6">
        {certificates.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No certificates yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete events to earn certificates
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <a href="/participant/schedule">View Events</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          certificates.map((certificate) => (
            <Card key={certificate.id} className="overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge
                  className={
                    certificate.status === 'issued'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {certificate.status}
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {getCertificateTypeIcon(certificate.type)}
                  </span>
                  <div>
                    <CardTitle>{certificate.event.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(certificate.event.start_date), 'PPP')} -{' '}
                      {format(new Date(certificate.event.end_date), 'PPP')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Certificate Type</p>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{certificate.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Issued Date</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {format(new Date(certificate.issued_date), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Organizer</p>
                    <p className="mt-1 text-sm text-gray-900">{certificate.event.organizer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Verification Code</p>
                    <p className="mt-1 text-sm text-gray-900">{certificate.verification_code}</p>
                  </div>
                </div>

                {certificate.metadata && (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {certificate.metadata.grade && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Grade</p>
                        <p className="mt-1 text-sm text-gray-900">{certificate.metadata.grade}</p>
                      </div>
                    )}
                    {certificate.metadata.score !== undefined && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Score</p>
                        <p className="mt-1 text-sm text-gray-900">{certificate.metadata.score}%</p>
                      </div>
                    )}
                    {certificate.metadata.hours_completed && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Hours Completed</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {certificate.metadata.hours_completed} hours
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => handleShare(certificate)}
                    className="flex items-center"
                  >
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center"
                  >
                    <QrCodeIcon className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                  <Button
                    onClick={() => handleDownload(certificate)}
                    className="flex items-center"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
