import { supabase } from '../lib/supabase';
import {
  addMinutesToIso,
  durationToMinutes,
  MonitoringStatus,
  PaymentStatus,
  SecurityStepId,
  uniqStepIds,
} from '../lib/security-steps';

export interface SecurityStepsRecord {
  id?: string;
  conversation_id: string;
  activated_by: string;
  steps: SecurityStepId[];
  video_call_completed: boolean;
  video_call_completed_at?: string | null;
  face_verified: boolean;
  face_verified_at?: string | null;
  face_photo_url?: string | null;
  payment_activated: boolean;
  payment_activated_at?: string | null;
  payment_status: PaymentStatus;
  payment_requested_at?: string | null;
  payment_paid_at?: string | null;
  payment_released_at?: string | null;
  payment_transaction_id?: string | null;
  service_value?: number | null;
  checkin_location?: string | null;
  checkin_duration?: string | null;
  checkin_activated: boolean;
  checkin_activated_at?: string | null;
  checkin_confirmed: boolean;
  checkin_confirmed_at?: string | null;
  checkin_latitude?: number | null;
  checkin_longitude?: number | null;
  checkin_note?: string | null;
  monitoring_status: MonitoringStatus;
  monitoring_started_at?: string | null;
  monitoring_expires_at?: string | null;
  monitoring_finished_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

type RecordUpdate = Partial<SecurityStepsRecord>;

function normalizeRecord(data: any): SecurityStepsRecord {
  const rawSteps = Array.isArray(data?.steps) ? data.steps : [];
  const migratedSteps = rawSteps.map((stepId: string) =>
    stepId === 'facial-recognition' ? 'selfie-verification' : stepId
  );

  return {
    id: data.id,
    conversation_id: data.conversation_id,
    activated_by: data.activated_by,
    steps: uniqStepIds(migratedSteps),
    video_call_completed: Boolean(data.video_call_completed),
    video_call_completed_at: data.video_call_completed_at ?? null,
    face_verified: Boolean(data.face_verified),
    face_verified_at: data.face_verified_at ?? null,
    face_photo_url: data.face_photo_url ?? null,
    payment_activated: Boolean(data.payment_activated),
    payment_activated_at: data.payment_activated_at ?? null,
    payment_status: (data.payment_status ?? 'not_requested') as PaymentStatus,
    payment_requested_at: data.payment_requested_at ?? null,
    payment_paid_at: data.payment_paid_at ?? null,
    payment_released_at: data.payment_released_at ?? null,
    payment_transaction_id: data.payment_transaction_id ?? null,
    service_value:
      typeof data.service_value === 'number' ? data.service_value : data.service_value ?? null,
    checkin_location: data.checkin_location ?? null,
    checkin_duration: data.checkin_duration ?? null,
    checkin_activated: Boolean(data.checkin_activated),
    checkin_activated_at: data.checkin_activated_at ?? null,
    checkin_confirmed: Boolean(data.checkin_confirmed),
    checkin_confirmed_at: data.checkin_confirmed_at ?? null,
    checkin_latitude: data.checkin_latitude ?? null,
    checkin_longitude: data.checkin_longitude ?? null,
    checkin_note: data.checkin_note ?? null,
    monitoring_status: (data.monitoring_status ?? 'idle') as MonitoringStatus,
    monitoring_started_at: data.monitoring_started_at ?? null,
    monitoring_expires_at: data.monitoring_expires_at ?? null,
    monitoring_finished_at: data.monitoring_finished_at ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user?.id ?? null;
}

async function updateRecord(conversationId: string, updates: RecordUpdate): Promise<boolean> {
  const { error } = await supabase
    .from('conversation_security_steps')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('conversation_id', conversationId);

  if (error) {
    console.error('Erro ao atualizar etapas de seguranca:', error);
    return false;
  }

  return true;
}

async function syncMonitoringState(record: SecurityStepsRecord | null): Promise<SecurityStepsRecord | null> {
  if (!record || record.monitoring_status !== 'active' || !record.monitoring_expires_at) {
    return record;
  }

  const expired = new Date(record.monitoring_expires_at).getTime() <= Date.now();
  if (!expired) {
    return record;
  }

  const updated = await securityStepsService.markMonitoringOverdue(record.conversation_id);
  if (!updated) {
    return record;
  }

  return securityStepsService.getByConversation(record.conversation_id);
}

function mergeStepIds(existing: readonly string[], stepIds: readonly string[]): SecurityStepId[] {
  return uniqStepIds([...existing, ...stepIds]);
}

export const securityStepsService = {
  async getByConversation(conversationId: string): Promise<SecurityStepsRecord | null> {
    try {
      const { data, error } = await supabase
        .from('conversation_security_steps')
        .select('*')
        .eq('conversation_id', conversationId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('relation')) {
          return null;
        }

        console.error('Erro ao buscar etapas de seguranca:', error);
        return null;
      }

      const normalized = data ? normalizeRecord(data) : null;
      return syncMonitoringState(normalized);
    } catch (error) {
      console.error('Erro inesperado ao buscar etapas de seguranca:', error);
      return null;
    }
  },

  async ensureRecord(conversationId: string, activatedBy?: string): Promise<SecurityStepsRecord | null> {
    const existing = await this.getByConversation(conversationId);
    if (existing) {
      return existing;
    }

    const userId = activatedBy ?? (await getAuthenticatedUserId());
    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('conversation_security_steps')
      .insert({
        conversation_id: conversationId,
        activated_by: userId,
        steps: [],
        payment_status: 'not_requested',
        monitoring_status: 'idle',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar registro de etapas de seguranca:', error);
      return null;
    }

    return normalizeRecord(data);
  },

  async activate(
    conversationId: string,
    activatedBy: string,
    steps: string[]
  ): Promise<SecurityStepsRecord | null> {
    const ensured = await this.ensureRecord(conversationId, activatedBy);
    if (!ensured) {
      return null;
    }

    const selectedSteps = uniqStepIds(steps);
    const { data, error } = await supabase
      .from('conversation_security_steps')
      .update({
        activated_by: activatedBy,
        steps: selectedSteps,
        updated_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao ativar etapas de seguranca:', error);
      return null;
    }

    return normalizeRecord(data);
  },

  async completeVideoCall(conversationId: string): Promise<boolean> {
    const userId = await getAuthenticatedUserId();
    const ensured = await this.ensureRecord(conversationId, userId ?? undefined);
    if (!ensured) {
      return false;
    }

    return updateRecord(conversationId, {
      steps: mergeStepIds(ensured.steps, ['video-call']),
      video_call_completed: true,
      video_call_completed_at: new Date().toISOString(),
    });
  },

  async saveFaceVerification(conversationId: string, photoUrl: string): Promise<boolean> {
    const userId = await getAuthenticatedUserId();
    const ensured = await this.ensureRecord(conversationId, userId ?? undefined);
    if (!ensured) {
      return false;
    }

    return updateRecord(conversationId, {
      steps: mergeStepIds(ensured.steps, ['selfie-verification']),
      face_verified: true,
      face_verified_at: new Date().toISOString(),
      face_photo_url: photoUrl,
    });
  },

  async requestSecurePayment(
    conversationId: string,
    activatedBy: string,
    serviceValue: number
  ): Promise<boolean> {
    const ensured = await this.ensureRecord(conversationId, activatedBy);
    if (!ensured) {
      return false;
    }

    return updateRecord(conversationId, {
      steps: mergeStepIds(ensured.steps, ['secure-payment']),
      payment_activated: true,
      payment_activated_at: ensured.payment_activated_at ?? new Date().toISOString(),
      payment_status: 'awaiting_payment',
      payment_requested_at: new Date().toISOString(),
      payment_paid_at: null,
      payment_released_at: null,
      service_value: serviceValue,
    });
  },

  async confirmSecurePayment(
    conversationId: string,
    paymentTransactionId?: string | null
  ): Promise<boolean> {
    const userId = await getAuthenticatedUserId();
    const ensured = await this.ensureRecord(conversationId, userId ?? undefined);
    if (!ensured) {
      return false;
    }

    return updateRecord(conversationId, {
      steps: mergeStepIds(ensured.steps, ['secure-payment']),
      payment_activated: true,
      payment_status: 'paid',
      payment_paid_at: new Date().toISOString(),
      ...(paymentTransactionId ? { payment_transaction_id: paymentTransactionId } : {}),
    });
  },

  async releaseSecurePayment(conversationId: string): Promise<boolean> {
    const userId = await getAuthenticatedUserId();
    const ensured = await this.ensureRecord(conversationId, userId ?? undefined);
    if (!ensured) {
      return false;
    }

    return updateRecord(conversationId, {
      steps: mergeStepIds(ensured.steps, ['secure-payment']),
      payment_status: 'released',
      payment_released_at: new Date().toISOString(),
    });
  },

  async setPaymentFailed(conversationId: string): Promise<boolean> {
    return updateRecord(conversationId, {
      payment_status: 'failed',
    });
  },

  async configureMonitoring(
    conversationId: string,
    activatedBy: string,
    location: string,
    duration: string
  ): Promise<boolean> {
    const ensured = await this.ensureRecord(conversationId, activatedBy);
    if (!ensured) {
      return false;
    }

    return updateRecord(conversationId, {
      steps: mergeStepIds(ensured.steps, ['location-checkin', 'time-monitoring']),
      checkin_location: location,
      checkin_duration: duration,
      checkin_activated: true,
      checkin_activated_at: new Date().toISOString(),
      checkin_confirmed: false,
      checkin_confirmed_at: null,
      monitoring_status: 'configured',
      monitoring_started_at: null,
      monitoring_expires_at: null,
      monitoring_finished_at: null,
      checkin_latitude: null,
      checkin_longitude: null,
      checkin_note: null,
    });
  },

  async confirmCheckin(
    conversationId: string,
    payload: {
      latitude?: number | null;
      longitude?: number | null;
      note?: string;
    }
  ): Promise<boolean> {
    const userId = await getAuthenticatedUserId();
    const ensured = await this.ensureRecord(conversationId, userId ?? undefined);
    if (!ensured) {
      return false;
    }

    const durationMinutes = durationToMinutes(ensured.checkin_duration);
    const startedAt = new Date().toISOString();
    const expiresAt = durationMinutes > 0 ? addMinutesToIso(startedAt, durationMinutes) : null;

    return updateRecord(conversationId, {
      steps: mergeStepIds(ensured.steps, ['location-checkin', 'time-monitoring']),
      checkin_confirmed: true,
      checkin_confirmed_at: startedAt,
      checkin_latitude: payload.latitude ?? null,
      checkin_longitude: payload.longitude ?? null,
      checkin_note: payload.note?.trim() || null,
      monitoring_status: expiresAt ? 'active' : 'configured',
      monitoring_started_at: startedAt,
      monitoring_expires_at: expiresAt,
    });
  },

  async finishMonitoring(conversationId: string): Promise<boolean> {
    return updateRecord(conversationId, {
      monitoring_status: 'completed',
      monitoring_finished_at: new Date().toISOString(),
    });
  },

  async markMonitoringOverdue(conversationId: string): Promise<boolean> {
    return updateRecord(conversationId, {
      monitoring_status: 'overdue',
    });
  },

  async uploadFacePhoto(blob: Blob, conversationId: string): Promise<string> {
    const filename = `face-verification/${conversationId}_${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('images')
      .upload(filename, blob, { contentType: 'image/jpeg', upsert: false });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filename);
    return data.publicUrl;
  },

  subscribeToChanges(
    conversationId: string,
    onChange: (record: SecurityStepsRecord) => void
  ): () => void {
    const channel = supabase
      .channel(`security-steps-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_security_steps',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.new) {
            onChange(normalizeRecord(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
