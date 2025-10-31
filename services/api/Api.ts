import axios from 'axios'

// const BASE_URL = 'https://api.novic.dev'
const BASE_URL = `http://localhost:5001`
const hotelId = `cmh3iygew00009crzsls6rlzy`

// Routes publiques qui ne nécessitent pas d'authentification
// IMPORTANT: Ces routes devraient être publiques mais le backend les bloque actuellement
// En attendant la correction backend, on les laisse en mode "semi-public" (avec token optionnel)
const PUBLIC_ROUTES = [
  '/api/v1/login',            // Liste des hôtels
  '/api/v1/rooms',             // Liste des chambres (ancienne route)
  '/api/v1/room-types',        // Types de chambres (inventaire)
  '/api/v1/auth/guest',        // Enregistrement invité
  '/api/v1/reservations/calculate', // Calcul prix réservation
  '/api/v1/reservations/availability', // Vérifier disponibilité chambres
  '/api/v1/reservations/guest', // Création réservation guest (public)
  '/api/v1/reviews/hotel',     // Avis publics d'un hôtel
]

// Routes qui DEVRAIENT être publiques mais nécessitent un token côté backend actuellement
// On n'envoie le token que s'il existe, mais on n'empêche pas la requête
const SEMI_PUBLIC_ROUTES = [
  '/api/v1/spa/services',      // Liste des services spa
  '/api/v1/spa/forfaits',      // Liste des forfaits spa
  '/api/v1/spa/certificats',   // Liste des certificats cadeaux
  '/api/v1/spa/statistics',    // Statistiques spa
  '/api/v1/reservations/spa-categories', // Catégories spa
]

/**
 * Vérifie si une route est publique (ne nécessite pas de token)
 */
const isPublicRoute = (url?: string): boolean => {
  if (!url) return false
  return PUBLIC_ROUTES.some(route => url.includes(route))
}

/**
 * Vérifie si une route est semi-publique (token optionnel)
 */
const isSemiPublicRoute = (url?: string): boolean => {
  if (!url) return false
  return SEMI_PUBLIC_ROUTES.some(route => url.includes(route))
}

const apiService = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  responseType: 'json',
  // withCredentials désactivé par défaut pour les routes publiques
  // Sera activé uniquement pour les routes qui nécessitent l'authentification
  withCredentials: false,
})

// Intercepteur de requête pour ajouter le token
apiService.interceptors.request.use(
  async (config) => {
    const routeIsPublic = isPublicRoute(config.url)
    const routeIsSemiPublic = isSemiPublicRoute(config.url)

    console.log('🔵 API Request:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      isPublic: routeIsPublic,
      isSemiPublic: routeIsSemiPublic,
      requiresAuth: !routeIsPublic && !routeIsSemiPublic
    })

    if (routeIsPublic) {
      // Routes publiques : pas de credentials et pas de token
      config.withCredentials = false
      delete config.headers.Authorization
    } else if (routeIsSemiPublic) {
      // Routes semi-publiques : envoyer le token s'il existe, mais ne pas bloquer sinon
      // Ne pas utiliser withCredentials pour éviter les problèmes CORS
      config.withCredentials = false

      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('userToken')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log('🔑 Token envoyé pour route semi-publique')
          } else {
            console.log('⚠️ Pas de token trouvé, requête sans auth')
            delete config.headers.Authorization
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du token:', error)
        delete config.headers.Authorization
      }
    } else {
      // Routes privées : token obligatoire
      config.withCredentials = true

      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('userToken')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du token:', error)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur de réponse pour gérer les erreurs
apiService.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Erreur avec réponse du serveur
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Non autorisé - supprimer le token et rediriger vers login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userToken')
            // window.location.href = '/login'
          }
          break
        case 403:
          console.error('Accès interdit')
          break
        case 404:
          console.error('Ressource non trouvée')
          break
        case 500:
          console.error('Erreur serveur')
          break
        default:
          console.error('Erreur API:', data?.message || error.message)
      }
    } else if (error.request) {
      // Pas de réponse du serveur
      console.error('Pas de réponse du serveur')
    } else {
      // Erreur lors de la configuration de la requête
      console.error('Erreur de configuration:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiService
export { BASE_URL, hotelId }
