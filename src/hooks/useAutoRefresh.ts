import { useEffect, useRef, useState } from 'react';

interface UseAutoRefreshOptions {
  // Intervalle de rafraîchissement en millisecondes (par défaut: 30 secondes)
  interval?: number;
  // Activer/désactiver le rafraîchissement automatique
  enabled?: boolean;
  // Mettre en pause quand l'onglet n'est pas visible
  pauseWhenHidden?: boolean;
}

/**
 * Hook personnalisé pour rafraîchir automatiquement les données à intervalles réguliers
 *
 * @param callback - Fonction à exécuter à chaque intervalle
 * @param options - Options de configuration du rafraîchissement
 *
 * @example
 * ```tsx
 * const { isRefreshing, lastRefresh, refresh } = useAutoRefresh(
 *   async () => {
 *     await fetchData();
 *   },
 *   { interval: 30000, enabled: true }
 * );
 * ```
 */
export function useAutoRefresh(
  callback: () => void | Promise<void>,
  options: UseAutoRefreshOptions = {}
) {
  const {
    interval = 30000, // 30 secondes par défaut
    enabled = true,
    pauseWhenHidden = true,
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const callbackRef = useRef(callback);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mettre à jour la référence du callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Fonction pour exécuter le rafraîchissement
  const refresh = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      await callbackRef.current();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur lors du rafraîchissement automatique:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Gérer la visibilité de la page
  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Mettre en pause quand la page est cachée
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Reprendre quand la page redevient visible
        if (enabled && !intervalRef.current) {
          // Rafraîchir immédiatement
          refresh();
          // Puis démarrer l'intervalle
          intervalRef.current = setInterval(refresh, interval);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, interval, pauseWhenHidden]);

  // Gérer l'intervalle de rafraîchissement
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Ne démarrer l'intervalle que si la page est visible ou si on ne se soucie pas de la visibilité
    if (!pauseWhenHidden || !document.hidden) {
      // Exécuter immédiatement une fois
      refresh();

      // Puis démarrer l'intervalle
      intervalRef.current = setInterval(refresh, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, pauseWhenHidden]);

  return {
    isRefreshing,
    lastRefresh,
    refresh,
  };
}
