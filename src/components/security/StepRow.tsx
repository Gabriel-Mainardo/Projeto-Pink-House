import React from 'react';
import { Check, Lock } from 'lucide-react';
import { SecurityStep, SecurityStepStatus } from '../../types/security';

interface StepRowProps {
  step: SecurityStep;
  onAction: (type: string) => void;
  status?: SecurityStepStatus;
}

const STATUS_STYLES: Record<SecurityStepStatus, {
  card: string;
  icon: string;
  title: string;
  description: string;
  badge: string;
  button: string;
}> = {
  available: {
    card: 'bg-[#FAFAFA] border-gray-100 hover:border-pink-100',
    icon: 'bg-pink-100 text-[#E5007E]',
    title: 'text-gray-900',
    description: 'text-gray-500',
    badge: 'bg-pink-100 text-[#E5007E]',
    button: 'bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#E5007E]',
  },
  completed: {
    card: 'bg-green-50 border-green-200',
    icon: 'bg-green-100 text-green-600',
    title: 'text-green-700',
    description: 'text-green-600',
    badge: 'bg-green-100 text-green-600',
    button: 'bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#E5007E]',
  },
  pending: {
    card: 'bg-amber-50 border-amber-200',
    icon: 'bg-amber-100 text-amber-700',
    title: 'text-amber-800',
    description: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    button: 'bg-amber-100 text-amber-700 cursor-not-allowed',
  },
  locked: {
    card: 'bg-[#FAFAFA] border-gray-100 hover:border-pink-100',
    icon: 'bg-gray-100 text-gray-400',
    title: 'text-gray-900',
    description: 'text-gray-500',
    badge: 'bg-pink-100 text-[#E5007E]',
    button: 'bg-gray-100 text-gray-400 cursor-not-allowed',
  },
};

const STATUS_DESCRIPTIONS: Partial<Record<SecurityStepStatus, string>> = {
  completed: 'Concluido!',
  pending: 'Enviado e aguardando aprovacao.',
};

const StepRow: React.FC<StepRowProps> = ({ step, onAction, status = 'available' }) => {
  const Icon = step.icon;
  const completed = status === 'completed';
  const locked = status === 'locked';
  const pending = status === 'pending';
  const styles = STATUS_STYLES[status];
  const description = STATUS_DESCRIPTIONS[status] ?? step.description;

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl mb-3 border transition-colors ${styles.card}`}>
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
          {completed ? (
            <Check size={20} strokeWidth={2.5} />
          ) : locked ? (
            <Lock size={18} strokeWidth={2.5} />
          ) : (
            <Icon size={20} strokeWidth={2.5} />
          )}
        </div>

        <div className="flex flex-col">
          <span className={`text-[15px] ${styles.title}`}>
            {step.title}
          </span>
          <span className={`text-xs leading-tight max-w-[200px] mt-0.5 ${styles.description}`}>
            {description}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 ml-2">
        <span className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${styles.badge}`}>
          +{step.points} pts
        </span>
        {completed ? (
          <span className="text-green-600 text-xs px-4 py-1.5 font-medium">
            Feito
          </span>
        ) : (
          <button
            onClick={() => !locked && !pending && onAction(step.actionType)}
            disabled={locked || pending}
            className={`text-xs px-4 py-1.5 rounded-full transition-colors ${styles.button}`}
          >
            {pending ? 'Em analise' : step.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default StepRow;
