'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { Search, Plus, Edit, Trash2, UserCog } from 'lucide-react';
import { staffService } from '@/lib/api/services';
import type { Staff } from '@/lib/types';

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadStaff();
  }, [filters]);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const response = await staffService.getAll(filters);
      setStaff(response.data || []);
      setPagination({
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      });
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        await staffService.delete(id);
        loadStaff();
      } catch (error) {
        console.error('Failed to delete staff member:', error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Staff
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage hotel staff and employees
            </p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Add Staff Member
          </Button>
        </div>

        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search by name, email..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                leftIcon={<Search className="w-4 h-4 text-gray-400" />}
              />

              <Select
                value={filters.role}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
                options={[
                  { value: '', label: 'All Roles' },
                  { value: 'SUPER_ADMIN', label: 'Super Admin' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'RECEPTIONIST', label: 'Receptionist' },
                  { value: 'HOUSEKEEPER', label: 'Housekeeper' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'ACCOUNTANT', label: 'Accountant' },
                  { value: 'MANAGER', label: 'Manager' },
                ]}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              All Staff ({pagination.total})
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : staff.length === 0 ? (
              <div className="text-center py-12">
                <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No staff members found
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.firstName} {member.lastName}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant="info" size="sm">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.department || 'N/A'}</TableCell>
                      <TableCell>{member.phone || 'N/A'}</TableCell>
                      <TableCell>
                        {member.isActive ? (
                          <Badge variant="success" size="sm">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="gray" size="sm">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
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

          {!isLoading && staff.length > 0 && (
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
