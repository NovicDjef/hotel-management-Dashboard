'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { Card, CardBody, CardHeader, Button, Input, Badge } from '../../../components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchReviews,
  fetchReviewStats,
  publishReview,
  verifyReview,
  deleteReview,
  respondToReview,
} from '@/store/slices/reviewSlice';
import {
  Search,
  Star,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Send,
  ThumbsUp,
} from 'lucide-react';
import { useClientDate } from '../../../hooks/useClientDate';

export default function ReviewsPage() {
  const dispatch = useAppDispatch();
  const { reviews, stats, isLoading } = useAppSelector((state) => state.reviews);
  const { formatDate } = useClientDate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    isPublished: undefined as boolean | undefined,
    rating: undefined as number | undefined,
    page: 1,
    limit: 10,
  });

  const [responseText, setResponseText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    dispatch(fetchReviews(filters));
    dispatch(fetchReviewStats());
  }, [dispatch, filters]);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handlePublish = async (id: string) => {
    try {
      await dispatch(publishReview(id)).unwrap();
      alert('Avis publié avec succès');
    } catch (error) {
      alert('Erreur lors de la publication');
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await dispatch(verifyReview(id)).unwrap();
      alert('Avis vérifié avec succès');
    } catch (error) {
      alert('Erreur lors de la vérification');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis?')) {
      try {
        await dispatch(deleteReview(id)).unwrap();
        alert('Avis supprimé avec succès');
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleRespond = async (id: string) => {
    const response = responseText[id];
    if (!response || response.trim() === '') {
      alert('Veuillez entrer une réponse');
      return;
    }

    try {
      await dispatch(respondToReview({ id, response })).unwrap();
      alert('Réponse envoyée avec succès');
      setResponseText({ ...responseText, [id]: '' });
    } catch (error) {
      alert('Erreur lors de l\'envoi de la réponse');
    }
  };

  const filteredReviews = reviews.filter((review) =>
    searchTerm
      ? review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.guestId?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const getStatusBadge = (isPublished: boolean, isVerified: boolean) => {
    if (isPublished && isVerified) {
      return { color: 'success' as const, label: 'Publié & Vérifié' };
    } else if (isPublished) {
      return { color: 'info' as const, label: 'Publié' };
    } else if (isVerified) {
      return { color: 'warning' as const, label: 'Vérifié (Non publié)' };
    } else {
      return { color: 'default' as const, label: 'En Attente' };
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              ⭐ Gestion des Avis
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les avis et commentaires des clients
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +15% ce mois
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
                      Note Moyenne
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.averageRating?.toFixed(1) || '0.0'}
                    </p>
                    <div className="mt-1">
                      {renderStars(Math.round(stats.averageRating || 0))}
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
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Publiés
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.publishedReviews?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      En ligne
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Vérifiés
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.verifiedReviews?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Authentifiés
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <CheckCircle className="w-7 h-7 text-white" />
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filters.isPublished === undefined ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, isPublished: undefined, page: 1 })}
                  className="min-w-[80px]"
                >
                  Tous
                </Button>
                <Button
                  variant={filters.isPublished === false ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, isPublished: false, page: 1 })}
                  className="min-w-[100px]"
                >
                  En Attente
                </Button>
                <Button
                  variant={filters.isPublished === true ? "primary" : "secondary"}
                  onClick={() => setFilters({ ...filters, isPublished: true, page: 1 })}
                  className="min-w-[100px]"
                >
                  Publiés
                </Button>
                <Button variant="primary" onClick={handleSearch} className="min-w-[120px]">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
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
                {filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                  >
                    {/* Review Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">
                              {review.guestId?.toString().substring(0, 2).toUpperCase() || 'G'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              Client #{review.guestId}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(review.createdAt, 'dd/MM/yyyy à HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const badge = getStatusBadge(review.isPublished, review.isVerified);
                          return (
                            <Badge variant={badge.color} className="text-xs">
                              {badge.label}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="mb-4">
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {review.comment || 'Aucun commentaire'}
                      </p>
                    </div>

                    {/* Staff Response */}
                    {review.response && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <ThumbsUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1" />
                          <div>
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                              Réponse de l'hôtel
                            </p>
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                              {review.response}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Response Input (if no response yet) */}
                    {!review.response && review.isPublished && (
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
                      {!review.isPublished && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handlePublish(review.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Publier
                        </Button>
                      )}
                      {!review.isVerified && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleVerify(review.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Vérifier
                        </Button>
                      )}
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
                ))}
              </div>
            )}

            {/* Pagination (if needed) */}
            {filteredReviews.length > 0 && (
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
      </div>
    </DashboardLayout>
  );
}
