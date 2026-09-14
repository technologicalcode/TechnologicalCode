import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useCrm } from '../store/crm-store';

const LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/nuevo', label: 'Nuevo lead' },
];

export function Layout() {
  const { user, logout } = useCrm();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-paper text-ink lg:grid lg:grid-cols-[15.5rem_1fr]">
      <aside className="border-b border-line bg-card px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="mb-5 flex items-center justify-between gap-3 lg:mb-8 lg:block">
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-brand uppercase">
              Altura
            </p>
            <p className="text-lg font-semibold tracking-tight">CRM inmobiliario</p>
          </div>
          <p className="hidden text-xs text-muted lg:mt-1 lg:block">Demo · TechnologicalCode</p>
        </div>

        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 font-semibold text-brand'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 lg:mt-10">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted capitalize">{user?.role}</p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Salir
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <Outlet />
      </main>
    </div>
  );
}
