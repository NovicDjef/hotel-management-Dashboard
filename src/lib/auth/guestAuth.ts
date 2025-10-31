/**
 * Service pour gérer l'authentification guest automatique
 * Crée un utilisateur guest temporaire pour accéder aux routes protégées
 */

import apiService from '../api/client'

const GUEST_TOKEN_KEY = 'guestToken'
const GUEST_USER_KEY = 'guestUser'

interface GuestAuthResponse {
  success: boolean
  data: {
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
    tokens: {
      accessToken: string
      refreshToken: string
      expiresIn: string
    }
  }
}

/**
 * Génère un email guest unique basé sur le timestamp
 */
function generateGuestEmail(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `guest_${timestamp}_${random}@hotel-sept-iles.com`
}

/**
 * Crée un compte guest et stocke le token
 */
export async function createGuestAuth(): Promise<string | null> {
  try {
    const guestEmail = generateGuestEmail()

    console.log('🔑 Création d\'un compte guest automatique...')

    const response = await apiService.post<GuestAuthResponse>('/api/v1/auth/guest/register', {
      firstName: 'Visiteur',
      lastName: 'Guest',
      email: guestEmail,
      phone: '0000000000',
      hotelId: 'cmh3iygew00009crzsls6rlzy',
      password: 'Guest123'
    })

    if (response.data.success && response.data.data.tokens.accessToken) {
      const token = response.data.data.tokens.accessToken

      // Stocker le token
      if (typeof window !== 'undefined') {
        localStorage.setItem(GUEST_TOKEN_KEY, token)
        localStorage.setItem('userToken', token) // Pour compatibilité avec l'intercepteur
        localStorage.setItem(GUEST_USER_KEY, JSON.stringify(response.data.data.user))
      }

      console.log('✅ Compte guest créé avec succès')
      return token
    }

    return null
  } catch (error: any) {
    console.error('❌ Erreur lors de la création du compte guest:', error.response?.data || error.message)
    return null
  }
}

/**
 * Récupère le token guest existant ou en crée un nouveau
 */
export async function ensureGuestAuth(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null
  }

  // Vérifier si on a déjà un token
  let token = localStorage.getItem(GUEST_TOKEN_KEY) || localStorage.getItem('userToken')

  if (token) {
    console.log('✅ Token guest existant trouvé')
    return token
  }

  // Créer un nouveau token guest
  token = await createGuestAuth()
  return token
}

/**
 * Supprime l'authentification guest
 */
export function clearGuestAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_TOKEN_KEY)
    localStorage.removeItem(GUEST_USER_KEY)
    // Ne pas supprimer 'userToken' car il pourrait être un vrai user
  }
}

/**
 * Vérifie si l'utilisateur actuel est un guest
 */
export function isGuestUser(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return localStorage.getItem(GUEST_USER_KEY) !== null
}
