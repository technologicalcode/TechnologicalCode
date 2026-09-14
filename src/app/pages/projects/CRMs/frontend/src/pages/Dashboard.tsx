import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { isSameMonth, isStale } from '../lib/dates';
import { useCrm } from '../store/crm-store';

export function Dashboard() {
  const { leads, stages, interactions } = useCrm();
  const won = leads.filter((lead) => lead.stageId === 's6');
  const lost = leads.filter((lead) => lead.stageId === 's7');
  const wonThisMonth = won.filter((lead) => isSameMonth(lead.createdAt));
  const closed = won.length + lost.length;
  const conversion = closed === 0 ? 0 : Math.round((won.length / closed) * 100);
  const staleCount = leads.filter((lead) => isStale(lead, interactions)).length;

  const chart = stages.map((stage) => ({
    name: stage.name,
    leads: leads.filter((lead) => lead.stageId === stage.id).length,
    fill: stage.color,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Resumen del embudo de Altura. Arrastra leads en el pipeline o abre un cliente.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Leads totales" value={String(leads.length)} hint="En el embudo" />
        <Metric label="Ganados este mes" value={String(wonThisMonth.length)} hint="Etapa Ganado" />
        <Metric label="Conversión" value={`${conversion}%`} hint="Ganados / cerrados" />
        <Metric
          label="Sin actividad"
          value={String(staleCount)}
          hint="Más de 7 días"
          warn={staleCount > 0}
        />
      </section>

      <section className="rounded-2xl border border-line bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Leads por etapa</h2>
          <Link to="/pipeline" className="text-sm font-semibold text-brand hover:underline">
            Ver pipeline
          </Link>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="leads" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: string;
  hint: string;
  warn?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-line bg-card p-4">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${warn ? 'text-warn' : ''}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </article>
  );
}
