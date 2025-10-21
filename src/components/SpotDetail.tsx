import { FishingSpot } from "@/types";
import { X, Navigation, Heart, Star, FileText, Fish, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SpotDetailProps {
  spot: FishingSpot;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const SpotDetail = ({ spot, onClose, isFavorite, onToggleFavorite }: SpotDetailProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 animate-fade-in" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up pb-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-48 w-full">
          <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
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
                    {spot.regulations.permit ? "Oui" : "Non"}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Taille minimale:</span>{" "}
                  <span className="text-muted-foreground">{spot.regulations.minSize}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Quotas:</span>{" "}
                  <span className="text-muted-foreground">{spot.regulations.quotas}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Avis de la communauté</h3>
            <div className="space-y-4">
              {spot.reviews.map((review) => (
                <div key={review.id} className="p-4 bg-secondary rounded-2xl">
                  <div className="flex items-start gap-3">
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{review.userName}</span>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotDetail;
