import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SecurityStep } from './SecurityStep';
import PaymentSecurityScreen from './PaymentSecurityScreen';
import SecurityModal from './SecurityModal';
import { VideoCallInterface } from './VideoCallInterface';
import { securityStepsService } from '../services/securityStepsService';
import { SECURITY_STEP_DEFINITIONS } from '../constants/securitySteps';
import type { SecurityStepId } from '../lib/security-steps';
import { useToast } from '../hooks/use-toast';

const FACE_STEP_ID: SecurityStepId = 'selfie-verification';

interface SecurityStepsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedSteps: SecurityStepId[]) => void | Promise<void>;
  conversationId?: string;
  activatedBy?: string;
  currentUserId?: string;
  isCompanion: boolean;
  peerName?: string;
}

const SecurityStepsModal: React.FC<SecurityStepsModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  conversationId,
  activatedBy,
  currentUserId,
  isCompanion,
  peerName,
}) => {
  const { toast } = useToast();
  const [selectedSteps, setSelectedSteps] = useState<Set<SecurityStepId>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  useEffect(() => {
    if (!open || !conversationId) {
      return;
    }

    let ignore = false;

    const loadExistingState = async () => {
      if (activatedBy) {
        await securityStepsService.ensureRecord(conversationId, activatedBy);
      }

      const record = await securityStepsService.getByConversation(conversationId);
      if (ignore) {
        return;
      }

      setSelectedSteps(new Set(record?.steps || []));
    };

    void loadExistingState();

    return () => {
      ignore = true;
    };
  }, [activatedBy, conversationId, open]);

  const orderedSelection = useMemo(
    () =>
      SECURITY_STEP_DEFINITIONS.filter(
        (step) => step.id !== FACE_STEP_ID && selectedSteps.has(step.id)
      ).map(
        (step) => step.id
      ),
    [selectedSteps]
  );

  const markStepActive = (stepId: SecurityStepId) => {
    setSelectedSteps((previous) => new Set(previous).add(stepId));
  };

  const handleToggleStep = (stepId: SecurityStepId) => {
    if (stepId === 'secure-payment') {
      if (!isCompanion) {
        toast({
          title: 'Pagamento configurado pela acompanhante',
          description: 'A acompanhante define o valor e o cliente realiza o pagamento depois.',
        });
        return;
      }

      setShowPaymentScreen(true);
      return;
    }

    if (stepId === 'selfie-verification') {
      toast({
        title: 'Reconhecimento facial em desenvolvimento',
        description: 'Essa etapa ainda nao esta disponivel para uso.',
      });
      return;
    }

    if (stepId === 'location-checkin' || stepId === 'time-monitoring') {
      setShowSecurityModal(true);
      return;
    }

    if (stepId === 'video-call') {
      setShowVideoCall(true);
    }
  };

  const handlePaymentConfigured = async (serviceValue: number) => {
    if (!conversationId || !activatedBy) {
      return;
    }

    const saved = await securityStepsService.requestSecurePayment(
      conversationId,
      activatedBy,
      serviceValue
    );

    if (!saved) {
      toast({
        title: 'Erro ao salvar pagamento',
        description: 'Nao foi possivel registrar o valor agora.',
        variant: 'destructive',
      });
      return;
    }

    markStepActive('secure-payment');
    setShowPaymentScreen(false);
    toast({
      title: 'Pagamento configurado',
      description: 'O pedido de pagamento foi vinculado a conversa.',
    });
  };

  const handleMonitoringConfigured = async (location: string, duration: string) => {
    if (!conversationId || !activatedBy) {
      return;
    }

    const saved = await securityStepsService.configureMonitoring(
      conversationId,
      activatedBy,
      location,
      duration
    );

    if (!saved) {
      toast({
        title: 'Erro ao configurar monitoramento',
        description: 'Nao foi possivel salvar o local e a duracao agora.',
        variant: 'destructive',
      });
      return;
    }

    markStepActive('location-checkin');
    markStepActive('time-monitoring');
    setShowSecurityModal(false);
    toast({
      title: 'Monitoramento configurado',
      description: 'As etapas de check-in e tempo foram associadas a conversa.',
    });
  };

  const handleVideoCallCompleted = async () => {
    if (!conversationId) {
      return;
    }

    const saved = await securityStepsService.completeVideoCall(conversationId);

    if (saved) {
      markStepActive('video-call');
      toast({
        title: 'Videochamada concluida',
        description: 'A etapa foi marcada como concluida para esta conversa.',
      });
    }
  };

  const handleConfirm = async () => {
    setIsSaving(true);

    try {
      await onConfirm(orderedSelection);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <>
      {showPaymentScreen && (
        <Dialog open={showPaymentScreen} onOpenChange={setShowPaymentScreen} modal={false}>
          <DialogContent className="max-w-md p-0 overflow-hidden bg-gray-50 h-[90vh] overflow-y-auto">
            <PaymentSecurityScreen
              onClose={() => setShowPaymentScreen(false)}
              onActivate={handlePaymentConfigured}
              conversationId={conversationId}
              isCompanion={isCompanion}
            />
          </DialogContent>
        </Dialog>
      )}

      <SecurityModal
        isOpen={showSecurityModal}
        mode="configure"
        onClose={() => setShowSecurityModal(false)}
        onConfigure={handleMonitoringConfigured}
      />

      <VideoCallInterface
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        conversationId={conversationId}
        currentUserId={currentUserId}
        peerLabel={peerName}
        onCompleted={handleVideoCallCompleted}
      />

      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-100">
          <div className="w-full">
            <div className="text-center mb-8 space-y-2">
              <DialogTitle className="text-3xl font-bold text-foreground">
                Etapas de Seguranca
              </DialogTitle>
              <p className="text-muted-foreground italic">
                Selecione e configure as etapas que deseja usar nesta conversa
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {SECURITY_STEP_DEFINITIONS.map((step) => (
                <SecurityStep
                  key={step.id}
                  number={step.number}
                  title={step.title}
                  description={
                    step.id === FACE_STEP_ID
                      ? 'Em desenvolvimento no momento. As outras etapas ja podem ser usadas normalmente.'
                      : step.description
                  }
                  icon={step.icon}
                  isActive={step.id === FACE_STEP_ID ? false : selectedSteps.has(step.id)}
                  disabled={step.id === FACE_STEP_ID}
                  onClick={() => handleToggleStep(step.id)}
                />
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 h-14 text-lg rounded-full"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 h-14 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
                onClick={() => void handleConfirm()}
                disabled={orderedSelection.length === 0 || isSaving}
              >
                {isSaving ? 'Salvando...' : `Iniciar (${orderedSelection.length})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecurityStepsModal;
