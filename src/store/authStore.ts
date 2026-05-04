import { create } from 'zustand';
import { authService, AuthError } from '@/services/authService';
import { tokenManager } from '@/lib/tokenManager';
import { AuthUser, LoginRequest } from '@/types/auth';

interface AuthStore {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _authChecked: boolean;

  // Actions
  login: (credentials: LoginRequest, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<{ message?: string }>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => void;

  // Permission helpers
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  _authChecked: false,

  // Login action
  login: async (credentials: LoginRequest, rememberMe: boolean = false) => {
    set({ isLoading: true, error: null });

    try {
      // Call login API with remember me preference
      await authService.login(credentials, rememberMe);

      // Fetch user profile
      const profile = await authService.getProfile();

      // Transform to AuthUser
      const user: AuthUser = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile?.phone?.startsWith("+")
          ? profile?.phone
          : (profile?.country_code && profile?.phone ? profile.country_code + profile.phone : profile?.phone),
        countryCode: profile.country_code,
        isEmailVerified: profile.is_email_verified,
        organization: profile.organization,
        roles: profile.roles || [],
      };

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof AuthError
        ? error.message
        : 'Login failed. Please try again.';

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  // Logout action
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        _authChecked: true,
      });
      if (typeof window !== 'undefined') {
        const bc = new BroadcastChannel('auth_channel');
        bc.postMessage({ type: 'logout' });
        bc.close();
      }
      return result;
    } catch {
      // Ensure tokens are cleared even if the API call fails
      tokenManager.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        _authChecked: true,
      });
      if (typeof window !== 'undefined') {
        const bc = new BroadcastChannel('auth_channel');
        bc.postMessage({ type: 'logout' });
        bc.close();
      }
      return { message: undefined };
    }
  },

  // Fetch user profile
  fetchProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const profile = await authService.getProfile();

      const user: AuthUser = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile?.phone?.startsWith("+")
          ? profile?.phone
          : (profile?.country_code && profile?.phone ? profile.country_code + profile.phone : profile?.phone),
        isEmailVerified: profile.is_email_verified,
        organization: profile.organization,
        roles: profile.roles || [],
      };

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof AuthError
        ? error.message
        : 'Failed to fetch profile';

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Check if user has a specific role
  hasRole: (role: string) => {
    const { user } = get();
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.name === role);
  },

  // Check if user has a specific permission
  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user || !user.roles) return false;
    // Gather all permissions from all roles
    const allPermissions = user.roles.flatMap(r => r.permissions?.map(p => p.name) || []);
    // admin:full overrides everything
    return allPermissions.includes('admin:full') || allPermissions.includes(permission);
  },

  // Check authentication status on app load
  checkAuth: () => {
    // SYNCHRONOUS CHECK: Verify tokens exist FIRST
    const hasTokens = tokenManager.hasTokens();

    if (!hasTokens) {
      // NO TOKENS: Immediately clear state and mark as checked
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        _authChecked: true,
      });
      return;
    }

    // Tokens exist - check if they're valid (not expired)
    const isAuth = authService.isAuthenticated();

    if (!isAuth) {
    // Tokens exist but are expired/invalid - clear them
      tokenManager.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        _authChecked: true,
      });
      return;
    }

    // Tokens are valid - fetch fresh profile data
    set({ isLoading: true });

    get().fetchProfile()
      .catch(() => {
        // Profile fetch failed - clear everything
        tokenManager.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      })
      .finally(() => {
        // Mark auth check as complete
        set({ _authChecked: true });
      });
  },
}));