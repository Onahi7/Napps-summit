'use client';

import { useRef } from 'react';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

interface RegistrationTagProps {
  registrationId: string;
  name: string;
  state: string;
  chapter: string;
  eventTitle: string;
  accredited: boolean;
}

export function RegistrationTag({
  registrationId,
  name,
  state,
  chapter,
  eventTitle,
  accredited
}: RegistrationTagProps) {
  const tagRef = useRef<HTMLDivElement>(null);

  const downloadTag = async () => {
    if (!tagRef.current) return;

    try {
      const canvas = await html2canvas(tagRef.current);
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `registration-tag-${registrationId}.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Error generating tag:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={tagRef}
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto"
        style={{ width: '350px', height: '500px' }}
      >
        <div className="text-center space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              North Central Education Summit
            </h2>
            <p className="text-sm text-gray-600">{eventTitle}</p>
          </div>

          <div className="space-y-2 py-4">
            <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
            <p className="text-gray-600">{state} State</p>
            <p className="text-gray-600">{chapter} Chapter</p>
          </div>

          <div className="py-4">
            <QRCode
              value={registrationId}
              size={150}
              level="H"
              className="mx-auto"
            />
            <p className="mt-2 text-sm font-mono text-gray-600">{registrationId}</p>
          </div>

          <div className="pt-4 border-t">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                accredited
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {accredited ? 'Accredited' : 'Not Accredited'}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button onClick={downloadTag} className="w-full sm:w-auto">
          Download Tag
        </Button>
      </div>
    </div>
  );
}
