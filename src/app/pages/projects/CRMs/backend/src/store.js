import { INITIAL_INTERACTIONS, INITIAL_LEADS } from './data.js';

/** Estado mutable en RAM. Reinicia al apagar el proceso (ideal para un demo). */
const db = {
  leads: structuredClone(INITIAL_LEADS),
  interactions: structuredClone(INITIAL_INTERACTIONS),
  nextLead: 16,
  nextNote: 13,
};

export function listLeads() {
  return db.leads;
}

export function getLead(id) {
  return db.leads.find((lead) => lead.id === id) ?? null;
}

export function moveLead(id, stageId) {
  const lead = getLead(id);
  if (!lead) {
    return null;
  }
  lead.stageId = stageId;
  return lead;
}

export function addLead(input) {
  const lead = {
    id: `l${db.nextLead++}`,
    createdAt: new Date().toISOString().slice(0, 10),
    ...input,
  };
  db.leads.unshift(lead);
  return lead;
}

export function listInteractions(leadId) {
  return db.interactions.filter((item) => item.leadId === leadId);
}

export function addInteraction(leadId, userId, { type, description }) {
  const note = {
    id: `i${db.nextNote++}`,
    leadId,
    userId,
    type,
    description,
    date: new Date().toISOString().slice(0, 10),
  };
  db.interactions.unshift(note);
  return note;
}
