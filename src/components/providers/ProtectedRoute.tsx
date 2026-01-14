'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/lib/tokenManager';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, _authChecked } = useAuthStore();
  const [routeChecked, setRouteChecked] = useState(false);

  useEffect(() => {
    // Only proceed after auth check is complete and not loading
    if (_authChecked && !isLoading) {
      // Check if tokens exist
      const hasTokens = tokenManager.hasTokens();

      if (!hasTokens || !isAuthenticated) {
      // No tokens or not authenticated - redirect to login
        router.replace('/auth/login');
        return;
      }

      // Authenticated - allow access
      setRouteChecked(true);
    }
  }, [_authChecked, isAuthenticated, isLoading, router]);

  // Show loading state while auth check in progress
  if (!_authChecked || isLoading || !routeChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
