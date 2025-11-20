'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
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
} from '../../../components/ui';
import { Search, Plus, Edit, Trash2, Bed, RefreshCw, X, Image as ImageIcon, Upload } from 'lucide-react';
import { roomService } from '@/lib/api/services';
import type { RoomTypeInventory, RoomType } from '@/lib/types';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

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
  const [roomStats, setRoomStats] = useState<any>(null);
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
    images: [] as string[],
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

  const [currentImageUrl, setCurrentImageUrl] = useState('');

  useEffect(() => {
    loadRooms();
    loadRoomStats();
  }, [filters]);

  // Fonction de rafraîchissement automatique
  const refreshData = useCallback(() => {
    loadRooms();
    loadRoomStats();
  }, [filters]);

  // Rafraîchissement automatique toutes les 30 secondes
  const { isRefreshing, lastRefresh } = useAutoRefresh(refreshData, {
    interval: 30000, // 30 secondes
    enabled: true,
    pauseWhenHidden: true,
  });

  const loadRoomStats = async () => {
    try {
      const stats = await roomService.getStats();
      console.log('📊 Room stats loaded in component:', stats);
      // Extraire les données depuis la propriété 'data' si elle existe
      setRoomStats(stats.data || stats);
    } catch (error) {
      console.error('❌ Failed to load room stats:', error);
    }
  };

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
        images: [],
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
      setCurrentImageUrl('');
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

  const handleAddImage = () => {
    if (currentImageUrl.trim() !== '') {
      setFormData({
        ...formData,
        images: [...formData.images, currentImageUrl.trim()],
      });
      setCurrentImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} n'est pas une image valide`);
        continue;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} est trop volumineux (max 5MB)`);
        continue;
      }

      // Convertir en base64
      try {
        const base64 = await convertFileToBase64(file);
        newImages.push(base64 as string);
      } catch (error) {
        console.error('Error converting file:', error);
        alert(`Erreur lors du traitement de ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages],
      });
    }

    // Réinitialiser l'input file
    event.target.value = '';
  };

  const convertFileToBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
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

          <div className="flex items-center gap-4">
            {/* Indicateur de rafraîchissement automatique */}
            <div className="flex items-center gap-2 text-sm">
              {isRefreshing && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Mise à jour...</span>
                </div>
              )}
              {!isRefreshing && lastRefresh && (
                <div className="text-gray-500 dark:text-gray-400 text-xs hidden sm:block">
                  Màj: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
            </div>

            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Room Type
            </Button>
          </div>
        </div>

        {/* Statistiques des chambres par type */}
        {roomStats && roomStats.byType && roomStats.byType.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {roomStats.byType.map((typeStats: any) => {
              const total = typeStats.total || 0;
              const available = typeStats.available || 0;
              const occupied = typeStats.occupied || 0;
              const reserved = typeStats.reserved || 0;
              const maintenance = typeStats.maintenance || 0;
              const cleaning = typeStats.cleaning || 0;
              const occupancyRate = parseFloat(typeStats.occupancyRate || '0');

              return (
                <Card key={typeStats.type} className="hover:shadow-lg transition-shadow">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Bed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        {getRoomTypeBadge(typeStats.type as RoomType)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{total}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-600 dark:text-green-400">Disponibles:</span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">{available}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-red-600 dark:text-red-400">Occupées:</span>
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">{occupied}</span>
                      </div>

                      {reserved > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-orange-600 dark:text-orange-400">Réservées:</span>
                          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{reserved}</span>
                        </div>
                      )}

                      {maintenance > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-purple-600 dark:text-purple-400">Maintenance:</span>
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{maintenance}</span>
                        </div>
                      )}

                      {cleaning > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-blue-600 dark:text-blue-400">Nettoyage:</span>
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{cleaning}</span>
                        </div>
                      )}

                      {/* Barre de progression */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Taux d'occupation</span>
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{occupancyRate.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              occupancyRate >= 80 ? 'bg-red-500' : occupancyRate >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${occupancyRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardBody className="text-center py-8">
              <div className="animate-pulse">
                <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Chargement des statistiques...
                </p>
              </div>
            </CardBody>
          </Card>
        )}

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

              {/* Section 4: Images */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Room Images
                </h3>

                <div className="space-y-3">
                  {/* Option 1: Ajouter par URL */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Add by URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        value={currentImageUrl}
                        onChange={(e) => setCurrentImageUrl(e.target.value)}
                        placeholder="Enter image URL (https://...)"
                        disabled={isSubmitting}
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImage();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddImage}
                        disabled={!currentImageUrl.trim() || isSubmitting}
                        size="sm"
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Add URL
                      </Button>
                    </div>
                  </div>

                  {/* Option 2: Upload depuis l'ordinateur */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Or upload from computer
                    </label>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="file-upload"
                        className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Choose images or drag & drop
                        </span>
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          disabled={isSubmitting}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 5MB each. You can select multiple files.
                    </p>
                  </div>

                  {/* Liste des images ajoutées */}
                  {formData.images.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.images.length} image(s) added
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                        {formData.images.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                          >
                            <img
                              src={imageUrl}
                              alt={`Room image ${index + 1}`}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              disabled={isSubmitting}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                              {imageUrl}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.images.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        No images added yet. Enter image URLs above to add them.
                      </p>
                    </div>
                  )}
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
