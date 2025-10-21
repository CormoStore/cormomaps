import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = (userId: string | undefined) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    } else {
      setFavorites(new Set());
      setLoading(false);
    }
  }, [userId]);

  const fetchFavorites = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('spot_id')
        .eq('user_id', userId);

      if (error) throw error;

      const favoriteIds = new Set(data.map(f => f.spot_id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (spotId: string) => {
    if (!userId) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter des favoris",
        variant: "destructive",
      });
      return;
    }

    const isFavorite = favorites.has(spotId);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('spot_id', spotId);

        if (error) throw error;

        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(spotId);
          return newSet;
        });

        toast({
          title: "Retiré des favoris",
          description: "Le spot a été retiré de vos favoris",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: userId, spot_id: spotId });

        if (error) throw error;

        setFavorites(prev => new Set(prev).add(spotId));

        toast({
          title: "Ajouté aux favoris",
          description: "Le spot a été ajouté à vos favoris",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier les favoris",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (spotId: string) => favorites.has(spotId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
};
