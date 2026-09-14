import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { isStale } from '../lib/dates';
import { initials, SOURCE_LABEL } from '../lib/labels';
import type { Interaction, Lead } from '../types';

type Props = {
  lead: Lead;
  interactions: Interaction[];
  assigneeName?: string;
};

export function LeadCard({ lead, interactions, assigneeName }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  });
  const stale = isStale(lead, interactions);

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-line bg-card p-3 shadow-sm ${
        isDragging ? 'z-10 opacity-80 ring-2 ring-blue-200' : ''
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <button
          type="button"
          className="cursor-grab text-left active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <p className="text-sm font-semibold">{lead.name}</p>
          <p className="text-xs text-muted">{lead.company}</p>
        </button>
        {stale ? (
          <span
            title="Más de 7 días sin actividad"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-warn"
          >
            !
          </span>
        ) : null}
      </div>
      <p className="mb-3 line-clamp-2 text-xs text-slate-600">{lead.interest}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.68rem] font-medium text-slate-600">
          {SOURCE_LABEL[lead.source]}
        </span>
        <div className="flex items-center gap-2">
          <span
            title={assigneeName}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[0.62rem] font-semibold text-brand"
          >
            {initials(assigneeName ?? '?')}
          </span>
          <Link
            to={`/clientes/${lead.id}`}
            className="text-[0.7rem] font-semibold text-brand hover:underline"
          >
            Ver
          </Link>
        </div>
      </div>
    </article>
  );
}
