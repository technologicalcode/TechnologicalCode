import jwt from 'jsonwebtoken';
import { USERS } from './data.js';

/** Solo demo. En producción: secret por env + hash bcrypt de password. */
const SECRET = process.env.JWT_SECRET ?? 'altura-crm-demo-secret';

export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export function signUser(user) {
  return jwt.sign(publicUser(user), SECRET, { expiresIn: '8h' });
}

export function findUser(email, password) {
  return (
    USERS.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
    ) ?? null
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}
