import Footer from '../components/Footer';

const TermsOfUse = () => {
  const currentDate = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="min-h-screen bg-white">
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">
              Termos de Uso
            </h1>
            <p className="text-gray-600">
              Plataforma Privada de Experiências Pessoais
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-lg prose prose-gray max-w-none">
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4">
                <strong>Última atualização:</strong> {currentDate}
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Bem-vindo à <strong>Faixa Rosa</strong>, uma plataforma digital desenvolvida para conectar pessoas interessadas em experiências pessoais exclusivas. Ao acessar ou utilizar nossos serviços, você concorda integralmente com os termos e condições descritos abaixo. Se você não concorda com qualquer parte destes termos, por favor, não utilize a plataforma.
              </p>
            </div>

            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-3">
                  1. NATUREZA DO SERVIÇO
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>1.1.</strong> A Faixa Rosa é uma plataforma de anúncio e divulgação pessoal. Nós não agenciamos, intermediamos, controlamos ou nos responsabilizamos por qualquer contato, interação, encontro ou serviço prestado entre os usuários da plataforma.
                  </p>
                  <p>
                    <strong>1.2.</strong> Todos os perfis, informações e conteúdos são de responsabilidade exclusiva dos anunciantes.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-3">
                  2. USO DA PLATAFORMA
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>2.1.</strong> Para acessar determinadas funcionalidades, o usuário deverá ter mais de 18 anos e fornecer informações verdadeiras.
                  </p>
                  <p>
                    <strong>2.2.</strong> O uso da plataforma é destinado exclusivamente à divulgação de perfis e contatos de forma voluntária e autônoma.
                  </p>
                  <p>
                    <strong>2.3.</strong> É proibido utilizar a plataforma para:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Práticas ilegais;</li>
                    <li>Compartilhar conteúdo sexualmente explícito ou pornográfico;</li>
                    <li>Promover ou facilitar atividades de rufianismo, lenocínio ou agenciamento;</li>
                    <li>Publicar informações falsas ou fraudulentas.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-3">
                  3. RESPONSABILIDADE DOS USUÁRIOS
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>3.1.</strong> O usuário é o único responsável pelas informações fornecidas e pelas interações realizadas.
                  </p>
                  <p>
                    <strong>3.2.</strong> Faixa Rosa não participa nem intervém nas comunicações entre os usuários, tampouco garante a veracidade das informações publicadas.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-3">
                  4. POLÍTICA DE PRIVACIDADE
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>4.1.</strong> Os dados fornecidos pelos usuários são armazenados com confidencialidade e usados apenas para operação interna da plataforma.
                  </p>
                  <p>
                    <strong>4.2.</strong> Não compartilhamos dados com terceiros sem autorização.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-3">
                  5. SUSPENSÃO E EXCLUSÃO DE CONTA
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>5.1.</strong> Reservamo-nos o direito de suspender ou excluir contas que violem estes termos, sem aviso prévio.
                  </p>
                  <p>
                    <strong>5.2.</strong> O uso indevido da plataforma pode acarretar a responsabilização civil e criminal.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-3">
                  6. MODIFICAÇÕES NOS TERMOS
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>6.1.</strong> Estes termos podem ser atualizados a qualquer momento, a critério exclusivo da administração do site. A continuidade do uso da plataforma após alterações representa aceitação integral das novas condições.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-3">
                  7. CONTATO
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    Para dúvidas ou solicitações relacionadas a estes termos, entre em contato através do canal oficial disponibilizado na plataforma.
                  </p>
                </div>
              </section>

              {/* Aviso Legal Destacado */}
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-8">
                <p className="text-amber-800 font-medium">
                  <strong>Faixa Rosa</strong> é uma ferramenta digital neutra, que apenas disponibiliza espaço para divulgação pessoal e interação voluntária entre adultos. Não apoiamos, incentivamos ou promovemos atividades ilegais de qualquer natureza.
                </p>
              </div>

              {/* Aviso de Isenção */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-6">
                <p className="text-gray-700 text-center font-medium">
                  <strong>IMPORTANTE:</strong> Somos apenas um site de anúncios. Não agenciamos, intermediamos nem garantimos qualquer encontro entre partes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfUse; 