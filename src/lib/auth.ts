import { SignJWT, jwtVerify } from 'jose';
import { Usuario } from '../types';

// Clave secreta para firmar los tokens JWT
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'uleam_mundial_super_secret_token_key_2026_manabi';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_KEY);

// Nombre de la cookie de sesión
export const SESSION_COOKIE_NAME = 'uleam_mundial_session';

/**
 * Hashea una contraseña de forma segura usando la Web Crypto API nativa.
 * Es compatible con Edge Middleware y no requiere librerías nativas compiladas.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  // Usar una sal estática combinada con la contraseña
  const salt = 'uleam_copa_mundial_2026_salt_system_key';
  const data = encoder.encode(password + salt);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida si una contraseña ingresada coincide con el hash guardado.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

/**
 * Crea y firma un JWT para el usuario.
 */
export async function signJWT(payload: { id: string; email: string; nombre: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Expira en 24 horas
    .sign(JWT_SECRET);
}

/**
 * Verifica un token JWT y retorna su contenido. Retorna null si es inválido.
 */
export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: string; email: string; nombre: string };
  } catch (error) {
    return null;
  }
}

/**
 * Valida un correo según el formato institucional de la ULEAM:
 * - Debe terminar en @live.uleam.edu.ec
 * - Debe empezar con la letra "e" (mayúscula o minúscula)
 * - Debe tener solo números después de la "e"
 */
export function validateUleamEmail(email: string): boolean {
  const regex = /^e\d+@live\.uleam\.edu\.ec$/i;
  return regex.test(email);
}
