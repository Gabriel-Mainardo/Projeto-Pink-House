import { useState, type RefObject } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Coins, FlaskConical, X } from 'lucide-react';
import { pinkcoinPreviewPackages } from '../config/pinkcoinPreview';

const quantity = new Intl.NumberFormat('pt-BR');
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const defaultPackage = pinkcoinPreviewPackages.find((item) => item.recommended) ?? pinkcoinPreviewPackages[0];

export function PinkcoinPurchasePreview({ open, onOpenChange, returnFocusRef }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusRef?: RefObject<HTMLButtonElement>;
}) {
  const [selected, setSelected] = useState(defaultPackage);
  const [step, setStep] = useState<'packages' | 'review' | 'complete'>('packages');
  const changeOpen = (next: boolean) => {
    if (!next) {
      setStep('packages');
      setSelected(defaultPackage);
    }
    onOpenChange(next);
  };

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[180] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content onCloseAutoFocus={(event) => {
          if (returnFocusRef?.current) {
            event.preventDefault();
            returnFocusRef.current.focus();
          }
        }} className="fixed left-1/2 top-1/2 z-[181] flex max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl focus:outline-none">
          <header className="shrink-0 border-b border-gray-100 px-5 py-5 sm:px-7">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-[#d91d83]">
              <FlaskConical className="h-3.5 w-3.5" /> Prévia de compra
            </div>
            <Dialog.Title className="pr-8 text-xl font-bold text-gray-900 sm:text-2xl">
              {step === 'complete' ? 'Simulação concluída' : step === 'review' ? 'Confira seu pacote' : 'Escolha seus PinkCoins'}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-5 text-gray-500">
              Preços fictícios para avaliação. Nenhuma cobrança será realizada.
            </Dialog.Description>
            <Dialog.Close aria-label="Fechar compra simulada" className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d91d83]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            {step === 'packages' ? (
              <div role="group" aria-label="Pacotes de PinkCoins" className="grid gap-3 sm:grid-cols-2">
                {pinkcoinPreviewPackages.map((item) => {
                  const active = item.code === selected.code;
                  return (
                    <button key={item.code} type="button" aria-pressed={active} onClick={() => setSelected(item)} className={`relative rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d91d83] ${active ? 'border-[#d91d83] bg-pink-50/70' : 'border-gray-100 bg-white hover:border-pink-200'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-gray-700">{item.name}</span>
                        {item.recommended && <span className="rounded-full bg-[#d91d83] px-2 py-1 text-[10px] font-bold text-white">Sugestão</span>}
                        {active && <Check className="h-4 w-4 text-[#d91d83]" aria-hidden="true" />}
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Coins className="h-5 w-5 text-[#d91d83]" aria-hidden="true" />
                        <span className="text-2xl font-extrabold text-gray-900">{quantity.format(item.coins)}</span>
                        <span className="text-xs font-semibold text-gray-500">PinkCoins</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-gray-500">{item.description}</p>
                      <p className="mt-4 text-xl font-bold text-[#d91d83]">{currency.format(item.price)}</p>
                    </button>
                  );
                })}
              </div>
            ) : step === 'review' ? (
              <div>
                <div className="flex items-center gap-4 rounded-xl bg-pink-50 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#d91d83]"><Coins className="h-6 w-6" /></div>
                  <div><p className="text-sm font-semibold text-gray-500">Pacote {selected.name}</p><p className="mt-1 text-2xl font-bold text-gray-900">{quantity.format(selected.coins)} PinkCoins</p></div>
                </div>
                <dl className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-gray-500">Valor ilustrativo</dt><dd className="text-lg font-bold text-gray-900">{currency.format(selected.price)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-gray-500">Tipo de operação</dt><dd className="font-semibold text-[#d91d83]">Simulação</dd></div>
                </dl>
                <p className="mt-6 rounded-lg border border-gray-100 p-4 text-xs leading-6 text-gray-500">Você pode testar esta etapa sem pagar. A simulação não adiciona PinkCoins ao saldo nem registra uma compra no histórico da carteira.</p>
              </div>
            ) : (
              <div role="status" className="py-4 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-[#d91d83]" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-bold text-gray-900">Tudo pronto para avaliar o fluxo</h3>
                <p className="mt-3 text-sm text-gray-600">Pacote {selected.name}: <strong>{quantity.format(selected.coins)} PinkCoins</strong> por <strong>{currency.format(selected.price)}</strong>.</p>
                <p className="mt-4 text-sm leading-6 text-gray-500">Esta foi uma compra simulada. O saldo da sua PinkWallet permanece o mesmo.</p>
              </div>
            )}
          </div>

          <footer className="shrink-0 border-t border-gray-100 px-5 py-4 sm:px-7">
            {step === 'packages' ? (
              <button type="button" onClick={() => setStep('review')} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d91d83] px-4 py-3 text-sm font-bold text-white hover:bg-[#b90a69]">Continuar com {quantity.format(selected.coins)} PinkCoins <ArrowRight className="h-4 w-4" /></button>
            ) : step === 'review' ? (
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('packages')} className="flex min-h-12 items-center justify-center gap-1 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /> Voltar</button>
                <button type="button" onClick={() => setStep('complete')} className="min-h-12 flex-1 rounded-xl bg-[#d91d83] px-4 py-3 text-sm font-bold text-white hover:bg-[#b90a69]">Simular compra</button>
              </div>
            ) : (
              <button type="button" onClick={() => changeOpen(false)} className="min-h-12 w-full rounded-xl bg-[#d91d83] px-4 py-3 text-sm font-bold text-white hover:bg-[#b90a69]">Voltar para a PinkWallet</button>
            )}
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
