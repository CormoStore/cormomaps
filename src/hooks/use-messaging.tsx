import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useMessaging = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const startConversation = async (
    currentUserId: string,
    otherUserId: string,
    listingId?: string
  ) => {
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant1_id.eq.${currentUserId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUserId})`
        )
        .maybeSingle();

      if (existing) {
        navigate("/messages");
        return existing.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          participant1_id: currentUserId,
          participant2_id: otherUserId,
          listing_id: listingId || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Conversation créée",
        description: "Vous pouvez maintenant envoyer des messages",
      });

      navigate("/messages");
      return data.id;
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la conversation",
        variant: "destructive",
      });
      return null;
    }
  };

  return { startConversation };
};