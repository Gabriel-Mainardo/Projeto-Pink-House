import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReferralItemProps {
  name: string;
  status: "verified" | "pending" | "incomplete";
  reward: string;
  avatarUrl?: string;
}

const statusConfig = {
  verified: {
    label: "Verificada",
    className: "text-verified",
  },
  pending: {
    label: "Em análise",
    className: "text-warning",
  },
  incomplete: {
    label: "Cadastro incompleto",
    className: "text-incomplete",
  },
};

export const ReferralItem = ({ name, status, reward, avatarUrl }: ReferralItemProps) => {
  const statusInfo = statusConfig[status];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className={`text-sm ${statusInfo.className}`}>{statusInfo.label}</p>
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{reward}</p>
    </div>
  );
};
