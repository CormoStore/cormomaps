import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const { toast } = useToast();

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          setPermissionStatus(result.state);
          
          result.addEventListener('change', () => {
            setPermissionStatus(result.state);
          });
        } catch (err) {
          console.log('Permission API not fully supported');
        }
      }
    };
    
    checkPermission();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      const errorMsg = "La géolocalisation n'est pas supportée par votre navigateur";
      setError(errorMsg);
      toast({
        title: "Erreur",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setPosition(newPosition);
        setLoading(false);
        toast({
          title: "Position trouvée !",
          description: `Précision: ${Math.round(pos.coords.accuracy)}m`,
        });
      },
      (err) => {
        let errorMsg = "Impossible d'obtenir votre position";
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = "Vous avez refusé l'accès à la géolocalisation. Veuillez autoriser l'accès dans les paramètres de votre appareil.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = "Position indisponible. Vérifiez que le GPS est activé.";
            break;
          case err.TIMEOUT:
            errorMsg = "Délai d'attente dépassé pour obtenir votre position.";
            break;
        }
        
        setError(errorMsg);
        setLoading(false);
        toast({
          title: "Erreur de géolocalisation",
          description: errorMsg,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return {
    position,
    loading,
    error,
    permissionStatus,
    requestLocation,
  };
};
