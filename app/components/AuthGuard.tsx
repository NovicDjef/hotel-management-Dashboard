'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, tokens } = useAppSelector((state) => state.auth);
  const [hasChecked, setHasChecked] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Marquer que le chargement initial est terminé
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }

    // Si déjà authentifié, ne rien faire
    if (isAuthenticated) {
      console.log('✅ AuthGuard: User is authenticated');
      return;
    }

    // Si on a des tokens mais qu'on n'est pas encore authentifié, vérifier
    if (tokens && !hasChecked) {
      console.log('🔍 AuthGuard: Checking authentication with stored tokens...');
      dispatch(checkAuth());
      setHasChecked(true);
      return;
    }

    // Si pas de tokens ET pas authentifié, rediriger vers login (mais pas au premier chargement)
    if (!tokens && !isAuthenticated && !isInitialLoad) {
      console.log('🔒 AuthGuard: No tokens found, redirecting to login...');
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [tokens, isAuthenticated, hasChecked, isInitialLoad, dispatch, pathname, router]);

  // If we're checking auth with the server, show loading
  if (isLoading && hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and no tokens, show nothing (redirecting)
  if (!isAuthenticated && !tokens) {
    return null;
  }

  // If authenticated or we have tokens in initial state, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show nothing while loading initial check
  return null;
}
