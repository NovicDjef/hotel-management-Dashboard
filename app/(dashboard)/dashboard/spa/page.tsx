'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { Card, CardBody, CardHeader, Button, Input, Badge, Modal, ModalFooter, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSpaCategories,
  fetchSpaServices,
  fetchSpaPackages,
  fetchSpaReservations,
  fetchSpaCertificates,
  fetchSpaStats,
  deleteSpaService,
  deleteSpaPackage,
  cancelSpaReservation,
  updateSpaReservation,
  createSpaService,
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
  CheckCircle,
} from 'lucide-react';
import { useClientDate } from '../../../hooks/useClientDate';

type TabType = 'services' | 'packages' | 'reservations' | 'certificates';

export default function SpaPage() {
  const dispatch = useAppDispatch();
  const { categories, services, packages, reservations, certificates, stats, isLoading, error } = useAppSelector(
    (state) => state.spa
  );
  const { formatDate, isMounted } = useClientDate();

  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [apiAvailable, setApiAvailable] = useState(true);

  // Create service modal states
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newService, setNewService] = useState({
    nom: '',
    description: '',
    categorie: '',
    durees: '',
    prix: '',
    bienfaits: '',
  });

  // Reservation details modal states
  const [showReservationDetailsModal, setShowReservationDetailsModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  useEffect(() => {
    // Charger les données avec gestion d'erreur
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchSpaCategories()).unwrap(),
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

  const handleViewReservationDetails = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowReservationDetailsModal(true);
  };

  const handleCloseReservationDetails = () => {
    setSelectedReservation(null);
    setShowReservationDetailsModal(false);
  };

  const handleConfirmPayment = async (reservationId: string) => {
    if (confirm('Êtes-vous sûr de vouloir valider le paiement et confirmer cette réservation?')) {
      try {
        await dispatch(updateSpaReservation({
          id: reservationId,
          data: { status: 'CONFIRMED' }
        })).unwrap();
        alert('✅ Paiement validé et réservation confirmée avec succès!');
        // Rafraîchir les réservations
        dispatch(fetchSpaReservations({}));
        dispatch(fetchSpaStats({}));
        // Fermer le modal
        handleCloseReservationDetails();
      } catch (error) {
        alert('❌ Erreur lors de la validation du paiement');
        console.error(error);
      }
    }
  };

  const handleCreateService = async () => {
    setIsSubmitting(true);
    try {
      // Parse durees (comma-separated string to array of numbers)
      const dureesArray = newService.durees
        .split(',')
        .map(d => parseInt(d.trim()))
        .filter(d => !isNaN(d));

      // Parse prix (format: "60:100,90:150" -> {60: 100, 90: 150})
      const prixObject: { [key: string]: number } = {};
      newService.prix.split(',').forEach(pair => {
        const [duration, price] = pair.split(':').map(s => s.trim());
        if (duration && price) {
          prixObject[duration] = parseFloat(price);
        }
      });

      // Parse bienfaits (comma-separated string to array)
      const bienfaitsArray = newService.bienfaits
        .split(',')
        .map(b => b.trim())
        .filter(b => b.length > 0);

      const serviceData = {
        nom: newService.nom,
        description: newService.description,
        categorie: newService.categorie,
        durees: dureesArray,
        prix: prixObject,
        bienfaits: bienfaitsArray,
      };

      await dispatch(createSpaService(serviceData)).unwrap();
      alert('Service créé avec succès!');
      setShowCreateServiceModal(false);
      // Reset form
      setNewService({
        nom: '',
        description: '',
        categorie: '',
        durees: '',
        prix: '',
        bienfaits: '',
      });
      // Refresh services list
      dispatch(fetchSpaServices({}));
      dispatch(fetchSpaStats({}));
    } catch (error) {
      alert('Erreur lors de la création du service');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = (Array.isArray(services) ? services : []).filter((service) => {
    const serviceName = service.nom || service.name || '';
    const serviceDescription = service.description || '';
    const serviceCategory = service.categorie || service.category || '';

    // Filtrage par recherche
    const matchesSearch = searchTerm
      ? serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        serviceDescription.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // Filtrage par catégorie
    const matchesCategory = selectedCategory === 'tous'
      ? true
      : serviceCategory.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const filteredPackages = (Array.isArray(packages) ? packages : []).filter((pkg) => {
    const packageName = pkg.nom || pkg.name || '';
    const packageDescription = pkg.description || '';

    return searchTerm
      ? packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        packageDescription.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
  });

  const filteredReservations = (Array.isArray(reservations) ? reservations : [])
    .filter((reservation) => {
      const guestName = reservation.reservation?.guest?.firstName + ' ' + reservation.reservation?.guest?.lastName;
      const serviceName = reservation.spaService?.nom || reservation.spaService?.name || '';
      const guestEmail = reservation.reservation?.guest?.email || '';

      return searchTerm
        ? guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guestEmail.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
    })
    // Trier par date (plus récent en premier)
    .sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      return dateB - dateA; // Ordre décroissant (plus récent en premier)
    });

  const filteredCertificates = (Array.isArray(certificates) ? certificates : []).filter((cert) =>
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
          <Button
            variant="primary"
            className="w-full md:w-auto"
            onClick={() => activeTab === 'services' && setShowCreateServiceModal(true)}
          >
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
                    {stats?.activeServices?.toLocaleString() || (Array.isArray(services) ? services.length : 0)}
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
                    {Array.isArray(packages) ? packages.length : 0}
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
                    {stats?.totalReservations?.toLocaleString() || (Array.isArray(reservations) ? reservations.length : 0)}
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
                    {stats?.certificatesSold?.toLocaleString() || (Array.isArray(certificates) ? certificates.length : 0)}
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

        {/* Category Filter - Only show for services tab */}
        {activeTab === 'services' && Array.isArray(categories) && categories.length > 0 && (
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap mr-2">
                  Catégories:
                </span>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCategory === category.slug
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.name}
                    {category.servicesCount > 0 && (
                      <span className="ml-2 text-xs opacity-75">
                        ({category.servicesCount})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

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
                      filteredServices.map((service) => {
                        const serviceName = service.nom || service.name || 'Service sans nom';
                        const serviceDescription = service.description || '';
                        const serviceCategory = service.categorie || service.category || '';
                        const durations = service.durees || (service.duration ? [service.duration] : []);
                        const prices = service.prix || (service.price ? { [service.duration || '0']: service.price } : {});

                        return (
                        <div
                          key={service.id}
                          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {serviceName}
                                </h3>
                                {serviceCategory && (
                                  <Badge variant="purple" className="text-xs ml-2">
                                    {serviceCategory}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {serviceDescription}
                              </p>

                              {/* Duration and Price Options */}
                              {durations.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Durées disponibles:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {durations.map((duration) => (
                                      <div
                                        key={duration}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                      >
                                        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          {duration} min
                                        </span>
                                        {prices[duration] && (
                                          <>
                                            <span className="text-gray-400">•</span>
                                            <DollarSign className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                              {prices[duration]}$
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Benefits */}
                              {service.bienfaits && service.bienfaits.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Bienfaits:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {service.bienfaits.slice(0, 3).map((benefit, idx) => (
                                      <Badge key={idx} variant="info" className="text-xs">
                                        {benefit}
                                      </Badge>
                                    ))}
                                    {service.bienfaits.length > 3 && (
                                      <Badge variant="default" className="text-xs">
                                        +{service.bienfaits.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
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
                        );
                      })
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
                      filteredPackages.map((pkg) => {
                        const packageName = pkg.nom || pkg.name || 'Forfait sans nom';
                        const packageDescription = pkg.description || '';
                        const priceIndividual = pkg.prixIndividuel || pkg.price || 0;
                        const priceDuo = pkg.prixDuo || 0;
                        const savingsIndividual = pkg.economieIndividuel || pkg.discount || 0;
                        const savingsDuo = pkg.economieDuo || 0;
                        const servicesCount = pkg.services?.length || 0;

                        return (
                        <div
                          key={pkg.id}
                          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {packageName}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {packageDescription}
                              </p>

                              {/* Services inclus */}
                              {servicesCount > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Services inclus ({servicesCount}):
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {pkg.services?.slice(0, 3).map((svc) => (
                                      <Badge key={svc.id} variant="info" className="text-xs">
                                        {svc.service?.nom || svc.service?.name}
                                      </Badge>
                                    ))}
                                    {servicesCount > 3 && (
                                      <Badge variant="default" className="text-xs">
                                        +{servicesCount - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Pricing */}
                              <div className="flex flex-wrap gap-4">
                                {/* Prix Individuel */}
                                <div className="flex flex-col">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Individuel</p>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                      {priceIndividual}$
                                    </span>
                                    {savingsIndividual > 0 && (
                                      <Badge variant="warning" className="text-xs">
                                        Économie: {savingsIndividual}$
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Prix Duo */}
                                {priceDuo > 0 && (
                                  <div className="flex flex-col">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Duo</p>
                                    <div className="flex items-center gap-2">
                                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        {priceDuo}$
                                      </span>
                                      {savingsDuo > 0 && (
                                        <Badge variant="warning" className="text-xs">
                                          Économie: {savingsDuo}$
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
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
                                onClick={() => handleDeletePackage(pkg.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Reservations Tab */}
                {activeTab === 'reservations' && (
                  <div className="overflow-x-auto">
                    {filteredReservations.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Aucune réservation trouvée</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Date & Heure</TableHead>
                            <TableHead>Durée</TableHead>
                            <TableHead>Personnes</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReservations.map((reservation) => {
                            const guest = reservation.reservation?.guest;
                            const guestName = guest ? `${guest.firstName} ${guest.lastName}` : 'Client inconnu';
                            const serviceName = reservation.spaService?.nom || reservation.spaService?.name || 'Service inconnu';
                            const duration = reservation.duree || reservation.duration || 0;
                            const price = reservation.prix || reservation.totalAmount || 0;
                            const time = reservation.heure || reservation.time || '';
                            const nombrePersonnes = reservation.nombrePersonnes || 1;

                            return (
                              <TableRow key={reservation.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      {guestName}
                                    </div>
                                    {guest?.email && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {guest.email}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                    {serviceName}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    <div className="text-sm">
                                      <div className="text-gray-900 dark:text-gray-100">
                                        {isMounted ? formatDate(reservation.date) : reservation.date}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {time}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {duration} min
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {nombrePersonnes}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                      {price}$
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getReservationStatusColor(reservation.status)} size="sm">
                                    {reservation.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() => handleViewReservationDetails(reservation)}
                                      title="Voir les détails"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {reservation.status === 'PENDING' && (
                                      <Button
                                        size="sm"
                                        variant="success"
                                        onClick={() => handleConfirmPayment(reservation.id)}
                                        title="Valider le paiement"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {reservation.status !== 'CANCELLED' && (
                                      <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => handleCancelReservation(reservation.id)}
                                        title="Annuler"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
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

        {/* Create Service Modal */}
        <Modal
          isOpen={showCreateServiceModal}
          onClose={() => setShowCreateServiceModal(false)}
          title="Nouveau Service Spa"
          size="lg"
        >
          <form className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {/* Service Information Section */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Informations du Service
              </h4>
              <div className="space-y-4">
                <Input
                  label="Nom du Service"
                  value={newService.nom}
                  onChange={(e) => setNewService({ ...newService, nom: e.target.value })}
                  placeholder="Ex: Massage Relaxant"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Décrivez le service..."
                    rows={3}
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <Select
                  label="Catégorie"
                  value={newService.categorie}
                  onChange={(e) => setNewService({ ...newService, categorie: e.target.value })}
                  options={[
                    { value: '', label: 'Sélectionnez une catégorie' },
                    { value: 'massage', label: 'Massage' },
                    { value: 'soin-visage', label: 'Soin Visage' },
                    { value: 'soin-corps', label: 'Soin Corps' },
                    { value: 'rituel', label: 'Rituel' },
                    { value: 'beaute', label: 'Beauté' },
                  ]}
                  required
                />
              </div>
            </div>

            {/* Duration and Pricing Section */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Durées et Prix
              </h4>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Durées disponibles (minutes)"
                    value={newService.durees}
                    onChange={(e) => setNewService({ ...newService, durees: e.target.value })}
                    placeholder="Ex: 60,90,120"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Séparez les durées par des virgules
                  </p>
                </div>
                <div>
                  <Input
                    label="Prix par durée"
                    value={newService.prix}
                    onChange={(e) => setNewService({ ...newService, prix: e.target.value })}
                    placeholder="Ex: 60:100,90:150,120:200"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Format: durée:prix (Ex: 60:100 pour 100$ pour 60 minutes)
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Bienfaits
              </h4>
              <div>
                <Input
                  label="Bienfaits du Service"
                  value={newService.bienfaits}
                  onChange={(e) => setNewService({ ...newService, bienfaits: e.target.value })}
                  placeholder="Ex: Relaxation,Détente musculaire,Amélioration circulation"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Séparez les bienfaits par des virgules
                </p>
              </div>
            </div>
          </form>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setShowCreateServiceModal(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateService}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création...' : 'Créer le Service'}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Modal Détails de la Réservation */}
        {showReservationDetailsModal && selectedReservation && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              {/* Overlay */}
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
                onClick={handleCloseReservationDetails}
              ></div>

              {/* Modal */}
              <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Détails de la Réservation
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {selectedReservation.id?.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseReservationDetails}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {/* Informations Client et Statut */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informations Client */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Informations Client
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Nom:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedReservation.reservation?.guest?.firstName}{' '}
                            {selectedReservation.reservation?.guest?.lastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Email:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedReservation.reservation?.guest?.email || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Téléphone:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedReservation.reservation?.guest?.phone || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Informations Service */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Service Spa
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Service:</span>{' '}
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            {selectedReservation.spaService?.nom || selectedReservation.spaService?.name || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Catégorie:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedReservation.spaService?.categorie || selectedReservation.spaService?.category || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Description:</span>{' '}
                          <span className="text-gray-700 dark:text-gray-300">
                            {selectedReservation.spaService?.description || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Détails de la Réservation */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Détails de la Réservation
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Date</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {isMounted ? formatDate(selectedReservation.date) : selectedReservation.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Heure</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedReservation.heure || selectedReservation.time || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Durée</p>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {selectedReservation.duree || selectedReservation.duration || 0} min
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Personnes</p>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {selectedReservation.nombrePersonnes || 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prix et Statut */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Prix Total</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {selectedReservation.prix || selectedReservation.totalAmount || 0}$
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">Statut</span>
                        <Badge variant={getReservationStatusColor(selectedReservation.status)} size="lg">
                          {selectedReservation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Notes spéciales si disponibles */}
                  {selectedReservation.notes && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                        Notes Spéciales
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedReservation.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between gap-3">
                  <Button variant="secondary" onClick={handleCloseReservationDetails}>
                    Fermer
                  </Button>
                  <div className="flex gap-3">
                    {selectedReservation.status === 'PENDING' && (
                      <Button
                        variant="success"
                        onClick={() => handleConfirmPayment(selectedReservation.id)}
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                      >
                        Valider le Paiement
                      </Button>
                    )}
                    {selectedReservation.status !== 'CANCELLED' && selectedReservation.status !== 'CONFIRMED' && (
                      <Button
                        variant="danger"
                        onClick={() => {
                          handleCancelReservation(selectedReservation.id);
                          handleCloseReservationDetails();
                        }}
                      >
                        Annuler la Réservation
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
