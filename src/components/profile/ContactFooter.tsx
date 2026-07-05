import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactFooterProps {
  price?: string;
  onContactClick: () => void;
}

export const ContactFooter = ({ price = "R$ 300", onContactClick }: ContactFooterProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-lg z-50">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium" style={{ }}>A partir de</p>
          <p className="text-xl font-bold text-foreground" style={{ }}>{price}</p>
        </div>
        <Button
          onClick={onContactClick}
          className="text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg"
          style={{ }}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Enviar mensagem
        </Button>
      </div>
    </div>
  );
};
