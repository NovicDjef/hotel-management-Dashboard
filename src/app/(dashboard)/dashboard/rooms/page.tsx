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
  Modal,
  ModalFooter,
} from '@/components/ui';
import { Search, Plus, Edit, Trash2, Bed } from 'lucide-react';
import { roomService } from '@/lib/api/services';
import type { RoomTypeInventory, RoomType } from '@/lib/types';

const getRoomTypeBadge = (roomType: RoomType) => {
  const variants: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
    SINGLE: 'info',
    DOUBLE: 'success',
    SUITE: 'warning',
    EXECUTIVE: 'danger',
    STANDARD: 'info',
    DELUXE: 'success',
  };

  return (
    <Badge variant={variants[roomType] || 'default'} size="sm">
      {roomType}
    </Badge>
  );
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomTypeInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [formData, setFormData] = useState({
    roomType: 'SINGLE' as RoomType,
    name: '',
    description: '',
    basePrice: 0,
    weekendPrice: 0,
    capacity: 1,
    size: 0,
    bedType: '',
    totalRooms: 1,
    amenities: {
      wifi: true,
      tv: true,
      ac: true,
      minibar: false,
      safe: false,
      desk: false,
      wardrobe: false,
      balcony: false,
      coffeeMaker: false,
      bathrobeSlippers: false,
    },
  });

  useEffect(() => {
    loadRooms();
  }, [filters]);

  const loadRooms = async () => {
    try {
      setIsLoading(true);

      // Nettoyer les paramètres vides
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const response = await roomService.getAll(cleanFilters);

      // L'API retourne les room types dans response.data.roomTypes
      const roomTypes = response.data?.roomTypes || response.roomTypes || [];
      setRooms(roomTypes);

      setPagination({
        total: response.pagination?.total || roomTypes.length,
        totalPages: response.pagination?.totalPages || 1,
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
    if (confirm('Are you sure you want to delete this room type?')) {
      try {
        await roomService.delete(id);
        loadRooms();
      } catch (error) {
        console.error('Failed to delete room type:', error);
      }
    }
  };

  const handleSubmitRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.basePrice <= 0 || formData.size <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const roomData = {
        ...formData,
        hotelId: 'cmh3iygew00009crzsls6rlzy', // ID de l'hôtel
      };

      await roomService.create(roomData);

      // Fermer le modal et recharger les données
      setShowAddModal(false);
      loadRooms();

      // Réinitialiser le formulaire
      setFormData({
        roomType: 'SINGLE' as RoomType,
        name: '',
        description: '',
        basePrice: 0,
        weekendPrice: 0,
        capacity: 1,
        size: 0,
        bedType: '',
        totalRooms: 1,
        amenities: {
          wifi: true,
          tv: true,
          ac: true,
          minibar: false,
          safe: false,
          desk: false,
          wardrobe: false,
          balcony: false,
          coffeeMaker: false,
          bathrobeSlippers: false,
        },
      });
    } catch (error) {
      console.error('Failed to create room type:', error);
      alert('Error creating room type. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: {
        ...formData.amenities,
        [amenity]: !formData.amenities[amenity as keyof typeof formData.amenities],
      },
    });
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
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Room Type
          </Button>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Price (Base/Weekend)</TableHead>
                    <TableHead>Total Rooms</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {room.name}
                          </div>
                          {room.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {room.description.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoomTypeBadge(room.roomType)}
                      </TableCell>
                      <TableCell>{room.capacity} {room.capacity > 1 ? 'guests' : 'guest'}</TableCell>
                      <TableCell>{room.size} m²</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            ${room.basePrice}/night
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Weekend: ${room.weekendPrice}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {room.totalRooms} {room.totalRooms > 1 ? 'rooms' : 'room'}
                        </div>
                        {room.availableRooms !== undefined && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            {room.availableRooms} available
                          </div>
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
                            onClick={() => handleDelete(room.id)}
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

        {/* Modal d'ajout de type de chambre */}
        {showAddModal && (
          <Modal
            isOpen={showAddModal}
            onClose={() => !isSubmitting && setShowAddModal(false)}
            title="Add New Room Type"
            size="xl"
          >
            <form onSubmit={handleSubmitRoom} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Section 1: Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Room Name *"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Chambre Double Deluxe"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Select
                    label="Room Type *"
                    value={formData.roomType}
                    onChange={(e) =>
                      setFormData({ ...formData, roomType: e.target.value as RoomType })
                    }
                    options={[
                      { value: 'SINGLE', label: 'Single' },
                      { value: 'DOUBLE', label: 'Double' },
                      { value: 'SUITE', label: 'Suite' },
                      { value: 'EXECUTIVE', label: 'Executive' },
                      { value: 'STANDARD', label: 'Standard' },
                      { value: 'DELUXE', label: 'Deluxe' },
                    ]}
                    disabled={isSubmitting}
                  />

                  <Input
                    label="Total Rooms *"
                    type="number"
                    min="1"
                    value={formData.totalRooms}
                    onChange={(e) =>
                      setFormData({ ...formData, totalRooms: parseInt(e.target.value) })
                    }
                    required
                    disabled={isSubmitting}
                  />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      rows={3}
                      placeholder="Describe the room..."
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Capacity */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Pricing & Capacity
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Base Price ($/night) *"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, basePrice: parseFloat(e.target.value) })
                    }
                    required
                    disabled={isSubmitting}
                  />

                  <Input
                    label="Weekend Price ($/night) *"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.weekendPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, weekendPrice: parseFloat(e.target.value) })
                    }
                    required
                    disabled={isSubmitting}
                  />

                  <Input
                    label="Capacity (guests) *"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: parseInt(e.target.value) })
                    }
                    required
                    disabled={isSubmitting}
                  />

                  <Input
                    label="Size (m²) *"
                    type="number"
                    min="0"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData({ ...formData, size: parseInt(e.target.value) })
                    }
                    required
                    disabled={isSubmitting}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Bed Type *"
                      type="text"
                      value={formData.bedType}
                      onChange={(e) =>
                        setFormData({ ...formData, bedType: e.target.value })
                      }
                      placeholder="e.g., 1 lit double (160x200cm) ou 2 lits simples"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Amenities */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Amenities
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(formData.amenities).map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities[amenity as keyof typeof formData.amenities]}
                        onChange={() => toggleAmenity(amenity)}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {amenity.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
              <ModalFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Room Type'}
                </Button>
              </ModalFooter>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
