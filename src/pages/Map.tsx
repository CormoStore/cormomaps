import { useState, useRef, useEffect } from "react";
import { Search, Filter, MapPin, Plus, X, Locate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import SpotDetail from "@/components/SpotDetail";
import CreateSpotForm from "@/components/CreateSpotForm";
import { useFishingSpots, FishingSpot } from "@/hooks/use-fishing-spots";
import { useFavorites } from "@/hooks/use-favorites";
import { useGeolocation } from "@/hooks/use-geolocation";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapPage = () => {
  const { spots, loading, addSpot, updateSpot, deleteSpot } = useFishingSpots();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites(user?.id);
  const { position, loading: geoLoading, requestLocation } = useGeolocation();
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState<FishingSpot | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 46.6034,
    zoom: 5.5,
  });
  const mapRef = useRef(null);

  // Center map on user location when available
  useEffect(() => {
    if (position && mapRef.current) {
      setViewState({
        longitude: position.longitude,
        latitude: position.latitude,
        zoom: 12,
      });
    }
  }, [position]);

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

  const handleSubmitSpot = async (spot: any) => {
    if (editingSpot) {
      await updateSpot({ ...spot, id: editingSpot.id });
      setEditingSpot(null);
    } else {
      await addSpot(spot);
    }
  };

  const handleDeleteSpot = async (spotId: string) => {
    await deleteSpot(spotId);
  };

  const handleEditSpot = (spot: FishingSpot) => {
    setEditingSpot(spot);
    setSelectedSpot(null);
    setMapCenter({ lat: spot.latitude, lng: spot.longitude });
    setShowCreateForm(true);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full safe-bottom">
      {/* Search Bar */}
      <div className="absolute z-10 left-4 right-4" style={{ top: "calc(env(safe-area-inset-top) + 12px)" }}>
        <div className="glass-ios-white rounded-2xl shadow-lg p-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un spot..."
            className="flex-1 bg-transparent border-none outline-none text-base md:text-base"
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
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        onClick={handleMapClick}
        cursor={isCreationMode ? "crosshair" : "auto"}
      >
        {/* Map Controls */}
        <NavigationControl position="top-right" style={{ top: 80, right: 16 }} />
        
        {/* Custom Geolocation Button with iOS/Android permission request */}
        <button
          onClick={requestLocation}
          disabled={geoLoading}
          className="absolute top-[140px] right-4 w-[29px] h-[29px] bg-white rounded border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Me localiser"
        >
          <Locate className={`w-4 h-4 text-gray-700 ${geoLoading ? 'animate-pulse' : ''}`} />
        </button>

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

      {/* Floating Add Button - Hide in edit mode and creation form */}
      {!editingSpot && !showCreateForm && (
        <button
          onClick={handleCreateSpot}
          className={`absolute bottom-32 right-4 z-[60] w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all animate-scale-in ${
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
          isFavorite={isFavorite(selectedSpot.id)}
          onToggleFavorite={() => toggleFavorite(selectedSpot.id)}
          onEdit={selectedSpot.created_by === user?.id ? () => handleEditSpot(selectedSpot) : undefined}
          onDelete={(selectedSpot.created_by === user?.id || isAdmin) ? () => handleDeleteSpot(selectedSpot.id) : undefined}
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
