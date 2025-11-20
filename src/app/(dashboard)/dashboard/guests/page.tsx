'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardBody, CardHeader, Button, Input, Badge, Modal, ModalFooter } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGuests, fetchGuestStats } from '@/store/slices/guestSlice';
import {
  Search,
  Plus,
  Users as UsersIcon,
  Star,
  UserCheck,
  Award,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  User,
  Briefcase,
  CreditCard,
  Globe
} from 'lucide-react';
import { useClientDate } from '@/hooks/useClientDate';
import { guestService } from '@/lib/api/services';

export default function GuestsPage() {
  const dispatch = useAppDispatch();
  const { guests, stats, isLoading } = useAppSelector((state) => state.guests);
  const { formatDate } = useClientDate();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGuest, setNewGuest] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
  });
  const [filters, setFilters] = useState({
    search: '',
    isVIP: undefined as boolean | undefined,
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    dispatch(fetchGuests(filters));
    dispatch(fetchGuestStats());
  }, [dispatch, filters]);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGuest.email || !newGuest.firstName || !newGuest.lastName) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);
      await guestService.create(newGuest);
      setShowCreateModal(false);
      setNewGuest({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        dateOfBirth: '',
        nationality: '',
        passportNumber: '',
      });
      dispatch(fetchGuests(filters));
      dispatch(fetchGuestStats());
    } catch (error) {
      console.error('Failed to create guest:', error);
      alert('Erreur lors de la création du client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGuests = guests.filter((guest) =>
    searchTerm
      ? guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleViewGuest = async (guestId: string) => {
    try {
      const guestDetails = await guestService.getById(guestId);
      setSelectedGuest(guestDetails);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch guest details:', error);
      alert('Erreur lors du chargement des détails du client');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              👥 Gestion des Clients
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos clients et leur programme de fidélité
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full md:w-auto"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Client
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Clients
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.total?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% ce mois
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <UsersIcon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Clients VIP
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.vip?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Programme premium
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Nouveaux Ce Mois
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.newThisMonth?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Inscriptions récentes
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <UserCheck className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Clients Réguliers
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.repeatGuests?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Fidélité élevée
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher par nom, email, téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filters.isVIP === undefined ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, isVIP: undefined, page: 1 })}
                  className="min-w-[80px]"
                >
                  Tous
                </Button>
                <Button
                  variant={filters.isVIP === true ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, isVIP: true, page: 1 })}
                  className="min-w-[80px]"
                >
                  <Star className="w-4 h-4 mr-1" />
                  VIP
                </Button>
                <Button variant="primary" onClick={handleSearch} className="min-w-[120px]">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Guests List */}
        <Card>
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Liste des Clients
              </h2>
              <Badge variant="info" className="text-sm px-3 py-1">
                {filteredGuests.length} clients
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Chargement des clients...</p>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Aucun client trouvé</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {getInitials(guest.firstName, guest.lastName)}
                            </span>
                          </div>
                          {guest.isVIP && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                              <Star className="w-3 h-3 text-white fill-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {guest.firstName} {guest.lastName}
                            </h3>
                            <Badge variant={guest.isVIP ? 'warning' : 'default'} className="text-xs">
                              {guest.isVIP ? 'VIP' : 'Standard'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{guest.email}</span>
                            </div>
                            {guest.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <span>{guest.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info Cards */}
                      <div className="flex flex-wrap lg:flex-nowrap gap-3 lg:gap-4">
                        {/* Loyalty Points */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg px-4 py-2.5 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <div>
                              <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Points</p>
                              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                {guest.loyaltyPoints || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        {guest.city && (
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg px-4 py-2.5 min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <div>
                                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Localisation</p>
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                                  {guest.city}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Join Date */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg px-4 py-2.5 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Membre depuis</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {formatDate(guest.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            className="h-full min-w-[100px]"
                            onClick={() => handleViewGuest(guest.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination (if needed) */}
            {filteredGuests.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button variant="secondary" size="sm" disabled>
                  Précédent
                </Button>
                <div className="flex items-center gap-1">
                  <Button variant="primary" size="sm">1</Button>
                  <Button variant="secondary" size="sm">2</Button>
                  <Button variant="secondary" size="sm">3</Button>
                </div>
                <Button variant="secondary" size="sm">
                  Suivant
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Create Guest Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => !isSubmitting && setShowCreateModal(false)}
          title="Nouveau Client"
          size="lg"
        >
          <form onSubmit={handleCreateGuest} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom *"
                  type="text"
                  value={newGuest.firstName}
                  onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                  placeholder="Jean"
                  required
                  disabled={isSubmitting}
                />
                <Input
                  label="Nom *"
                  type="text"
                  value={newGuest.lastName}
                  onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                  placeholder="Dupont"
                  required
                  disabled={isSubmitting}
                />
                <Input
                  label="Email *"
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  placeholder="jean.dupont@email.com"
                  required
                  disabled={isSubmitting}
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  disabled={isSubmitting}
                />
                <Input
                  label="Date de naissance"
                  type="date"
                  value={newGuest.dateOfBirth}
                  onChange={(e) => setNewGuest({ ...newGuest, dateOfBirth: e.target.value })}
                  disabled={isSubmitting}
                />
                <Input
                  label="Nationalité"
                  type="text"
                  value={newGuest.nationality}
                  onChange={(e) => setNewGuest({ ...newGuest, nationality: e.target.value })}
                  placeholder="Française"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Adresse */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Adresse
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Adresse"
                    type="text"
                    value={newGuest.address}
                    onChange={(e) => setNewGuest({ ...newGuest, address: e.target.value })}
                    placeholder="123 rue Example"
                    disabled={isSubmitting}
                  />
                </div>
                <Input
                  label="Ville"
                  type="text"
                  value={newGuest.city}
                  onChange={(e) => setNewGuest({ ...newGuest, city: e.target.value })}
                  placeholder="Paris"
                  disabled={isSubmitting}
                />
                <Input
                  label="Pays"
                  type="text"
                  value={newGuest.country}
                  onChange={(e) => setNewGuest({ ...newGuest, country: e.target.value })}
                  placeholder="France"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Document */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Document d'identité
              </h3>
              <Input
                label="Numéro de passeport"
                type="text"
                value={newGuest.passportNumber}
                onChange={(e) => setNewGuest({ ...newGuest, passportNumber: e.target.value })}
                placeholder="AB123456"
                disabled={isSubmitting}
              />
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                {isSubmitting ? 'Création...' : 'Créer le client'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* Guest Details Modal */}
        {selectedGuest && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title={`Détails du client`}
            size="xl"
          >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Header avec Avatar */}
              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {getInitials(selectedGuest.firstName, selectedGuest.lastName)}
                    </span>
                  </div>
                  {selectedGuest.isVIP && (
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedGuest.firstName} {selectedGuest.lastName}
                    </h2>
                    <Badge variant={selectedGuest.isVIP ? 'warning' : 'default'}>
                      {selectedGuest.isVIP ? 'VIP' : 'Standard'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedGuest.email}
                  </p>
                </div>
              </div>

              {/* Informations Personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations Personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Téléphone</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {selectedGuest.phone || 'Non renseigné'}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date de naissance</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {selectedGuest.dateOfBirth ? formatDate(selectedGuest.dateOfBirth) : 'Non renseigné'}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nationalité</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {selectedGuest.nationality || 'Non renseigné'}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Passeport</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {selectedGuest.passportNumber || 'Non renseigné'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Adresse
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Adresse complète</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {selectedGuest.address || 'Non renseigné'}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Ville</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {selectedGuest.city || 'Non renseigné'}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Pays</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {selectedGuest.country || 'Non renseigné'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Programme de fidélité */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Programme de Fidélité
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Points de fidélité</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {selectedGuest.loyaltyPoints || 0}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Statut</p>
                    </div>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {selectedGuest.isVIP ? 'Client VIP' : 'Client Standard'}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Membre depuis</p>
                    </div>
                    <p className="text-base font-bold text-green-900 dark:text-green-100">
                      {formatDate(selectedGuest.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Informations Système
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">ID Client</p>
                    <p className="text-xs font-mono text-gray-900 dark:text-gray-100 break-all">
                      {selectedGuest.id}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Dernière mise à jour</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {formatDate(selectedGuest.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button
                variant="secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Fermer
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
