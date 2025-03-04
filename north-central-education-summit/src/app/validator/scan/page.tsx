'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<'success' | 'error' | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  function onScanSuccess(decodedText: string) {
    setScanResult(decodedText);
    // Mock validation
    setTimeout(() => {
      if (decodedText.includes('valid')) {
        setValidationStatus('success');
        setValidationMessage('Participant verified successfully!');
      } else {
        setValidationStatus('error');
        setValidationMessage('Invalid QR code or participant not found.');
      }
    }, 1000);
  }

  function onScanFailure(error: any) {
    console.warn('QR code scan error:', error);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scan QR Code</h1>
          <p className="mt-2 text-gray-600">Scan participant's QR code to validate entry</p>
        </div>

        {/* Scanner */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div id="reader" className="w-full"></div>
        </div>

        {/* Results */}
        {validationStatus && (
          <div
            className={`mt-4 p-4 rounded-md ${
              validationStatus === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {validationStatus === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <h3
                  className={`text-sm font-medium ${
                    validationStatus === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {validationMessage}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Recent Scans */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Scans</h3>
            <div className="mt-4 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                          Time
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                          2:30 PM
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600">
                          Success
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          John Doe - Main Conference
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                          2:15 PM
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600">
                          Failed
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          Invalid QR Code
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
