import { useState } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { fishingSpots } from "@/data/spots";
import SpotDetail from "@/components/SpotDetail";
import { FishingSpot } from "@/types";

const Map = () => {
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (spotId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(spotId)) {
        newFavorites.delete(spotId);
      } else {
        newFavorites.add(spotId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="relative h-screen w-full pb-20">
      {/* Search Bar */}
      <div className="absolute top-safe z-10 left-4 right-4 mt-4">
        <div className="glass-ios-white rounded-2xl shadow-lg p-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un spot..."
            className="flex-1 bg-transparent border-none outline-none text-sm"
          />
          <button className="w-9 h-9 rounded-full bg-[hsl(var(--ios-blue))] flex items-center justify-center">
            <Filter className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center relative overflow-hidden">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-gray-400" />
            ))}
          </div>
        </div>

        {/* Spots on map */}
        <div className="absolute inset-0">
          {fishingSpots.map((spot, index) => (
            <button
              key={spot.id}
              onClick={() => setSelectedSpot(spot)}
              className="absolute w-10 h-10 rounded-full bg-[hsl(var(--ios-blue))] shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform animate-scale-in"
              style={{
                left: `${20 + index * 25}%`,
                top: `${30 + index * 10}%`,
              }}
            >
              <MapPin className="w-5 h-5 text-white fill-white" />
            </button>
          ))}
        </div>

        {/* Info text */}
        <div className="relative z-10 text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg max-w-md mx-4">
          <MapPin className="w-12 h-12 text-[hsl(var(--ios-blue))] mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Carte interactive</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Cliquez sur les marqueurs bleus pour découvrir les spots de pêche
          </p>
          <p className="text-xs text-muted-foreground">
            Note: Pour utiliser Mapbox, ajoutez votre token dans Map.tsx
          </p>
        </div>
      </div>

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <SpotDetail
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          isFavorite={favorites.has(selectedSpot.id)}
          onToggleFavorite={() => toggleFavorite(selectedSpot.id)}
        />
      )}
    </div>
  );
};

export default Map;
