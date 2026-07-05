import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ClientRegister = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/client-signup', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Cadastro atualizado</h1>
        <p className="text-gray-600 mb-6">
          Esta rota antiga foi substituida pelo fluxo oficial de cadastro de cliente.
        </p>
        <Link
          to="/client-signup"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-blue-600 transition-colors"
        >
          Ir para cadastro de cliente
        </Link>
      </div>
    </div>
  );
};

export default ClientRegister;
