'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Key, ChevronDown, X } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('JP(+81)');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const countryCodes = [
    'JP(+81)',
    'US(+1)',
    'UK(+44)',
    'IN(+91)',
    'CN(+86)',
    'AU(+61)',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Handle registration logic here
    console.log('Registration:', { email, countryCode, phone, password });
  };

  const handleSignInAsOrganizer = () => {
    console.log('Navigate to sign in as organizer');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Register <span className="text-blue-600 text-sm font-medium">as Organizer</span>
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
                placeholder="Enter business email address"
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
          </div>

          {/* Contact Number Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-3">
              Contact Number
            </label>
            <div className="flex space-x-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center justify-between w-32 px-3 py-4 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{countryCode}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {showCountryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                    {countryCodes.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setCountryCode(code);
                          setShowCountryDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm">{code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex-1 relative">
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="XX-XXX-XXX"
                  className="block w-full px-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
                {phone && (
                  <button
                    type="button"
                    aria-label="Clear phone number"
                    onClick={() => setPhone('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-3">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-3">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Get Started Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
          >
            Get Started
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Sign In Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={handleSignInAsOrganizer}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign in as Organizer
              </button>
            </span>
          </div>
        </form>

        {/* Terms and Conditions */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            By continuing, you consent to the fact that you have read and <br />
            understood our{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              terms and conditions
            </button>
            {' '}and{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              privacy policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;