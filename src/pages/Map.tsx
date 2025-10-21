import { useState, useRef } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import Map, { Marker, NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import { fishingSpots } from "@/data/spots";
import SpotDetail from "@/components/SpotDetail";
import { FishingSpot } from "@/types";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1IjoiY29ybW9zdG9yZSIsImEiOiJjbWgwZ2U4NWUwaG9tNWtxdWM0cTEyamtyIn0.eCz_pytNEYgJyKjnP9J_Lw";

const MapPage = () => {
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const mapRef = useRef(null);

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

      {/* Interactive Mapbox Map */}
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: 2.3522,
          latitude: 46.6034,
          zoom: 5.5,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
      >
        {/* Map Controls */}
        <NavigationControl position="top-right" style={{ top: 80, right: 16 }} />
        <GeolocateControl
          position="top-right"
          style={{ top: 140, right: 16 }}
          trackUserLocation
        />

        {/* Fishing Spot Markers */}
        {fishingSpots.map((spot) => (
          <Marker
            key={spot.id}
            longitude={spot.longitude}
            latitude={spot.latitude}
            anchor="bottom"
          >
            <button
              onClick={() => setSelectedSpot(spot)}
              className="w-10 h-10 rounded-full bg-[hsl(var(--ios-blue))] shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform animate-scale-in"
            >
              <MapPin className="w-5 h-5 text-white fill-white" />
            </button>
          </Marker>
        ))}
      </Map>

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

export default MapPage;
