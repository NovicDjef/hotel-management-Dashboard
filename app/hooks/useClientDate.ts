import { useState, useEffect } from 'react';
import { format } from 'date-fns';

/**
 * Hook personnalisé pour formater les dates de manière safe (évite les erreurs d'hydratation)
 * Retourne la date brute côté serveur et la date formatée côté client
 */
export function useClientDate() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy') => {
    if (!isMounted) {
      // Côté serveur : retourner la date brute
      return typeof date === 'string' ? date : date.toISOString();
    }
    // Côté client : formater la date
    return format(new Date(date), formatStr);
  };

  return { formatDate, isMounted };
}
