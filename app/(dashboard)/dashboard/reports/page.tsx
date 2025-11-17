'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { Card, CardBody, CardHeader, Button, Select } from '../../../components/ui';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Home,
  ClipboardCheck,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { reservationService, roomService, guestService, dashboardService } from '@/lib/api/services';

type Period = 'today' | 'week' | 'month' | 'year' | 'custom';

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    confirmedReservations: 0,
    checkedInReservations: 0,
    cancelledReservations: 0,
    totalRevenue: 0,
    totalGuests: 0,
    occupancyRate: 0,
    availableRooms: 0,
    totalRooms: 0,
  });

  const [reservationsByType, setReservationsByType] = useState<any[]>([]);
  const [reservationsByStatus, setReservationsByStatus] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // Charger les statistiques
      const [reservations, rooms, guests] = await Promise.all([
        reservationService.getAll({ limit: 1000 }),
        roomService.getAll({ limit: 1000 }),
        guestService.getAll({ limit: 1000 }),
      ]);

      const reservationsData = reservations.data || [];
      const roomsData = rooms.data || [];
      const guestsData = guests.data || [];

      // Calculer les statistiques
      const totalReservations = reservationsData.length;
      const confirmed = reservationsData.filter((r: any) => r.status === 'CONFIRMED').length;
      const checkedIn = reservationsData.filter((r: any) => r.status === 'CHECKED_IN').length;
      const cancelled = reservationsData.filter((r: any) => r.status === 'CANCELLED').length;

      // Calculer le revenu total
      const totalRevenue = reservationsData.reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0);

      // Calculer le taux d'occupation
      const occupiedRooms = roomsData.filter((r: any) => r.status !== 'AVAILABLE').length;
      const totalRooms = roomsData.length;
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      // Réservations par type de chambre
      const byType: any = {};
      reservationsData.forEach((r: any) => {
        const type = r.roomType || 'UNKNOWN';
        byType[type] = (byType[type] || 0) + 1;
      });

      const reservationsByTypeData = Object.entries(byType).map(([type, count]) => ({
        type,
        count,
        percentage: Math.round(((count as number) / totalReservations) * 100),
      }));

      // Réservations par statut
      const byStatus: any = {};
      reservationsData.forEach((r: any) => {
        const status = r.status || 'UNKNOWN';
        byStatus[status] = (byStatus[status] || 0) + 1;
      });

      const reservationsByStatusData = Object.entries(byStatus).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round(((count as number) / totalReservations) * 100),
      }));

      setStats({
        totalReservations,
        confirmedReservations: confirmed,
        checkedInReservations: checkedIn,
        cancelledReservations: cancelled,
        totalRevenue,
        totalGuests: guestsData.length,
        occupancyRate,
        availableRooms: totalRooms - occupiedRooms,
        totalRooms,
      });

      setReservationsByType(reservationsByTypeData);
      setReservationsByStatus(reservationsByStatusData);
    } catch (error) {
      console.error('❌ Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    alert('Export Excel - Fonctionnalité à implémenter');
  };

  const handleExportPDF = () => {
    alert('Export PDF - Fonctionnalité à implémenter');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'CHECKED_IN':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'CHECKED_OUT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      SINGLE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      DOUBLE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      SUITE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      PRESIDENTIAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      DELUXE: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      TWIN: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Rapports & Analyses
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Vue d'ensemble des performances et statistiques de l'hôtel
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sélecteur de période */}
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              options={[
                { value: 'today', label: "Aujourd'hui" },
                { value: 'week', label: 'Cette semaine' },
                { value: 'month', label: 'Ce mois' },
                { value: 'year', label: 'Cette année' },
              ]}
            />

            {/* Boutons d'export */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportExcel}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Excel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPDF}
              leftIcon={<FileText className="w-4 h-4" />}
            >
              PDF
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Réservations */}
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Réservations</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.totalReservations}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Revenu Total */}
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Revenu Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${stats.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Taux d'Occupation */}
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Taux d'Occupation</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.occupancyRate}%
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Total Clients */}
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.totalGuests}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Détails des réservations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Confirmées</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.confirmedReservations}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Check-in</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.checkedInReservations}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Annulées</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.cancelledReservations}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Réservations par Type */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Réservations par Type de Chambre
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {reservationsByType.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        Aucune donnée disponible
                      </p>
                    ) : (
                      reservationsByType.map((item) => (
                        <div key={item.type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-md text-sm font-medium ${getTypeColor(item.type)}`}>
                              {item.type}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.count} ({item.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Réservations par Statut */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Réservations par Statut
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {reservationsByStatus.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        Aucune donnée disponible
                      </p>
                    ) : (
                      reservationsByStatus.map((item) => (
                        <div key={item.status} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.count} ({item.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Informations des chambres */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    État des Chambres
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Chambres Disponibles</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.availableRooms}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Chambres Occupées</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalRooms - stats.availableRooms}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Chambres</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.totalRooms}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
