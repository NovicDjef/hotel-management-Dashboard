'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { Card, CardBody, CardHeader } from '../../components/ui';
import {
  DollarSign,
  Users,
  CalendarCheck,
  TrendingUp,
  Bed,
  ClipboardList,
  ArrowUp,
  ArrowDown,
  Minus,
  Hotel,
  Percent,
  CreditCard,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import type { DashboardStats } from '@/lib/types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { stats, isLoading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Helper pour calculer le trend
  const getTrendIcon = (change?: number) => {
    if (!change) return Minus;
    if (change > 0) return ArrowUp;
    if (change < 0) return ArrowDown;
    return Minus;
  };

  const getTrendColor = (change?: number) => {
    if (!change) return 'text-gray-500';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const statCards = [
    {
      label: "Revenus Aujourd'hui",
      value: `$${stats?.stats?.revenue?.today?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      changeLabel: 'cette semaine',
      subValue: `$${stats?.stats?.revenue?.week?.toLocaleString() || 0}`,
    },
    {
      label: 'Revenus du Mois',
      value: `$${stats?.stats?.revenue?.month?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      changeLabel: 'revenu moyen',
      subValue: `$${stats?.stats?.revenue?.average?.toLocaleString() || 0}`,
    },
    {
      label: "Taux d'Occupation",
      value: `${stats?.stats?.occupancy?.occupancyRate || 0}%`,
      icon: Bed,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      changeLabel: 'chambres occupées',
      subValue: `${stats?.stats?.occupancy?.occupiedRooms || 0}/${stats?.stats?.occupancy?.totalRooms || 0}`,
    },
    {
      label: 'Réservations Totales',
      value: stats?.stats?.reservations?.total || 0,
      icon: CalendarCheck,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      changeLabel: 'confirmées',
      subValue: stats?.stats?.reservations?.confirmed || 0,
    },
    {
      label: 'Nouveaux Clients (Mois)',
      value: stats?.stats?.clients?.newClientsMonth || 0,
      icon: Users,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      changeLabel: 'cette semaine',
      subValue: stats?.stats?.clients?.newClientsWeek || 0,
    },
    {
      label: 'Réservations en Attente',
      value: stats?.stats?.reservations?.pending || 0,
      icon: ClipboardList,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  const additionalStats = [
    {
      label: 'Revenu Moyen par Réservation',
      value: `$${stats?.stats?.revenue?.average?.toLocaleString() || 0}`,
      icon: CreditCard,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Chambres Disponibles',
      value: stats?.stats?.occupancy?.availableRooms || 0,
      icon: Hotel,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      subtitle: `sur ${stats?.stats?.occupancy?.totalRooms || 0} chambres`,
    },
    {
      label: 'Taux de Conversion',
      value: `${stats?.stats?.clients?.conversionRate || 0}%`,
      icon: Percent,
      color: 'text-pink-600',
      bg: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      label: 'Clients Actifs',
      value: stats?.stats?.clients?.activeClients || 0,
      icon: UserCheck,
      color: 'text-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      subtitle: `${stats?.stats?.clients?.newClientsToday || 0} nouveaux aujourd'hui`,
    },
    {
      label: 'Annulations du Mois',
      value: stats?.stats?.reservations?.cancelledThisMonth || 0,
      icon: UserX,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      subtitle: `${stats?.stats?.reservations?.cancelled || 0} total`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Cards Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <Card key={index} hover>
                <CardBody>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>

                  {stat.subValue && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        {stat.changeLabel}:
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {stat.subValue}
                      </span>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Stats Additionnelles */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📊 Statistiques Détaillées
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {additionalStats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <Card key={index} hover>
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-2 rounded-lg ${stat.bg}`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {stat.value}
                    </p>

                    {stat.subtitle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {stat.subtitle}
                      </p>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📈 Analyses et Tendances
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  📊 Évolution des Revenus
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Revenus mensuels sur 12 mois
                </p>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats?.charts?.monthlyRevenue || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenus"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Occupancy Rate by Month */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  🏨 Taux d'Occupation Mensuel
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Évolution du taux d'occupation
                </p>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats?.charts?.monthlyOccupancy || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      name="Taux (%)"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Revenue by Room Type */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  💰 Revenus par Type de Chambre
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Contribution aux revenus totaux
                </p>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.charts?.revenueByRoomType || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="type" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenus ($)" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ⚡ Activités d'Aujourd'hui
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aperçu en temps réel des opérations
            </p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Nouveaux Clients Aujourd'hui
                  </p>
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.stats?.clients?.newClientsToday || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  nouveaux clients enregistrés
                </p>
              </div>

              <div className="p-4 border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Clients Actifs
                  </p>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.stats?.clients?.activeClients || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  clients actuellement présents
                </p>
              </div>

              <div className="p-4 border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Réservations en Attente
                  </p>
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.stats?.reservations?.pending || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  à confirmer
                </p>
              </div>

              <div className="p-4 border-l-4 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Revenus du Jour
                  </p>
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ${stats?.stats?.revenue?.today?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  encaissé aujourd'hui
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
