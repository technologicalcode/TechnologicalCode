import { FormEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDate } from '../lib/dates';
import { INTERACTION_LABEL, SOURCE_LABEL } from '../lib/labels';
import { useCrm } from '../store/crm-store';
import type { InteractionType } from '../types';

export function LeadDetail() {
  const { id } = useParams();
  const { leads, interactions, stages, userById, stageById, addInteraction, moveLead } = useCrm();
  const lead = leads.find((item) => item.id === id);
  const notes = interactions
    .filter((item) => item.leadId === id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const [type, setType] = useState<InteractionType>('nota');
  const [description, setDescription] = useState('');

  if (!lead) {
    return (
      <p className="text-sm text-muted">
        Lead no encontrado.{' '}
        <Link to="/clientes" className="font-semibold text-brand">
          Volver
        </Link>
      </p>
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!description.trim()) {
      return;
    }
    addInteraction({ leadId: lead.id, type, description: description.trim() });
    setDescription('');
  }

  return (
    <div className="space-y-6">
      <Link to="/clientes" className="text-sm font-semibold text-brand hover:underline">
        ← Clientes
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
          <p className="mt-1 text-sm text-muted">{lead.interest}</p>
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-muted">Etapa</span>
          <select
            className="rounded-lg border border-line bg-card px-3 py-2"
            value={lead.stageId}
            onChange={(e) => moveLead(lead.id, e.target.value)}
          >
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="grid gap-3 rounded-2xl border border-line bg-card p-5 sm:grid-cols-2">
        <Field label="Empresa" value={lead.company} />
        <Field label="Email" value={lead.email} />
        <Field label="Teléfono" value={lead.phone} />
        <Field label="Fuente" value={SOURCE_LABEL[lead.source]} />
        <Field label="Asignado a" value={userById(lead.assigneeId)?.name ?? '—'} />
        <Field label="Alta" value={formatDate(lead.createdAt)} />
        <Field label="Etapa" value={stageById(lead.stageId)?.name ?? '—'} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-2xl border border-line bg-card p-5">
          <h2 className="text-base font-semibold">Historial</h2>
          <ul className="mt-4 space-y-3">
            {notes.length === 0 ? (
              <li className="text-sm text-muted">Sin interacciones todavía.</li>
            ) : (
              notes.map((note) => (
                <li key={note.id} className="rounded-xl border border-line px-3 py-3">
                  <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                    {INTERACTION_LABEL[note.type]} · {formatDate(note.date)}
                  </p>
                  <p className="mt-1 text-sm">{note.description}</p>
                  <p className="mt-1 text-xs text-muted">{userById(note.userId)?.name}</p>
                </li>
              ))
            )}
          </ul>
        </div>

        <form className="h-fit rounded-2xl border border-line bg-card p-5" onSubmit={onSubmit}>
          <h2 className="text-base font-semibold">Nueva interacción</h2>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-medium">Tipo</span>
            <select
              className="w-full rounded-lg border border-line px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value as InteractionType)}
            >
              <option value="nota">Nota</option>
              <option value="llamada">Llamada</option>
              <option value="email">Email</option>
              <option value="reunion">Reunión</option>
            </select>
          </label>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block font-medium">Descripción</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <p className="mt-2 text-xs text-muted">Queda registrada con tu usuario.</p>
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-2"
          >
            Guardar
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
