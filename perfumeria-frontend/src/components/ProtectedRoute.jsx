import { useEffect, useState, useRef, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const [authState, setAuthState] = useState({
    isAuthenticated: localStorage.getItem('isLoggedIn') === 'true',
    role: localStorage.getItem('role')
  });

  const logoutAction = useCallback(() => {
    localStorage.clear();
    setAuthState({ isAuthenticated: false, role: null });
    navigate('/', { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logoutAction();
    }, 20 * 60 * 1000); 
  }, [logoutAction]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'isLoggedIn' || e.key === 'role' || e.key === null) {
        const isAuth = localStorage.getItem('isLoggedIn') === 'true';
        const currentRole = localStorage.getItem('role');
        
        setAuthState({
          isAuthenticated: isAuth,
          role: currentRole
        });

        if (!isAuth) {
          navigate('/', { replace: true });
        } else if (allowedRoles && !allowedRoles.includes(currentRole)) {
          navigate(currentRole === 'admin' ? '/dashboard' : '/venta', { replace: true });
        }
      }
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    window.addEventListener('storage', handleStorageChange);
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('storage', handleStorageChange);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate, allowedRoles, resetTimer]);

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(authState.role)) {
    if (authState.role === 'vendedor') {
      return <Navigate to="/venta" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;