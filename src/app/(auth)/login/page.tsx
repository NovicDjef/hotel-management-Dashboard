'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, CardBody, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, Hotel } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const { login, isLoading, error, clearError } = useAuthStore();

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
      clearError();
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
      await login(formData);
      router.push(redirect);
    } catch (error) {
      // Error is handled by the store
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Hotel className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold">Hotel Admin</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Management Dashboard
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardBody>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Welcome Back
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Sign in to your account to continue
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="admin@hotel.com"
                value={formData.email}
                onChange={handleChange}
                error={validationErrors.email}
                disabled={isLoading}
                leftIcon={
                  <Mail className="w-5 h-5 text-gray-400" />
                }
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={validationErrors.password}
                disabled={isLoading}
                leftIcon={
                  <Lock className="w-5 h-5 text-gray-400" />
                }
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </span>
                </label>

                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Demo Credentials:{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  admin@hotel.com
                </span>{' '}
                / <span className="font-medium">password123</span>
              </p>
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          © 2025 Hotel Admin Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
