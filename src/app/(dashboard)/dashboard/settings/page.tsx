'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
} from '@/components/ui';
import {
  Hotel,
  Calendar,
  CreditCard,
  Bell,
  Shield,
  Users,
  Palette,
  Link as LinkIcon,
  Save,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  DollarSign,
  Lock,
  Key,
  Smartphone,
  Image,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { settingsService } from '@/lib/api/services';

type TabType = 'hotel' | 'reservations' | 'payments' | 'notifications' | 'security' | 'users' | 'appearance' | 'integrations';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('hotel');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hotel Settings
  const [hotelSettings, setHotelSettings] = useState({
    name: 'Hotel Paradise',
    email: 'contact@hotelparadise.com',
    phone: '+1 (514) 555-1234',
    address: '123 Rue Principale',
    city: 'Montréal',
    country: 'Canada',
    postalCode: 'H1A 1A1',
    website: 'www.hotelparadise.com',
    description: 'Un hôtel de luxe au cœur de la ville',
    stars: '5',
    logo: '',
  });

  // Reservation Settings
  const [reservationSettings, setReservationSettings] = useState({
    checkInTime: '15:00',
    checkOutTime: '11:00',
    minAdvanceBooking: '1',
    maxAdvanceBooking: '365',
    cancellationDeadline: '24',
    requireDeposit: 'true',
    depositPercentage: '30',
    autoConfirm: 'false',
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    currency: 'CAD',
    taxRate: '15',
    acceptCreditCard: 'true',
    acceptDebitCard: 'true',
    acceptCash: 'true',
    acceptPaypal: 'false',
    stripePublicKey: '',
    stripeSecretKey: '',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: 'true',
    smsNotifications: 'false',
    bookingConfirmation: 'true',
    paymentConfirmation: 'true',
    cancellationNotice: 'true',
    reminderBeforeCheckIn: 'true',
    reminderDays: '1',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: '8',
    requireUppercase: 'true',
    requireNumber: 'true',
    requireSpecialChar: 'true',
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    twoFactorAuth: 'false',
    ipWhitelist: '',
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    defaultLanguage: 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    logo: '',
    favicon: '',
  });

  // Integration Settings
  const [integrationSettings, setIntegrationSettings] = useState({
    googleMapsApiKey: '',
    twilioAccountSid: '',
    twilioAuthToken: '',
    sendGridApiKey: '',
    reservationWebhook: '',
    paymentWebhook: '',
  });

  const tabs = [
    { id: 'hotel', label: 'Hôtel', icon: Hotel },
    { id: 'reservations', label: 'Réservations', icon: Calendar },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'integrations', label: 'Intégrations', icon: LinkIcon },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await settingsService.getAll();

      if (settings.hotel) {
        setHotelSettings({
          name: settings.hotel.name || '',
          email: settings.hotel.email || '',
          phone: settings.hotel.phone || '',
          address: settings.hotel.address || '',
          city: settings.hotel.city || '',
          country: settings.hotel.country || '',
          postalCode: settings.hotel.postalCode || '',
          website: settings.hotel.website || '',
          description: settings.hotel.description || '',
          stars: settings.hotel.stars || '5',
          logo: settings.hotel.logo || '',
        });
      }

      if (settings.reservationPolicy) {
        setReservationSettings({
          checkInTime: settings.reservationPolicy.checkInTime || '15:00',
          checkOutTime: settings.reservationPolicy.checkOutTime || '11:00',
          minAdvanceBooking: String(settings.reservationPolicy.minAdvanceBooking || 1),
          maxAdvanceBooking: String(settings.reservationPolicy.maxAdvanceBooking || 365),
          cancellationDeadline: String(settings.reservationPolicy.cancellationDeadline || 24),
          requireDeposit: String(settings.reservationPolicy.requireDeposit || true),
          depositPercentage: String(settings.reservationPolicy.depositPercentage || 30),
          autoConfirm: String(settings.reservationPolicy.autoConfirm || false),
        });
      }

      if (settings.payment) {
        setPaymentSettings({
          currency: settings.payment.currency || 'CAD',
          taxRate: String(settings.payment.taxRate || 15),
          acceptCreditCard: String(settings.payment.acceptCreditCard || true),
          acceptDebitCard: String(settings.payment.acceptDebitCard || true),
          acceptCash: String(settings.payment.acceptCash || true),
          acceptPaypal: String(settings.payment.acceptPaypal || false),
          stripePublicKey: settings.payment.stripePublicKey || '',
          stripeSecretKey: settings.payment.stripeSecretKey || '',
        });
      }

      if (settings.notifications) {
        setNotificationSettings({
          emailNotifications: String(settings.notifications.emailNotifications || true),
          smsNotifications: String(settings.notifications.smsNotifications || false),
          bookingConfirmation: String(settings.notifications.bookingConfirmation || true),
          paymentConfirmation: String(settings.notifications.paymentConfirmation || true),
          cancellationNotice: String(settings.notifications.cancellationNotice || true),
          reminderBeforeCheckIn: String(settings.notifications.reminderBeforeCheckIn || true),
          reminderDays: String(settings.notifications.reminderDays || 1),
          smtpHost: settings.notifications.smtpHost || '',
          smtpPort: String(settings.notifications.smtpPort || 587),
          smtpUser: settings.notifications.smtpUser || '',
          smtpPassword: settings.notifications.smtpPassword || '',
        });
      }

      if (settings.security) {
        setSecuritySettings({
          passwordMinLength: String(settings.security.passwordMinLength || 8),
          requireUppercase: String(settings.security.requireUppercase || true),
          requireNumber: String(settings.security.requireNumber || true),
          requireSpecialChar: String(settings.security.requireSpecialChar || true),
          sessionTimeout: String(settings.security.sessionTimeout || 30),
          maxLoginAttempts: String(settings.security.maxLoginAttempts || 5),
          twoFactorAuth: String(settings.security.twoFactorAuth || false),
          ipWhitelist: settings.security.ipWhitelist || '',
        });
      }

      if (settings.appearance) {
        setAppearanceSettings({
          defaultLanguage: settings.appearance.defaultLanguage || 'fr',
          dateFormat: settings.appearance.dateFormat || 'DD/MM/YYYY',
          timeFormat: settings.appearance.timeFormat || '24h',
          primaryColor: settings.appearance.primaryColor || '#3B82F6',
          secondaryColor: settings.appearance.secondaryColor || '#10B981',
          logo: settings.appearance.logo || '',
          favicon: settings.appearance.favicon || '',
        });
      }

      if (settings.integrations) {
        setIntegrationSettings({
          googleMapsApiKey: settings.integrations.googleMapsApiKey || '',
          twilioAccountSid: settings.integrations.twilioAccountSid || '',
          twilioAuthToken: settings.integrations.twilioAuthToken || '',
          sendGridApiKey: settings.integrations.sendGridApiKey || '',
          reservationWebhook: settings.integrations.reservationWebhook || '',
          paymentWebhook: settings.integrations.paymentWebhook || '',
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      alert('Erreur lors du chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      // Save based on active tab
      switch (activeTab) {
        case 'hotel':
          await settingsService.updateAll({
            hotel: hotelSettings,
          });
          break;

        case 'reservations':
          await settingsService.updateReservationPolicy({
            checkInTime: reservationSettings.checkInTime,
            checkOutTime: reservationSettings.checkOutTime,
            minAdvanceBooking: parseInt(reservationSettings.minAdvanceBooking),
            maxAdvanceBooking: parseInt(reservationSettings.maxAdvanceBooking),
            cancellationDeadline: parseInt(reservationSettings.cancellationDeadline),
            requireDeposit: reservationSettings.requireDeposit === 'true',
            depositPercentage: parseInt(reservationSettings.depositPercentage),
            autoConfirm: reservationSettings.autoConfirm === 'true',
          });
          break;

        case 'payments':
          await settingsService.updatePayment({
            currency: paymentSettings.currency,
            taxRate: parseFloat(paymentSettings.taxRate),
            acceptCreditCard: paymentSettings.acceptCreditCard === 'true',
            acceptDebitCard: paymentSettings.acceptDebitCard === 'true',
            acceptCash: paymentSettings.acceptCash === 'true',
            acceptPaypal: paymentSettings.acceptPaypal === 'true',
            stripePublicKey: paymentSettings.stripePublicKey,
            stripeSecretKey: paymentSettings.stripeSecretKey,
          });
          break;

        case 'notifications':
          await settingsService.updateNotifications({
            emailNotifications: notificationSettings.emailNotifications === 'true',
            smsNotifications: notificationSettings.smsNotifications === 'true',
            bookingConfirmation: notificationSettings.bookingConfirmation === 'true',
            paymentConfirmation: notificationSettings.paymentConfirmation === 'true',
            cancellationNotice: notificationSettings.cancellationNotice === 'true',
            reminderBeforeCheckIn: notificationSettings.reminderBeforeCheckIn === 'true',
            reminderDays: parseInt(notificationSettings.reminderDays),
            smtpHost: notificationSettings.smtpHost,
            smtpPort: parseInt(notificationSettings.smtpPort),
            smtpUser: notificationSettings.smtpUser,
            smtpPassword: notificationSettings.smtpPassword,
          });
          break;

        case 'security':
          await settingsService.updateSecurity({
            passwordMinLength: parseInt(securitySettings.passwordMinLength),
            requireUppercase: securitySettings.requireUppercase === 'true',
            requireNumber: securitySettings.requireNumber === 'true',
            requireSpecialChar: securitySettings.requireSpecialChar === 'true',
            sessionTimeout: parseInt(securitySettings.sessionTimeout),
            maxLoginAttempts: parseInt(securitySettings.maxLoginAttempts),
            twoFactorAuth: securitySettings.twoFactorAuth === 'true',
            ipWhitelist: securitySettings.ipWhitelist,
          });
          break;

        case 'appearance':
          await settingsService.updateAppearance(appearanceSettings);
          break;

        case 'integrations':
          await settingsService.updateIntegrations(integrationSettings);
          break;
      }

      alert('Paramètres enregistrés avec succès!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut?')) {
      return;
    }

    try {
      setIsLoading(true);
      await settingsService.reset();
      await loadSettings();
      alert('Paramètres réinitialisés avec succès!');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      alert('Erreur lors de la réinitialisation des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Paramètres Système
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configurez les paramètres de votre système hôtelier
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleResetSettings}
              disabled={isLoading || isSaving}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Réinitialiser
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving || isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Hotel Settings */}
        {activeTab === 'hotel' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Informations de l'Hôtel
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nom de l'hôtel *"
                    value={hotelSettings.name}
                    onChange={(e) =>
                      setHotelSettings({ ...hotelSettings, name: e.target.value })
                    }
                    placeholder="Hotel Paradise"
                  />

                  <Select
                    label="Nombre d'étoiles *"
                    value={hotelSettings.stars}
                    onChange={(e) =>
                      setHotelSettings({ ...hotelSettings, stars: e.target.value })
                    }
                    options={[
                      { value: '1', label: '1 Étoile' },
                      { value: '2', label: '2 Étoiles' },
                      { value: '3', label: '3 Étoiles' },
                      { value: '4', label: '4 Étoiles' },
                      { value: '5', label: '5 Étoiles' },
                    ]}
                  />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={hotelSettings.description}
                      onChange={(e) =>
                        setHotelSettings({ ...hotelSettings, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Décrivez votre hôtel..."
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Adresse et Contact
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Adresse *"
                    value={hotelSettings.address}
                    onChange={(e) =>
                      setHotelSettings({ ...hotelSettings, address: e.target.value })
                    }
                    placeholder="123 Rue Principale"
                  />

                  <Input
                    label="Ville *"
                    value={hotelSettings.city}
                    onChange={(e) =>
                      setHotelSettings({ ...hotelSettings, city: e.target.value })
                    }
                    placeholder="Montréal"
                  />

                  <Input
                    label="Pays *"
                    value={hotelSettings.country}
                    onChange={(e) =>
                      setHotelSettings({ ...hotelSettings, country: e.target.value })
                    }
                    placeholder="Canada"
                  />

                  <Input
                    label="Code postal *"
                    value={hotelSettings.postalCode}
                    onChange={(e) =>
                      setHotelSettings({ ...hotelSettings, postalCode: e.target.value })
                    }
                    placeholder="H1A 1A1"
                  />

                  <Input
                    label="Email *"
                    type="email"
                    value={hotelSettings.email}
                    onChange={(e) =>
                      setHotelSettings({ ...hotelSettings, email: e.target.value })
                    }
                    placeholder="contact@hotel.com"
                  />

                  <Input
                    label="Téléphone *"
                    type="tel"
                    value={hotelSettings.phone}
                    onChange={(e) =>
                      setHotelSettings({ ...hotelSettings, phone: e.target.value })
                    }
                    placeholder="+1 (514) 555-1234"
                  />

                  <Input
                    label="Site web"
                    value={hotelSettings.website}
                    onChange={(e) =>
                      setHotelSettings({ ...hotelSettings, website: e.target.value })
                    }
                    placeholder="www.hotel.com"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Logo de l'hôtel
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Reservation Settings */}
        {activeTab === 'reservations' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Paramètres de Réservation
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Heure de check-in *"
                  type="time"
                  value={reservationSettings.checkInTime}
                  onChange={(e) =>
                    setReservationSettings({
                      ...reservationSettings,
                      checkInTime: e.target.value,
                    })
                  }
                />

                <Input
                  label="Heure de check-out *"
                  type="time"
                  value={reservationSettings.checkOutTime}
                  onChange={(e) =>
                    setReservationSettings({
                      ...reservationSettings,
                      checkOutTime: e.target.value,
                    })
                  }
                />

                <Input
                  label="Réservation minimum à l'avance (jours) *"
                  type="number"
                  value={reservationSettings.minAdvanceBooking}
                  onChange={(e) =>
                    setReservationSettings({
                      ...reservationSettings,
                      minAdvanceBooking: e.target.value,
                    })
                  }
                />

                <Input
                  label="Réservation maximum à l'avance (jours) *"
                  type="number"
                  value={reservationSettings.maxAdvanceBooking}
                  onChange={(e) =>
                    setReservationSettings({
                      ...reservationSettings,
                      maxAdvanceBooking: e.target.value,
                    })
                  }
                />

                <Input
                  label="Délai d'annulation gratuite (heures) *"
                  type="number"
                  value={reservationSettings.cancellationDeadline}
                  onChange={(e) =>
                    setReservationSettings({
                      ...reservationSettings,
                      cancellationDeadline: e.target.value,
                    })
                  }
                />

                <Input
                  label="Pourcentage d'acompte (%)"
                  type="number"
                  value={reservationSettings.depositPercentage}
                  onChange={(e) =>
                    setReservationSettings({
                      ...reservationSettings,
                      depositPercentage: e.target.value,
                    })
                  }
                />

                <Select
                  label="Exiger un acompte *"
                  value={reservationSettings.requireDeposit}
                  onChange={(e) =>
                    setReservationSettings({
                      ...reservationSettings,
                      requireDeposit: e.target.value,
                    })
                  }
                  options={[
                    { value: 'true', label: 'Oui' },
                    { value: 'false', label: 'Non' },
                  ]}
                />

                <Select
                  label="Confirmation automatique *"
                  value={reservationSettings.autoConfirm}
                  onChange={(e) =>
                    setReservationSettings({
                      ...reservationSettings,
                      autoConfirm: e.target.value,
                    })
                  }
                  options={[
                    { value: 'true', label: 'Oui' },
                    { value: 'false', label: 'Non' },
                  ]}
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Payment Settings */}
        {activeTab === 'payments' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Paramètres de Paiement
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Devise principale *"
                  value={paymentSettings.currency}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, currency: e.target.value })
                  }
                  options={[
                    { value: 'CAD', label: 'CAD - Dollar canadien' },
                    { value: 'USD', label: 'USD - Dollar américain' },
                    { value: 'EUR', label: 'EUR - Euro' },
                    { value: 'GBP', label: 'GBP - Livre sterling' },
                  ]}
                />

                <Input
                  label="Taux de taxe (%) *"
                  type="number"
                  value={paymentSettings.taxRate}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, taxRate: e.target.value })
                  }
                />

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Moyens de paiement acceptés
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={paymentSettings.acceptCreditCard === 'true'}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            acceptCreditCard: e.target.checked ? 'true' : 'false',
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Carte de crédit
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={paymentSettings.acceptDebitCard === 'true'}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            acceptDebitCard: e.target.checked ? 'true' : 'false',
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Carte de débit
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={paymentSettings.acceptCash === 'true'}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            acceptCash: e.target.checked ? 'true' : 'false',
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Espèces
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={paymentSettings.acceptPaypal === 'true'}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            acceptPaypal: e.target.checked ? 'true' : 'false',
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        PayPal
                      </span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Configuration Stripe
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Clé publique Stripe"
                      value={paymentSettings.stripePublicKey}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          stripePublicKey: e.target.value,
                        })
                      }
                      placeholder="pk_live_..."
                    />

                    <Input
                      label="Clé secrète Stripe"
                      type="password"
                      value={paymentSettings.stripeSecretKey}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          stripeSecretKey: e.target.value,
                        })
                      }
                      placeholder="sk_live_..."
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Paramètres de Notification
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Types de notifications
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications === 'true'}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: e.target.checked ? 'true' : 'false',
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Notifications par email
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications === 'true'}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            smsNotifications: e.target.checked ? 'true' : 'false',
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Notifications par SMS
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.bookingConfirmation === 'true'}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            bookingConfirmation: e.target.checked ? 'true' : 'false',
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Confirmation de réservation
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.paymentConfirmation === 'true'}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            paymentConfirmation: e.target.checked ? 'true' : 'false',
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Confirmation de paiement
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.cancellationNotice === 'true'}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            cancellationNotice: e.target.checked ? 'true' : 'false',
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Avis d'annulation
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.reminderBeforeCheckIn === 'true'}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            reminderBeforeCheckIn: e.target.checked ? 'true' : 'false',
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Rappel avant check-in
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Rappel X jours avant check-in"
                    type="number"
                    value={notificationSettings.reminderDays}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        reminderDays: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Configuration SMTP (Email)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Hôte SMTP"
                      value={notificationSettings.smtpHost}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          smtpHost: e.target.value,
                        })
                      }
                      placeholder="smtp.gmail.com"
                    />

                    <Input
                      label="Port SMTP"
                      type="number"
                      value={notificationSettings.smtpPort}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          smtpPort: e.target.value,
                        })
                      }
                      placeholder="587"
                    />

                    <Input
                      label="Utilisateur SMTP"
                      value={notificationSettings.smtpUser}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          smtpUser: e.target.value,
                        })
                      }
                      placeholder="noreply@hotel.com"
                    />

                    <Input
                      label="Mot de passe SMTP"
                      type="password"
                      value={notificationSettings.smtpPassword}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          smtpPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Paramètres de Sécurité
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Politique de mots de passe
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Longueur minimale *"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordMinLength: e.target.value,
                        })
                      }
                    />

                    <Input
                      label="Tentatives de connexion max *"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          maxLoginAttempts: e.target.value,
                        })
                      }
                    />

                    <div className="md:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={securitySettings.requireUppercase === 'true'}
                            onChange={(e) =>
                              setSecuritySettings({
                                ...securitySettings,
                                requireUppercase: e.target.checked ? 'true' : 'false',
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Exiger une majuscule
                          </span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={securitySettings.requireNumber === 'true'}
                            onChange={(e) =>
                              setSecuritySettings({
                                ...securitySettings,
                                requireNumber: e.target.checked ? 'true' : 'false',
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Exiger un chiffre
                          </span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={securitySettings.requireSpecialChar === 'true'}
                            onChange={(e) =>
                              setSecuritySettings({
                                ...securitySettings,
                                requireSpecialChar: e.target.checked ? 'true' : 'false',
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Exiger un caractère spécial
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Sécurité des sessions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Timeout de session (minutes) *"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: e.target.value,
                        })
                      }
                    />

                    <Select
                      label="Authentification à deux facteurs *"
                      value={securitySettings.twoFactorAuth}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          twoFactorAuth: e.target.value,
                        })
                      }
                      options={[
                        { value: 'true', label: 'Activée' },
                        { value: 'false', label: 'Désactivée' },
                      ]}
                    />

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Liste blanche IP (une par ligne)
                      </label>
                      <textarea
                        value={securitySettings.ipWhitelist}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            ipWhitelist: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="192.168.1.1&#10;10.0.0.1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Users Settings */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Gestion des Utilisateurs Admin
                  </h3>
                </div>
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  Ajouter un admin
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  La gestion des utilisateurs admin sera disponible prochainement
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Apparence et Personnalisation
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Langue par défaut *"
                  value={appearanceSettings.defaultLanguage}
                  onChange={(e) =>
                    setAppearanceSettings({
                      ...appearanceSettings,
                      defaultLanguage: e.target.value,
                    })
                  }
                  options={[
                    { value: 'fr', label: 'Français' },
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                  ]}
                />

                <Select
                  label="Format de date *"
                  value={appearanceSettings.dateFormat}
                  onChange={(e) =>
                    setAppearanceSettings({
                      ...appearanceSettings,
                      dateFormat: e.target.value,
                    })
                  }
                  options={[
                    { value: 'DD/MM/YYYY', label: 'JJ/MM/AAAA' },
                    { value: 'MM/DD/YYYY', label: 'MM/JJ/AAAA' },
                    { value: 'YYYY-MM-DD', label: 'AAAA-MM-JJ' },
                  ]}
                />

                <Select
                  label="Format d'heure *"
                  value={appearanceSettings.timeFormat}
                  onChange={(e) =>
                    setAppearanceSettings({
                      ...appearanceSettings,
                      timeFormat: e.target.value,
                    })
                  }
                  options={[
                    { value: '24h', label: '24 heures' },
                    { value: '12h', label: '12 heures (AM/PM)' },
                  ]}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Couleur principale
                  </label>
                  <input
                    type="color"
                    value={appearanceSettings.primaryColor}
                    onChange={(e) =>
                      setAppearanceSettings({
                        ...appearanceSettings,
                        primaryColor: e.target.value,
                      })
                    }
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Couleur secondaire
                  </label>
                  <input
                    type="color"
                    value={appearanceSettings.secondaryColor}
                    onChange={(e) =>
                      setAppearanceSettings({
                        ...appearanceSettings,
                        secondaryColor: e.target.value,
                      })
                    }
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Logo du système
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Favicon
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Integrations Settings */}
        {activeTab === 'integrations' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Intégrations et API
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Clés API
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Google Maps API Key"
                      type="password"
                      value={integrationSettings.googleMapsApiKey}
                      onChange={(e) =>
                        setIntegrationSettings({
                          ...integrationSettings,
                          googleMapsApiKey: e.target.value,
                        })
                      }
                      placeholder="AIzaSy..."
                    />

                    <Input
                      label="Twilio Account SID (SMS)"
                      type="password"
                      value={integrationSettings.twilioAccountSid}
                      onChange={(e) =>
                        setIntegrationSettings({
                          ...integrationSettings,
                          twilioAccountSid: e.target.value,
                        })
                      }
                      placeholder="AC..."
                    />

                    <Input
                      label="Twilio Auth Token"
                      type="password"
                      value={integrationSettings.twilioAuthToken}
                      onChange={(e) =>
                        setIntegrationSettings({
                          ...integrationSettings,
                          twilioAuthToken: e.target.value,
                        })
                      }
                      placeholder="..."
                    />

                    <Input
                      label="SendGrid API Key (Email)"
                      type="password"
                      value={integrationSettings.sendGridApiKey}
                      onChange={(e) =>
                        setIntegrationSettings({
                          ...integrationSettings,
                          sendGridApiKey: e.target.value,
                        })
                      }
                      placeholder="SG..."
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Webhooks
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="URL Webhook pour nouvelles réservations"
                      value={integrationSettings.reservationWebhook}
                      onChange={(e) =>
                        setIntegrationSettings({
                          ...integrationSettings,
                          reservationWebhook: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />

                    <Input
                      label="URL Webhook pour paiements"
                      value={integrationSettings.paymentWebhook}
                      onChange={(e) =>
                        setIntegrationSettings({
                          ...integrationSettings,
                          paymentWebhook: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
