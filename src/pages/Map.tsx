import { useState, useRef } from "react";
import { Search, Filter, MapPin, Plus } from "lucide-react";
import Map, { Marker, NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import SpotDetail from "@/components/SpotDetail";
import CreateSpotForm from "@/components/CreateSpotForm";
import { FishingSpot } from "@/types";
import { useSpots } from "@/hooks/use-spots";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1IjoiY29ybW9zdG9yZSIsImEiOiJjbWgwZ2U4NWUwaG9tNWtxdWM0cTEyamtyIn0.eCz_pytNEYgJyKjnP9J_Lw";

const MapPage = () => {
  const { spots, addSpot } = useSpots();
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
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

  const handleCreateSpot = () => {
    // Get current map center
    if (mapRef.current) {
      const map = (mapRef.current as any).getMap();
      const center = map.getCenter();
      setMapCenter({ lat: center.lat, lng: center.lng });
    }
    setShowCreateForm(true);
  };

  const handleSubmitSpot = (spot: FishingSpot) => {
    addSpot(spot);
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
        {spots.map((spot) => (
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

      {/* Floating Add Button */}
      <button
        onClick={handleCreateSpot}
        className="absolute bottom-28 right-4 z-10 w-14 h-14 rounded-full bg-[hsl(var(--ios-blue))] shadow-lg flex items-center justify-center hover:scale-110 transition-transform animate-scale-in"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <SpotDetail
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          isFavorite={favorites.has(selectedSpot.id)}
          onToggleFavorite={() => toggleFavorite(selectedSpot.id)}
        />
      )}

      {/* Create Spot Form */}
      {showCreateForm && (
        <CreateSpotForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleSubmitSpot}
          initialCoordinates={mapCenter || undefined}
        />
      )}
    </div>
  );
};

export default MapPage;
