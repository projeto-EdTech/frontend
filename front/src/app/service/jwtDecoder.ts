import { jwtDecode } from 'jwt-decode';

/**
 * Interface representing the structure of your JWT payload.
 * Adjust this interface according to the actual fields in your JWT.
 */
export interface JWTPayload {
  // Standard claims
  sub?: string;
  iat?: number;
  exp?: number;
  
  // Custom claims from backend
  id?: string;
  nome?: string;
  email?: string;
  tipo?: string;        // Tier do usuário (ex: FREE, SIMULAPRO, TEACHER, ADMIN)
  newsletter?: boolean; // Preferência de newsletter
  [key: string]: any;
}

/**
 * Decodes a JWT token string.
 *
 * @param token The JWT token string to decode.
 * @returns The decoded payload as JWTPayload, or null if decoding fails.
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token) {
      return null;
    }
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Checks if a JWT token is expired.
 *
 * @param token The JWT token string to check.
 * @returns True if the token is expired or invalid, false otherwise.
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true; // Consider invalid/missing exp as expired for safety
  }

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}
