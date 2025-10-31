import { BASE_URL } from './client'

/**
 * Génère l'URL complète d'une image à partir du chemin relatif
 * @param path - Chemin relatif de l'image (ex: 'images/room1.jpg' ou 'room1.jpg')
 * @returns URL complète de l'image ou null si le chemin est invalide
 */
export const baseImage = (path: string | null | undefined): string | null => {
  if (!path) return null

  // Si le chemin commence déjà par 'http', le retourner tel quel
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Si le chemin commence par 'images/', l'ajouter directement
  if (path.startsWith('images/')) {
    return `${BASE_URL}/${path}`
  }

  // Sinon, préfixer avec 'images/'
  return `${BASE_URL}/images/${path}`
}

/**
 * Génère l'URL complète pour un avatar
 * @param path - Chemin relatif de l'avatar
 * @returns URL complète de l'avatar
 */
export const avatarUrl = (path: string | null | undefined): string | null => {
  if (!path) return null

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${BASE_URL}/images/avatars/${path}`
}

/**
 * Génère l'URL complète pour une photo de chambre
 * @param path - Chemin relatif de la photo
 * @returns URL complète de la photo
 */
export const roomImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${BASE_URL}/images/rooms/${path}`
}

/**
 * Génère l'URL complète pour une photo de service/spa
 * @param path - Chemin relatif de la photo
 * @returns URL complète de la photo
 */
export const serviceImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${BASE_URL}/images/services/${path}`
}
