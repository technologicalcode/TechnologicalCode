/**
 * API de demo para Altura CRM.
 * El frontend embebido en el sitio NO depende de este servidor:
 * usa el mismo seed hardcodeado en React.
 * Corre esto si quieres probar las rutas REST en local.
 */
import cors from 'cors';
import express from 'express';
import { STAGES, USERS } from './data.js';
import { findUser, publicUser, requireAuth, signUser } from './auth.js';
import {
  addInteraction,
  addLead,
  getLead,
  listInteractions,
  listLeads,
  moveLead,
} from './store.js';

const app = express();
const PORT = Number(process.env.PORT ?? 4178);

app.use(cors({ origin: true }));
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const user = findUser(String(email ?? ''), String(password ?? ''));
  if (!user) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }
  res.json({ token: signUser(user), user: publicUser(user) });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/stages', requireAuth, (_req, res) => {
  res.json(STAGES);
});

app.get('/api/users', requireAuth, (_req, res) => {
  res.json(USERS.map(publicUser));
});

app.get('/api/leads', requireAuth, (_req, res) => {
  res.json(listLeads());
});

app.get('/api/leads/:id', requireAuth, (req, res) => {
  const lead = getLead(req.params.id);
  if (!lead) {
    res.status(404).json({ error: 'Lead no encontrado' });
    return;
  }
  res.json(lead);
});

app.post('/api/leads', requireAuth, (req, res) => {
  const body = req.body ?? {};
  if (!body.name || !body.email) {
    res.status(400).json({ error: 'name y email son obligatorios' });
    return;
  }
  const lead = addLead({
    name: String(body.name),
    company: String(body.company ?? 'Independiente'),
    phone: String(body.phone ?? '—'),
    email: String(body.email),
    source: body.source ?? 'web',
    stageId: body.stageId ?? 's1',
    assigneeId: body.assigneeId ?? req.user.id,
    interest: String(body.interest ?? 'Consulta general'),
  });
  res.status(201).json(lead);
});

/** Cambiar de etapa (el Kanban llama esto al soltar una tarjeta). */
app.patch('/api/leads/:id', requireAuth, (req, res) => {
  const lead = moveLead(req.params.id, String(req.body?.stageId ?? ''));
  if (!lead) {
    res.status(404).json({ error: 'Lead no encontrado' });
    return;
  }
  res.json(lead);
});

app.get('/api/leads/:id/interactions', requireAuth, (req, res) => {
  if (!getLead(req.params.id)) {
    res.status(404).json({ error: 'Lead no encontrado' });
    return;
  }
  res.json(listInteractions(req.params.id));
});

app.post('/api/leads/:id/interactions', requireAuth, (req, res) => {
  if (!getLead(req.params.id)) {
    res.status(404).json({ error: 'Lead no encontrado' });
    return;
  }
  const { type, description } = req.body ?? {};
  if (!description) {
    res.status(400).json({ error: 'description es obligatoria' });
    return;
  }
  const note = addInteraction(req.params.id, req.user.id, {
    type: type ?? 'nota',
    description: String(description),
  });
  res.status(201).json(note);
});

app.get('/api/metrics', requireAuth, (_req, res) => {
  const leads = listLeads();
  const now = new Date();
  const won = leads.filter((lead) => lead.stageId === 's6');
  const lost = leads.filter((lead) => lead.stageId === 's7');
  const wonThisMonth = won.filter((lead) => {
    const date = new Date(`${lead.createdAt}T12:00:00`);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
  const closed = won.length + lost.length;
  res.json({
    total: leads.length,
    wonThisMonth: wonThisMonth.length,
    conversion: closed === 0 ? 0 : Math.round((won.length / closed) * 100),
    byStage: STAGES.map((stage) => ({
      stageId: stage.id,
      name: stage.name,
      count: leads.filter((lead) => lead.stageId === stage.id).length,
    })),
  });
});

app.listen(PORT, () => {
  console.log(`Altura CRM API en http://localhost:${PORT}`);
});
