'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { Card, CardBody, CardHeader, Button, Input, Badge } from '../../../components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSpaServices,
  fetchSpaPackages,
  fetchSpaReservations,
  fetchSpaCertificates,
  fetchSpaStats,
  deleteSpaService,
  deleteSpaPackage,
  cancelSpaReservation,
} from '@/store/slices/spaSlice';
import {
  Search,
  Plus,
  Sparkles,
  Package,
  Calendar,
  Gift,
  TrendingUp,
  Eye,
  Trash2,
  Clock,
  DollarSign,
  Users,
  X,
} from 'lucide-react';
import { useClientDate } from '../../../hooks/useClientDate';

type TabType = 'services' | 'packages' | 'reservations' | 'certificates';

export default function SpaPage() {
  const dispatch = useAppDispatch();
  const { services, packages, reservations, certificates, stats, isLoading, error } = useAppSelector(
    (state) => state.spa
  );
  const { formatDate, isMounted } = useClientDate();

  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    // Charger les données avec gestion d'erreur
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchSpaServices({})).unwrap(),
          dispatch(fetchSpaPackages({})).unwrap(),
          dispatch(fetchSpaReservations({})).unwrap(),
          dispatch(fetchSpaCertificates({})).unwrap(),
          dispatch(fetchSpaStats({})).unwrap(),
        ]);
        setApiAvailable(true);
      } catch (error) {
        console.log('API Spa non disponible - Mode démonstration activé');
        setApiAvailable(false);
      }
    };

    loadData();
  }, [dispatch]);

  const handleDeleteService = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service?')) {
      try {
        await dispatch(deleteSpaService(id)).unwrap();
        alert('Service supprimé avec succès');
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce forfait?')) {
      try {
        await dispatch(deleteSpaPackage(id)).unwrap();
        alert('Forfait supprimé avec succès');
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation?')) {
      try {
        await dispatch(cancelSpaReservation(id)).unwrap();
        alert('Réservation annulée avec succès');
      } catch (error) {
        alert('Erreur lors de l\'annulation');
      }
    }
  };

  const filteredServices = services.filter((service) =>
    searchTerm
      ? service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const filteredPackages = packages.filter((pkg) =>
    searchTerm
      ? pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const filteredReservations = reservations.filter((reservation) =>
    searchTerm
      ? reservation.guestId?.toString().includes(searchTerm.toLowerCase())
      : true
  );

  const filteredCertificates = certificates.filter((cert) =>
    searchTerm
      ? cert.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.purchasedFor?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const getReservationStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      case 'COMPLETED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCertificateStatus = (certificate: any) => {
    // Cette fonction n'est appelée que côté client grâce au check isMounted
    if (certificate.isUsed) {
      return { color: 'info' as const, label: 'UTILISÉ' };
    } else if (new Date(certificate.expiresAt) < new Date()) {
      return { color: 'danger' as const, label: 'EXPIRÉ' };
    } else if (certificate.isPaid) {
      return { color: 'success' as const, label: 'ACTIF' };
    } else {
      return { color: 'warning' as const, label: 'EN ATTENTE' };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              💆 Gestion du Spa
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les services, forfaits, réservations et certificats cadeaux
            </p>
          </div>
          <Button variant="primary" className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau {activeTab === 'services' ? 'Service' : activeTab === 'packages' ? 'Forfait' : activeTab === 'reservations' ? 'Réservation' : 'Certificat'}
          </Button>
        </div>

        {/* Message d'information si API non disponible */}
        {!apiAvailable && (
          <Card className="border-l-4 border-blue-500">
            <CardBody className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Mode Démonstration
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Les endpoints API du spa ne sont pas encore configurés sur le serveur backend.
                    L'interface est prête et fonctionnelle, mais les données ne peuvent pas être chargées pour le moment.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    📌 Endpoints requis : <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/spa/services</code>,
                    <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs ml-1">/spa/forfaits</code>,
                    <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs ml-1">/spa/reservations</code>,
                    <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs ml-1">/spa/certificats</code>
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Services
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.activeServices?.toLocaleString() || services.length}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Actifs
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Forfaits Disponibles
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {packages.length}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Offres spéciales
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Package className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Réservations
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.totalReservations?.toLocaleString() || reservations.length}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Ce mois
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Certificats Vendus
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.certificatesSold?.toLocaleString() || certificates.length}
                  </p>
                  <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                    Cadeaux disponibles
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
                  <Gift className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search Bar */}
        <Card>
          <CardBody className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </CardBody>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'services'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Services
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'packages'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Forfaits
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'reservations'
                ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Réservations
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'certificates'
                ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Gift className="w-4 h-4 inline mr-2" />
            Certificats
          </button>
        </div>

        {/* Content based on active tab */}
        <Card>
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {activeTab === 'services' && 'Liste des Services'}
                {activeTab === 'packages' && 'Liste des Forfaits'}
                {activeTab === 'reservations' && 'Liste des Réservations'}
                {activeTab === 'certificates' && 'Liste des Certificats Cadeaux'}
              </h2>
              <Badge variant="info" className="text-sm px-3 py-1">
                {activeTab === 'services' && `${filteredServices.length} services`}
                {activeTab === 'packages' && `${filteredPackages.length} forfaits`}
                {activeTab === 'reservations' && `${filteredReservations.length} réservations`}
                {activeTab === 'certificates' && `${filteredCertificates.length} certificats`}
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
              </div>
            ) : (
              <>
                {/* Services Tab */}
                {activeTab === 'services' && (
                  <div className="space-y-3">
                    {filteredServices.length === 0 ? (
                      <div className="text-center py-12">
                        <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Aucun service trouvé</p>
                      </div>
                    ) : (
                      filteredServices.map((service) => (
                        <div
                          key={service.id}
                          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {service.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {service.description}
                              </p>
                              <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  <span className="font-semibold text-green-600 dark:text-green-400">
                                    ${service.price}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {service.duration} min
                                  </span>
                                </div>
                                {service.category && (
                                  <Badge variant="purple" className="text-xs">
                                    {service.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="primary">
                                <Eye className="w-4 h-4 mr-1" />
                                Voir
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeleteService(service.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Packages Tab */}
                {activeTab === 'packages' && (
                  <div className="space-y-3">
                    {filteredPackages.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Aucun forfait trouvé</p>
                      </div>
                    ) : (
                      filteredPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {pkg.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {pkg.description}
                              </p>
                              <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  <span className="font-semibold text-green-600 dark:text-green-400">
                                    ${pkg.price}
                                  </span>
                                  {pkg.discount && (
                                    <Badge variant="warning" className="text-xs">
                                      -{pkg.discount}%
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {pkg.services?.length || 0} services
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="primary">
                                <Eye className="w-4 h-4 mr-1" />
                                Voir
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeletePackage(pkg.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Reservations Tab */}
                {activeTab === 'reservations' && (
                  <div className="space-y-3">
                    {filteredReservations.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Aucune réservation trouvée</p>
                      </div>
                    ) : (
                      filteredReservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  Client #{reservation.guestId}
                                </h3>
                                <Badge variant={getReservationStatusColor(reservation.status)} className="text-xs">
                                  {reservation.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {isMounted ? formatDate(reservation.date) : reservation.date} à {reservation.time}
                                  </span>
                                </div>
                                {reservation.totalAmount && (
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                      ${reservation.totalAmount}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="primary">
                                <Eye className="w-4 h-4 mr-1" />
                                Voir
                              </Button>
                              {reservation.status !== 'CANCELLED' && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleCancelReservation(reservation.id)}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Annuler
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Certificates Tab */}
                {activeTab === 'certificates' && (
                  <div className="space-y-3">
                    {filteredCertificates.length === 0 ? (
                      <div className="text-center py-12">
                        <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Aucun certificat trouvé</p>
                      </div>
                    ) : (
                      filteredCertificates.map((certificate) => {
                        const status = getCertificateStatus(certificate);
                        return (
                          <div
                            key={certificate.code}
                            className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-600 transition-all duration-200"
                          >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 font-mono">
                                    {certificate.code}
                                  </h3>
                                  {isMounted && (
                                    <Badge variant={status.color} className="text-xs">
                                      {status.label}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                      ${certificate.amount}
                                    </span>
                                  </div>
                                  {certificate.purchasedFor && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-700 dark:text-gray-300">
                                        Pour: {certificate.purchasedFor}
                                      </span>
                                    </div>
                                  )}
                                  {certificate.expiresAt && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                      <span className="text-gray-700 dark:text-gray-300">
                                        Expire: {isMounted ? formatDate(certificate.expiresAt) : certificate.expiresAt}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="primary">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Voir
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
