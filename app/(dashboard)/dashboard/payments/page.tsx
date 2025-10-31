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
                                variant="secondary"
                                onClick={() => handleDownloadPDF(invoice.id)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              {invoice.status !== 'PAID' && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleSendInvoice(invoice.id)}
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
      </div>
    </DashboardLayout>
  );
}
