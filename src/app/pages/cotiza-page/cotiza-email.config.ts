/**
 * Correo de la empresa para el fallback `mailto:` si no hay API ni Web3Forms.
 */
export const COTIZA_COMPANY_INBOX_EMAIL = 'cotizaciones@technologicalcode.com';

/**
 * URL base del servidor Node con Nodemailer (sin barra final), p. ej.
 * `http://localhost:3847`. Vacío = no se usa; entonces Web3Forms o mailto.
 * Arranca con: `npm run server:mail` y configura `server/.env`.
 */
export const COTIZA_QUOTE_API_URL = '';

/**
 * Misma clave que `MAIL_API_KEY` en server/.env (opcional). Refuerzo frente a spam.
 */
export const COTIZA_QUOTE_API_KEY = '';

/**
 * Clave https://web3forms.com si no usas el servidor propio.
 */
export const COTIZA_WEB3FORMS_ACCESS_KEY = '';
