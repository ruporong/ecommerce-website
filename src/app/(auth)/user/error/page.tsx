'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  let title = "Authentication Error";
  let message = "An unexpected error occurred during authentication. Please try again.";

  if (error === 'Configuration') {
    title = "Server Configuration Error";
    message = "There is a problem with the server authentication configuration. Please contact support if the issue persists.";
  } else if (error === 'AccessDenied') {
    title = "Access Denied";
    message = "You do not have permission to access this resource or your account has been restricted.";
  } else if (error === 'Verification') {
    title = "Verification Failed";
    message = "The sign-in token has expired or has already been used. Please request a new one.";
  } else if (error === 'CredentialsSignin') {
    title = "Sign In Failed";
    message = "The credentials you provided are incorrect. Please check your email and password.";
  }

  return (
    <div className="w-full text-center flex flex-col items-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h1 className="text-2xl font-serif font-semibold text-gray-900 mb-3">
        {title}
      </h1>
      
      <p className="text-sm text-gray-500 mb-8 max-w-[280px] mx-auto leading-relaxed">
        {message}
      </p>

      <div className="w-full space-y-3">
        <Link 
          href="/user/login"
          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
        >
          Try Again
        </Link>
        
        <Link 
          href="/"
          className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>}>
      <ErrorContent />
    </Suspense>
  );
}
