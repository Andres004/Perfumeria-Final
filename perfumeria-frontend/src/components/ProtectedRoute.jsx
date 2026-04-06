import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Simulación de autenticación (Luego esto vendrá de Supabase)
  // Cambia esto a 'false' para probar cómo te bloquea el acceso
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';

  if (!isAuthenticated) {
    // Si no está logueado, lo redirigimos al Login (la raíz '/')
    return <Navigate to="/" replace />;
  }

  // Si está logueado, lo dejamos pasar a la página que quería ver
  return children;
};

export default ProtectedRoute;