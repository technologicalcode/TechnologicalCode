import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { INITIAL_INTERACTIONS, INITIAL_LEADS, STAGES, USERS } from '../data/seed';
import { todayIso } from '../lib/dates';
import type { Interaction, InteractionType, Lead, LeadSource, Stage, User } from '../types';

const SESSION_KEY = 'altura-crm-session';
const DATA_KEY = 'altura-crm-data';

type SessionUser = Omit<User, 'password'>;

type Persisted = {
  leads: Lead[];
  interactions: Interaction[];
  nextLead: number;
  nextNote: number;
};

type State = Persisted & {
  user: SessionUser | null;
};

type Action =
  | { type: 'login'; user: SessionUser }
  | { type: 'logout' }
  | { type: 'move'; leadId: string; stageId: string }
  | { type: 'addLead'; lead: Lead }
  | { type: 'addNote'; note: Interaction };

function loadPersisted(): Persisted {
  try {
    const raw = sessionStorage.getItem(DATA_KEY);
    if (raw) {
      return JSON.parse(raw) as Persisted;
    }
  } catch {
    /* demo: si el storage falla, volvemos al seed */
  }
  return {
    leads: INITIAL_LEADS,
    interactions: INITIAL_INTERACTIONS,
    nextLead: 16,
    nextNote: 13,
  };
}

function loadUser(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function persist(state: State): void {
  sessionStorage.setItem(
    DATA_KEY,
    JSON.stringify({
      leads: state.leads,
      interactions: state.interactions,
      nextLead: state.nextLead,
      nextNote: state.nextNote,
    }),
  );
}

function reducer(state: State, action: Action): State {
  let next = state;
  if (action.type === 'login') {
    next = { ...state, user: action.user };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(action.user));
    return next;
  }
  if (action.type === 'logout') {
    sessionStorage.removeItem(SESSION_KEY);
    return { ...state, user: null };
  }
  if (action.type === 'move') {
    next = {
      ...state,
      leads: state.leads.map((lead) =>
        lead.id === action.leadId ? { ...lead, stageId: action.stageId } : lead,
      ),
    };
  } else if (action.type === 'addLead') {
    next = {
      ...state,
      leads: [action.lead, ...state.leads],
      nextLead: state.nextLead + 1,
    };
  } else if (action.type === 'addNote') {
    next = {
      ...state,
      interactions: [action.note, ...state.interactions],
      nextNote: state.nextNote + 1,
    };
  }
  persist(next);
  return next;
}

type CrmContextValue = {
  user: SessionUser | null;
  users: User[];
  stages: Stage[];
  leads: Lead[];
  interactions: Interaction[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  moveLead: (leadId: string, stageId: string) => void;
  addLead: (input: Omit<Lead, 'id' | 'createdAt'> & { createdAt?: string }) => Lead;
  addInteraction: (input: { leadId: string; type: InteractionType; description: string }) => void;
  userById: (id: string) => User | undefined;
  stageById: (id: string) => Stage | undefined;
};

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    ...loadPersisted(),
    user: loadUser(),
  }));

  const value = useMemo<CrmContextValue>(
    () => ({
      user: state.user,
      users: USERS,
      stages: STAGES,
      leads: state.leads,
      interactions: state.interactions,
      login: (email, password) => {
        const found = USERS.find(
          (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
        );
        if (!found) {
          return false;
        }
        dispatch({
          type: 'login',
          user: { id: found.id, name: found.name, email: found.email, role: found.role },
        });
        return true;
      },
      logout: () => dispatch({ type: 'logout' }),
      moveLead: (leadId, stageId) => dispatch({ type: 'move', leadId, stageId }),
      addLead: (input) => {
        const lead: Lead = {
          ...input,
          id: `l${state.nextLead}`,
          createdAt: input.createdAt ?? todayIso(),
        };
        dispatch({ type: 'addLead', lead });
        return lead;
      },
      addInteraction: ({ leadId, type, description }) => {
        if (!state.user) {
          return;
        }
        dispatch({
          type: 'addNote',
          note: {
            id: `i${state.nextNote}`,
            leadId,
            userId: state.user.id,
            type,
            description,
            date: todayIso(),
          },
        });
      },
      userById: (id) => USERS.find((item) => item.id === id),
      stageById: (id) => STAGES.find((item) => item.id === id),
    }),
    [state],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm(): CrmContextValue {
  const ctx = useContext(CrmContext);
  if (!ctx) {
    throw new Error('useCrm debe usarse dentro de CrmProvider');
  }
  return ctx;
}

export function sourceList(): LeadSource[] {
  return ['web', 'referido', 'redes', 'feria'];
}
