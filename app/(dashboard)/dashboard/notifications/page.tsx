'use client';

import React from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { Card, CardBody } from '../../../components/ui';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your notifications
          </p>
        </div>

        <Card>
          <CardBody className="text-center py-12">
            <Bell className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No New Notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You're all caught up!
            </p>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
