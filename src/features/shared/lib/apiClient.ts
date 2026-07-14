import axios from 'axios';

import {
  getActiveSession,
  getValidAccessToken,
  signOut,
} from '@/features/shared/auth/session';
import { API_URL } from '@/features/shared/constants/global.constants';

/**
 * Instance axios partagée, miroir de l'`apiClient` du front web : chaque requête
 * porte le token du tenant actif (rafraîchi si besoin) + le header `X-Tenant-Slug`,
 * exactement ce que la `MultiRealmJwtStrategy` du back exige.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const accessToken = await getValidAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    const session = getActiveSession();
    if (session) {
      config.headers['X-Tenant-Slug'] = session.slug;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // 401 : token plus accepté → on purge la session ; l'auth gate renverra au login.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await signOut();
    }
    return Promise.reject(error);
  },
);
