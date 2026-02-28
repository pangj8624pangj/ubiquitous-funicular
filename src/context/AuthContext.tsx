import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { authService, type AuthUser } from '../services/auth';

interface AuthContextValue {
  user: AuthUser | null;
  /** The raw JWT — pass as query param for SSE or Authorization header for fetch. */
  token: string | null;
  login:    (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout:   () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage on first render (survives page refresh)
  const [user, setUser] = useState<AuthUser | null>(() => authService.getUserFromToken());
  const [token, setToken] = useState<string | null>(() =>
    authService.isLoggedIn() ? authService.getToken() : null,
  );

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.token);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const data = await authService.register(email, password);
    setUser(data.user);
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
