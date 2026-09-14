import { Navigate, Outlet } from 'react-router-dom';
import { useCrm } from '../store/crm-store';

export function ProtectedRoute() {
  const { user } = useCrm();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
