/**
 * Base URL of the back-minuseek API.
 *
 * Set `EXPO_PUBLIC_API_URL` in a `.env` file to point at your backend, e.g.:
 * The back exposes every route under the global `/api` prefix, so the base URL
 * must include it (e.g. http://localhost:3000/api), mirroring the web front.
 *
 *   - iOS simulator / web:      http://localhost:3000/api
 *   - Android emulator:         http://10.0.2.2:3000/api
 *   - Physical device:          http://<your-machine-lan-ip>:3000/api
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
