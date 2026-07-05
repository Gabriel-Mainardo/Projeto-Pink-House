import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Hand, IdCard, Camera, Video, Mail, UserCircle, CheckCircle2, ShieldCheck, Images, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './security/ProgressBar';
import StepRow from './security/StepRow';
import VideoVerificationModal from './VideoVerificationModal';
import PhotoVerificationModal from './PhotoVerificationModal';
import DocumentVerificationModal from './DocumentVerificationModal';
import EmailVerificationModal from './EmailVerificationModal';
import GestureSelfieVerificationModal from './GestureSelfieVerificationModal';
import MediaComparisonVerificationModal from './MediaComparisonVerificationModal';
import AudioVerificationModal from './AudioVerificationModal';
import { SecurityStep, SecurityStepStatus } from '../types/security';
import {
  getCompletedSteps,
  getOrCreateVerification,
  getPendingSteps,
  markEmailAsVerified,
  resolveCompanionId,
  submitDocument,
  submitGestureSelfie,
  submitMediaComparison,
  submitPhotos,
  submitVideo,
} from '../services/verificationService';

const basicSteps: SecurityStep[] = [
  {
    id: '2',
    title: 'Confirmar Email',
    description: 'Verifique seu email para notificacoes.',
    points: 20,
    actionLabel: 'Verificar',
    icon: Mail,
    actionType: 'email',
  },
  {
    id: '3',
    title: 'Completar Perfil',
    description: 'Preencha todas as informacoes do seu perfil.',
    points: 20,
    actionLabel: 'Completar',
    icon: UserCircle,
    actionType: 'profile',
  },
  {
    id: '5',
    title: 'Enviar Fotos Reais',
    description: 'Mostre que voce e real com fotos atuais.',
    points: 20,
    actionLabel: 'Enviar',
    icon: Camera,
    actionType: 'photo',
  },
];

const advancedSteps: SecurityStep[] = [
  {
    id: '1',
    title: 'Selfie com gesto',
    description: 'Tire uma selfie fazendo o gesto indicado para confirmar que a foto e atual.',
    points: 0,
    actionLabel: 'Capturar',
    icon: Hand,
    actionType: 'phone',
  },
  {
    id: '4',
    title: 'Verificar Documento',
    description: 'Confirme sua identidade para maior seguranca.',
    points: 20,
    actionLabel: 'Iniciar',
    icon: IdCard,
    actionType: 'document',
  },
  {
    id: '6',
    title: 'Gravar Video de Verificacao',
    description: 'Grave um video rapido para provar sua autenticidade.',
    points: 20,
    actionLabel: 'Gravar',
    icon: Video,
    actionType: 'video',
  },
  {
    id: '7',
    title: 'Comparacao de Midia',
    description: 'Grave um video 360 para comparacao manual com as fotos e videos do seu perfil.',
    points: 20,
    actionLabel: 'Gravar',
    icon: Images,
    actionType: 'media-comparison',
  },
  {
    id: '8',
    title: 'Áudio de Voz',
    description: 'Grave até 30s de áudio para que os clientes ouçam sua voz. Opcional.',
    points: 10,
    actionLabel: 'Gravar',
    icon: Mic,
    actionType: 'audio',
  },
];

interface ProfileVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionId?: string;
  onReliabilityChange?: (score: number) => void;
}

export default function ProfileVerificationModal({
  isOpen,
  onClose,
  companionId,
  onReliabilityChange,
}: ProfileVerificationModalProps) {
  const navigate = useNavigate();
  const [resolvedCompanionId, setResolvedCompanionId] = useState<string | null>(companionId || null);
  const [reliability, setReliability] = useState(0);
  const [showVideoVerification, setShowVideoVerification] = useState(false);
  const [showPhotoVerification, setShowPhotoVerification] = useState(false);
  const [showDocumentVerification, setShowDocumentVerification] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showGestureVerification, setShowGestureVerification] = useState(false);
  const [showMediaComparisonVerification, setShowMediaComparisonVerification] = useState(false);
  const [showAudioVerification, setShowAudioVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [pendingSteps, setPendingSteps] = useState<string[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const loadVerificationData = useCallback(async () => {
    if (!isOpen) return;

    setIsLoading(true);

    try {
      const effectiveCompanionId = await resolveCompanionId(companionId);
      setResolvedCompanionId(effectiveCompanionId);

      if (!effectiveCompanionId) {
        setCompletedSteps([]);
        setPendingSteps([]);
        setReliability(0);
        return;
      }

      const data = await getOrCreateVerification(effectiveCompanionId);

      // Check if audio exists in companion record
      const { data: companionData } = await supabase
        .from('acompanhantes')
        .select('audio_url')
        .eq('id', effectiveCompanionId)
        .maybeSingle();

      if (data) {
        const completed = getCompletedSteps(data);
        if (companionData?.audio_url) {
          completed.push('8');
        }
        const pending = getPendingSteps(data);

        setCompletedSteps(completed);
        setPendingSteps(pending);
        setReliability(data.reliability_score || 0);
        onReliabilityChange?.(data.reliability_score || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar verificacoes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companionId, isOpen, onReliabilityChange]);

  useEffect(() => {
    loadVerificationData();
  }, [loadVerificationData]);

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (!userDataString) return;

    try {
      const userData = JSON.parse(userDataString);
      if (userData.email) {
        setUserEmail(userData.email);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuario:', error);
    }
  }, []);

  // Fotos (step '5') desbloqueiam as etapas avançadas assim que ENVIADAS (pending),
  // não é preciso esperar aprovação do admin. Email e perfil precisam estar completos.
  const basicPhaseComplete = useMemo(
    () => basicSteps.every((step) =>
      completedSteps.includes(step.id) ||
      (step.id === '5' && pendingSteps.includes(step.id))
    ),
    [completedSteps, pendingSteps]
  );

  const getStepStatus = (stepId: string): SecurityStepStatus => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (pendingSteps.includes(stepId)) return 'pending';
    if (!basicPhaseComplete && ['1', '4', '6', '7'].includes(stepId)) return 'locked';
    return 'available';
  };

  const handleAction = (type: string) => {
    switch (type) {
      case 'email':
        setShowEmailVerification(true);
        break;
      case 'profile':
        if (resolvedCompanionId) {
          onClose();
          navigate(`/editar-perfil/${resolvedCompanionId}?fromVerification=true`);
        }
        break;
      case 'phone':
        setShowGestureVerification(true);
        break;
      case 'document':
        setShowDocumentVerification(true);
        break;
      case 'photo':
        setShowPhotoVerification(true);
        break;
      case 'video':
        setShowVideoVerification(true);
        break;
      case 'media-comparison':
        setShowMediaComparisonVerification(true);
        break;
      case 'audio':
        setShowAudioVerification(true);
        break;
      default:
        break;
    }
  };

  const handleEmailVerified = async () => {
    // Garantir que o email seja marcado como verificado no banco (safety net)
    if (resolvedCompanionId) {
      await markEmailAsVerified(resolvedCompanionId);
    }
    await loadVerificationData();
  };

  const handleDocumentVerified = async (documentType?: string, frontUrl?: string, backUrl?: string) => {
    if (!resolvedCompanionId) throw new Error('ID da acompanhante ausente.');

    const success = await submitDocument(resolvedCompanionId, documentType || '', frontUrl || '', backUrl || '');
    if (!success) throw new Error('Falha ao registrar documento no banco. Verifique permissões/colunas.');
    await loadVerificationData();
  };

  const handlePhotoVerified = async (photoUrls?: string[]) => {
    if (!resolvedCompanionId) throw new Error('ID da acompanhante ausente.');

    const success = await submitPhotos(resolvedCompanionId, photoUrls || []);
    if (!success) throw new Error('Falha ao registrar fotos no banco. Verifique permissões/colunas.');
    await loadVerificationData();
  };

  const handleVideoVerified = async (videoUrl?: string) => {
    if (!resolvedCompanionId) throw new Error('ID da acompanhante ausente.');

    const success = await submitVideo(resolvedCompanionId, videoUrl || '');
    if (!success) throw new Error('Falha ao registrar vídeo no banco. Verifique permissões/colunas.');
    await loadVerificationData();
  };

  const handleGestureVerified = async (photoUrl?: string) => {
    if (!resolvedCompanionId || !photoUrl) throw new Error('ID da acompanhante ou URL ausente.');

    const success = await submitGestureSelfie(resolvedCompanionId, photoUrl);
    if (!success) throw new Error('Falha ao registrar selfie no banco. Verifique permissões/colunas.');
    await loadVerificationData();
  };

  const handleMediaComparisonVerified = async (videoUrl?: string) => {
    if (!resolvedCompanionId || !videoUrl) {
      throw new Error('ID da acompanhante ou URL do vídeo ausente.');
    }

    // Propaga erro para o modal mostrar a mensagem real (RLS, rede, etc).
    await submitMediaComparison(resolvedCompanionId, videoUrl);
    await loadVerificationData();
  };

  const handleAudioSaved = async (audioUrl: string) => {
    // Audio is already saved directly to the acompanhantes table by the modal.
    // Just reload verification data to refresh the UI.
    console.log('Áudio salvo:', audioUrl);
    await loadVerificationData();
    setShowAudioVerification(false);
  };

  const allSteps = useMemo(() => [...basicSteps, ...advancedSteps], []);

  const getStepLabel = (stepId: string) => {
    const step = allSteps.find((s) => s.id === stepId);
    return step?.title || '';
  };

  const handleCloseWithSuccess = () => {
    if (completedSteps.length > 0 || pendingSteps.length > 0) {
      setShowSuccessPopup(true);
    } else {
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    onClose();
  };

  if (!isOpen) return null;

  if (showSuccessPopup) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-[420px] rounded-[32px] p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Decorative gradient top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#d91d83] to-[#9C27B0]" />

          <div className="flex flex-col items-center text-center">
            {/* Success icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-5 shadow-lg shadow-green-200">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              {reliability === 100 ? 'Verificação Completa!' : 'Progresso Salvo!'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {reliability === 100
                ? 'Parabéns! Seu perfil está 100% verificado.'
                : `Seu perfil está com ${reliability}% de confiabilidade.`}
            </p>

            {/* Completed steps */}
            {completedSteps.length > 0 && (
              <div className="w-full mb-4">
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2 block">
                  Etapas Concluídas
                </span>
                <div className="space-y-2">
                  {completedSteps.map((stepId) => (
                    <div
                      key={stepId}
                      className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-800">{getStepLabel(stepId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending steps */}
            {pendingSteps.length > 0 && (
              <div className="w-full mb-4">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 block">
                  Em Análise
                </span>
                <div className="space-y-2">
                  {pendingSteps.map((stepId) => (
                    <div
                      key={stepId}
                      className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5"
                    >
                      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <span className="text-sm font-medium text-amber-800">{getStepLabel(stepId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remaining steps count */}
            {reliability < 100 && (
              <p className="text-xs text-gray-400 mb-5">
                {allSteps.length - completedSteps.length - pendingSteps.length} etapa(s) restante(s) para verificacao completa.
              </p>
            )}

            {/* Close button */}
            <button
              onClick={handleSuccessClose}
              className="w-full bg-gradient-to-r from-[#d91d83] to-[#9C27B0] text-white py-3.5 rounded-full text-base font-bold transition-all shadow-lg shadow-pink-200 hover:shadow-pink-300 active:scale-[0.98]"
            >
              {reliability === 100 ? 'Fechar' : 'Entendido!'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-4 overflow-y-auto">
      <div className="bg-white w-full max-w-[500px] rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 my-4">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl text-gray-900 tracking-tight">Etapas de Seguranca</h1>
          <button onClick={handleCloseWithSuccess} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-500 text-sm">Confiabilidade do Perfil: {reliability}%</span>
          <span className="text-[#E5007E] text-sm">{reliability}%</span>
        </div>

        <ProgressBar percentage={reliability} />

        <h2 className="text-lg text-gray-900 mb-2">Aumente sua visibilidade e seguranca</h2>
        <p className="text-sm text-gray-500 mb-5">
          Documento, video e comparacao de midia passam por analise da equipe.
        </p>

        {!resolvedCompanionId && !isLoading && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Nao foi possivel identificar a conta da acompanhante para continuar o fluxo de verificacao.
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-700">Etapas Basicas</span>
            <span className="text-xs bg-[#d91d83]/10 text-[#d91d83] px-2 py-0.5 rounded-full font-medium">
              {completedSteps.filter((id) => ['2', '3', '5'].includes(id)).length}/3
            </span>
          </div>
          <div className="space-y-3">
            {basicSteps.map((step) => (
              <StepRow
                key={step.id}
                step={step}
                onAction={handleAction}
                status={getStepStatus(step.id)}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-700">Verificacao Avancada</span>
            {basicPhaseComplete ? (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                Desbloqueado
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                Complete as basicas primeiro
              </span>
            )}
          </div>
          <div className={`space-y-3 ${!basicPhaseComplete ? 'opacity-50' : ''}`}>
            {advancedSteps.map((step) => (
              <StepRow
                key={step.id}
                step={step}
                onAction={handleAction}
                status={getStepStatus(step.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleCloseWithSuccess}
            className="w-full bg-[#E5007E] hover:bg-[#C9006F] text-white py-3.5 rounded-full text-base transition-colors shadow-lg shadow-pink-200"
          >
            {reliability === 100 ? 'Verificacao Completa!' : 'Continuar Depois'}
          </button>

          <button onClick={handleCloseWithSuccess} className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
            Fechar
          </button>
        </div>
      </div>

      <VideoVerificationModal
        isOpen={showVideoVerification}
        onClose={() => setShowVideoVerification(false)}
        onVerified={(videoUrl) => handleVideoVerified(videoUrl)}
      />

      <PhotoVerificationModal
        isOpen={showPhotoVerification}
        onClose={() => setShowPhotoVerification(false)}
        onVerified={(photoUrls) => handlePhotoVerified(photoUrls)}
      />

      <DocumentVerificationModal
        isOpen={showDocumentVerification}
        onClose={() => setShowDocumentVerification(false)}
        onVerified={(docType, frontUrl, backUrl) => handleDocumentVerified(docType, frontUrl, backUrl)}
      />

      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        onVerified={handleEmailVerified}
        onStatusChange={loadVerificationData}
        userEmail={userEmail}
        companionId={resolvedCompanionId || undefined}
      />

      <GestureSelfieVerificationModal
        isOpen={showGestureVerification}
        onClose={() => setShowGestureVerification(false)}
        onVerified={(photoUrl) => handleGestureVerified(photoUrl)}
      />

      <MediaComparisonVerificationModal
        isOpen={showMediaComparisonVerification}
        onClose={() => setShowMediaComparisonVerification(false)}
        onVerified={(videoUrl) => handleMediaComparisonVerified(videoUrl)}
      />

      <AudioVerificationModal
        isOpen={showAudioVerification}
        onClose={() => setShowAudioVerification(false)}
        companionId={resolvedCompanionId}
        onSaved={handleAudioSaved}
      />
    </div>
  );
}
