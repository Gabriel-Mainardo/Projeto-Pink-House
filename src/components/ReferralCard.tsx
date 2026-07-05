import { LucideIcon } from "lucide-react";

interface ReferralCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

export const ReferralCard = ({ icon: Icon, value, label }: ReferralCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-card p-3 shadow-sm aspect-square">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="text-center flex-1 flex flex-col justify-center">
        <p className="text-black text-xs leading-tight" style={{ }}>{value}</p>
        <p className="text-[10px] text-black leading-tight" style={{ }}>{label}</p>
      </div>
    </div>
  );
};
