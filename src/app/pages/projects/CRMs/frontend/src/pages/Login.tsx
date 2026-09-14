import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCrm } from '../store/crm-store';

export function Login() {
  const { user, login } = useCrm();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const ok = login(email, password);
    if (!ok) {
      setError('Credenciales inválidas. Prueba admin@demo.com / demo1234.');
      return;
    }
    navigate('/', { replace: true });
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-7 shadow-sm">
        <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-brand uppercase">
          Altura
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ingresar al CRM</h1>
        <p className="mt-2 text-sm text-muted">
          Inmobiliaria de ejemplo. Usuario de demo precargado.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input
              className="w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Contraseña</span>
            <input
              className="w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-2"
          >
            Entrar
          </button>
        </form>
        <p className="mt-4 text-xs text-muted">admin@demo.com · demo1234</p>
      </div>
    </div>
  );
}
