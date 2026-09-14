/**
 * Seed en memoria (sin SQLite).
 * En producción real estas tablas viven en PostgreSQL:
 *   users(id, name, email, password_hash, role)
 *   stages(id, name, sort_order)
 *   leads(id, name, company, phone, email, source, created_at, stage_id, assignee_id, interest)
 *   interactions(id, lead_id, user_id, type, description, date)
 */

export const USERS = [
  { id: 'u1', name: 'Carla Ruiz', email: 'admin@demo.com', password: 'demo1234', role: 'admin' },
  { id: 'u2', name: 'Diego Soto', email: 'diego@demo.com', password: 'demo1234', role: 'vendedor' },
];

export const STAGES = [
  { id: 's1', name: 'Nuevo', order: 1, color: '#94a3b8' },
  { id: 's2', name: 'Contactado', order: 2, color: '#38bdf8' },
  { id: 's3', name: 'Visita', order: 3, color: '#818cf8' },
  { id: 's4', name: 'Propuesta', order: 4, color: '#f59e0b' },
  { id: 's5', name: 'Negociación', order: 5, color: '#fb7185' },
  { id: 's6', name: 'Ganado', order: 6, color: '#34d399' },
  { id: 's7', name: 'Perdido', order: 7, color: '#64748b' },
];

export const INITIAL_LEADS = [
  { id: 'l1', name: 'Lucía Mendoza', company: 'Familia Mendoza', phone: '987 111 201', email: 'lucia@mail.com', source: 'web', createdAt: '2026-08-02', stageId: 's1', assigneeId: 'u2', interest: 'Dpto 2 dorm. — Barranco' },
  { id: 'l2', name: 'Jorge Palacios', company: 'Palacios SAC', phone: '987 111 202', email: 'jorge@palacios.pe', source: 'referido', createdAt: '2026-08-05', stageId: 's2', assigneeId: 'u2', interest: 'Oficina 80 m² — San Isidro' },
  { id: 'l3', name: 'Ana Torres', company: 'Independiente', phone: '987 111 203', email: 'ana.t@mail.com', source: 'redes', createdAt: '2026-07-20', stageId: 's3', assigneeId: 'u1', interest: 'Casa de playa — Asia' },
  { id: 'l4', name: 'Mateo Ríos', company: 'Ríos & Hijos', phone: '987 111 204', email: 'mateo@rios.pe', source: 'feria', createdAt: '2026-08-12', stageId: 's4', assigneeId: 'u2', interest: 'Terreno 300 m² — Lurín' },
  { id: 'l5', name: 'Elena Vásquez', company: 'Clínica Vásquez', phone: '987 111 205', email: 'elena@clinica.pe', source: 'web', createdAt: '2026-08-18', stageId: 's5', assigneeId: 'u1', interest: 'Local comercial — Miraflores' },
  { id: 'l6', name: 'Pablo Núñez', company: 'Núñez Group', phone: '987 111 206', email: 'pablo@nunez.pe', source: 'referido', createdAt: '2026-09-04', stageId: 's6', assigneeId: 'u2', interest: 'Penthouse — San Borja' },
  { id: 'l7', name: 'Rosa Delgado', company: 'Delgado Inversiones', phone: '987 111 207', email: 'rosa@delgado.pe', source: 'web', createdAt: '2026-06-15', stageId: 's7', assigneeId: 'u1', interest: 'Dpto 3 dorm. — Surco' },
  { id: 'l8', name: 'Iván Castro', company: 'Castro Labs', phone: '987 111 208', email: 'ivan@castro.pe', source: 'redes', createdAt: '2026-08-22', stageId: 's1', assigneeId: 'u2', interest: 'Loft — Barranco' },
  { id: 'l9', name: 'Marta Quispe', company: 'Quispe Hnos.', phone: '987 111 209', email: 'marta@quispe.pe', source: 'feria', createdAt: '2026-08-08', stageId: 's2', assigneeId: 'u1', interest: 'Casa 180 m² — La Molina' },
  { id: 'l10', name: 'Hugo Salas', company: 'Salas Legal', phone: '987 111 210', email: 'hugo@salas.pe', source: 'referido', createdAt: '2026-08-25', stageId: 's3', assigneeId: 'u2', interest: 'Oficina vista al golf' },
  { id: 'l11', name: 'Camila Ortiz', company: 'Ortiz Studio', phone: '987 111 211', email: 'camila@ortiz.pe', source: 'web', createdAt: '2026-07-30', stageId: 's4', assigneeId: 'u1', interest: 'Dpto estreno — Jesús María' },
  { id: 'l12', name: 'Raúl Pinedo', company: 'Pinedo Corp', phone: '987 111 212', email: 'raul@pinedo.pe', source: 'redes', createdAt: '2026-08-01', stageId: 's5', assigneeId: 'u2', interest: 'Edificio 4 pisos — Pueblo Libre' },
  { id: 'l13', name: 'Sofía León', company: 'León Family', phone: '987 111 213', email: 'sofia@mail.com', source: 'web', createdAt: '2026-08-28', stageId: 's1', assigneeId: 'u1', interest: 'Dpto 1 dorm. — Magdalena' },
  { id: 'l14', name: 'Andrés Vega', company: 'Vega Foods', phone: '987 111 214', email: 'andres@vega.pe', source: 'referido', createdAt: '2026-09-08', stageId: 's6', assigneeId: 'u2', interest: 'Almacén + oficina — Callao' },
  { id: 'l15', name: 'Natalia Cruz', company: 'Cruz Design', phone: '987 111 215', email: 'natalia@cruz.pe', source: 'feria', createdAt: '2026-07-10', stageId: 's2', assigneeId: 'u1', interest: 'Studio — San Miguel' },
];

export const INITIAL_INTERACTIONS = [
  { id: 'i1', leadId: 'l2', userId: 'u2', type: 'llamada', description: 'Primera llamada. Quiere ver San Isidro esta semana.', date: '2026-08-20' },
  { id: 'i2', leadId: 'l3', userId: 'u1', type: 'reunion', description: 'Visita a casa en Asia. Le gustó el terreno.', date: '2026-08-21' },
  { id: 'i3', leadId: 'l4', userId: 'u2', type: 'email', description: 'Envié brochure del terreno en Lurín.', date: '2026-08-24' },
  { id: 'i4', leadId: 'l5', userId: 'u1', type: 'nota', description: 'Pide financiamiento a 10 años.', date: '2026-08-26' },
  { id: 'i5', leadId: 'l6', userId: 'u2', type: 'reunion', description: 'Firma de separación. Cierre en septiembre.', date: '2026-09-04' },
  { id: 'i6', leadId: 'l7', userId: 'u1', type: 'llamada', description: 'Eligió otro proyecto en Surco.', date: '2026-07-01' },
  { id: 'i7', leadId: 'l9', userId: 'u1', type: 'email', description: 'Mandé 3 opciones en La Molina.', date: '2026-08-09' },
  { id: 'i8', leadId: 'l10', userId: 'u2', type: 'llamada', description: 'Agenda visita al golf el jueves.', date: '2026-08-27' },
  { id: 'i9', leadId: 'l11', userId: 'u1', type: 'nota', description: 'Espera bono del banco.', date: '2026-08-19' },
  { id: 'i10', leadId: 'l12', userId: 'u2', type: 'reunion', description: 'Contraoferta: pide 8% menos.', date: '2026-08-23' },
  { id: 'i11', leadId: 'l14', userId: 'u2', type: 'email', description: 'Minuta lista. Ganado.', date: '2026-09-08' },
  { id: 'i12', leadId: 'l15', userId: 'u1', type: 'llamada', description: 'Sin respuesta. Reintentar.', date: '2026-07-18' },
];
