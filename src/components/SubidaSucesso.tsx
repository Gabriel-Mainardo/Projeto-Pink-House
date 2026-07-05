import { useEffect, useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

interface SubidaSucessoProps {
  onVoltar: () => void;
  onVerStatus?: () => void;
  duracao?: string;
  cidade?: string;
  expiresAt?: string;
}

const SubidaSucesso = ({
  onVoltar,
  onVerStatus,
  duracao = "1 hora",
  cidade = "sua cidade",
  expiresAt,
}: SubidaSucessoProps) => {
  const [remaining, setRemaining] = useState({ min: 0, sec: 0, pct: 0 });

  useEffect(() => {
    document.body.classList.add("hide-bottom-navigation");
    return () => document.body.classList.remove("hide-bottom-navigation");
  }, []);

  // Live countdown
  useEffect(() => {
    if (!expiresAt) return;

    const durationMs = parseDurationMs(duracao);

    const update = () => {
      const now = Date.now();
      const end = new Date(expiresAt).getTime();
      const remainMs = Math.max(0, end - now);
      const mins = Math.floor(remainMs / 60000);
      const secs = Math.floor((remainMs % 60000) / 1000);
      const pct = durationMs > 0 ? Math.min(100, ((durationMs - remainMs) / durationMs) * 100) : 0;
      setRemaining({ min: mins, sec: secs, pct });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt, duracao]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-lg px-4 py-3.5 text-center">
          <h1 className="text-lg font-bold text-gray-900">Subida Ativada</h1>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-lg w-full px-5 py-8 flex flex-col items-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Sucesso!</h2>
        <p className="text-sm text-gray-500 mb-6">
          Seu perfil esta no topo em <span className="font-semibold text-gray-700">{cidade}</span>
        </p>

        {/* Countdown card */}
        <div className="w-full bg-gray-50 rounded-2xl p-5 mb-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#d91d83]" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tempo Restante</span>
          </div>

          {/* Timer display */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white rounded-xl px-4 py-2 border border-gray-100 text-center min-w-[72px]">
              <span className="text-3xl font-bold text-gray-900">{String(remaining.min).padStart(2, "0")}</span>
              <p className="text-[9px] text-gray-400 uppercase mt-0.5">Minutos</p>
            </div>
            <span className="text-2xl font-bold text-gray-300">:</span>
            <div className="bg-white rounded-xl px-4 py-2 border border-gray-100 text-center min-w-[72px]">
              <span className="text-3xl font-bold text-gray-900">{String(remaining.sec).padStart(2, "0")}</span>
              <p className="text-[9px] text-gray-400 uppercase mt-0.5">Segundos</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${100 - remaining.pct}%`,
                backgroundColor: "#d91d83",
              }}
            />
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            {remaining.pct.toFixed(0)}% do tempo utilizado
          </p>
        </div>

        {/* PinkPoints reward */}
        <div className="w-full bg-[#FFF8FB] rounded-2xl p-4 mb-6 border border-pink-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🌸</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">+10 PinkPoints ganhos!</p>
            <p className="text-xs text-gray-500">Obrigada por usar a Subida</p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="w-full space-y-3 pb-4">
          <button
            onClick={onVoltar}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98]"
            style={{ backgroundColor: "#d91d83" }}
          >
            Ver meu Perfil
          </button>

          {onVerStatus && (
            <button
              onClick={onVerStatus}
              className="w-full py-4 rounded-2xl font-bold text-base border-2 border-pink-200 text-[#d91d83] hover:bg-pink-50 transition-all active:scale-[0.98]"
            >
              Ver Status da Subida
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

function parseDurationMs(duracao: string): number {
  const match = duracao.match(/(\d+)/);
  const hours = match ? parseInt(match[1], 10) : 1;
  return hours * 60 * 60 * 1000;
}

export default SubidaSucesso;
