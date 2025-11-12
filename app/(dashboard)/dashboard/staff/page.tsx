'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { Card, CardBody, CardHeader, Button, Input, Badge, Modal, ModalFooter, Select } from '../../../components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchStaff, fetchStaffStats } from '@/store/slices/staffSlice';
import { staffService } from '@/lib/api/services';
import {
  Search,
  Plus,
  Users,
  UserCheck,
  Shield,
  Briefcase,
  Eye,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  UserCog,
} from 'lucide-react';
import { useClientDate } from '../../../hooks/useClientDate';

export default function StaffPage() {
  const dispatch = useAppDispatch();
  const { staffMembers, stats, isLoading } = useAppSelector((state) => state.staff);
  const { formatDate } = useClientDate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    role: undefined as string | undefined,
    page: 1,
    limit: 10,
  });

  // Create modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'RECEPTIONIST',
    department: '',
    shift: 'MORNING',
    salary: 0,
  });

  useEffect(() => {
    dispatch(fetchStaff(filters));
    dispatch(fetchStaffStats());
  }, [dispatch, filters]);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleCreateStaff = async () => {
    setIsSubmitting(true);
    try {
      await staffService.create(newStaff);
      alert('Staff member created successfully!');
      setShowCreateModal(false);
      // Reset form
      setNewStaff({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'RECEPTIONIST',
        department: '',
        shift: 'MORNING',
        salary: 0,
      });
      // Refresh staff list
      dispatch(fetchStaff(filters));
      dispatch(fetchStaffStats());
    } catch (error) {
      alert('Error creating staff member');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staffMembers.filter((staff) =>
    searchTerm
      ? staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleColor = (role: string): 'danger' | 'warning' | 'info' | 'success' | 'purple' | 'default' => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'danger';
      case 'ADMIN':
        return 'warning';
      case 'MANAGER':
        return 'purple';
      case 'RECEPTIONIST':
        return 'info';
      case 'ACCOUNTANT':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'Admin',
      MANAGER: 'Manager',
      RECEPTIONIST: 'Réceptionniste',
      HOUSEKEEPER: 'Femme de Ménage',
      MAINTENANCE: 'Maintenance',
      ACCOUNTANT: 'Comptable',
    };
    return labels[role] || role;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              👥 Gestion du Personnel
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez votre équipe et leurs rôles
            </p>
          </div>
          <Button variant="primary" className="w-full md:w-auto" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Membre
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
                      Total Personnel
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.total?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8% ce mois
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Personnel Actif
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.active?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      En service
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
                      Administrateurs
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.byRole?.ADMIN?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Gestion système
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Réceptionnistes
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.byRole?.RECEPTIONIST?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Service client
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Briefcase className="w-7 h-7 text-white" />
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
                    placeholder="Rechercher par nom, email, rôle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filters.role === undefined ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, role: undefined, page: 1 })}
                  className="min-w-[80px]"
                >
                  Tous
                </Button>
                <Button
                  variant={filters.role === 'ADMIN' ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, role: 'ADMIN', page: 1 })}
                  className="min-w-[80px]"
                >
                  Admin
                </Button>
                <Button
                  variant={filters.role === 'RECEPTIONIST' ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, role: 'RECEPTIONIST', page: 1 })}
                  className="min-w-[120px]"
                >
                  Réception
                </Button>
                <Button variant="primary" onClick={handleSearch} className="min-w-[120px]">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Staff List */}
        <Card>
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Liste du Personnel
              </h2>
              <Badge variant="info" className="text-sm px-3 py-1">
                {filteredStaff.length} membres
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Chargement du personnel...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCog className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Aucun membre trouvé</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {getInitials(staff.firstName, staff.lastName)}
                            </span>
                          </div>
                          {staff.isActive && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {staff.firstName} {staff.lastName}
                            </h3>
                            <Badge variant={getRoleColor(staff.role)} className="text-xs">
                              {getRoleLabel(staff.role)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{staff.email}</span>
                            </div>
                            {staff.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <span>{staff.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info Cards */}
                      <div className="flex flex-wrap lg:flex-nowrap gap-3 lg:gap-4">
                        {/* Department */}
                        {staff.department && (
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg px-4 py-2.5 min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <div>
                                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Département</p>
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                                  {staff.department}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status */}
                        <div className={`bg-gradient-to-br rounded-lg px-4 py-2.5 min-w-[140px] ${
                          staff.isActive
                            ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
                            : 'from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50'
                        }`}>
                          <div className="flex items-center gap-2">
                            <UserCheck className={`w-4 h-4 ${
                              staff.isActive
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                            <div>
                              <p className={`text-xs font-medium ${
                                staff.isActive
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>Statut</p>
                              <p className={`text-sm font-semibold ${
                                staff.isActive
                                  ? 'text-green-900 dark:text-green-100'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {staff.isActive ? 'Actif' : 'Inactif'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Hire Date */}
                        {staff.createdAt && (
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg px-4 py-2.5 min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Embauché le</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {formatDate(staff.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            className="h-full min-w-[100px]"
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
            {filteredStaff.length > 0 && (
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

        {/* Create Staff Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Nouveau Membre du Personnel"
          size="lg"
        >
          <form className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {/* Personal Information Section */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Informations Personnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={newStaff.firstName}
                  onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                  placeholder="Entrez le prénom"
                  required
                />
                <Input
                  label="Nom"
                  value={newStaff.lastName}
                  onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                  placeholder="Entrez le nom"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {/* Job Information Section */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Informations Professionnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Rôle"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  options={[
                    { value: 'MANAGER', label: 'Manager' },
                    { value: 'RECEPTIONIST', label: 'Réceptionniste' },
                    { value: 'HOUSEKEEPING', label: 'Femme de Ménage' },
                    { value: 'MAINTENANCE', label: 'Maintenance' },
                    { value: 'CONCIERGE', label: 'Concierge' },
                  ]}
                  required
                />
                <Input
                  label="Département"
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  placeholder="Ex: Réception, Housekeeping"
                />
                <Select
                  label="Shift"
                  value={newStaff.shift}
                  onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                  options={[
                    { value: 'MORNING', label: 'Matin (6h-14h)' },
                    { value: 'AFTERNOON', label: 'Après-midi (14h-22h)' },
                    { value: 'NIGHT', label: 'Nuit (22h-6h)' },
                  ]}
                  required
                />
                <Input
                  label="Salaire"
                  type="number"
                  value={newStaff.salary}
                  onChange={(e) => setNewStaff({ ...newStaff, salary: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </form>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateStaff}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création...' : 'Créer le Membre'}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
