'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import {redirect} from 'next/navigation';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle forgot password logic here
    console.log('Reset password for:', email);
    redirect('/auth/verify-otp')
  };

  const handleReturnToLogin = () => {
    // Handle navigation back to login page
    console.log('Return to login page');
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Forgot Password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-3">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter registered email address"
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
          </div>

          {/* Reset Password Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reset Password
          </button>

          {/* Return to Login Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleReturnToLogin}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Return to login page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;