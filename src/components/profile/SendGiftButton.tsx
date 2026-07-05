import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SendGiftButton = () => {
  return (
    <div className="px-4 mb-6">
      <Button
        className="w-full text-white rounded-full h-12 text-base font-semibold shadow-lg"
        style={{ }}
      >
        <Gift className="w-5 h-5 mr-2" />
        Enviar Presente
      </Button>
    </div>
  );
};
