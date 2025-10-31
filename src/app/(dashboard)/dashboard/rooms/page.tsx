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
import { Search, Plus, Edit, Trash2, Bed } from 'lucide-react';
import { roomService } from '@/lib/api/services';
import type { Room, RoomStatus } from '@/lib/types';

const getStatusBadge = (status: RoomStatus) => {
  const variants = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    CLEANING: 'warning',
    MAINTENANCE: 'gray',
    RESERVED: 'info',
  } as const;

  return (
    <Badge variant={variants[status] || 'default'} size="sm">
      {status}
    </Badge>
  );
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    hotelId: 'default-hotel-id',
    search: '',
    status: '',
    type: '',
    floor: '',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadRooms();
  }, [filters]);

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const params = {
        ...filters,
        floor: filters.floor ? parseInt(filters.floor) : undefined,
      };
      const response = await roomService.getAll(params as any);
      setRooms(response.data || []);
      setPagination({
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      });
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await roomService.updateStatus(id, newStatus);
      loadRooms();
    } catch (error) {
      console.error('Failed to update room status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        await roomService.delete(id);
        loadRooms();
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Rooms
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage hotel rooms and inventory
            </p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />}>Add Room</Button>
        </div>

        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by room number..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                leftIcon={<Search className="w-4 h-4 text-gray-400" />}
              />

              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'OCCUPIED', label: 'Occupied' },
                  { value: 'CLEANING', label: 'Cleaning' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'RESERVED', label: 'Reserved' },
                ]}
              />

              <Select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'STANDARD', label: 'Standard' },
                  { value: 'DELUXE', label: 'Deluxe' },
                  { value: 'SUITE', label: 'Suite' },
                  { value: 'EXECUTIVE', label: 'Executive' },
                ]}
              />

              <Input
                type="number"
                placeholder="Floor"
                value={filters.floor}
                onChange={(e) =>
                  setFilters({ ...filters, floor: e.target.value })
                }
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              All Rooms ({pagination.total})
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12">
                <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No rooms found
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-semibold">
                        {room.roomNumber}
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" size="sm">
                          {room.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell>{room.capacity} guests</TableCell>
                      <TableCell className="font-semibold">
                        ${room.price}/night
                      </TableCell>
                      <TableCell>{getStatusBadge(room.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Select
                            value={room.status}
                            onChange={(e) =>
                              handleUpdateStatus(room.id, e.target.value)
                            }
                            options={[
                              { value: 'AVAILABLE', label: 'Available' },
                              { value: 'OCCUPIED', label: 'Occupied' },
                              { value: 'CLEANING', label: 'Cleaning' },
                              { value: 'MAINTENANCE', label: 'Maintenance' },
                              { value: 'RESERVED', label: 'Reserved' },
                            ]}
                            className="text-xs"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>

          {!isLoading && rooms.length > 0 && (
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
