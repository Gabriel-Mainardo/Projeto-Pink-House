import { Badge } from "@/components/ui/badge";

interface ServicesSectionProps {
  services: string[];
}

export const ServicesSection = ({ services }: ServicesSectionProps) => {
  if (!services || services.length === 0) return null;

  return (
    <div className="mb-6 px-4">
      <h2 className="text-base font-semibold mb-3 text-foreground" style={{ }}>
        Serviços Oferecidos
      </h2>
      <div className="flex flex-wrap gap-2">
        {services.map((service, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{ }}
          >
            {service}
          </Badge>
        ))}
      </div>
    </div>
  );
};
