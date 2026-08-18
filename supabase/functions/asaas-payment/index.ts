import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  createBoletoPayment,
  createCreditCardPayment,
  createPixPayment,
  findOrCreateCustomer,
  getPaymentStatus,
} from '../_shared/asaas.ts';

type TransactionType = 'rositas' | 'pinkcoins' | 'boost' | 'story' | 'secure_payment';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Nao autorizado');
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      throw new Error('Nao autorizado');
    }

    const body = await req.json();

    if (body.action === 'create_payment') {
      const {
        customerName,
        customerEmail,
        customerCpf,
        customerPhone,
        value,
        description,
        billingType,
        transactionType,
        referenceId,
        creditCard,
        creditCardHolderInfo,
      } = body as {
        customerName: string;
        customerEmail?: string;
        customerCpf: string;
        customerPhone?: string;
        value: number;
        description?: string;
        billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
        transactionType: TransactionType;
        referenceId: string;
        creditCard?: Record<string, unknown>;
        creditCardHolderInfo?: Record<string, unknown>;
      };

      if (!customerCpf || !customerName || !billingType || !transactionType || !referenceId) {
        throw new Error(
          'Campos obrigatorios: customerName, customerCpf, billingType, transactionType e referenceId'
        );
      }

      let resolvedValue = Number(value);
      let resolvedDescription = description || 'Pagamento PinkHouse';
      let paymentMetadata: Record<string, unknown> = {};

      if (transactionType === 'pinkcoins') {
        const { data: pinkcoinPackage, error: packageError } = await supabase
          .from('pinkcoin_packages')
          .select('id, code, name, coins_amount, price_brl, active')
          .eq('code', referenceId)
          .eq('active', true)
          .maybeSingle();

        if (packageError || !pinkcoinPackage) {
          throw new Error('PINKCOIN_PACKAGE_NOT_FOUND');
        }

        resolvedValue = Number(pinkcoinPackage.price_brl);
        resolvedDescription = `Compra de ${pinkcoinPackage.coins_amount} PinkCoins - ${pinkcoinPackage.name}`;
        paymentMetadata = {
          package_id: pinkcoinPackage.id,
          package_code: pinkcoinPackage.code,
          coins_amount: Number(pinkcoinPackage.coins_amount),
          price_brl: resolvedValue,
        };
      }

      if (!Number.isFinite(resolvedValue) || resolvedValue <= 0) {
        throw new Error('INVALID_PAYMENT_AMOUNT');
      }

      const customerId = await findOrCreateCustomer({
        name: customerName,
        email: customerEmail || user.email,
        cpfCnpj: customerCpf.replace(/\D/g, ''),
        phone: customerPhone,
      });

      const externalReference = `${transactionType}_${user.id}_${referenceId}_${Date.now()}`;

      let paymentResult: any;

      if (billingType === 'PIX') {
        paymentResult = await createPixPayment(
          customerId,
          resolvedValue,
          resolvedDescription,
          externalReference
        );
      } else if (billingType === 'CREDIT_CARD') {
        if (!creditCard || !creditCardHolderInfo) {
          throw new Error('Dados do cartao sao obrigatorios para pagamento com cartao');
        }

        paymentResult = await createCreditCardPayment(
          customerId,
          resolvedValue,
          resolvedDescription,
          creditCard as any,
          creditCardHolderInfo as any,
          externalReference
        );
      } else if (billingType === 'BOLETO') {
        paymentResult = await createBoletoPayment(
          customerId,
          resolvedValue,
          resolvedDescription,
          externalReference
        );
      } else {
        throw new Error('billingType invalido. Use PIX, CREDIT_CARD ou BOLETO');
      }

      const { error: insertError } = await supabase
        .from('payment_transactions')
        .upsert(
          {
            user_id: user.id,
            asaas_payment_id: paymentResult.paymentId,
            asaas_customer_id: customerId,
            transaction_type: transactionType,
            reference_id: referenceId,
            amount: resolvedValue,
            billing_type: billingType,
            status: billingType === 'CREDIT_CARD' ? paymentResult.status : 'PENDING',
            external_reference: externalReference,
            description: resolvedDescription,
            metadata: paymentMetadata,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'asaas_payment_id' }
        );

      if (insertError) {
        console.error('Erro ao salvar transacao:', insertError);
        throw new Error('PAYMENT_TRANSACTION_PERSISTENCE_FAILED');
      }

      if (billingType === 'CREDIT_CARD' && paymentResult.status === 'CONFIRMED') {
        const { data: transaction } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('asaas_payment_id', paymentResult.paymentId)
          .single();

        if (transaction) {
          await processPaymentStatus(supabase, transaction, 'CONFIRMED');
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          ...paymentResult,
          externalReference,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (body.action === 'check_status') {
      const paymentId = body.paymentId as string | undefined;
      if (!paymentId) {
        throw new Error('paymentId e obrigatorio');
      }

      const { data: transaction, error: fetchError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('asaas_payment_id', paymentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !transaction) {
        return new Response(
          JSON.stringify({
            success: true,
            status: 'NOT_FOUND',
            transaction: null,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      const asaasPayment = await getPaymentStatus(paymentId);
      const nextStatus = normalizeAsaasStatus(asaasPayment.status);

      await processPaymentStatus(supabase, transaction, nextStatus, asaasPayment);

      const { data: refreshedTransaction } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('asaas_payment_id', paymentId)
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          status: nextStatus,
          transaction: refreshedTransaction || transaction,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Acao invalida. Use create_payment ou check_status');
  } catch (error) {
    console.error('asaas-payment error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function normalizeAsaasStatus(status: string): string {
  switch (status) {
    case 'RECEIVED':
    case 'CONFIRMED':
      return status;
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
    (nextStatus === 'CONFIRMED' || nextStatus === 'RECEIVED') &&
    transaction.status !== 'CONFIRMED' &&
    transaction.status !== 'RECEIVED';

  const updateData: Record<string, unknown> = {
    status: nextStatus,
    updated_at: new Date().toISOString(),
  };

  if (webhookData) {
    updateData.webhook_data = webhookData;
  }

  if (nextStatus === 'CONFIRMED' || nextStatus === 'RECEIVED') {
    updateData.confirmed_at = new Date().toISOString();
  }

  await supabase
    .from('payment_transactions')
    .update(updateData)
    .eq('id', transaction.id);

  // The ledger RPC is idempotent. Retrying it on every confirmed observation
  // recovers from a prior status update followed by a transient credit failure.
  if (
    transaction.transaction_type === 'pinkcoins' &&
    (nextStatus === 'CONFIRMED' || nextStatus === 'RECEIVED')
  ) {
    const { error } = await supabase.rpc('credit_pinkcoins_from_payment', {
      p_payment_transaction_id: transaction.id,
    });
    if (error) throw error;
    return;
  }

  if (
    transaction.transaction_type === 'rositas' &&
    (nextStatus === 'CONFIRMED' || nextStatus === 'RECEIVED')
  ) {
    await processRositasPayment(supabase, transaction);
    return;
  }

  if (!isFirstConfirmation) {
    if (transaction.transaction_type === 'secure_payment' && (nextStatus === 'FAILED' || nextStatus === 'OVERDUE')) {
      await supabase
        .from('conversation_security_steps')
        .update({
          payment_status: nextStatus === 'FAILED' ? 'failed' : 'awaiting_payment',
          updated_at: new Date().toISOString(),
        })
        .eq('conversation_id', transaction.reference_id);
    }

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

async function processRositasPayment(supabase: any, transaction: any) {
  const rositasMap: Record<string, { rositas: number; pinkPoints: number }> = {
    start: { rositas: 100, pinkPoints: 200 },
    essencial: { rositas: 300, pinkPoints: 600 },
    top: { rositas: 700, pinkPoints: 1400 },
    premium: { rositas: 1500, pinkPoints: 3000 },
    black: { rositas: 3000, pinkPoints: 6000 },
  };

  const amounts = rositasMap[transaction.reference_id];
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
