'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
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
  Modal,
  ModalFooter,
  Input,
} from '@/components/ui';
import { Plus, Play, Check, X, ClipboardList } from 'lucide-react';
import { taskService, roomService, staffService } from '@/lib/api/services';
import type { Task, TaskStatus, TaskPriority, RoomTypeInventory, Staff } from '@/lib/types';
import { useClientDate } from '@/hooks/useClientDate';

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
  const { formatDate } = useClientDate();
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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'CLEANING',
    priority: 'MEDIUM',
    roomId: '',
    assignedToId: '',
    dueDate: '',
    scheduledDate: '',
  });

  useEffect(() => {
    loadTasks();
  }, [filters]);

  useEffect(() => {
    if (showCreateModal) {
      loadRoomsAndStaff();
    }
  }, [showCreateModal]);

  const loadRoomsAndStaff = async () => {
    try {
      const [roomsData, staffData] = await Promise.all([
        roomService.getAll({ page: 1, limit: 100 }),
        staffService.getAll({ page: 1, limit: 100 }),
      ]);
      setRooms(roomsData.data || []);
      setStaffMembers(staffData.data || []);
    } catch (error) {
      console.error('Failed to load rooms and staff:', error);
    }
  };

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title || !newTask.type || !newTask.priority) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);
      const taskData: any = {
        title: newTask.title,
        description: newTask.description,
        type: newTask.type,
        priority: newTask.priority,
      };

      if (newTask.roomId) taskData.roomId = newTask.roomId;
      if (newTask.assignedToId) taskData.assignedToId = newTask.assignedToId;
      if (newTask.dueDate) taskData.dueDate = new Date(newTask.dueDate).toISOString();
      if (newTask.scheduledDate) taskData.scheduledDate = new Date(newTask.scheduledDate).toISOString();

      await taskService.create(taskData);

      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        type: 'CLEANING',
        priority: 'MEDIUM',
        roomId: '',
        assignedToId: '',
        dueDate: '',
        scheduledDate: '',
      });
      loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Erreur lors de la création de la tâche');
    } finally {
      setIsSubmitting(false);
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
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Task
          </Button>
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
                          ? formatDate(task.dueDate, 'MMM dd, yyyy')
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

        {/* Create Task Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Créer une nouvelle tâche"
          size="lg"
        >
          <form onSubmit={handleCreateTask} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Informations de base
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Titre *"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Ex: Nettoyage chambre 101"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    placeholder="Décrivez la tâche en détail..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Type et priorité */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Type et priorité
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Type *"
                  value={newTask.type}
                  onChange={(e) =>
                    setNewTask({ ...newTask, type: e.target.value })
                  }
                  options={[
                    { value: 'CLEANING', label: 'Nettoyage' },
                    { value: 'MAINTENANCE', label: 'Maintenance' },
                    { value: 'INSPECTION', label: 'Inspection' },
                    { value: 'OTHER', label: 'Autre' },
                  ]}
                  required
                />

                <Select
                  label="Priorité *"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                  options={[
                    { value: 'LOW', label: 'Basse' },
                    { value: 'MEDIUM', label: 'Moyenne' },
                    { value: 'HIGH', label: 'Haute' },
                    { value: 'URGENT', label: 'Urgente' },
                  ]}
                  required
                />
              </div>
            </div>

            {/* Assignation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Assignation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Chambre"
                  value={newTask.roomId}
                  onChange={(e) =>
                    setNewTask({ ...newTask, roomId: e.target.value })
                  }
                  options={[
                    { value: '', label: 'Aucune chambre' },
                    ...rooms.map((room: any) => ({
                      value: room.id,
                      label: `${room.roomNumber} - ${room.roomType?.name || room.type}`,
                    })),
                  ]}
                />

                <Select
                  label="Assigné à"
                  value={newTask.assignedToId}
                  onChange={(e) =>
                    setNewTask({ ...newTask, assignedToId: e.target.value })
                  }
                  options={[
                    { value: '', label: 'Non assigné' },
                    ...staffMembers.map((staff: any) => ({
                      value: staff.id,
                      label: `${staff.firstName} ${staff.lastName} - ${staff.role}`,
                    })),
                  ]}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Planification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date planifiée"
                  type="datetime-local"
                  value={newTask.scheduledDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, scheduledDate: e.target.value })
                  }
                />

                <Input
                  label="Date d'échéance"
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
          </form>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création...' : 'Créer la tâche'}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
