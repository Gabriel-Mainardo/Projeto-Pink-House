import { CheckCircle2 } from "lucide-react";

interface RewardStepProps {
  title: string;
  subtitle?: string;
}

export const RewardStep = ({ title, subtitle }: RewardStepProps) => {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary" />
      <div className="flex-1">
        <p className="text-foreground">{title}</p>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
};
