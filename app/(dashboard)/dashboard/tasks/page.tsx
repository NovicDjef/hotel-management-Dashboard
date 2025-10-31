'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui';
import { Plus, Play, Check, X, ClipboardList } from 'lucide-react';
import { taskService } from '@/lib/api/services';
import type { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { format } from 'date-fns';

const getStatusBadge = (status: TaskStatus) => {
  const variants = {
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    CANCELLED: 'gray',
  } as const;

  return (
    <Badge variant={variants[status] || 'default'} size="sm">
      {status.replace('_', ' ')}
    </Badge>
  );
};

const getPriorityBadge = (priority: TaskPriority) => {
  const variants = {
    LOW: 'gray',
    MEDIUM: 'info',
    HIGH: 'warning',
    URGENT: 'danger',
  } as const;

  return (
    <Badge variant={variants[priority] || 'default'} size="sm">
      {priority}
    </Badge>
  );
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const response = await taskService.getAll(filters);
      setTasks(response.data || []);
      setPagination({
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      });
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await taskService.start(id);
      loadTasks();
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await taskService.complete(id);
      loadTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this task?')) {
      try {
        await taskService.cancel(id);
        loadTasks();
      } catch (error) {
        console.error('Failed to cancel task:', error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage maintenance and cleaning tasks
            </p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />}>Create Task</Button>
        </div>

        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
              />

              <Select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'CLEANING', label: 'Cleaning' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'INSPECTION', label: 'Inspection' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />

              <Select
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
                options={[
                  { value: '', label: 'All Priorities' },
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              All Tasks ({pagination.total})
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No tasks found
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {task.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" size="sm">
                          {task.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        {task.room?.roomNumber || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {task.assignedTo
                          ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                          : 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        {task.dueDate
                          ? format(new Date(task.dueDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {task.status === 'PENDING' && (
                            <button
                              onClick={() => handleStart(task.id)}
                              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600"
                              title="Start"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}

                          {task.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleComplete(task.id)}
                              className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded text-green-600"
                              title="Complete"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {(task.status === 'PENDING' ||
                            task.status === 'IN_PROGRESS') && (
                            <button
                              onClick={() => handleCancel(task.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>

          {!isLoading && tasks.length > 0 && (
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
