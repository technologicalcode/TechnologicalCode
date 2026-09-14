export type Role = 'admin' | 'vendedor';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type Stage = {
  id: string;
  name: string;
  order: number;
  color: string;
};

export type LeadSource = 'web' | 'referido' | 'redes' | 'feria';

export type Lead = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: LeadSource;
  createdAt: string;
  stageId: string;
  assigneeId: string;
  interest: string;
};

export type InteractionType = 'llamada' | 'email' | 'reunion' | 'nota';

export type Interaction = {
  id: string;
  leadId: string;
  userId: string;
  type: InteractionType;
  description: string;
  date: string;
};
