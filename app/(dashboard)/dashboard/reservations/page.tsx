'use client';

import React, { useEffect, useState } from 'react';
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
import {
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
} from 'lucide-react';
import { reservationService } from '@/lib/api/services';
import type { Reservation, ReservationStatus } from '@/lib/types';
import { format } from 'date-fns';

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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const handleConfirm = async (id: string) => {
    if (confirm('Confirm this reservation?')) {
      try {
        await reservationService.confirm(id);
        loadReservations();
      } catch (error) {
        console.error('Confirmation failed:', error);
      }
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
          <Button leftIcon={<Plus className="w-4 h-4" />}>
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
                        {format(
                          new Date(reservation.checkInDate),
                          'MMM dd, yyyy'
                        )}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(reservation.checkOutDate),
                          'MMM dd, yyyy'
                        )}
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

                          {reservation.status === 'PENDING' && (
                            <button
                              onClick={() => handleConfirm(reservation.id)}
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
            <div className="space-y-4">
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
                    {format(
                      new Date(selectedReservation.checkInDate),
                      'MMMM dd, yyyy'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check-out Date
                  </p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedReservation.checkOutDate),
                      'MMMM dd, yyyy'
                    )}
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
      </div>
    </DashboardLayout>
  );
}
