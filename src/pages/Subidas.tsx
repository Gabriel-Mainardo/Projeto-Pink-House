import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import SubidasDoPerfil from "../components/SubidasDoPerfil";
import SubidaSucesso from "../components/SubidaSucesso";
import { supabase } from "../lib/supabase";
import { resolveCompanionId } from "../services/verificationService";

const DAILY_LIMIT_HOURS = 24;
const MAX_BOOSTS_PER_DAY = 3;
const MIN_HOURS_BETWEEN_BOOSTS = 6;

const PLANO_PADRAO = [{
  id: "free-1h",
  titulo: "Subida Gratis 1h",
  resumo: "Ative 1 hora de destaque. No MVP, cada perfil pode usar uma subida por dia.",
  badge: "1 hora no topo",
  destaque: true,
  priceLocal: "Gratis no MVP",
  dbData: null
}];

const formatRemainingHours = (targetDate: string) => {
  const remainingMs = new Date(targetDate).getTime() - Date.now();
  return Math.max(0, remainingMs / (1000 * 60 * 60));
};

const Subidas = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSucesso, setShowSucesso] = useState(false);
  const [showVideoSelect, setShowVideoSelect] = useState(false);
  const [pendingPlano, setPendingPlano] = useState<any>(null);
  const [planoSelecionado, setPlanoSelecionado] = useState<any>(null);
  const [planos, setPlanos] = useState<any[]>([]);
  const [companionId, setCompanionId] = useState<string | null>(null);
  const [companionVideos, setCompanionVideos] = useState<string[]>([]);
  const [selectedAdVideo, setSelectedAdVideo] = useState<string | null>(null);
  const [currentAdVideo, setCurrentAdVideo] = useState<string | null>(null);
  const [activeBoost, setActiveBoost] = useState<any>(null);
  const [lastBoostToday, setLastBoostToday] = useState<any>(null);
  const [boostsToday, setBoostsToday] = useState<any[]>([]);
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [videoInputKey, setVideoInputKey] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [videoMode, setVideoMode] = useState<'gravar' | 'galeria' | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const user = localStorage.getItem("user");

      if (!user) {
        setCompanionId(null);
        return;
      }

      try {
        const parsedUser = JSON.parse(user);
        const resolvedCompanionId = await resolveCompanionId(
          parsedUser.companionId || parsedUser.companion_id || null
        );

        setCompanionId(resolvedCompanionId);
      } catch {
        setCompanionId(null);
      }
    };

    void loadUserData();
  }, []);

  // Carregar vídeos da acompanhante
  useEffect(() => {
    if (!companionId) return;
    const loadVideos = async () => {
      try {
        const { data } = await supabase
          .from("acompanhantes")
          .select("videos, ad_video")
          .eq("id", companionId)
          .single();
        if (data) {
          const vids = (data.videos || []).filter((v: string) => v && v.trim());
          setCompanionVideos(vids);
          setCurrentAdVideo(data.ad_video || null);
          const initialVideo = data.ad_video || (vids.length > 0 ? vids[0] : null);
          setSelectedAdVideo(initialVideo);
          const initialIdx = initialVideo ? vids.indexOf(initialVideo) : 0;
          setCurrentVideoIdx(initialIdx >= 0 ? initialIdx : 0);
        }
      } catch (err) {
        console.error("Erro ao carregar vídeos:", err);
      }
    };
    void loadVideos();
  }, [companionId]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("boost_plans")
          .select("*")
          .eq("is_active", true)
          .order("position_priority", { ascending: true });

        if (error) throw error;

        const planosFormatados = (data || []).map((plan) => {
          const durLabel =
            plan.duration_hours >= 168 ? `${plan.duration_hours / 24} dias` :
            plan.duration_hours >= 24  ? `${plan.duration_hours / 24} dia${plan.duration_hours / 24 > 1 ? 's' : ''}` :
            `${plan.duration_hours} hora${plan.duration_hours > 1 ? 's' : ''}`;
          return {
            id: plan.id,
            titulo: plan.name,
            resumo: `Ative ${durLabel} de destaque no topo da sua cidade. Gratis no MVP.`,
            badge: `${durLabel} no topo`,
            priceLocal: "Gratis no MVP",
            destaque: plan.position_priority === 1,
            dbData: plan
          };
        });

        const resultado = planosFormatados.length > 0 ? planosFormatados : PLANO_PADRAO;
        setPlanos(resultado);

        // Pré-selecionar plano passado via URL (?plan=<id>)
        const planIdFromUrl = searchParams.get("plan");
        if (planIdFromUrl) {
          const found = resultado.find((p) => p.dbData?.id === planIdFromUrl);
          if (found) setPendingPlano(found);
        }
      } catch (error) {
        console.error("Erro ao carregar planos:", error);
        setPlanos(PLANO_PADRAO);
      }
    };

    void loadPlans();
  }, [searchParams]);

  useEffect(() => {
    const loadBoostStatus = async () => {
      if (!companionId) {
        setActiveBoost(null);
        setLastBoostToday(null);
        return;
      }

      try {
        const nowIso = new Date().toISOString();
        const limitDate = new Date(Date.now() - DAILY_LIMIT_HOURS * 60 * 60 * 1000).toISOString();

        const [activeRes, recentRes] = await Promise.all([
          supabase
            .from("active_boosts")
            .select(`
              id,
              started_at,
              expires_at,
              plan_id,
              boost_plans (name, duration_hours)
            `)
            .eq("companion_id", companionId)
            .eq("is_active", true)
            .eq("payment_status", "approved")
            .gt("expires_at", nowIso)
            .order("started_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("active_boosts")
            .select(`
              id,
              started_at,
              expires_at,
              plan_id,
              boost_plans (name, duration_hours)
            `)
            .eq("companion_id", companionId)
            .eq("payment_status", "approved")
            .gte("started_at", limitDate)
            .order("started_at", { ascending: false })
        ]);

        if (activeRes.error && activeRes.error.code !== "PGRST116") throw activeRes.error;
        if (recentRes.error) throw recentRes.error;

        const todayBoosts = recentRes.data || [];
        setActiveBoost(activeRes.data || null);
        setBoostsToday(todayBoosts);
        setLastBoostToday(todayBoosts[0] || null);
      } catch (error) {
        console.error("Erro ao verificar status de subida:", error);
        setActiveBoost(null);
        setLastBoostToday(null);
      }
    };

    void loadBoostStatus();
  }, [companionId]);

  // Next available: 6h after the most recent boost
  const nextBoostAvailableAt = lastBoostToday
    ? new Date(new Date(lastBoostToday.started_at).getTime() + MIN_HOURS_BETWEEN_BOOSTS * 60 * 60 * 1000).toISOString()
    : null;

  const validateBeforeSubida = (plano: any): boolean => {
    setSendError("");

    if (!companionId) {
      const msg = "Voce precisa estar logado para ativar uma subida.";
      setSendError(msg);
      toast.error("Faca login para ativar uma subida");
      return false;
    }

    // Limit: max 3 boosts per 24h window
    if (boostsToday.length >= MAX_BOOSTS_PER_DAY) {
      const oldestBoost = boostsToday[boostsToday.length - 1];
      const resetAt = new Date(new Date(oldestBoost.started_at).getTime() + DAILY_LIMIT_HOURS * 60 * 60 * 1000).toISOString();
      const remainingHours = formatRemainingHours(resetAt);
      const msg = `Limite diario atingido (${MAX_BOOSTS_PER_DAY} subidas/dia). Proxima disponivel em ${remainingHours.toFixed(1)}h.`;
      setSendError(msg);
      toast.error(msg);
      return false;
    }

    // Limit: must wait 6h between boosts
    if (lastBoostToday && nextBoostAvailableAt && new Date(nextBoostAvailableAt).getTime() > Date.now()) {
      const remainingHours = formatRemainingHours(nextBoostAvailableAt);
      const msg = `Aguarde ${remainingHours.toFixed(1)}h entre subidas (intervalo minimo de ${MIN_HOURS_BETWEEN_BOOSTS}h).`;
      setSendError(msg);
      toast.error(msg);
      return false;
    }

    return true;
  };

  // Upload de vídeo para o Supabase Storage
  const uploadVideoFile = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop() || 'mp4';
    const filename = `ads/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from('videos')
      .upload(filename, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from('videos').getPublicUrl(filename);
    return data.publicUrl;
  };

  // Quando clica em "Gravar" ou "Galeria"
  const handleSubir = async (plano: any, mode: 'gravar' | 'galeria' = 'galeria') => {
    if (!validateBeforeSubida(plano)) return;

    setPendingPlano(plano);
    setVideoMode(mode);
    setShowVideoSelect(true);
  };

  const confirmSubida = async (plano: any) => {
    setIsSending(true);

    try {
      // Salvar o vídeo de anúncio selecionado
      if (selectedAdVideo && companionId) {
        await supabase
          .from("acompanhantes")
          .update({ ad_video: selectedAdVideo })
          .eq("id", companionId);
      }
      let planId = plano?.dbData?.id || null;

      if (!planId) {
        // Fallback: pegar o plano de menor duração ativo
        const { data: anyPlan, error: planError } = await supabase
          .from("boost_plans")
          .select("id")
          .eq("is_active", true)
          .order("duration_hours", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (planError) throw planError;
        planId = anyPlan?.id || null;
      }

      if (!planId) {
        throw new Error("Nenhum plano disponivel. Tente novamente mais tarde.");
      }

      const { data: boostId, error } = await supabase.rpc("create_boost", {
        p_companion_id: companionId,
        p_plan_id: planId,
        p_payment_id: `mvp-free-${Date.now()}`,
        p_payment_status: "approved",
        p_payment_method: "free_mvp"
      });

      if (error) throw error;

      const { data: createdBoost, error: fetchError } = await supabase
        .from("active_boosts")
        .select(`
          id,
          started_at,
          expires_at,
          plan_id,
          boost_plans (name, duration_hours)
        `)
        .eq("id", boostId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      setActiveBoost(createdBoost || null);
      setLastBoostToday(createdBoost || null);
      setPlanoSelecionado(plano || { badge: "Subida ativada" });
      setShowSucesso(true);
      toast.success(`${plano?.titulo || 'Subida'} ativada com sucesso!`);
    } catch (error: any) {
      console.error("Erro ao ativar subida:", error);
      const msg = error?.message || "Nao foi possivel ativar a subida. Tente novamente.";
      setSendError(msg);
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelar = () => {
    navigate(-1);
  };

  const handleVoltarPerfil = () => {
    navigate("/companion-dashboard");
  };

  if (!showSucesso && lastBoostToday && nextBoostAvailableAt && new Date(nextBoostAvailableAt).getTime() > Date.now()) {
    const remainingHours = formatRemainingHours(nextBoostAvailableAt);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-pink-500/15 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#d91d83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Sua subida diaria ja foi usada
          </h2>

          <p className="text-gray-600 mb-3">
            No MVP, cada perfil pode usar apenas uma subida de 1 hora por dia.
          </p>

          <p className="text-gray-600 mb-6">
            Nova subida disponivel em <span className="font-bold text-[#d91d83]">{remainingHours.toFixed(1)} horas</span>
          </p>

          <button
            onClick={() => navigate("/companion-dashboard")}
            className="w-full bg-[#d91d83] hover:bg-[#b8166c] transition-colors text-white font-semibold rounded-lg shadow-md py-3"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showSucesso && planoSelecionado) {
    const duracao = planoSelecionado.badge.replace(" no topo", "");
    const expiresAt = activeBoost?.expires_at || null;
    return (
      <SubidaSucesso
        onVoltar={handleVoltarPerfil}
        onVerStatus={() => navigate("/my-boosts")}
        duracao={duracao}
        expiresAt={expiresAt}
      />
    );
  }

  // Tela de seleção de vídeo para o anúncio (mockup #2)
  if (showVideoSelect) {
    const hasVideos = companionVideos.length > 0;

    const handleTrocarVideo = () => {
      if (companionVideos.length < 2) return;
      const nextIdx = (currentVideoIdx + 1) % companionVideos.length;
      setCurrentVideoIdx(nextIdx);
      setSelectedAdVideo(companionVideos[nextIdx]);
    };

    const handleNewVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('video/')) {
        setSendError('Selecione apenas arquivos de video.');
        toast.error('Selecione apenas arquivos de video.');
        setVideoInputKey(k => k + 1);
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setSendError('O video deve ter no maximo 100MB.');
        toast.error('O video deve ter no maximo 100MB.');
        setVideoInputKey(k => k + 1);
        return;
      }

      setIsUploading(true);
      setSendError('');
      try {
        toast.info('Enviando video...');
        const videoUrl = await uploadVideoFile(file);
        // usar versão funcional para garantir estado mais recente
        setCompanionVideos(prev => {
          const updatedVideos = [...prev, videoUrl];
          setCurrentVideoIdx(updatedVideos.length - 1);
          if (companionId) {
            supabase
              .from('acompanhantes')
              .update({ videos: updatedVideos })
              .eq('id', companionId)
              .then(({ error }) => { if (error) console.error('Erro ao salvar videos:', error); });
          }
          return updatedVideos;
        });
        setSelectedAdVideo(videoUrl);
        toast.success('Video enviado!');
      } catch (err: any) {
        const msg = err?.message || 'Erro ao enviar video.';
        setSendError(msg);
        toast.error(msg);
      } finally {
        setIsUploading(false);
        setVideoInputKey(k => k + 1); // força recriação dos inputs para próxima seleção
      }
    };

    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Hidden file inputs — key força recriação após cada upload */}
        <input
          key={`camera-${videoInputKey}`}
          id="camera-input"
          type="file"
          accept="video/*"
          capture="environment"
          className="hidden"
          onChange={handleNewVideoFile}
        />
        <input
          key={`gallery-${videoInputKey}`}
          id="gallery-input"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleNewVideoFile}
        />

        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <div className="mx-auto max-w-lg px-4 py-3.5 flex items-center gap-3">
            <button
              onClick={() => { setShowVideoSelect(false); setPendingPlano(null); setVideoMode(null); }}
              className="p-1 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900 flex-1">Video do Anuncio</h1>
          </div>
        </header>

        <main className="flex-1 mx-auto max-w-lg w-full px-5 py-6 flex flex-col items-center">
          {hasVideos ? (
            <>
              {/* Title */}
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Video Selecionado!</h2>
              <p className="text-xs text-gray-500 mb-5">Este video sera exibido no seu card de destaque</p>

              {/* Video preview */}
              <div className="relative w-full max-w-[240px] aspect-[9/16] rounded-2xl overflow-hidden bg-black mb-3 shadow-lg">
                <video
                  key={selectedAdVideo || ""}
                  src={selectedAdVideo || ""}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  autoPlay
                  loop
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.5 5.5v9l7-4.5-7-4.5z" />
                    </svg>
                  </div>
                </div>
                <span className="absolute top-2.5 right-2.5 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full">
                  {currentVideoIdx + 1}/{companionVideos.length}
                </span>
              </div>

              {/* Trocar / Gravar novo */}
              <div className="flex items-center gap-4 mb-5">
                {companionVideos.length > 1 && (
                  <button
                    onClick={handleTrocarVideo}
                    className="text-[#d91d83] text-sm font-semibold hover:underline"
                  >
                    Trocar Video
                  </button>
                )}
                <label
                  htmlFor="camera-input"
                  className="text-[#d91d83] text-sm font-semibold hover:underline cursor-pointer"
                >
                  Gravar Novo
                </label>
                <label
                  htmlFor="gallery-input"
                  className="text-[#d91d83] text-sm font-semibold hover:underline cursor-pointer"
                >
                  Enviar da Galeria
                </label>
              </div>

              {/* Uploading indicator */}
              {isUploading && (
                <div className="flex items-center gap-2 mb-4 text-sm text-[#d91d83] font-medium">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Enviando video...
                </div>
              )}

              {/* Visibility notice */}
              <div className="w-full bg-[#FFF8FB] border border-pink-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#d91d83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Visibilidade do video</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Este video sera visivel para todos os visitantes enquanto a subida estiver ativa.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Sem vídeos — opções para gravar ou enviar */}
              <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#d91d83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Adicione seu video</h2>
              <p className="text-sm text-gray-500 mb-6 text-center">
                Grave um video agora ou envie um da sua galeria para usar como anuncio.
              </p>

              {/* Uploading indicator */}
              {isUploading && (
                <div className="flex items-center gap-2 mb-4 text-sm text-[#d91d83] font-medium">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Enviando video...
                </div>
              )}

              {/* Gravar / Galeria buttons */}
              <div className="w-full space-y-3 mb-6">
                <label
                  htmlFor="camera-input"
                  className={`w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
                  style={{ backgroundColor: '#d91d83' }}
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </span>
                  Gravar Video Agora
                </label>

                <label
                  htmlFor="gallery-input"
                  className={`w-full py-4 rounded-2xl font-bold text-base border-2 border-pink-200 text-[#d91d83] hover:bg-pink-50 transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  Escolher da Galeria
                </label>
              </div>

              <div className="w-full bg-[#FFF8FB] border border-pink-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#d91d83]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.5 5.5v9l7-4.5-7-4.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Dica</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Videos gravados agora tem mais impacto! O horario sera mostrado aos visitantes.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Error */}
          {sendError && (
            <div className="w-full mb-3 p-3 rounded-xl text-sm font-medium text-red-700 bg-red-50 border border-red-200">
              {sendError}
            </div>
          )}

          {/* CTA */}
          <div className="w-full space-y-3 pb-4">
            {hasVideos && (
              <button
                onClick={async () => {
                  setShowVideoSelect(false);
                  await confirmSubida(pendingPlano);
                }}
                disabled={!selectedAdVideo || isSending || isUploading}
                className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ backgroundColor: "#d91d83" }}
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Ativando...
                  </>
                ) : (
                  "Confirmar e Ativar Subida"
                )}
              </button>
            )}

            <button
              onClick={() => { setShowVideoSelect(false); setPendingPlano(null); setVideoMode(null); }}
              className="w-full py-2.5 text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors"
            >
              Voltar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <SubidasDoPerfil
      onSubir={handleSubir}
      onCancelar={handleCancelar}
      planos={planos}
      defaultPlanoId={pendingPlano?.id || searchParams.get("plan") || undefined}
      isSending={isSending || isUploading}
      sendError={sendError}
    />
  );
};

export default Subidas;
