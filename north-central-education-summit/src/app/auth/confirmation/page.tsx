'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Registration Successful!
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="text-center">
          <p className="text-base text-gray-600">
            Thank you for registering for the North Central Education Summit. A confirmation email has been sent to your email address.
          </p>
          
          <p className="mt-4 text-base text-gray-600">
            Please check your email and verify your account to complete the registration process.
          </p>

          <p className="mt-4 text-base text-gray-600">
            After verification, you can proceed to complete your profile and make payment for the summit.
          </p>

          <div className="mt-8 flex flex-col space-y-4">
            <Link href="/auth/login">
              <Button className="w-full">
                Sign in to your account
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
