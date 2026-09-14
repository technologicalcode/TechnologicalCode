import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, isStale } from '../lib/dates';
import { SOURCE_LABEL } from '../lib/labels';
import { useCrm } from '../store/crm-store';
import type { LeadSource } from '../types';

type SortKey = 'name' | 'date';

export function Leads() {
  const { leads, stages, interactions, userById, stageById } = useCrm();
  const [q, setQ] = useState('');
  const [stageId, setStageId] = useState('');
  const [source, setSource] = useState<'' | LeadSource>('');
  const [sort, setSort] = useState<SortKey>('date');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return leads
      .filter((lead) => {
        const hay = `${lead.name} ${lead.company} ${lead.email} ${lead.interest}`.toLowerCase();
        const matchQ = !query || hay.includes(query);
        const matchStage = !stageId || lead.stageId === stageId;
        const matchSource = !source || lead.source === source;
        return matchQ && matchStage && matchSource;
      })
      .sort((a, b) => {
        if (sort === 'name') {
          return a.name.localeCompare(b.name, 'es');
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [leads, q, stageId, source, sort]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="mt-1 text-sm text-muted">{rows.length} resultados</p>
        </div>
        <Link
          to="/nuevo"
          className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-2"
        >
          Nuevo lead
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <input
          className="rounded-lg border border-line bg-card px-3 py-2 text-sm outline-none focus:border-brand"
          placeholder="Buscar nombre, empresa o email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded-lg border border-line bg-card px-3 py-2 text-sm"
          value={stageId}
          onChange={(e) => setStageId(e.target.value)}
        >
          <option value="">Todas las etapas</option>
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-line bg-card px-3 py-2 text-sm"
          value={source}
          onChange={(e) => setSource(e.target.value as '' | LeadSource)}
        >
          <option value="">Todas las fuentes</option>
          <option value="web">Web</option>
          <option value="referido">Referido</option>
          <option value="redes">Redes sociales</option>
          <option value="feria">Feria</option>
        </select>
        <select
          className="rounded-lg border border-line bg-card px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="date">Ordenar por fecha</option>
          <option value="name">Ordenar por nombre</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Etapa</th>
              <th className="px-4 py-3 font-medium">Fuente</th>
              <th className="px-4 py-3 font-medium">Asignado</th>
              <th className="px-4 py-3 font-medium">Alta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link to={`/clientes/${lead.id}`} className="font-semibold text-ink hover:text-brand">
                    {lead.name}
                    {isStale(lead, interactions) ? (
                      <span className="ml-2 text-warn" title="Sin actividad reciente">
                        !
                      </span>
                    ) : null}
                  </Link>
                  <p className="text-xs text-muted">{lead.company}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{stageById(lead.stageId)?.name}</td>
                <td className="px-4 py-3 text-slate-600">{SOURCE_LABEL[lead.source]}</td>
                <td className="px-4 py-3 text-slate-600">{userById(lead.assigneeId)?.name}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
