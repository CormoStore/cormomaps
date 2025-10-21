import { FishingSpot } from "@/hooks/use-fishing-spots";
import { X, Navigation, Heart, Star, FileText, Fish, AlertCircle, CreditCard, Edit, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SpotDetailProps {
  spot: FishingSpot;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SpotDetail = ({ spot, onClose, isFavorite, onToggleFavorite, onEdit, onDelete }: SpotDetailProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const images = spot.images && spot.images.length > 0 ? spot.images : [spot.image];

  console.log("SpotDetail - spot.isCustom:", spot.isCustom, "onEdit:", !!onEdit, "onDelete:", !!onDelete);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDelete = () => {
    onDelete?.();
    setShowDeleteDialog(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 animate-fade-in" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up pb-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image Carousel */}
        <div className="relative h-48 w-full">
          <img src={images[currentImageIndex]} alt={spot.name} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          {images.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Title & Rating */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{spot.name}</h2>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(spot.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">{spot.rating}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {spot.isCustom && onEdit && (
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  onClick={onEdit}
                >
                  <Edit className="w-5 h-5" />
                </Button>
              )}
              {spot.isCustom && onDelete && (
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <Button
                size="icon"
                variant="outline"
                className="rounded-full"
                onClick={onToggleFavorite}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Action Button */}
          <Button className="w-full bg-[hsl(var(--ios-blue))] hover:bg-[hsl(var(--ios-blue))]/90 text-white">
            <Navigation className="w-4 h-4 mr-2" />
            Y aller
          </Button>

          {/* Description */}
          <p className="text-muted-foreground">{spot.description}</p>

          {/* Fish Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Fish className="w-5 h-5 text-[hsl(var(--ios-blue))]" />
              <h3 className="font-semibold text-lg">Poissons présents</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {spot.fish.map((fish) => (
                <span
                  key={fish}
                  className="px-3 py-1 bg-secondary rounded-full text-sm font-medium"
                >
                  {fish}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing (only if no permit required) */}
          {!spot.permit_required && (spot.pricing_daily || spot.pricing_day24h || spot.pricing_yearly) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-[hsl(var(--ios-blue))]" />
                <h3 className="font-semibold text-lg">Grille tarifaire</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {spot.pricing_daily && (
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <span className="font-medium">Journée</span>
                    <span className="text-[hsl(var(--ios-blue))] font-semibold">{spot.pricing_daily}</span>
                  </div>
                )}
                {spot.pricing_day24h && (
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <span className="font-medium">24 heures</span>
                    <span className="text-[hsl(var(--ios-blue))] font-semibold">{spot.pricing_day24h}</span>
                  </div>
                )}
                {spot.pricing_yearly && (
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <span className="font-medium">Carte annuelle</span>
                    <span className="text-[hsl(var(--ios-blue))] font-semibold">{spot.pricing_yearly}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Regulations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-[hsl(var(--ios-blue))]" />
              <h3 className="font-semibold text-lg">Réglementation</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Permis requis:</span>{" "}
                  <span className="text-muted-foreground">
                    {spot.permit_required ? "Oui" : "Non"}
                  </span>
                </div>
              </div>
              {spot.min_size && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Taille minimale:</span>{" "}
                    <span className="text-muted-foreground">{spot.min_size}</span>
                  </div>
                </div>
              )}
              {spot.quotas && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Quotas:</span>{" "}
                    <span className="text-muted-foreground">{spot.quotas}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce spot ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le spot "{spot.name}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SpotDetail;
