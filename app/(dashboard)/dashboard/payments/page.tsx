'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { Card, CardBody, CardHeader, Badge, Button, Table } from '../../../components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPayments,
  fetchPaymentStats,
  refundPayment,
} from '@/store/slices/paymentSlice';
import {
  fetchInvoices,
  sendInvoice,
  downloadInvoicePDF,
} from '@/store/slices/invoiceSlice';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Send,
  RefreshCw,
  Eye,
  X,
} from 'lucide-react';
import { useClientDate } from '../../../hooks/useClientDate';

export default function PaymentsPage() {
  const dispatch = useAppDispatch();
  const { formatDate } = useClientDate();
  const { payments, stats: paymentStats, isLoading: paymentsLoading } = useAppSelector(
    (state) => state.payments
  );
  const { invoices, isLoading: invoicesLoading } = useAppSelector((state) => state.invoices);

  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

  useEffect(() => {
    dispatch(fetchPayments({}));
    dispatch(fetchPaymentStats());
    dispatch(fetchInvoices({}));
  }, [dispatch]);

  const handleRefund = async (paymentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir rembourser ce paiement?')) {
      try {
        await dispatch(refundPayment({ id: paymentId })).unwrap();
        alert('Paiement remboursé avec succès');
        dispatch(fetchPayments({}));
      } catch (error) {
        alert('Erreur lors du remboursement');
      }
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await dispatch(sendInvoice(invoiceId)).unwrap();
      alert('Facture envoyée avec succès');
    } catch (error) {
      alert('Erreur lors de l\'envoi de la facture');
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      await dispatch(downloadInvoicePDF(invoiceId)).unwrap();
    } catch (error) {
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const handleViewInvoiceDetails = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  const handleCloseInvoiceDetails = () => {
    setSelectedInvoice(null);
    setShowInvoiceDetails(false);
  };

  const getPaymentStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      case 'REFUNDED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CARD':
        return 'Carte';
      case 'CASH':
        return 'Espèces';
      case 'BANK_TRANSFER':
        return 'Virement';
      default:
        return method;
    }
  };

  const getInvoiceStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'SENT':
        return 'info';
      case 'DRAFT':
        return 'default';
      case 'OVERDUE':
        return 'danger';
      case 'CANCELLED':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            💳 Paiements & Factures
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les paiements et factures
          </p>
        </div>

        {/* Stats Cards */}
        {paymentStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Revenu Total
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      ${paymentStats.totalRevenue?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Paiements Payés
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      ${paymentStats.totalPaid?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      En Attente
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      ${paymentStats.totalPending?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <CreditCard className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Remboursé
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      ${paymentStats.totalRefunded?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'payments'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Paiements
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'invoices'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Factures
          </button>
        </div>

        {/* Payments Table */}
        {activeTab === 'payments' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Liste des Paiements
              </h2>
            </CardHeader>
            <CardBody>
              {paymentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Chargement...</p>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Aucun paiement trouvé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Montant</th>
                        <th>Méthode</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="font-mono text-sm">{payment.id.substring(0, 8)}...</td>
                          <td className="font-semibold">${payment.amount.toLocaleString()}</td>
                          <td>{getPaymentMethodLabel(payment.method)}</td>
                          <td>
                            <Badge variant={getPaymentStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </td>
                          <td>
                            {payment.paidAt
                              ? formatDate(payment.paidAt, 'dd/MM/yyyy HH:mm')
                              : '-'}
                          </td>
                          <td>
                            {payment.status === 'COMPLETED' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleRefund(payment.id)}
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Rembourser
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Invoices Table */}
        {activeTab === 'invoices' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Liste des Factures
              </h2>
            </CardHeader>
            <CardBody>
              {invoicesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Chargement...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Aucune facture trouvée</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <thead>
                      <tr>
                        <th>N° Facture</th>
                        <th>Total</th>
                        <th>Payé</th>
                        <th>Statut</th>
                        <th>Date d'émission</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="font-mono">{invoice.invoiceNumber}</td>
                          <td className="font-semibold">${invoice.total.toLocaleString()}</td>
                          <td>${invoice.paidAmount.toLocaleString()}</td>
                          <td>
                            <Badge variant={getInvoiceStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td>{formatDate(invoice.issueDate)}</td>
                          <td>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleViewInvoiceDetails(invoice)}
                                title="Voir les détails"
                                leftIcon={<Eye className="w-4 h-4" />}
                              >
                                Détails
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleDownloadPDF(invoice.id)}
                                title="Télécharger PDF"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              {invoice.status !== 'PAID' && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleSendInvoice(invoice.id)}
                                  title="Envoyer par email"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Modal Détails de la Facture */}
        {showInvoiceDetails && selectedInvoice && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              {/* Overlay */}
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
                onClick={handleCloseInvoiceDetails}
              ></div>

              {/* Modal */}
              <div className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Facture {selectedInvoice.invoiceNumber}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Émise le {formatDate(selectedInvoice.issueDate)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseInvoiceDetails}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {/* Info principales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informations Client */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Informations Client
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Nom:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedInvoice.reservation?.guest?.firstName}{' '}
                            {selectedInvoice.reservation?.guest?.lastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Email:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedInvoice.reservation?.guest?.email}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Téléphone:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedInvoice.reservation?.guest?.phone || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Informations Réservation */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Informations Réservation
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">N° Réservation:</span>{' '}
                          <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                            {selectedInvoice.reservationId?.substring(0, 8)}...
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Type de chambre:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedInvoice.reservation?.roomType || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Période:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedInvoice.reservation?.checkInDate && formatDate(selectedInvoice.reservation.checkInDate)}{' '}
                            - {selectedInvoice.reservation?.checkOutDate && formatDate(selectedInvoice.reservation.checkOutDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Détails de la facture */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Quantité
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Prix unitaire
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Montant
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                          selectedInvoice.items.map((item: any, index: number) => (
                            <tr key={index}>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                {item.description}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right">
                                ${item.unitPrice.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                                ${(item.quantity * item.unitPrice).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                              Réservation {selectedInvoice.reservation?.roomType}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right">
                              1
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right">
                              ${selectedInvoice.subtotal?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                              ${selectedInvoice.subtotal?.toLocaleString()}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculs */}
                  <div className="flex justify-end">
                    <div className="w-full max-w-md space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Sous-total:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          ${(selectedInvoice.subtotal || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Taxes ({selectedInvoice.taxRate || 0}%):</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          ${(selectedInvoice.tax || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                        <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                          ${(selectedInvoice.total || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Montant payé:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          ${(selectedInvoice.paidAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Reste à payer:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          ${((selectedInvoice.total || 0) - (selectedInvoice.paidAmount || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Statut de paiement:</span>
                    </div>
                    <Badge variant={getInvoiceStatusColor(selectedInvoice.status)} size="lg">
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <Button variant="secondary" onClick={handleCloseInvoiceDetails}>
                    Fermer
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleDownloadPDF(selectedInvoice.id)}
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Télécharger PDF
                  </Button>
                  {selectedInvoice.status !== 'PAID' && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleSendInvoice(selectedInvoice.id);
                        handleCloseInvoiceDetails();
                      }}
                      leftIcon={<Send className="w-4 h-4" />}
                    >
                      Envoyer par Email
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
