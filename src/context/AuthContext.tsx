
"use client";

import { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import type { Participant, Role } from '@/lib/rbac';
import { login as apiLogin, logout as apiLogout, saveAuthData, getAuthData } from '@/lib/auth';

interface AuthState {
  isAuthenticated: boolean;
  participant: Participant | null;
  role: Role | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (userName: string, password: string) => Promise<boolean>;
  logout: () => void;
  sandboxLogin: (participant: Participant, role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    participant: null,
    role: null,
    isLoading: true,
  });

  console.log("AuthProvider rendering with state:", auth);

  useEffect(() => {
    console.log("AuthProvider: useEffect triggered");
    const { token, participant, role } = getAuthData();
    console.log("AuthProvider: useEffect - initial auth data", { isAuthenticated: !!token });
    setAuth({
      isAuthenticated: !!token,
      participant,
      role,
      isLoading: false,
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
            const response = await apiLogin(email, password);
      saveAuthData(response.access_token, response.user);
      setAuth({
        isAuthenticated: true,
        participant: response.user.participant,
        role: response.user.role,
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setAuth({ isAuthenticated: false, participant: null, role: null, isLoading: false });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setAuth({
      isAuthenticated: false,
      participant: null,
      role: null,
      isLoading: false,
    });
  }, []);

  const sandboxLogin = useCallback((participant: Participant, role: Role) => {
    setAuth({
      isAuthenticated: true,
      participant,
      role,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, sandboxLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
