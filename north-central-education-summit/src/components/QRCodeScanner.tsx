'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScan: (registrationId: string) => void;
}

export function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize the scanner
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    // Start scanning
    scannerRef.current.render(
      (decodedText) => {
        // When a QR code is scanned, call the onScan callback
        onScan(decodedText);
      },
      (error) => {
        // Handle scan errors silently
        console.error('QR Code scanning error:', error);
      }
    );

    // Cleanup
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [onScan]);

  return (
    <div>
      <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
      <p className="text-sm text-gray-500 text-center mt-2">
        Position the QR code within the frame to scan
      </p>
    </div>
  );
}
