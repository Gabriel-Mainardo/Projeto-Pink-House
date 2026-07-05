import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CreditCard,
  Loader2,
  MapPin,
  ScanFace,
  Shield,
  Timer,
  Video,
  X,
} from 'lucide-react';
import { securityStepsService, type SecurityStepsRecord } from '../services/securityStepsService';
import { SECURITY_STEP_DEFINITIONS } from '../constants/securitySteps';
import {
  formatCurrencyBRL,
  formatDateTime,
  formatRemainingTime,
  type SecurityStepId,
} from '../lib/security-steps';
import PaymentSecurityScreen from './PaymentSecurityScreen';
import SecurityModal from './SecurityModal';
import { VideoCallInterface } from './VideoCallInterface';
import { useToast } from '../hooks/use-toast';

interface SecurityStepsActiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  currentUserId: string;
  isCompanion: boolean;
  peerName?: string;
  onManageSteps?: () => void;
}

interface StepPresentation {
  id: SecurityStepId;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  state: 'pending' | 'active' | 'done' | 'warning';
  detail?: string;
  actionLabel?: string;
  action?: () => void;
}

const SecurityStepsActiveModal: React.FC<SecurityStepsActiveModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  currentUserId,
  isCompanion,
  peerName,
  onManageSteps,
}) => {
  const { toast } = useToast();
  const [record, setRecord] = useState<SecurityStepsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const refreshRecord = async () => {
    setLoading(true);
    const nextRecord = await securityStepsService.getByConversation(conversationId);
    setRecord(nextRecord);
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    void refreshRecord();
    const unsubscribe = securityStepsService.subscribeToChanges(conversationId, (nextRecord) => {
      setRecord(nextRecord);
      setLoading(false);
    });

    return unsubscribe;
  }, [conversationId, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isOpen]);

  const handlePaymentConfirmed = async () => {
    const saved = await securityStepsService.confirmSecurePayment(conversationId);

    if (!saved) {
      toast({
        title: 'Erro ao confirmar pagamento',
        description: 'O pagamento foi processado, mas a conversa nao foi atualizada.',
        variant: 'destructive',
      });
      return;
    }

    setShowPaymentScreen(false);
    await refreshRecord();
    toast({
      title: 'Pagamento confirmado',
      description: 'A etapa de pagamento foi marcada como paga.',
    });
  };

  const handleReleasePayment = async () => {
    const saved = await securityStepsService.releaseSecurePayment(conversationId);

    if (!saved) {
      toast({
        title: 'Erro ao liberar pagamento',
        description: 'Nao foi possivel atualizar o status agora.',
        variant: 'destructive',
      });
      return;
    }

    await refreshRecord();
    toast({
      title: 'Pagamento liberado',
      description: 'O pagamento foi marcado como liberado nesta conversa.',
    });
  };

  const handleCheckinConfirmed = async (payload: {
    latitude?: number | null;
    longitude?: number | null;
    note?: string;
  }) => {
    const saved = await securityStepsService.confirmCheckin(conversationId, payload);

    if (!saved) {
      toast({
        title: 'Erro ao confirmar check-in',
        description: 'Nao foi possivel registrar sua chegada agora.',
        variant: 'destructive',
      });
      return;
    }

    setShowCheckinModal(false);
    await refreshRecord();
    toast({
      title: 'Check-in confirmado',
      description: 'Sua chegada foi registrada com sucesso.',
    });
  };

  const handleMonitoringFinished = async () => {
    const saved = await securityStepsService.finishMonitoring(conversationId);

    if (!saved) {
      toast({
        title: 'Erro ao finalizar monitoramento',
        description: 'Nao foi possivel atualizar o prazo agora.',
        variant: 'destructive',
      });
      return;
    }

    await refreshRecord();
    toast({
      title: 'Monitoramento finalizado',
      description: 'A etapa foi encerrada nesta conversa.',
    });
  };

  const handleVideoCallCompleted = async () => {
    const saved = await securityStepsService.completeVideoCall(conversationId);

    if (saved) {
      await refreshRecord();
    }
  };

  const visibleSteps = useMemo<StepPresentation[]>(() => {
    if (!record) {
      return [];
    }

    const findDefinition = (stepId: SecurityStepId) =>
      SECURITY_STEP_DEFINITIONS.find((step) => step.id === stepId);

    return record.steps
      .map((stepId) => {
        const definition = findDefinition(stepId);
        if (!definition) {
          return null;
        }

        if (stepId === 'video-call') {
          return {
            id: stepId,
            title: definition.title,
            icon: <Video className="w-5 h-5" />,
            completed: record.video_call_completed,
            state: record.video_call_completed ? 'done' : 'pending',
            detail: record.video_call_completed
              ? `Concluida em ${formatDateTime(record.video_call_completed_at)}`
              : 'Aguardando videochamada entre os participantes.',
            actionLabel: record.video_call_completed ? undefined : 'Iniciar chamada',
            action: record.video_call_completed ? undefined : () => setShowVideoCall(true),
          } satisfies StepPresentation;
        }

        if (stepId === 'secure-payment') {
          const paymentDetailParts = [formatCurrencyBRL(record.service_value ?? 0)];
          if (record.payment_status === 'awaiting_payment') {
            paymentDetailParts.push('Aguardando pagamento');
          }
          if (record.payment_status === 'paid') {
            paymentDetailParts.push(`Pago em ${formatDateTime(record.payment_paid_at)}`);
          }
          if (record.payment_status === 'released') {
            paymentDetailParts.push(`Liberado em ${formatDateTime(record.payment_released_at)}`);
          }
          if (record.payment_status === 'failed') {
            paymentDetailParts.push('Pagamento falhou');
          }

          return {
            id: stepId,
            title: definition.title,
            icon: <CreditCard className="w-5 h-5" />,
            completed: record.payment_status === 'paid' || record.payment_status === 'released',
            state:
              record.payment_status === 'released'
                ? 'done'
                : record.payment_status === 'paid' || record.payment_status === 'awaiting_payment'
                  ? 'active'
                  : record.payment_status === 'failed'
                    ? 'warning'
                    : 'pending',
            detail: paymentDetailParts.join(' · '),
            actionLabel:
              !isCompanion && record.payment_status === 'awaiting_payment' && record.service_value
                ? 'Pagar agora'
                : isCompanion && record.payment_status === 'paid'
                  ? 'Marcar como liberado'
                  : undefined,
            action:
              !isCompanion && record.payment_status === 'awaiting_payment' && record.service_value
                ? () => setShowPaymentScreen(true)
                : isCompanion && record.payment_status === 'paid'
                  ? handleReleasePayment
                  : undefined,
          } satisfies StepPresentation;
        }

        if (stepId === 'selfie-verification') {
          return {
            id: stepId,
            title: definition.title,
            icon: <ScanFace className="w-5 h-5" />,
            completed: false,
            state: 'warning',
            detail: 'Em desenvolvimento. Essa etapa esta temporariamente indisponivel.',
          } satisfies StepPresentation;
        }

        if (stepId === 'location-checkin') {
          return {
            id: stepId,
            title: definition.title,
            icon: <MapPin className="w-5 h-5" />,
            completed: record.checkin_confirmed,
            state: record.checkin_confirmed
              ? 'done'
              : record.checkin_activated
                ? 'active'
                : 'pending',
            detail: record.checkin_confirmed
              ? `Confirmado em ${formatDateTime(record.checkin_confirmed_at)}`
              : record.checkin_location || 'Aguardando confirmacao no local.',
            actionLabel:
              !isCompanion && record.checkin_activated && !record.checkin_confirmed
                ? 'Confirmar chegada'
                : undefined,
            action:
              !isCompanion && record.checkin_activated && !record.checkin_confirmed
                ? () => setShowCheckinModal(true)
                : undefined,
          } satisfies StepPresentation;
        }

        if (stepId === 'time-monitoring') {
          const status = record.monitoring_status;
          const detailParts: string[] = [];

          if (record.checkin_duration) {
            detailParts.push(`Duracao: ${record.checkin_duration}`);
          }
          if (status === 'active') {
            detailParts.push(`Tempo restante: ${formatRemainingTime(record.monitoring_expires_at)}`);
          }
          if (status === 'overdue') {
            detailParts.push('Prazo excedido');
          }
          if (status === 'completed') {
            detailParts.push(`Finalizado em ${formatDateTime(record.monitoring_finished_at)}`);
          }
          if (status === 'configured') {
            detailParts.push('Aguardando check-in para iniciar');
          }

          return {
            id: stepId,
            title: definition.title,
            icon: status === 'overdue' ? <AlertTriangle className="w-5 h-5" /> : <Timer className="w-5 h-5" />,
            completed: status === 'active' || status === 'completed',
            state:
              status === 'completed'
                ? 'done'
                : status === 'overdue'
                  ? 'warning'
                  : status === 'active' || status === 'configured'
                    ? 'active'
                    : 'pending',
            detail: detailParts.join(' · '),
            actionLabel:
              isCompanion && (status === 'active' || status === 'overdue')
                ? 'Finalizar monitoramento'
                : undefined,
            action:
              isCompanion && (status === 'active' || status === 'overdue')
                ? handleMonitoringFinished
                : undefined,
          } satisfies StepPresentation;
        }

        return null;
      })
      .filter(Boolean) as StepPresentation[];
  }, [isCompanion, record, tick]);

  const completedCount = visibleSteps.filter(
    (step) => step.state === 'active' || step.state === 'done' || step.state === 'warning'
  ).length;
  const totalCount = visibleSteps.length;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {showPaymentScreen && record?.service_value && (
        <div className="fixed inset-0 z-[240] bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-white" onClick={(event) => event.stopPropagation()}>
            <PaymentSecurityScreen
              onClose={() => setShowPaymentScreen(false)}
              onActivate={handlePaymentConfirmed}
              conversationId={conversationId}
              isCompanion={false}
              presetValue={record.service_value}
            />
          </div>
        </div>
      )}

      <SecurityModal
        isOpen={showCheckinModal}
        mode="confirm"
        onClose={() => setShowCheckinModal(false)}
        onConfirmCheckin={handleCheckinConfirmed}
        initialLocation={record?.checkin_location}
        initialDuration={record?.checkin_duration}
      />

      <VideoCallInterface
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        conversationId={conversationId}
        currentUserId={currentUserId}
        peerLabel={peerName}
        onCompleted={handleVideoCallCompleted}
      />

      <div
        className="fixed inset-0 z-[150] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-3xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-50 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Etapas de Seguranca</h2>
                {!loading && record && (
                  <p className="text-xs text-gray-400">
                    {completedCount} de {totalCount} em andamento ou concluidas
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
              </div>
            ) : !record || totalCount === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">Nenhuma etapa ativa ainda.</p>
            ) : (
              <>
                {record.monitoring_status === 'overdue' && (
                  <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="text-sm font-semibold text-rose-700">Prazo do monitoramento excedido</p>
                    <p className="text-xs text-rose-600 mt-1">
                      Finalize o monitoramento ou revise o status da conversa o quanto antes.
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Progresso</span>
                    <span>{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                    />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {visibleSteps.map((step) => {
                    const colorClasses =
                      step.state === 'done'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : step.state === 'warning'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : step.state === 'active'
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800';

                    const detailColorClasses =
                      step.state === 'done'
                        ? 'text-green-600'
                        : step.state === 'warning'
                          ? 'text-rose-600'
                          : step.state === 'active'
                            ? 'text-blue-600'
                            : 'text-amber-600';

                    return (
                      <div key={step.id} className={`flex items-start gap-3 p-4 rounded-2xl border ${colorClasses}`}>
                        <div className="mt-0.5">
                          {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{step.title}</span>
                          </div>

                          {step.detail && <p className={`text-xs mt-0.5 ${detailColorClasses}`}>{step.detail}</p>}

                          {step.action && step.actionLabel && (
                            <button
                              onClick={step.action}
                              className="mt-2 text-xs bg-white/80 text-gray-800 px-3 py-1 rounded-full font-semibold hover:bg-white transition-colors"
                            >
                              {step.actionLabel}
                            </button>
                          )}
                        </div>

                        <div className="shrink-0 opacity-80">{step.icon}</div>
                      </div>
                    );
                  })}
                </div>

                {onManageSteps && (
                  <button
                    onClick={onManageSteps}
                    className="w-full mb-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-2xl transition-colors"
                  >
                    Adicionar ou editar etapas
                  </button>
                )}

                {record.face_verified && record.face_photo_url && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Selfie registrada
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src={record.face_photo_url}
                        alt="Selfie de verificacao"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-green-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-green-700">Verificacao salva</p>
                        {record.face_verified_at && (
                          <p className="text-xs text-gray-400">{formatDateTime(record.face_verified_at)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {record.created_at && (
                  <p className="text-xs text-gray-400 text-center">
                    Etapas iniciadas em {formatDateTime(record.created_at)}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecurityStepsActiveModal;
