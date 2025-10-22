import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FishingEquipment } from "@/components/FishingEquipment";

const Equipment = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background safe-bottom pt-4 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Mon Matériel</h1>
      </div>

      <FishingEquipment />
    </div>
  );
};

export default Equipment;