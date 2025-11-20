'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { Card, CardBody, CardHeader, Button, Input, Badge, Modal, ModalFooter } from '../../../components/ui';
import {
  Search,
  Star,
  MessageSquare,
  TrendingUp,
  Eye,
  Trash2,
  Send,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
  MapPin,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import { reviewService, type Review, type ReviewStats } from '@/lib/api/services';
import { useClientDate } from '../../../hooks/useClientDate';

const HOTEL_ID = 'cmh3iygew00009crzsls6rlzy'; // ID de l'hôtel par défaut

export default function ReviewsPage() {
  const { formatDate, isMounted } = useClientDate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [responseText, setResponseText] = useState<{ [key: string]: string }>({});

  const [filters, setFilters] = useState({
    sentiment: undefined as string | undefined,
    isPublished: undefined as boolean | undefined,
    minRating: undefined as number | undefined,
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [filters]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const response = await reviewService.getAll(HOTEL_ID, filters);
      console.log('📊 Reviews response:', response);
      // L'API retourne { success, data: [...], meta }
      setReviews(response.data || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await reviewService.getStats(HOTEL_ID);
      console.log('📊 Stats response:', statsData);
      // L'API peut retourner { success, data: {...} } ou directement {...}
      setStats(statsData.data || statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleViewDetails = async (reviewId: string) => {
    try {
      const reviewData = await reviewService.getById(reviewId);
      console.log('📊 Review details:', reviewData);
      // L'API peut retourner { success, data: {...} } ou directement {...}
      setSelectedReview(reviewData.data || reviewData);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch review details:', error);
      alert('Erreur lors du chargement des détails');
    }
  };

  const handleRespond = async (reviewId: string) => {
    const response = responseText[reviewId];
    if (!response || response.trim() === '') {
      alert('Veuillez entrer une réponse');
      return;
    }

    try {
      await reviewService.respond(reviewId, response);
      alert('Réponse envoyée avec succès');
      setResponseText({ ...responseText, [reviewId]: '' });
      loadReviews();
      loadStats();
    } catch (error) {
      console.error('Failed to respond:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis?')) {
      try {
        await reviewService.delete(reviewId);
        alert('Avis supprimé avec succès');
        loadReviews();
        loadStats();
      } catch (error) {
        console.error('Failed to delete review:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleTogglePublish = async (reviewId: string, currentStatus: boolean) => {
    try {
      await reviewService.updatePublishStatus(reviewId, !currentStatus);
      alert(!currentStatus ? 'Avis publié' : 'Avis dépublié');
      loadReviews();
      loadStats();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      alert('Erreur lors de la modification');
    }
  };

  const filteredReviews = reviews.filter((review) =>
    searchTerm
      ? review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.guest?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.guest?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getSentimentBadge = (sentiment: string) => {
    const variants = {
      POSITIVE: { color: 'success' as const, icon: ThumbsUp, label: 'Positif' },
      NEUTRAL: { color: 'warning' as const, icon: Minus, label: 'Neutre' },
      NEGATIVE: { color: 'danger' as const, icon: ThumbsDown, label: 'Négatif' },
    };
    return variants[sentiment as keyof typeof variants] || variants.NEUTRAL;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              ⭐ Gestion des Avis Clients
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les avis et commentaires de vos clients
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Avis
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.total?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {stats.published} publiés
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Note Globale
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.averageRating?.overallRating?.toFixed(1) || '0.0'}
                    </p>
                    <div className="mt-1">
                      {renderStars(Math.round(stats.averageRating?.overallRating || 0))}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Notes Moyennes par Catégorie
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Propreté</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{stats.averageRating?.cleanlinessRating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Service</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{stats.averageRating?.serviceRating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Emplacement</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{stats.averageRating?.locationRating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Rapport Qualité/Prix</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{stats.averageRating?.valueRating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
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
                    placeholder="Rechercher dans les avis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filters.sentiment === undefined ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, sentiment: undefined, page: 1 })}
                  size="sm"
                >
                  Tous
                </Button>
                <Button
                  variant={filters.sentiment === 'POSITIVE' ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, sentiment: 'POSITIVE', page: 1 })}
                  size="sm"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Positifs
                </Button>
                <Button
                  variant={filters.sentiment === 'NEGATIVE' ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, sentiment: 'NEGATIVE', page: 1 })}
                  size="sm"
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Négatifs
                </Button>
                <Button
                  variant={filters.isPublished === true ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, isPublished: true, page: 1 })}
                  size="sm"
                >
                  Publiés
                </Button>
                <Button
                  variant={filters.isPublished === false ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, isPublished: false, page: 1 })}
                  size="sm"
                >
                  Non publiés
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Reviews List */}
        <Card>
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Liste des Avis
              </h2>
              <Badge variant="info" className="text-sm px-3 py-1">
                {filteredReviews.length} avis
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Chargement des avis...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Aucun avis trouvé</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => {
                  const sentiment = getSentimentBadge(review.sentiment);
                  const SentimentIcon = sentiment.icon;

                  return (
                    <div
                      key={review.id}
                      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                    >
                      {/* Review Header */}
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-base">
                                {review.guest?.firstName?.charAt(0) || 'C'}
                                {review.guest?.lastName?.charAt(0) || 'L'}
                              </span>
                            </div>
                            <div>
                              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {review.guest?.firstName} {review.guest?.lastName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isMounted ? formatDate(review.createdAt) : review.createdAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {renderStars(review.overallRating)}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {review.overallRating.toFixed(1)}/5
                            </span>
                            <Badge variant={sentiment.color} size="sm" className="ml-2">
                              <SentimentIcon className="w-3 h-3 mr-1" />
                              {sentiment.label}
                            </Badge>
                            {review.isPublished ? (
                              <Badge variant="success" size="sm">Publié</Badge>
                            ) : (
                              <Badge variant="warning" size="sm">En attente</Badge>
                            )}
                          </div>

                          {review.title && (
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              {review.title}
                            </h3>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {review.helpfulCount > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{review.helpfulCount}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="mb-4">
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>

                      {/* Detailed Ratings */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Propreté</p>
                            <div className="flex items-center gap-1">
                              {renderStars(review.cleanlinessRating)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Service</p>
                            <div className="flex items-center gap-1">
                              {renderStars(review.serviceRating)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Emplacement</p>
                            <div className="flex items-center gap-1">
                              {renderStars(review.locationRating)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Qualité/Prix</p>
                            <div className="flex items-center gap-1">
                              {renderStars(review.valueRating)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hotel Response */}
                      {review.responseText && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                Réponse de l'hôtel • {review.responseDate && (isMounted ? formatDate(review.responseDate) : review.responseDate)}
                              </p>
                              <p className="text-sm text-blue-900 dark:text-blue-100">
                                {review.responseText}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Response Input (if no response yet and published) */}
                      {!review.responseText && review.isPublished && (
                        <div className="mb-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Répondre à cet avis..."
                              value={responseText[review.id] || ''}
                              onChange={(e) =>
                                setResponseText({ ...responseText, [review.id]: e.target.value })
                              }
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleRespond(review.id)}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Envoyer
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleViewDetails(review.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Détails
                        </Button>
                        <Button
                          size="sm"
                          variant={review.isPublished ? "warning" : "primary"}
                          onClick={() => handleTogglePublish(review.id, review.isPublished)}
                        >
                          {review.isPublished ? 'Dépublier' : 'Publier'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Details Modal */}
        {selectedReview && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title="Détails de l'avis"
            size="xl"
          >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Guest Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {selectedReview.guest?.firstName?.charAt(0) || 'C'}
                    {selectedReview.guest?.lastName?.charAt(0) || 'L'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedReview.guest?.firstName} {selectedReview.guest?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedReview.guest?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Posté le {isMounted ? formatDate(selectedReview.createdAt) : selectedReview.createdAt}
                  </p>
                </div>
              </div>

              {/* Rating Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Notes détaillées</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Note globale</span>
                      <div className="flex items-center gap-2">
                        {renderStars(selectedReview.overallRating)}
                        <span className="font-semibold">{selectedReview.overallRating}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Propreté</span>
                      <div className="flex items-center gap-2">
                        {renderStars(selectedReview.cleanlinessRating)}
                        <span className="font-semibold">{selectedReview.cleanlinessRating}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Service</span>
                      <div className="flex items-center gap-2">
                        {renderStars(selectedReview.serviceRating)}
                        <span className="font-semibold">{selectedReview.serviceRating}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Emplacement</span>
                      <div className="flex items-center gap-2">
                        {renderStars(selectedReview.locationRating)}
                        <span className="font-semibold">{selectedReview.locationRating}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rapport Qualité/Prix</span>
                      <div className="flex items-center gap-2">
                        {renderStars(selectedReview.valueRating)}
                        <span className="font-semibold">{selectedReview.valueRating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Commentaire</h4>
                {selectedReview.title && (
                  <h5 className="text-base font-medium text-gray-800 dark:text-gray-200">
                    {selectedReview.title}
                  </h5>
                )}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedReview.comment}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sentiment</p>
                  <Badge variant={getSentimentBadge(selectedReview.sentiment).color} className="mt-1">
                    {getSentimentBadge(selectedReview.sentiment).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Statut</p>
                  <Badge variant={selectedReview.isPublished ? 'success' : 'warning'} className="mt-1">
                    {selectedReview.isPublished ? 'Publié' : 'Non publié'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Votes utiles</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedReview.helpfulCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">ID</p>
                  <p className="text-xs font-mono text-gray-900 dark:text-gray-100 truncate">{selectedReview.id}</p>
                </div>
              </div>

              {/* Hotel Response */}
              {selectedReview.responseText && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Réponse de l'hôtel</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">{selectedReview.responseText}</p>
                    {selectedReview.responseDate && (
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                        Répondu le {isMounted ? formatDate(selectedReview.responseDate) : selectedReview.responseDate}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <ModalFooter>
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Fermer
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
