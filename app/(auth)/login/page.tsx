'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, CardBody, Input } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login as loginAction, clearError } from '@/store/slices/authSlice';
import { Mail, Lock, Hotel, Sparkles, Shield, Clock } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear auth error
    if (error) {
      dispatch(clearError());
    }
  };

  const validate = () => {
    const errors: { email?: string; password?: string } = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await dispatch(loginAction(formData)).unwrap();
      // Login successful, redirect to dashboard
      console.log('✅ Login successful, redirecting to:', redirect);
      router.push(redirect);
    } catch (error) {
      // Error is handled by the store
      console.error('❌ Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000,transparent)]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section with Animation */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative mb-4">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 blur-2xl rounded-full animate-pulse" />
            
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 p-4 rounded-2xl shadow-2xl shadow-blue-500/30 dark:shadow-blue-400/30">
              <Hotel className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-1">
              Hotel Admin
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Management Dashboard
            </p>
          </div>
        </div>

        {/* Main Card with Enhanced Styling */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
            <CardBody className="p-8">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Welcome Back 👋
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sign in to access your dashboard and manage your hotel
                </p>
              </div>

              {/* Error Alert with Icon */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="admin@hotel.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={validationErrors.email}
                  disabled={isLoading}
                  leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                  className="transition-all duration-200"
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  error={validationErrors.password}
                  disabled={isLoading}
                  leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                  className="transition-all duration-200"
                />

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-200 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                      Remember me
                    </span>
                  </label>

                  <a
                    href="#"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button with Enhanced Style */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 font-medium">
                    Demo Access
                  </span>
                </div>
              </div>

              {/* Demo Credentials Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Quick Test Access
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <code className="font-mono text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                          admin@hotel.com
                        </code>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <code className="font-mono text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                          password123
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Features Cards */}
        <div className="grid grid-cols-3 gap-3 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-lg p-3 text-center border border-gray-200 dark:border-gray-800 hover:scale-105 transition-transform duration-200">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Secure</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-lg p-3 text-center border border-gray-200 dark:border-gray-800 hover:scale-105 transition-transform duration-200">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">24/7 Access</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-lg p-3 text-center border border-gray-200 dark:border-gray-800 hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">AI-Powered</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-8 animate-in fade-in duration-700 delay-500">
          © 2025 Hotel Admin Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}