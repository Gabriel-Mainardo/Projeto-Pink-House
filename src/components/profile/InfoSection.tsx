import { Card } from "@/components/ui/card";

interface InfoSectionProps {
  location: string;
  age?: number;
  price?: string;
}

export const InfoSection = ({ location, age, price }: InfoSectionProps) => {
  const infoItems = [
    { label: "Localização", value: location },
    { label: "Idade", value: age ? `${age} anos` : "Não informado" },
    { label: "Cachê mínimo", value: price || "R$ 300" },
    { label: "Tempo de atendimento", value: "A partir de 1h" },
    { label: "Atende", value: "Homens, Casais" },
    { label: "Preferências", value: "Não fumantes" },
  ];

  return (
    <div className="mb-6 px-4">
      <div className="grid grid-cols-2 gap-3">
        {infoItems.map((item, index) => (
          <Card key={index} className="p-4 shadow-sm border-border">
            <h3 className="text-xs font-medium text-foreground mb-1" style={{ }}>
              {item.label}
            </h3>
            <p className="text-sm text-muted-foreground font-normal" style={{ }}>
              {item.value}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
