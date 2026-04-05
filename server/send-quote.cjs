'use strict';

/**
 * API mínima para enviar cotizaciones por correo con Nodemailer.
 * Uso: desde la raíz del repo, `npm run server:mail` (tras configurar server/.env).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const PORT = Number(process.env.PORT || 3847);
const MAIL_TO = process.env.MAIL_TO || '';
const MAIL_FROM = process.env.MAIL_FROM || '';
const MAIL_API_KEY = (process.env.MAIL_API_KEY || '').trim();
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !MAIL_FROM || !MAIL_TO) {
    return null;
  }
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
  const opts = {
    host,
    port,
    secure,
  };
  if (user && pass) {
    opts.auth = { user, pass };
  }
  return nodemailer.createTransport(opts);
}

const transporter = buildTransporter();

const app = express();
app.use(express.json({ limit: '256kb' }));
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || CORS_ORIGINS.includes(origin)) {
        return cb(null, true);
      }
      cb(null, false);
    },
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-quote-api-key'],
  }),
);

app.get('/health', (_req, res) => {
  res.json({ ok: true, mailConfigured: !!transporter });
});

app.post('/send-quote', async (req, res) => {
  if (!transporter) {
    return res.status(503).json({
      success: false,
      error: 'Servidor sin SMTP configurado. Revisa server/.env (SMTP_HOST, MAIL_FROM, MAIL_TO, etc.).',
    });
  }

  if (MAIL_API_KEY) {
    const key = (req.get('x-quote-api-key') || req.body?.apiKey || '').trim();
    if (key !== MAIL_API_KEY) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  }

  const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
  const text = typeof req.body?.text === 'string' ? req.body.text : '';
  const replyTo = typeof req.body?.replyTo === 'string' ? req.body.replyTo.trim() : '';
  const fromName = typeof req.body?.fromName === 'string' ? req.body.fromName.trim() : '';

  if (!subject || !text || !replyTo) {
    return res.status(400).json({ success: false, error: 'Faltan subject, text o replyTo' });
  }

  try {
    await transporter.sendMail({
      from: fromName ? `"${fromName.replace(/"/g, '')}" <${MAIL_FROM}>` : MAIL_FROM,
      to: MAIL_TO,
      replyTo,
      subject: subject.slice(0, 200),
      text,
    });
    return res.json({ success: true });
  } catch (e) {
    console.error('[send-quote]', e);
    return res.status(500).json({ success: false, error: 'Fallo al enviar el correo' });
  }
});

app.listen(PORT, () => {
  console.log(`[send-quote] http://localhost:${PORT}  (POST /send-quote)`);
  if (!transporter) {
    console.warn('[send-quote] SMTP no configurado: copia server/env.example a server/.env y rellena las variables.');
  }
});
