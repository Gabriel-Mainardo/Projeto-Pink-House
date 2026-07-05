// src/components/SubidasDoPerfil.tsx
import { useState, useEffect } from "react";
import { ArrowLeft, Clock } from "lucide-react";

type Plano = {
  id: string;
  titulo: string;
  resumo: string;
  badge: string;
  priceRositas?: number;
  priceLocal?: string;
  destaque?: boolean;
  dbData?: any;
};

type Props = {
  saldoRositas?: number;
  onCarregar?: () => void;
  onSubir?: (plano: Plano, mode: 'gravar' | 'galeria') => void;
  onCancelar?: () => void;
  planos: Plano[];
  defaultPlanoId?: string;
  isSending?: boolean;
  sendError?: string;
};

export default function SubidasDoPerfil({
  saldoRositas = 0,
  onCarregar,
  onSubir,
  onCancelar,
  planos,
  defaultPlanoId,
  isSending = false,
  sendError = '',
}: Props) {
  const [selecionado, setSelecionado] = useState<string>(
    defaultPlanoId || planos[0]?.id || ""
  );

  // Atualizar selecionado quando planos carregam assincronamente
  useEffect(() => {
    if (planos.length > 0) {
      if (defaultPlanoId && planos.find(p => p.id === defaultPlanoId)) {
        setSelecionado(defaultPlanoId);
      } else if (!planos.find(p => p.id === selecionado)) {
        setSelecionado(planos[0].id);
      }
    }
  }, [planos, defaultPlanoId]);

  const planoAtivo = planos.find((p) => p.id === selecionado) || planos[0];
  const custo = planoAtivo?.priceRositas || 0;
  const saldoFinal = saldoRositas - custo;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-lg px-4 py-3.5 flex items-center gap-3">
          <button onClick={onCancelar} className="p-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Confirmar Subida</h1>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-lg w-full px-5 py-6 flex flex-col">
        {/* Pacote selecionado */}
        <div className="text-center mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Pacote Selecionado</p>
          <h2 className="text-2xl font-bold text-gray-900">
            {planoAtivo?.titulo || 'Subida'}
          </h2>
        </div>

        {/* Seletor de planos (se mais de 1) */}
        {planos.length > 1 && (
          <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
            {planos.map(p => (
              <button
                key={p.id}
                onClick={() => setSelecionado(p.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  selecionado === p.id
                    ? 'bg-[#d91d83] text-white border-[#d91d83]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#d91d83]'
                }`}
              >
                {p.titulo}
              </button>
            ))}
          </div>
        )}

        {/* Info card */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Duracao</p>
              <p className="text-base font-bold text-gray-900">{planoAtivo?.badge || '1 hora no topo'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Custo</p>
              <p className="text-base font-bold text-[#d91d83]">
                {custo > 0 ? `${custo}` : '0'} <span className="text-sm font-medium text-gray-500">Rositas</span>
              </p>
            </div>
          </div>

          {/* Saldo */}
          <div className="bg-white rounded-xl p-3.5 flex items-center justify-between border border-gray-100">
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Saldo Atual</p>
              <p className="text-lg font-bold text-gray-900">{saldoRositas}</p>
            </div>
            <div className="text-gray-300 text-lg">&rarr;</div>
            <div className="text-right">
              <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Saldo Final</p>
              <p className={`text-lg font-bold ${saldoFinal >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                {saldoFinal}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            Seu perfil subira no topo da sua cidade.
          </p>
        </div>

        {/* Dica do video */}
        <div className="bg-[#FFF8FB] border border-pink-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-[#d91d83]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.5 5.5v9l7-4.5-7-4.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Para o maximo de impacto, prefira gravar seu video <span className="text-[#d91d83] font-bold uppercase">AGORA</span>.
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              O horario do video sera mostrado aos visitantes do site.
            </p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Error */}
        {sendError && (
          <div className="mb-3 p-3 rounded-xl text-sm font-medium text-red-700 bg-red-50 border border-red-200">
            {sendError}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pb-4">
          <button
            onClick={() => planoAtivo && onSubir?.(planoAtivo, 'gravar')}
            disabled={isSending}
            className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: '#d91d83' }}
          >
            {isSending ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processando...
              </>
            ) : (
              <>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </span>
                Gravar Video Agora
              </>
            )}
          </button>

          <button
            onClick={() => planoAtivo && onSubir?.(planoAtivo, 'galeria')}
            disabled={isSending}
            className="w-full py-4 rounded-2xl font-bold text-base border-2 border-pink-200 text-[#d91d83] hover:bg-pink-50 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            Escolher da Galeria
          </button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Duracao maxima: 15 segundos</span>
          </div>

          <button
            onClick={onCancelar}
            className="w-full py-2.5 text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors"
          >
            Cancelar
          </button>
        </div>
      </main>
    </div>
  );
}
