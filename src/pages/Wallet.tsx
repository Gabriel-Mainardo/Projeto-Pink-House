import { ArrowLeft, Heart, Star, Trophy, Zap, Camera, Gift, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { RositasStoreModal } from "@/components/RositasStoreModal";

const Wallet = () => {
  const navigate = useNavigate();
  const [showRositasStore, setShowRositasStore] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // Cor rosa personalizada para a carteira
  const rosaCarteira = "#d91d83";

  // Detectar mudança de tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para lidar com o clique no botão de comprar rositas
  const handleComprarRositas = () => {
    if (isDesktop) {
      navigate('/minhas-rositas');
    } else {
      setShowRositasStore(true);
    }
  };

  const transactions = [
    {
      id: 1,
      title: "Subida de Anúncio - Turbo 1h",
      date: "19 nov 2025, 14:30",
      amount: "-80",
      type: "negative",
      icon: Zap,
    },
    {
      id: 2,
      title: "Bônus de Indicação",
      date: "18 nov 2025, 10:15",
      amount: "+150",
      type: "positive",
      icon: Gift,
    },
    {
      id: 3,
      title: "Story Publicado",
      date: "17 nov 2025, 16:45",
      amount: "-50",
      type: "negative",
      icon: Camera,
    },
    {
      id: 4,
      title: "Avaliação 5 Estrelas",
      date: "16 nov 2025, 09:20",
      amount: "+25",
      type: "positive",
      icon: Star,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-24">
      <div className="max-w-2xl md:max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1
            className="text-2xl"
            style={{
              fontWeight: 600
            }}
          >
            Carteira
          </h1>
        </div>

        {/* Cards principais em grid no desktop */}
        <div className="space-y-6 md:grid md:grid-cols-3 md:gap-6 md:space-y-0 md:items-stretch">

        {/* Rositas Balance Card */}
        <Card
          className="p-6 bg-white rounded-lg flex flex-col min-h-[280px]"
        >
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" style={{ color: rosaCarteira }} />
            <span
              className="font-medium"
              style={{
                fontWeight: 700,
                color: '#333'
              }}
            >
              Rositas
            </span>
          </div>
          <div
            className="text-5xl font-bold mt-4"
            style={{
              color: rosaCarteira,
              fontWeight: 700
            }}
          >
            3.000
          </div>
          <p
            className="text-sm mt-4"
            style={{
              fontWeight: 400,
              color: '#777'
            }}
          >
            Saldo disponível para<br />
            subir anúncio, stories ou<br />
            desbloquear fotos.
          </p>
          <div className="flex justify-end mt-auto pt-4">
            <Button
              onClick={handleComprarRositas}
              className="w-full text-white rounded-md"
              style={{
                background: 'linear-gradient(90deg, #FF4FB1 0%, #FF4FB1 30%, #7C3AED 100%)',
                fontWeight: 500,
                border: 'none',
                fontSize: '11px',
                padding: '10px 12px',
                height: 'auto'
              }}
            >
              +Comprar Rositas
            </Button>
          </div>
        </Card>

        {/* PinkPoints Balance Card */}
        <Card
          className="p-6 bg-white rounded-lg flex flex-col min-h-[280px]"
        >
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" style={{ color: rosaCarteira }} />
            <span
              className="font-medium"
              style={{
                fontWeight: 700,
                color: '#333'
              }}
            >
              PinkPoints
            </span>
          </div>
          <div
            className="text-5xl font-bold mt-4"
            style={{
              color: rosaCarteira,
              fontWeight: 700
            }}
          >
            81.385
          </div>
          <p
            className="text-sm mt-4"
            style={{
              fontWeight: 400,
              color: '#777'
            }}
          >
            7ª posição no ranking de engajamento
          </p>
          <div className="flex justify-start mt-auto pt-4">
            <Button
              variant="outline"
              className="w-full rounded-md"
              onClick={() => navigate('/pinkpoints')}
              style={{
                borderColor: rosaCarteira,
                color: rosaCarteira,
                fontWeight: 500,
                borderWidth: '2px',
                fontSize: '11px',
                padding: '10px 12px',
                height: 'auto'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${rosaCarteira}08`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Como usar os PinkPoints?
            </Button>
          </div>
        </Card>

        {/* Ranking Card */}
        <Card className="p-6 bg-white rounded-lg flex flex-col min-h-[280px]">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 fill-current" style={{ color: rosaCarteira }} />
            <span
              className="font-medium"
              style={{
                fontWeight: 700,
                color: '#333'
              }}
            >
              Ranking
            </span>
          </div>
          <h3
            className="text-3xl font-bold mt-4"
            style={{
              fontWeight: 700,
              color: rosaCarteira
            }}
          >
            7ª posição no ranking nacional
          </h3>
          <p
            className="text-sm mt-3"
            style={{
              fontWeight: 400,
              color: '#666'
            }}
          >
            654 pontos • Bônus recebidos: 75
          </p>
          <div className="flex justify-start mt-auto pt-4">
            <Button
              variant="outline"
              className="w-full rounded-md"
              onClick={() => navigate('/ranking-info')}
              style={{
                borderColor: rosaCarteira,
                color: rosaCarteira,
                fontWeight: 500,
                borderWidth: '2px',
                fontSize: '11px',
                padding: '10px 12px',
                height: 'auto'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${rosaCarteira}08`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Como subir no ranking
            </Button>
          </div>
        </Card>

        </div>

        {/* Info Text */}
        <p
          className="text-center text-sm px-4 py-2"
          style={{
            fontWeight: 400,
            color: '#000'
          }}
        >
          Use Rositas para subir seu anúncio, postar stories ou indicar amigas e ganhar bônus.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card
            className="p-6 flex flex-col items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer rounded-3xl"
            onClick={() => navigate('/subidas')}
          >
            <div className="bg-primary/10 p-4 rounded-full">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <span
              className="text-sm font-medium text-center"
              style={{
                fontWeight: 600
              }}
            >
              Subir Anúncio
            </span>
          </Card>

          <Card className="p-6 flex flex-col items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer rounded-3xl">
            <div className="bg-primary/10 p-4 rounded-full">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <span
              className="text-sm font-medium text-center"
              style={{
                fontWeight: 600
              }}
            >
              Publicar Story
            </span>
          </Card>

          <Card
            className="p-6 flex flex-col items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer rounded-3xl"
            onClick={() => navigate('/indique-ganhe')}
          >
            <div className="bg-primary/10 p-4 rounded-full">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <span
              className="text-sm font-medium text-center"
              style={{
                fontWeight: 600
              }}
            >
              Indique e Ganhe
            </span>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="space-y-3">
          <h2
            className="text-xl font-bold px-2"
            style={{
              fontWeight: 600,
              color: '#333'
            }}
          >
            Extrato de Gastos e Ganhos
          </h2>

          <div className="space-y-2">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors rounded-3xl"
              >
                <div className="bg-primary/10 p-3 rounded-full">
                  <transaction.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3
                    className="font-medium"
                    style={{
                      fontWeight: 600
                    }}
                  >
                    {transaction.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      fontWeight: 400,
                      color: '#666'
                    }}
                  >
                    {transaction.date}
                  </p>
                </div>
                <span
                  className={`font-bold text-sm ${
                    transaction.type === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                  style={{
                    fontWeight: 700
                  }}
                >
                  {transaction.amount}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Compra de Rositas */}
      <RositasStoreModal
        isOpen={showRositasStore}
        onClose={() => setShowRositasStore(false)}
      />
    </div>
  );
};

export default Wallet;
