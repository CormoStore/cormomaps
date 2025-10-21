import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface FishingSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  fish: string[];
  image?: string;
  images?: string[];
  rating: number;
  permit_required: boolean;
  min_size?: string;
  quotas?: string;
  pricing_daily?: string;
  pricing_day24h?: string;
  pricing_yearly?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const useFishingSpots = () => {
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSpots = async () => {
    try {
      const { data, error } = await supabase
        .from("fishing_spots")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSpots(data || []);
    } catch (error) {
      console.error("Error fetching spots:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les spots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("fishing_spots_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fishing_spots",
        },
        () => {
          fetchSpots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addSpot = async (spot: Omit<FishingSpot, "id" | "created_at" | "updated_at">) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("fishing_spots")
        .insert([
          {
            name: spot.name,
            latitude: spot.latitude,
            longitude: spot.longitude,
            description: spot.description,
            fish: spot.fish,
            image: spot.image,
            images: spot.images,
            rating: spot.rating,
            permit_required: spot.permit_required,
            min_size: spot.min_size,
            quotas: spot.quotas,
            pricing_daily: spot.pricing_daily,
            pricing_day24h: spot.pricing_day24h,
            pricing_yearly: spot.pricing_yearly,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Spot créé !",
        description: "Votre spot a été ajouté avec succès",
      });

      return data;
    } catch (error) {
      console.error("Error adding spot:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le spot",
        variant: "destructive",
      });
    }
  };

  const updateSpot = async (spot: FishingSpot) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("fishing_spots")
        .update({
          name: spot.name,
          latitude: spot.latitude,
          longitude: spot.longitude,
          description: spot.description,
          fish: spot.fish,
          image: spot.image,
          images: spot.images,
          permit_required: spot.permit_required,
          min_size: spot.min_size,
          quotas: spot.quotas,
          pricing_daily: spot.pricing_daily,
          pricing_day24h: spot.pricing_day24h,
          pricing_yearly: spot.pricing_yearly,
        })
        .eq("id", spot.id);

      if (error) throw error;

      toast({
        title: "Spot modifié !",
        description: "Les modifications ont été enregistrées",
      });
    } catch (error) {
      console.error("Error updating spot:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le spot",
        variant: "destructive",
      });
    }
  };

  const deleteSpot = async (spotId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("fishing_spots")
        .delete()
        .eq("id", spotId);

      if (error) throw error;

      toast({
        title: "Spot supprimé",
        description: "Le spot a été supprimé avec succès",
      });
    } catch (error: any) {
      console.error("Error deleting spot:", error);
      
      // Check if it's a permission error
      if (error.message?.includes("policy")) {
        toast({
          title: "Permission refusée",
          description: "Seuls les administrateurs peuvent supprimer ce spot",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le spot",
          variant: "destructive",
        });
      }
    }
  };

  return { spots, loading, addSpot, updateSpot, deleteSpot };
};
