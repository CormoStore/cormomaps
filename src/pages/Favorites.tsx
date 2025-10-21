import { Heart, Star, Navigation } from "lucide-react";
import { fishingSpots } from "@/data/spots";
import { useState } from "react";

const Favorites = () => {
  const [favorites] = useState<Set<string>>(new Set(["1", "3"]));

  const favoriteSpots = fishingSpots.filter((spot) => favorites.has(spot.id));

  return (
    <div className="min-h-screen bg-background pb-24 pt-4 px-4">
      <h1 className="text-3xl font-bold mb-6 mt-2">Mes Favoris</h1>

      {favoriteSpots.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center px-8">
          <Heart className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold mb-2">Aucun favori pour le moment</p>
          <p className="text-muted-foreground">
            Ajoutez des spots à vos favoris pour les retrouver facilement ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {favoriteSpots.map((spot) => (
            <div
              key={spot.id}
              className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-4 p-4">
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{spot.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(spot.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{spot.rating}</span>
                      </div>
                    </div>
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Navigation className="w-3 h-3" />
                    <span>12 km</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
