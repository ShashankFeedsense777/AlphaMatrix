import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  const isAuthenticated = Boolean(localStorage.getItem('loggedIn')); // your auth check

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}