'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { Search, Plus, Edit, Trash2, Star, Users as UsersIcon } from 'lucide-react';
import { guestService } from '@/lib/api/services';
import type { Guest } from '@/lib/types';

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadGuests();
  }, [filters]);

  const loadGuests = async () => {
    try {
      setIsLoading(true);
      const response = await guestService.getAll(filters);
      setGuests(response.data || []);
      setPagination({
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      });
    } catch (error) {
      console.error('Failed to load guests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVIP = async (id: string) => {
    try {
      await guestService.toggleVIP(id);
      loadGuests();
    } catch (error) {
      console.error('Failed to toggle VIP status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this guest?')) {
      try {
        await guestService.delete(id);
        loadGuests();
      } catch (error) {
        console.error('Failed to delete guest:', error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Guests
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage hotel guests and customers
            </p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />}>Add Guest</Button>
        </div>

        <Card>
          <CardBody>
            <Input
              placeholder="Search by name, email, phone..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              All Guests ({pagination.total})
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : guests.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No guests found
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>VIP</TableHead>
                    <TableHead>Loyalty Points</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">
                        {guest.firstName} {guest.lastName}
                      </TableCell>
                      <TableCell>{guest.email}</TableCell>
                      <TableCell>{guest.phone || 'N/A'}</TableCell>
                      <TableCell>{guest.country || 'N/A'}</TableCell>
                      <TableCell>
                        {guest.isVIP ? (
                          <Badge variant="warning" size="sm">
                            <Star className="w-3 h-3 inline mr-1" />
                            VIP
                          </Badge>
                        ) : (
                          <Badge variant="gray" size="sm">
                            Standard
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {guest.loyaltyPoints}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleVIP(guest.id)}
                            className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded text-yellow-600"
                            title="Toggle VIP"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>

          {!isLoading && guests.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                {Math.min(filters.page * filters.limit, pagination.total)} of{' '}
                {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={filters.page >= pagination.totalPages}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
