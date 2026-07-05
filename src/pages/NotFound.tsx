import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center velvet-gradient">
      <div className="text-center p-12 card-velvet rounded-xl">
        <h1 className="text-6xl font-serif font-bold mb-4 text-velvet-white">404</h1>
        <p className="text-xl text-velvet-white/70 mb-6">Página não encontrada</p>
        <a href="/" className="btn-velvet inline-block">
          Voltar para Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
