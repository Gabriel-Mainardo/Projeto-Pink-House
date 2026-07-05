import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (requireAdmin) {
      const adminData = localStorage.getItem('admin');
      
      if (!adminData) {
        // Não está logado como admin, redireciona para login
        navigate('/admin-login');
        return;
      }

      try {
        const admin = JSON.parse(adminData);
        if (!admin.isLoggedIn || admin.role !== 'admin') {
          // Admin inválido, redireciona para login
          localStorage.removeItem('admin');
          navigate('/admin-login');
          return;
        }
      } catch (error) {
        // Dados corrompidos, limpa e redireciona
        localStorage.removeItem('admin');
        navigate('/admin-login');
        return;
      }
    }
  }, [navigate, requireAdmin]);

  return <>{children}</>;
};

export default ProtectedRoute; 