import axios from 'axios';
import { API_URL } from '@/features/shared/constants/global.constants';

/**
 * Shared axios instance, mirroring the web front's `apiClient`.
 *
 * Auth note: the web front reads `accessToken` from `localStorage`. React Native
 * has no `localStorage`, so token injection is intentionally left as a hook to be
 * wired to `expo-secure-store` once an auth flow exists. For now requests are
 * unauthenticated, which is enough to create an investigation case.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
