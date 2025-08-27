import React from 'react';
import { User, AuthSession } from '@/types';

const STORAGE_KEYS = {
  SESSION: 'appleaction_session',
  USERS: 'appleaction_users',
} as const;

// Predefined user credentials
const DEFAULT_USERS: User[] = [
  {
    id: 'admin-001',
    email: 'admin@unibexs.com',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'partner-001',
    email: 'partner@unibexs.com',
    password: 'partner123',
    role: 'partner',
    name: 'John Partner',
    partnerId: 'partner-techcorp-001',
    createdAt: new Date().toISOString(),
  }
];

export class AuthService {
  // Check if we're on the client side
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  static initializeUsers(): void {
    if (!this.isClient()) return;
    
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    
    // Force refresh users to apply partnerId fix for existing installations
    const users = this.getUsers();
    const partnerUser = users.find(u => u.id === 'partner-001');
    if (partnerUser && partnerUser.partnerId !== 'partner-techcorp-001') {
      console.log('🔧 AuthService: Fixing partner partnerId mismatch');
      this.forceRefreshUsers();
    }
  }

  static forceRefreshUsers(): void {
    if (!this.isClient()) return;
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    
    // Also refresh any existing session with updated user data
    const currentSession = this.getCurrentSession();
    if (currentSession) {
      const updatedUser = DEFAULT_USERS.find(u => u.id === currentSession.user.id);
      if (updatedUser) {
        const updatedSession = {
          ...currentSession,
          user: { ...updatedUser, password: '' }
        };
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession));
        console.log('🔄 AuthService: Session refreshed with updated user data');
      }
    }
  }

  static async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthSession> {
    if (!this.isClient()) {
      throw new Error('Cannot login on server side');
    }
    
    // Only initialize users if none exist, don't override existing users
    this.initializeUsers();
    
    const users = this.getUsers();
    console.log('🔍 AuthService: Available users:', users);
    console.log('🔍 AuthService: Trying to login with email:', email);
    
    const user = users.find(u => u.email === email && u.password === password);
    console.log('🔍 AuthService: Found user:', user);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const session: AuthSession = {
      user: { ...user, password: '' }, // Remove password from session
      token: this.generateToken(),
      expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    return session;
  }

  static logout(): void {
    if (!this.isClient()) return;
    
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    // Trigger storage event for real-time sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.SESSION,
      newValue: null,
    }));
  }

  static getCurrentSession(): AuthSession | null {
    if (!this.isClient()) return null;
    
    try {
      const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!sessionData) return null;

      const session: AuthSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        // Only logout if we're on client side
        if (this.isClient()) {
          this.logout();
        }
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error parsing session:', error);
      // Only logout if we're on client side
      if (this.isClient()) {
        this.logout();
      }
      return null;
    }
  }

  static getCurrentUser(): User | null {
    const session = this.getCurrentSession();
    const user = session?.user || null;
    console.log('🔍 AuthService: getCurrentUser returning:', user);
    return user;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  static hasRole(role: User['role']): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  static isAdmin(): boolean {
    return this.hasRole('admin');
  }

  static isPartner(): boolean {
    return this.hasRole('partner');
  }

  static getPartnerIdForCurrentUser(): string | null {
    const user = this.getCurrentUser();
    return user?.partnerId || null;
  }

  private static getUsers(): User[] {
    if (!this.isClient()) return DEFAULT_USERS;
    
    try {
      const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
      return usersData ? JSON.parse(usersData) : DEFAULT_USERS;
    } catch (error) {
      console.error('Error parsing users:', error);
      return DEFAULT_USERS;
    }
  }

  private static generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Auto-fill credentials helper functions
  static getAdminCredentials() {
    return {
      email: 'admin@unibexs.com',
      password: 'admin123'
    };
  }

  static getPartnerCredentials() {
    return {
      email: 'partner@unibexs.com',
      password: 'partner123'
    };
  }
}

// Auth hook for React components
export function useAuth() {
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Initial auth check
    const currentSession = AuthService.getCurrentSession();
    setSession(currentSession);
    setLoading(false);

    // Listen for auth changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.SESSION) {
        const newSession = AuthService.getCurrentSession();
        setSession(newSession);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    const newSession = await AuthService.login(email, password, rememberMe);
    setSession(newSession);
    return newSession;
  };

  const logout = () => {
    AuthService.logout();
    setSession(null);
  };

  // Compute these values based on current session to avoid SSR issues
  const isAuthenticated = !!session;
  const isAdmin = session?.user?.role === 'admin';
  const isPartner = session?.user?.role === 'partner';

  return {
    session,
    user: session?.user || null,
    loading,
    isAuthenticated,
    isAdmin,
    isPartner,
    login,
    logout,
  };
}