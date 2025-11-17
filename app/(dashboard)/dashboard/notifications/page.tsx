'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { Card, CardBody, Button } from '../../../components/ui';
import { Bell, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setNotifications, markAsRead, markAllAsRead } from '@/store/slices/notificationSlice';
import { reservationService } from '@/lib/api/services';

interface Notification {
  id: string;
  type: 'ROOM_NEEDED' | 'INFO' | 'WARNING';
  title: string;
  message: string;
  reservationId?: string;
  isRead: boolean;
  createdAt: Date;
}

export default function NotificationsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notifications: storeNotifications, unreadCount } = useAppSelector((state) => state.notifications);

  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setLocalNotifications] = useState<Notification[]>([]);

  // Charger les notifications
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Récupérer toutes les réservations
      const response = await reservationService.getAll({ limit: 1000 });

      // Filtrer les réservations CONFIRMED sans chambre
      const reservationsNeedingRoom = (response.data || []).filter((r: any) =>
        r.status === 'CONFIRMED' && !r.roomId
      );

      // Créer des notifications pour ces réservations
      const roomNotifications: Notification[] = reservationsNeedingRoom.map((r: any) => ({
        id: `room-needed-${r.id}`,
        type: 'ROOM_NEEDED' as const,
        title: '🏨 Attribution de chambre requise',
        message: `Réservation ${r.id.slice(0, 8)} pour ${r.guest?.firstName} ${r.guest?.lastName} (${r.roomType}) nécessite une chambre${r.paymentStatus === 'PAID' ? ' - PAYÉE' : ''}`,
        reservationId: r.id,
        isRead: false,
        createdAt: new Date(r.createdAt),
      }));

      setLocalNotifications(roomNotifications);

      // Mettre à jour le store Redux pour le badge
      dispatch(setNotifications(roomNotifications));
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
    setLocalNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    setLocalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleViewReservation = (reservationId: string, notificationId: string) => {
    handleMarkAsRead(notificationId);
    router.push(`/dashboard/reservations`);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ROOM_NEEDED':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'WARNING':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ROOM_NEEDED':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'WARNING':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos notifications et alertes
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllAsRead}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Statistiques */}
        {notifications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {notifications.length}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Non lues</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {unreadCount}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lues</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {notifications.filter(n => n.isRead).length}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Liste des notifications */}
        <Card>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Aucune notification
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tout est à jour ! Aucune action requise.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors ${
                      notification.isRead
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-blue-50 dark:bg-blue-900/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icône */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {new Date(notification.createdAt).toLocaleString('fr-FR')}
                            </p>
                          </div>

                          {/* Badge non lu */}
                          {!notification.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          {notification.reservationId && (
                            <button
                              onClick={() => handleViewReservation(notification.reservationId!, notification.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-md transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              Voir la réservation
                            </button>
                          )}

                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Marquer comme lu
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
