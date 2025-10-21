import { useState } from "react";
import { X, MapPin, Camera, Fish, FileText, Scale, Hash, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FishingSpot } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const createSpotSchema = z.object({
  name: z.string().trim().min(3, "Le nom doit contenir au moins 3 caractères").max(100, "Le nom doit contenir moins de 100 caractères"),
  description: z.string().trim().min(10, "La description doit contenir au moins 10 caractères").max(500, "La description doit contenir moins de 500 caractères"),
  fish: z.string().trim().min(1, "Ajoutez au moins un type de poisson"),
  minSize: z.string().trim().max(100, "Taille minimale trop longue"),
  quotas: z.string().trim().max(100, "Quotas trop longs"),
});

interface CreateSpotFormProps {
  onClose: () => void;
  onSubmit: (spot: FishingSpot) => void;
  initialCoordinates?: { lat: number; lng: number };
}

const CreateSpotForm = ({ onClose, onSubmit, initialCoordinates }: CreateSpotFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    latitude: initialCoordinates?.lat.toFixed(6) || "",
    longitude: initialCoordinates?.lng.toFixed(6) || "",
    description: "",
    fish: "",
    permitRequired: true,
    minSize: "",
    quotas: "",
    pricingDaily: "",
    pricingDay24h: "",
    pricingYearly: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      createSpotSchema.parse({
        name: formData.name,
        description: formData.description,
        fish: formData.fish,
        minSize: formData.minSize,
        quotas: formData.quotas,
      });

      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        setErrors({ latitude: "Latitude invalide (entre -90 et 90)" });
        return;
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        setErrors({ longitude: "Longitude invalide (entre -180 et 180)" });
        return;
      }

      const newSpot: FishingSpot = {
        id: `custom-${Date.now()}`,
        name: formData.name,
        latitude: lat,
        longitude: lng,
        rating: 0,
        image: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=800",
        description: formData.description,
        fish: formData.fish.split(",").map(f => f.trim()),
        regulations: {
          permit: formData.permitRequired,
          minSize: formData.minSize,
          quotas: formData.quotas,
        },
        pricing: !formData.permitRequired && (formData.pricingDaily || formData.pricingDay24h || formData.pricingYearly) ? {
          daily: formData.pricingDaily,
          day24h: formData.pricingDay24h,
          yearly: formData.pricingYearly,
        } : undefined,
        reviews: [],
      };

      onSubmit(newSpot);
      toast({
        title: "Spot créé !",
        description: "Votre nouveau spot a été ajouté avec succès.",
      });
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-in-right max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Créer un spot</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Nom du spot *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Lac des Truites"
              maxLength={100}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Latitude *
              </Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="46.123456"
              />
              {errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="2.123456"
              />
              {errors.longitude && <p className="text-sm text-destructive">{errors.longitude}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez le spot, l'accès, les conditions..."
              rows={3}
              maxLength={500}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Fish */}
          <div className="space-y-2">
            <Label htmlFor="fish" className="flex items-center gap-2">
              <Fish className="w-4 h-4" />
              Poissons présents *
            </Label>
            <Input
              id="fish"
              value={formData.fish}
              onChange={(e) => setFormData({ ...formData, fish: e.target.value })}
              placeholder="Ex: Truite, Brochet, Carpe (séparés par des virgules)"
              maxLength={200}
            />
            {errors.fish && <p className="text-sm text-destructive">{errors.fish}</p>}
          </div>

          {/* Regulations */}
          <div className="space-y-3 p-3 bg-secondary/30 rounded-xl">
            <h3 className="font-semibold text-sm">Réglementation</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="permit">Permis obligatoire</Label>
              <Switch
                id="permit"
                checked={formData.permitRequired}
                onCheckedChange={(checked) => setFormData({ ...formData, permitRequired: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minSize" className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Tailles minimales
              </Label>
              <Input
                id="minSize"
                value={formData.minSize}
                onChange={(e) => setFormData({ ...formData, minSize: e.target.value })}
                placeholder="Ex: Truite: 23cm"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quotas" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Quotas journaliers
              </Label>
              <Input
                id="quotas"
                value={formData.quotas}
                onChange={(e) => setFormData({ ...formData, quotas: e.target.value })}
                placeholder="Ex: 6 truites/jour"
                maxLength={100}
              />
            </div>
          </div>

          {/* Pricing (only if permit not required) */}
          {!formData.permitRequired && (
            <div className="space-y-3 p-3 bg-secondary/30 rounded-xl">
              <h3 className="font-semibold text-sm">Grille tarifaire</h3>
              
              <div className="space-y-2">
                <Label htmlFor="pricingDaily">Prix à la journée</Label>
                <Input
                  id="pricingDaily"
                  value={formData.pricingDaily}
                  onChange={(e) => setFormData({ ...formData, pricingDaily: e.target.value })}
                  placeholder="Ex: 15€"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricingDay24h">Prix les 24h</Label>
                <Input
                  id="pricingDay24h"
                  value={formData.pricingDay24h}
                  onChange={(e) => setFormData({ ...formData, pricingDay24h: e.target.value })}
                  placeholder="Ex: 25€"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricingYearly">Prix à l'année</Label>
                <Input
                  id="pricingYearly"
                  value={formData.pricingYearly}
                  onChange={(e) => setFormData({ ...formData, pricingYearly: e.target.value })}
                  placeholder="Ex: 250€"
                  maxLength={50}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-[hsl(var(--ios-blue))] hover:bg-[hsl(var(--ios-blue))]/90">
              Créer le spot
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSpotForm;
