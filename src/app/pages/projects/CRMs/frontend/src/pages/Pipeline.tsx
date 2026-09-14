import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LeadCard } from '../components/LeadCard';
import { useCrm } from '../store/crm-store';
import type { Stage } from '../types';

/**
 * Drag and drop del pipeline:
 * - cada columna es un droppable con id = stage.id
 * - cada tarjeta es sortable con id = lead.id
 * - al soltar sobre una columna (o sobre otra tarjeta), movemos el lead de etapa
 */
export function Pipeline() {
  const { leads, stages, interactions, moveLead, userById } = useCrm();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const leadId = String(active.id);
    const overId = String(over.id);
    const overStage = stages.find((stage) => stage.id === overId);
    if (overStage) {
      moveLead(leadId, overStage.id);
      return;
    }
    const overLead = leads.find((lead) => lead.id === overId);
    if (overLead) {
      moveLead(leadId, overLead.stageId);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="mt-1 text-sm text-muted">
          Arrastra una tarjeta entre columnas para cambiar de etapa.
        </p>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <Column
              key={stage.id}
              stage={stage}
              leads={leads.filter((lead) => lead.stageId === stage.id)}
              interactions={interactions}
              assigneeName={(id) => userById(id)?.name}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function Column({
  stage,
  leads,
  interactions,
  assigneeName,
}: {
  stage: Stage;
  leads: ReturnType<typeof useCrm>['leads'];
  interactions: ReturnType<typeof useCrm>['interactions'];
  assigneeName: (id: string) => string | undefined;
}) {
  const { setNodeRef } = useDroppable({ id: stage.id });
  const ids = leads.map((lead) => lead.id);

  return (
    <section className="w-[16.5rem] shrink-0 rounded-2xl border border-line bg-slate-50/80 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: stage.color }} />
          {stage.name}
        </h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-muted">{leads.length}</span>
      </div>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex min-h-40 flex-col gap-2">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              interactions={interactions}
              assigneeName={assigneeName(lead.assigneeId)}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
