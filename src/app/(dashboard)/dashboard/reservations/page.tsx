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
import {
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Edit,
} from 'lucide-react';
import { reservationService, roomService } from '@/lib/api/services';
import type { Reservation, ReservationStatus, RoomTypeInventory } from '@/lib/types';
import { format } from 'date-fns';
import { useClientDate } from '@/hooks/useClientDate';

const getStatusBadge = (status: ReservationStatus) => {
  const variants = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    CHECKED_IN: 'success',
    CHECKED_OUT: 'gray',
    CANCELLED: 'danger',
  } as const;

  return (
    <Badge variant={variants[status] || 'default'} size="sm">
      {status}
    </Badge>
  );
};

// Helper pour obtenir le prix total (compatibilité avec l'API)
const getTotalAmount = (reservation: Reservation) => {
  return reservation.finalPrice || reservation.totalPrice || reservation.totalAmount || 0;
};

// Helper pour obtenir le montant payé
const getPaidAmount = (reservation: Reservation) => {
  return reservation.paidAmount || 0;
};

export default function ReservationsPage() {
  const { formatDate } = useClientDate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [reservationToValidate, setReservationToValidate] =
    useState<Reservation | null>(null);
  const [validationNotes, setValidationNotes] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState<Reservation | null>(null);
  const [newReservation, setNewReservation] = useState({
    guestEmail: '',
    guestFirstName: '',
    guestLastName: '',
    guestPhone: '',
    roomType: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    specialRequests: '',
    paidAmount: 0,
    paymentMethod: 'CASH',
  });
  const [availability, setAvailability] = useState<any[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<any>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeInventory[]>([]);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadReservations();
  }, [filters]);

  useEffect(() => {
    loadRoomTypes();
  }, []);

  // Vérifier la disponibilité quand les dates changent
  useEffect(() => {
    if (newReservation.checkInDate && newReservation.checkOutDate && showCreateModal) {
      checkAvailability();
    }
  }, [newReservation.checkInDate, newReservation.checkOutDate, newReservation.roomType, showCreateModal]);

  // Mettre à jour automatiquement le montant payé quand le prix est calculé
  useEffect(() => {
    if (calculatedPrice && showCreateModal) {
      const totalAmount = calculatedPrice?.data?.totalAmount ||
                          calculatedPrice?.totalAmount ||
                          calculatedPrice?.data?.total ||
                          calculatedPrice?.total || 0;
      console.log('useEffect - calculatedPrice:', calculatedPrice);
      console.log('useEffect - totalAmount extracted:', totalAmount);

      if (totalAmount > 0) {
        setNewReservation(prev => ({
          ...prev,
          paidAmount: totalAmount,
        }));
      }
    }
  }, [calculatedPrice, showCreateModal]);

  const loadReservations = async () => {
    try {
      setIsLoading(true);

      // Nettoyer les paramètres vides pour éviter les erreurs de validation API
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        // N'inclure que les valeurs non vides
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const response = await reservationService.getAll(cleanFilters);
      setReservations(response.data || []);
      setPagination({
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      });
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoomTypes = async () => {
    try {
      setIsLoadingRoomTypes(true);
      const response = await roomService.getAllRoomTypes();
      console.log('🏨 Room types API response:', response);
      console.log('🏨 Room types data:', response.data?.data?.roomTypes);
      if (response.data?.data?.roomTypes) {
        const types = response.data.data.roomTypes;
        console.log('🏨 Setting room types:', types);
        console.log('🏨 Room types details:', types.map((rt: any) => ({
          id: rt.id,
          roomType: rt.roomType,
          name: rt.name,
          basePrice: rt.basePrice,
          weekendPrice: rt.weekendPrice
        })));
        setRoomTypes(types);
      }
    } catch (error) {
      console.error('Failed to load room types:', error);
    } finally {
      setIsLoadingRoomTypes(false);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await reservationService.checkIn(id);
      loadReservations();
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await reservationService.checkOut(id);
      loadReservations();
    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await reservationService.cancel(id);
        loadReservations();
      } catch (error) {
        console.error('Cancellation failed:', error);
      }
    }
  };

  const handleConfirm = (reservation: Reservation) => {
    setReservationToValidate(reservation);
    setValidationNotes('');
    setShowValidationModal(true);
  };

  const handleValidateReservation = async () => {
    if (!reservationToValidate) return;

    try {
      await reservationService.confirm(reservationToValidate.id);
      setShowValidationModal(false);
      setReservationToValidate(null);
      setValidationNotes('');
      loadReservations();
    } catch (error) {
      console.error('Confirmation failed:', error);
      alert('Failed to confirm reservation. Please try again.');
    }
  };

  const handleViewDetails = async (reservation: Reservation) => {
    try {
      const details = await reservationService.getById(reservation.id);
      setSelectedReservation(details || null);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to load reservation details:', error);
    }
  };

  const handleOpenCreateModal = () => {
    // Réinitialiser toutes les valeurs avant d'ouvrir le modal
    setNewReservation({
      guestEmail: '',
      guestFirstName: '',
      guestLastName: '',
      guestPhone: '',
      roomType: '',
      checkInDate: '',
      checkOutDate: '',
      numberOfGuests: 1,
      specialRequests: '',
      paidAmount: 0,
      paymentMethod: 'CASH',
    });
    setAvailability([]);
    setCalculatedPrice(null);
    setShowCreateModal(true);
  };

  const checkAvailability = async () => {
    if (!newReservation.checkInDate || !newReservation.checkOutDate) {
      return;
    }

    try {
      setIsCheckingAvailability(true);

      // Utiliser la nouvelle API avec décompte par type
      const availabilityData = await roomService.checkAvailabilityByDate({
        checkInDate: newReservation.checkInDate,
        checkOutDate: newReservation.checkOutDate,
      });

      console.log('🏨 Availability by date response:', availabilityData);

      // Extraire les données de disponibilité par type
      const byRoomType = availabilityData?.data?.byRoomType || [];
      console.log('🏨 Availability by room type:', byRoomType);

      setAvailability(byRoomType);

      // Calculer le prix si le type de chambre est sélectionné
      if (newReservation.roomType) {
        console.log('🔍 DEBUG - newReservation.roomType:', newReservation.roomType);
        console.log('🔍 DEBUG - All roomTypes:', roomTypes);
        console.log('🔍 DEBUG - Selected roomType details:', roomTypes.find(rt => rt.roomType === newReservation.roomType));

        // Convertir les dates au format ISO si nécessaire
        const checkInISO = newReservation.checkInDate.includes('T')
          ? newReservation.checkInDate
          : `${newReservation.checkInDate}T00:00:00.000Z`;
        const checkOutISO = newReservation.checkOutDate.includes('T')
          ? newReservation.checkOutDate
          : `${newReservation.checkOutDate}T00:00:00.000Z`;

        const calculateData = {
          roomType: newReservation.roomType,
          checkInDate: checkInISO,
          checkOutDate: checkOutISO,
          numberOfGuests: newReservation.numberOfGuests,
        };
        console.log('📤 Sending to calculate API:', JSON.stringify(calculateData, null, 2));

        try {
          const priceData = await reservationService.calculate(calculateData);
          console.log('✅ Price calculation response:', priceData);
          setCalculatedPrice(priceData);

          // Mettre à jour le montant payé automatiquement
          const totalAmount = priceData?.data?.totalAmount || priceData?.totalAmount || priceData?.data?.total || priceData?.total || 0;
          console.log('Setting paidAmount to:', totalAmount);
          if (totalAmount > 0) {
            setNewReservation(prev => ({
              ...prev,
              paidAmount: totalAmount,
            }));
          }
        } catch (priceError: any) {
          console.error('❌ Price calculation error:', priceError);
          console.error('❌ Error response:', priceError.response?.data);
          console.error('❌ Full error object:', JSON.stringify(priceError.response?.data, null, 2));

          // Afficher une alerte avec les détails de l'erreur
          const errorDetails = priceError.response?.data?.error?.details;
          if (errorDetails) {
            console.error('❌ Validation details:', errorDetails);
          }

          // Ne pas bloquer si le calcul du prix échoue
        }
      }
    } catch (error) {
      console.error('Failed to check availability:', error);
      setAvailability([]);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleCreateReservation = async () => {
    try {
      // Validation basique
      if (!newReservation.guestEmail || !newReservation.guestFirstName ||
          !newReservation.guestLastName || !newReservation.roomType ||
          !newReservation.checkInDate || !newReservation.checkOutDate) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Vérifier la disponibilité
      if (Array.isArray(availability) && availability.length > 0) {
        const roomAvailability = availability.find((a: any) => a.roomType === newReservation.roomType);
        if (!roomAvailability || roomAvailability.available === 0) {
          alert('Aucune chambre disponible pour ce type aux dates sélectionnées');
          return;
        }
      }

      await reservationService.create(newReservation);
      alert('✅ Réservation créée avec succès!');
      setShowCreateModal(false);
      setNewReservation({
        guestEmail: '',
        guestFirstName: '',
        guestLastName: '',
        guestPhone: '',
        roomType: '',
        checkInDate: '',
        checkOutDate: '',
        numberOfGuests: 1,
        specialRequests: '',
        paidAmount: 0,
        paymentMethod: 'CASH',
      });
      setAvailability([]);
      setCalculatedPrice(null);
      loadReservations();
    } catch (error: any) {
      console.error('Failed to create reservation:', error);

      // Gérer les erreurs spécifiques du backend
      const errorCode = error?.response?.data?.error?.code;
      const errorMessage = error?.response?.data?.message;

      if (errorCode === 'ROOM_TYPE_NOT_AVAILABLE') {
        alert('❌ COMPLET - Aucune chambre disponible pour ce type aux dates sélectionnées.\nVeuillez choisir d\'autres dates ou un autre type de chambre.');
      } else if (errorCode === 'VALIDATION_ERROR') {
        alert(`❌ Erreur de validation: ${errorMessage || 'Veuillez vérifier les données saisies'}`);
      } else {
        alert(`❌ Erreur lors de la création de la réservation: ${errorMessage || 'Veuillez réessayer'}`);
      }
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setReservationToEdit(reservation);
    setNewReservation({
      guestEmail: reservation.guest?.email || '',
      guestFirstName: reservation.guest?.firstName || '',
      guestLastName: reservation.guest?.lastName || '',
      guestPhone: reservation.guest?.phone || '',
      roomType: reservation.roomType || '',
      checkInDate: reservation.checkInDate?.split('T')[0] || '',
      checkOutDate: reservation.checkOutDate?.split('T')[0] || '',
      numberOfGuests: reservation.numberOfGuests || 1,
      specialRequests: reservation.specialRequests || '',
      paidAmount: 0,
      paymentMethod: 'CASH',
    });
    setShowEditModal(true);
  };

  const handleUpdateReservation = async () => {
    if (!reservationToEdit) return;

    try {
      // Validation basique
      if (!newReservation.roomType ||
          !newReservation.checkInDate || !newReservation.checkOutDate) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      await reservationService.update(reservationToEdit.id, {
        roomType: newReservation.roomType,
        checkInDate: newReservation.checkInDate,
        checkOutDate: newReservation.checkOutDate,
        numberOfGuests: newReservation.numberOfGuests,
        specialRequests: newReservation.specialRequests,
      });

      setShowEditModal(false);
      setReservationToEdit(null);
      setNewReservation({
        guestEmail: '',
        guestFirstName: '',
        guestLastName: '',
        guestPhone: '',
        roomType: '',
        checkInDate: '',
        checkOutDate: '',
        numberOfGuests: 1,
        specialRequests: '',
        paidAmount: 0,
        paymentMethod: 'CASH',
      });
      setAvailability([]);
      setCalculatedPrice(null);
      loadReservations();
    } catch (error) {
      console.error('Failed to update reservation:', error);
      alert('Erreur lors de la modification de la réservation');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Reservations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage hotel reservations and bookings
            </p>
          </div>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
          >
            New Reservation
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by guest name, email..."
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
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'CONFIRMED', label: 'Confirmed' },
                  { value: 'CHECKED_IN', label: 'Checked In' },
                  { value: 'CHECKED_OUT', label: 'Checked Out' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
              />

              <Button
                variant="secondary"
                leftIcon={<Filter className="w-4 h-4" />}
              >
                More Filters
              </Button>

              <Button
                variant="ghost"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Reservations Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              All Reservations ({pagination.total})
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No reservations found
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-mono text-xs">
                        {reservation.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {reservation.guest?.firstName}{' '}
                            {reservation.guest?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {reservation.guest?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        Room {reservation.room?.roomNumber}
                      </TableCell>
                      <TableCell>
                        {reservation.checkInDate ? formatDate(reservation.checkInDate, 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {reservation.checkOutDate ? formatDate(reservation.checkOutDate, 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>{reservation.numberOfGuests}</TableCell>
                      <TableCell>
                        {getStatusBadge(reservation.status)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${getTotalAmount(reservation).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(reservation)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleEditReservation(reservation)}
                              className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded text-purple-600"
                              title="Edit Reservation"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {reservation.status === 'PENDING' && (
                            <button
                              onClick={() => handleConfirm(reservation)}
                              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600"
                              title="Confirm Reservation"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {reservation.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCheckIn(reservation.id)}
                              className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded text-green-600"
                              title="Check In"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {reservation.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => handleCheckOut(reservation.id)}
                              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600"
                              title="Check Out"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {(reservation.status === 'PENDING' ||
                            reservation.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleCancel(reservation.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
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

          {/* Pagination */}
          {!isLoading && reservations.length > 0 && (
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

        {/* Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Reservation Details"
          size="lg"
        >
          {selectedReservation && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Guest Name
                  </p>
                  <p className="font-medium">
                    {selectedReservation.guest?.firstName}{' '}
                    {selectedReservation.guest?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  <p className="font-medium">
                    {selectedReservation.guest?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="font-medium">
                    {selectedReservation.guest?.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Room Number
                  </p>
                  <p className="font-medium">
                    {selectedReservation.room?.roomNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check-in Date
                  </p>
                  <p className="font-medium">
                    {selectedReservation.checkInDate ? formatDate(selectedReservation.checkInDate, 'MMMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check-out Date
                  </p>
                  <p className="font-medium">
                    {selectedReservation.checkOutDate ? formatDate(selectedReservation.checkOutDate, 'MMMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Number of Guests
                  </p>
                  <p className="font-medium">
                    {selectedReservation.numberOfGuests}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(selectedReservation.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Amount
                  </p>
                  <p className="font-medium text-lg">
                    ${getTotalAmount(selectedReservation).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Paid Amount
                  </p>
                  <p className="font-medium text-lg">
                    ${getPaidAmount(selectedReservation).toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedReservation.specialRequests && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Special Requests
                  </p>
                  <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {selectedReservation.specialRequests}
                  </p>
                </div>
              )}
            </div>
          )}

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>

        {/* Validation Modal */}
        <Modal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          title="Valider la réservation"
          size="lg"
        >
          {reservationToValidate && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Informations de la réservation */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Informations de la réservation
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Client
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {reservationToValidate.guest?.firstName}{' '}
                      {reservationToValidate.guest?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {reservationToValidate.guest?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Téléphone
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {reservationToValidate.guest?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Détails de la chambre */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Chambre
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Chambre {reservationToValidate.room?.roomNumber}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {reservationToValidate.room?.type || 'Type inconnu'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Nombre de personnes
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {reservationToValidate.numberOfGuests} personne(s)
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Date d'arrivée
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {reservationToValidate.checkInDate ? formatDate(reservationToValidate.checkInDate, 'EEEE, dd MMMM yyyy') : 'N/A'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Date de départ
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {reservationToValidate.checkOutDate ? formatDate(reservationToValidate.checkOutDate, 'EEEE, dd MMMM yyyy') : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Montants */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Montant total
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                      ${getTotalAmount(reservationToValidate).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Montant payé
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      ${getPaidAmount(reservationToValidate).toFixed(2)}
                    </p>
                  </div>
                </div>
                {getPaidAmount(reservationToValidate) < getTotalAmount(reservationToValidate) && (
                  <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded border border-yellow-300 dark:border-yellow-700">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Solde restant: $
                      {(
                        getTotalAmount(reservationToValidate) -
                        getPaidAmount(reservationToValidate)
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Demandes spéciales */}
              {reservationToValidate.specialRequests && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                    Demandes spéciales
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {reservationToValidate.specialRequests}
                  </p>
                </div>
              )}

              {/* Notes de validation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes de validation (optionnel)
                </label>
                <textarea
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Ajoutez des notes concernant cette validation..."
                />
              </div>

              {/* Confirmation message */}
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  En confirmant cette réservation, vous attestez que:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>✓ Les informations du client ont été vérifiées</li>
                  <li>✓ La chambre est disponible aux dates demandées</li>
                  <li>✓ Le paiement a été vérifié</li>
                  <li>✓ Les demandes spéciales ont été notées</li>
                </ul>
              </div>
            </div>
          )}

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setShowValidationModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleValidateReservation}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Confirmer la réservation
            </Button>
          </ModalFooter>
        </Modal>

        {/* Create Reservation Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Nouvelle réservation"
          size="lg"
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Guest Information */}
            <div className="border-b pb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Informations du client
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prénom *
                  </label>
                  <Input
                    value={newReservation.guestFirstName}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        guestFirstName: e.target.value,
                      })
                    }
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom *
                  </label>
                  <Input
                    value={newReservation.guestLastName}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        guestLastName: e.target.value,
                      })
                    }
                    placeholder="Dupont"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={newReservation.guestEmail}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        guestEmail: e.target.value,
                      })
                    }
                    placeholder="jean.dupont@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone
                  </label>
                  <Input
                    type="tel"
                    value={newReservation.guestPhone}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        guestPhone: e.target.value,
                      })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Reservation Details */}
            <div className="border-b pb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Détails de la réservation
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type de chambre *
                  </label>
                  <Select
                    value={newReservation.roomType}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        roomType: e.target.value,
                      })
                    }
                    disabled={isLoadingRoomTypes}
                    options={[
                      { value: '', label: isLoadingRoomTypes ? 'Chargement...' : 'Sélectionner...' },
                      ...roomTypes.map((rt) => {
                        const avail = availability.find((a: any) => a.roomType === rt.roomType);
                        const isAvailable = !avail || avail.available > 0;
                        const availText = avail ? ` (${avail.available}/${avail.total} dispo)` : '';
                        const completeText = avail && avail.available === 0 ? ' ❌ COMPLET' : '';

                        return {
                          value: rt.roomType,
                          label: `${rt.name} - ${rt.basePrice}$ (weekend: ${rt.weekendPrice}$)${availText}${completeText}`,
                          disabled: !isAvailable,
                        };
                      }),
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de personnes *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newReservation.numberOfGuests}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        numberOfGuests: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date d'arrivée *
                  </label>
                  <Input
                    type="date"
                    value={newReservation.checkInDate}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        checkInDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de départ *
                  </label>
                  <Input
                    type="date"
                    value={newReservation.checkOutDate}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        checkOutDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Availability and Price */}
              {isCheckingAvailability && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Vérification de la disponibilité...
                  </p>
                </div>
              )}

              {availability && availability.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Disponibilité des chambres
                  </h5>
                  <div className="space-y-2">
                    {availability.map((avail: any) => {
                      const isAvailable = avail.available > 0;
                      const roomTypeName = roomTypes.find(rt => rt.roomType === avail.roomType)?.name || avail.roomType;

                      return (
                        <div
                          key={avail.roomType}
                          className={`p-3 rounded-lg border ${
                            isAvailable
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {roomTypeName}
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                isAvailable
                                  ? 'text-green-700 dark:text-green-400'
                                  : 'text-red-700 dark:text-red-400'
                              }`}
                            >
                              {avail.available}/{avail.total}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {isAvailable ? (
                                `${avail.available} chambre${avail.available > 1 ? 's' : ''} disponible${avail.available > 1 ? 's' : ''}`
                              ) : (
                                '❌ COMPLET - Impossible de réserver'
                              )}
                            </span>
                            {isAvailable && (
                              <div className="flex gap-1">
                                {[...Array(Math.min(5, avail.total))].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < avail.available
                                        ? 'bg-green-500 dark:bg-green-400'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                  />
                                ))}
                                {avail.total > 5 && (
                                  <span className="text-xs text-gray-500">+{avail.total - 5}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {calculatedPrice && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                    Détail du prix
                  </h5>
                  <div className="space-y-2">
                    {(() => {
                      const priceData = calculatedPrice.data || calculatedPrice;
                      const weekdayNights = priceData.weekdayNights || 0;
                      const weekendNights = priceData.weekendNights || 0;
                      const weekdayTotal = priceData.weekdayTotal || 0;
                      const weekendTotal = priceData.weekendTotal || 0;
                      const subtotal = priceData.subtotal || priceData.basePrice || 0;
                      const taxes = priceData.taxes || 0;
                      const taxRate = priceData.taxRate || 15;
                      const totalAmount = priceData.totalAmount || priceData.total || 0;

                      return (
                        <>
                          {weekdayNights > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Jours de semaine ({weekdayNights} nuits):</span>
                              <span className="font-medium">${weekdayTotal.toFixed(2)}</span>
                            </div>
                          )}
                          {weekendNights > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Week-end ({weekendNights} nuits):</span>
                              <span className="font-medium">${weekendTotal.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span>Total nuits:</span>
                            <span className="font-medium">{weekdayNights + weekendNights}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Sous-total:</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                          </div>
                          {taxes > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Taxes ({taxRate}%):</span>
                              <span className="font-medium">${taxes.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                            <span>Total à payer:</span>
                            <span className="text-blue-700 dark:text-blue-400">
                              ${totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="border-b pb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Informations de paiement
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Montant payé *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newReservation.paidAmount}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        paidAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                  {calculatedPrice && newReservation.paidAmount > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Reste à payer: ${((calculatedPrice.totalAmount || calculatedPrice.total || 0) - newReservation.paidAmount).toFixed(2)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Méthode de paiement *
                  </label>
                  <Select
                    value={newReservation.paymentMethod}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        paymentMethod: e.target.value,
                      })
                    }
                    options={[
                      { value: 'CASH', label: 'Espèces' },
                      { value: 'CREDIT_CARD', label: 'Carte de crédit' },
                      { value: 'DEBIT_CARD', label: 'Carte de débit' },
                      { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
                      { value: 'MOBILE_PAYMENT', label: 'Paiement mobile' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Demandes spéciales
              </label>
              <textarea
                value={newReservation.specialRequests}
                onChange={(e) =>
                  setNewReservation({
                    ...newReservation,
                    specialRequests: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Lit supplémentaire, vue sur mer, etc..."
              />
            </div>
          </div>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateReservation}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Créer la réservation
            </Button>
          </ModalFooter>
        </Modal>

        {/* Edit Reservation Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setReservationToEdit(null);
            setAvailability([]);
            setCalculatedPrice(null);
          }}
          title="Modifier la réservation"
          size="lg"
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Guest Information (Read-only) */}
            <div className="border-b pb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Client (non modifiable)
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {newReservation.guestFirstName} {newReservation.guestLastName} - {newReservation.guestEmail}
              </p>
            </div>

            {/* Reservation Details */}
            <div className="border-b pb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Détails de la réservation
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type de chambre *
                  </label>
                  <Select
                    value={newReservation.roomType}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        roomType: e.target.value,
                      })
                    }
                    disabled={isLoadingRoomTypes}
                    options={[
                      { value: '', label: isLoadingRoomTypes ? 'Chargement...' : 'Sélectionner...' },
                      ...roomTypes.map((rt) => {
                        const avail = availability.find((a: any) => a.roomType === rt.roomType);
                        const isAvailable = !avail || avail.available > 0;
                        const availText = avail ? ` (${avail.available}/${avail.total} dispo)` : '';
                        const completeText = avail && avail.available === 0 ? ' ❌ COMPLET' : '';

                        return {
                          value: rt.roomType,
                          label: `${rt.name} - ${rt.basePrice}$ (weekend: ${rt.weekendPrice}$)${availText}${completeText}`,
                          disabled: !isAvailable,
                        };
                      }),
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de personnes *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newReservation.numberOfGuests}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        numberOfGuests: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date d'arrivée *
                  </label>
                  <Input
                    type="date"
                    value={newReservation.checkInDate}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        checkInDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de départ *
                  </label>
                  <Input
                    type="date"
                    value={newReservation.checkOutDate}
                    onChange={(e) =>
                      setNewReservation({
                        ...newReservation,
                        checkOutDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Demandes spéciales
              </label>
              <textarea
                value={newReservation.specialRequests}
                onChange={(e) =>
                  setNewReservation({
                    ...newReservation,
                    specialRequests: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Lit supplémentaire, vue sur mer, etc..."
              />
            </div>
          </div>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setReservationToEdit(null);
                setAvailability([]);
                setCalculatedPrice(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateReservation}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Modifier la réservation
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
