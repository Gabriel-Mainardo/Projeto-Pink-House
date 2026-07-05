import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">Politica de Privacidade</h1>
          <p className="text-gray-600">
            Esta politica explica quais dados a Pink House coleta, como eles sao usados e quais controles o usuario possui.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">1. Dados coletados</h2>
          <p className="text-gray-700">
            Podemos coletar dados cadastrais, informacoes de acesso, localizacao aproximada, historico de interacoes e conteudos enviados para operacao da plataforma, seguranca e cumprimento legal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">2. Uso das informacoes</h2>
          <p className="text-gray-700">
            Os dados sao utilizados para autenticar usuarios, publicar perfis, processar pagamentos, moderar conteudo, prevenir fraude, cumprir obrigacoes legais e melhorar a experiencia do servico.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">3. Compartilhamento</h2>
          <p className="text-gray-700">
            A plataforma pode compartilhar dados com provedores de infraestrutura, pagamento, autenticacao e obrigacoes regulatórias, sempre dentro do necessario para a operacao do servico.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">4. Direitos do usuario</h2>
          <p className="text-gray-700">
            O usuario pode solicitar acesso, correcao, atualizacao ou exclusao de dados pessoais, respeitadas as obrigacoes legais e de seguranca aplicaveis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">5. Contato</h2>
          <p className="text-gray-700">
            Para solicitacoes relacionadas a privacidade, utilize os canais oficiais de suporte disponibilizados pela plataforma.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
