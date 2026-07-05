import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="mx-auto max-w-[1180px] px-4 md:px-10 xl:px-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-white">Pink</span><span className="text-pink-400">House</span>
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Conectando pessoas com discrição e elegância. Sua privacidade é nossa prioridade.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/terms-of-use" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="/privacy-policy" className="hover:text-white transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/terms-of-use" className="hover:text-white transition-colors">Segurança</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Pink House. Todos os direitos reservados.</p>
          <p className="mt-2 text-sm">
            Este site é destinado exclusivamente para maiores de 18 anos.
          </p>
          
          {/* Botão discreto e estiloso para Painel Admin */}
          <div className="mt-8 flex justify-center">
            <a 
              href="/admin-login" 
              className="group relative inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-500 overflow-hidden"
              title="Painel Administrativo"
            >
              {/* Ponto discreto */}
              <div className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-velvet-pink-400 transition-colors duration-300"></div>
              
              {/* Tooltip que aparece no hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                Admin
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
