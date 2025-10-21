import { useState, useRef } from "react";
import { Search, Filter, MapPin, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Map, { Marker, NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import SpotDetail from "@/components/SpotDetail";
import CreateSpotForm from "@/components/CreateSpotForm";
import { FishingSpot } from "@/types";
import { useSpots } from "@/hooks/use-spots";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1IjoiY29ybW9zdG9yZSIsImEiOiJjbWgwZ2U4NWUwaG9tNWtxdWM0cTEyamtyIn0.eCz_pytNEYgJyKjnP9J_Lw";

const MapPage = () => {
  const { spots, addSpot, updateSpot } = useSpots();
  const { toast } = useToast();
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState<FishingSpot | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isCreationMode, setIsCreationMode] = useState(false);
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
    setIsCreationMode(true);
    toast({
      title: "Mode création activé",
      description: "Cliquez sur la carte pour placer votre spot",
    });
  };

  const handleMapClick = (event: any) => {
    if (!isCreationMode) return;
    
    const { lngLat } = event;
    setMapCenter({ lat: lngLat.lat, lng: lngLat.lng });
    setIsCreationMode(false);
    if (!showCreateForm) {
      setShowCreateForm(true);
    }
  };

  const handleSubmitSpot = (spot: FishingSpot) => {
    if (editingSpot) {
      updateSpot(spot);
      setEditingSpot(null);
    } else {
      addSpot(spot);
    }
  };

  const handleEditSpot = (spot: FishingSpot) => {
    setEditingSpot(spot);
    setSelectedSpot(null);
    setMapCenter({ lat: spot.latitude, lng: spot.longitude });
    setShowCreateForm(true);
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
        onClick={handleMapClick}
        cursor={isCreationMode ? "crosshair" : "auto"}
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

      {/* Floating Add Button - Hide in edit mode */}
      {!editingSpot && (
        <button
          onClick={handleCreateSpot}
          className={`absolute bottom-28 right-4 z-10 w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all animate-scale-in ${
            isCreationMode 
              ? "bg-red-500 animate-pulse" 
              : "bg-[hsl(var(--ios-blue))]"
          }`}
        >
          {isCreationMode ? (
            <X className="w-6 h-6 text-white" onClick={(e) => {
              e.stopPropagation();
              setIsCreationMode(false);
            }} />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </button>
      )}

      {/* Creation Mode Indicator */}
      {isCreationMode && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 bg-background/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg animate-fade-in">
          <p className="text-sm font-medium">📍 Cliquez sur la carte pour {editingSpot ? "déplacer" : "placer"} le spot</p>
        </div>
      )}

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <SpotDetail
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          isFavorite={favorites.has(selectedSpot.id)}
          onToggleFavorite={() => toggleFavorite(selectedSpot.id)}
          onEdit={selectedSpot.isCustom ? () => handleEditSpot(selectedSpot) : undefined}
        />
      )}

      {/* Create/Edit Spot Form */}
      {showCreateForm && (
        <CreateSpotForm
          onClose={() => {
            setShowCreateForm(false);
            setEditingSpot(null);
          }}
          onSubmit={handleSubmitSpot}
          initialCoordinates={mapCenter || undefined}
          editingSpot={editingSpot || undefined}
          onActivateMapMode={editingSpot ? () => {
            setIsCreationMode(true);
            toast({
              title: "Mode modification activé",
              description: "Cliquez sur la carte pour déplacer le spot",
            });
          } : undefined}
        />
      )}
    </div>
  );
};

export default MapPage;
