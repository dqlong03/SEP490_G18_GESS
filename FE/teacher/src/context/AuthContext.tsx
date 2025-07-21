'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };
  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};