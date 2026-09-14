import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOURCE_LABEL } from '../lib/labels';
import { sourceList, useCrm } from '../store/crm-store';
import type { LeadSource } from '../types';

export function NewLead() {
  const { users, stages, addLead } = useCrm();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('web');
  const [stageId, setStageId] = useState(stages[0]?.id ?? 's1');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id ?? 'u1');
  const [interest, setInterest] = useState('');

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      return;
    }
    const lead = addLead({
      name: name.trim(),
      company: company.trim() || 'Independiente',
      phone: phone.trim() || '—',
      email: email.trim(),
      source,
      stageId,
      assigneeId,
      interest: interest.trim() || 'Consulta general',
    });
    navigate(`/clientes/${lead.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo lead</h1>
        <p className="mt-1 text-sm text-muted">Alta manual. En un CRM real también entra por web o WhatsApp.</p>
      </header>

      <form className="space-y-4 rounded-2xl border border-line bg-card p-5" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" value={name} onChange={setName} required />
          <Field label="Empresa" value={company} onChange={setCompany} />
          <Field label="Teléfono" value={phone} onChange={setPhone} />
          <Field label="Email" value={email} onChange={setEmail} type="email" required />
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Interés</span>
          <input
            className="w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="Dpto 2 dorm. — Barranco"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Fuente</span>
            <select
              className="w-full rounded-lg border border-line px-3 py-2"
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
            >
              {sourceList().map((item) => (
                <option key={item} value={item}>
                  {SOURCE_LABEL[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Etapa</span>
            <select
              className="w-full rounded-lg border border-line px-3 py-2"
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Asignado a</span>
            <select
              className="w-full rounded-lg border border-line px-3 py-2"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-2"
        >
          Crear lead
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        className="w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        required={required}
      />
    </label>
  );
}
