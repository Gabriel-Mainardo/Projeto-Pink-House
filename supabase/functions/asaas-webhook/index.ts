import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

type TransactionType = 'rositas' | 'boost' | 'story' | 'secure_payment';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('Webhook Asaas recebido:', JSON.stringify(body));

    const { event, payment } = body;

    if (!payment?.id) {
      return jsonResponse({ received: true });
    }

    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('asaas_payment_id', payment.id)
      .maybeSingle();

    if (fetchError || !transaction) {
      console.error('Transacao nao encontrada para payment:', payment.id, fetchError);
      return jsonResponse({ received: true, warning: 'transaction_not_found' });
    }

    const nextStatus = normalizeWebhookEvent(event, payment.status ?? transaction.status);
    await processPaymentStatus(supabase, transaction, nextStatus, body);

    return jsonResponse({ received: true, status: nextStatus });
  } catch (error) {
    console.error('Webhook error:', error);
    return jsonResponse({
      received: true,
      error: error instanceof Error ? error.message : 'unknown_error',
    });
  }
});

function jsonResponse(payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

function normalizeWebhookEvent(event: string, fallbackStatus: string): string {
  switch (event) {
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED':
      return 'CONFIRMED';
    case 'PAYMENT_OVERDUE':
      return 'OVERDUE';
    case 'PAYMENT_DELETED':
    case 'PAYMENT_REFUNDED':
      return 'REFUNDED';
    case 'PAYMENT_DECLINED':
      return 'FAILED';
    case 'PAYMENT_RESTORED':
      return 'PENDING';
    case 'PAYMENT_UPDATED':
      return normalizeAsaasStatus(fallbackStatus);
    default:
      return normalizeAsaasStatus(fallbackStatus);
  }
}

function normalizeAsaasStatus(status: string): string {
  switch (status) {
    case 'RECEIVED':
    case 'CONFIRMED':
      return 'CONFIRMED';
    case 'OVERDUE':
      return 'OVERDUE';
    case 'REFUNDED':
      return 'REFUNDED';
    case 'DECLINED':
    case 'FAILED':
      return 'FAILED';
    default:
      return 'PENDING';
  }
}

async function processPaymentStatus(
  supabase: any,
  transaction: any,
  nextStatus: string,
  webhookData?: unknown
) {
  const isFirstConfirmation =
    nextStatus === 'CONFIRMED' &&
    transaction.status !== 'CONFIRMED' &&
    transaction.status !== 'RECEIVED';

  const updateData: Record<string, unknown> = {
    status: nextStatus,
    updated_at: new Date().toISOString(),
  };

  if (webhookData) {
    updateData.webhook_data = webhookData;
  }

  if (nextStatus === 'CONFIRMED') {
    updateData.confirmed_at = new Date().toISOString();
  }

  await supabase
    .from('payment_transactions')
    .update(updateData)
    .eq('id', transaction.id);

  if (!isFirstConfirmation) {
    if (transaction.transaction_type === 'secure_payment') {
      await syncSecurePaymentFailure(supabase, transaction.reference_id, nextStatus);
    }

    return;
  }

  if (transaction.transaction_type === 'rositas') {
    await processRositasPayment(supabase, transaction);
    return;
  }

  if (transaction.transaction_type === 'boost') {
    await supabase.rpc('create_boost', {
      p_companion_id: transaction.user_id,
      p_plan_id: transaction.reference_id,
      p_payment_id: transaction.external_reference,
      p_payment_status: 'approved',
      p_payment_method: 'asaas',
    });
    return;
  }

  if (transaction.transaction_type === 'story') {
    await supabase
      .from('story_purchases')
      .insert({
        user_id: transaction.user_id,
        story_type: transaction.reference_id,
        payment_id: transaction.id,
        purchased_at: new Date().toISOString(),
      });
    return;
  }

  if (transaction.transaction_type === 'secure_payment') {
    await supabase
      .from('conversation_security_steps')
      .update({
        payment_status: 'paid',
        payment_paid_at: new Date().toISOString(),
        payment_transaction_id: transaction.id,
        payment_activated: true,
        updated_at: new Date().toISOString(),
      })
      .eq('conversation_id', transaction.reference_id);
  }
}

async function syncSecurePaymentFailure(
  supabase: any,
  conversationId: string | null,
  nextStatus: string
) {
  if (!conversationId || (nextStatus !== 'FAILED' && nextStatus !== 'OVERDUE' && nextStatus !== 'REFUNDED')) {
    return;
  }

  const paymentStatus =
    nextStatus === 'OVERDUE'
      ? 'awaiting_payment'
      : nextStatus === 'FAILED'
        ? 'failed'
        : 'not_requested';

  await supabase
    .from('conversation_security_steps')
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('conversation_id', conversationId);
}

async function processRositasPayment(supabase: any, transaction: any) {
  const rositasMap: Record<string, { rositas: number; pinkPoints: number }> = {
    start: { rositas: 100, pinkPoints: 200 },
    essencial: { rositas: 300, pinkPoints: 600 },
    top: { rositas: 700, pinkPoints: 1400 },
    premium: { rositas: 1500, pinkPoints: 3000 },
    black: { rositas: 3000, pinkPoints: 6000 },
  };

  const amounts = rositasMap[transaction.reference_id as string];
  if (!amounts) {
    return;
  }

  await supabase.rpc('credit_rositas', {
    p_user_id: transaction.user_id,
    p_rositas: amounts.rositas,
    p_pink_points: amounts.pinkPoints,
    p_description: `Compra de ${amounts.rositas} Rositas (pacote ${String(transaction.reference_id).toUpperCase()})`,
    p_payment_transaction_id: transaction.id,
  });
}
