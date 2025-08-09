// src/lib/auth.ts

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
}

import { buildApiUrl } from './api';

export const auth = {
  // Obter token do localStorage
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  },

  // Salvar token no localStorage
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminToken', token);
  },

  // Remover token do localStorage
  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminToken');
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: (): boolean => {
    return !!auth.getToken();
  },

  // Fazer logout
  logout: (): void => {
    auth.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },

  // Verificar token com o backend
  verifyToken: async (): Promise<AuthUser | null> => {
    try {
      const token = auth.getToken();
      if (!token) return null;

      const response = await fetch(buildApiUrl('/api/auth/verify'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        auth.removeToken();
        return null;
      }

      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      auth.removeToken();
      return null;
    }
  },

  // Fazer requisição autenticada
  fetchWithAuth: async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = auth.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }
}; 