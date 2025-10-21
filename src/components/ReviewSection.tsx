import { useState, useEffect } from "react";
import { Star, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewSectionProps {
  spotId: string;
}

const reviewSchema = z.object({
  rating: z.number().min(1, "Veuillez sélectionner une note").max(5),
  comment: z.string().trim().max(500, "Le commentaire ne peut pas dépasser 500 caractères").optional(),
});

const ReviewSection = ({ spotId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadReviews();
  }, [spotId]);

  const loadReviews = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        user_id,
        profiles(full_name, avatar_url)
      `)
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading reviews:", error);
    } else if (data) {
      setReviews(data as any);
    }
    setIsLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour laisser un avis",
        variant: "destructive",
      });
      return;
    }

    try {
      const validatedData = reviewSchema.parse({
        rating: selectedRating,
        comment: comment || undefined,
      });

      setIsSubmitting(true);

      // Check if user already reviewed this spot
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("spot_id", spotId)
        .eq("user_id", user.id)
        .single();

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from("reviews")
          .update({
            rating: validatedData.rating,
            comment: validatedData.comment || null,
          })
          .eq("id", existingReview.id);

        if (error) throw error;

        toast({
          title: "Avis mis à jour",
          description: "Votre avis a été mis à jour avec succès",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from("reviews")
          .insert({
            spot_id: spotId,
            user_id: user.id,
            rating: validatedData.rating,
            comment: validatedData.comment || null,
          });

        if (error) throw error;

        toast({
          title: "Avis publié",
          description: "Votre avis a été publié avec succès",
        });
      }

      // Reset form and close dialog
      setSelectedRating(0);
      setComment("");
      setIsDialogOpen(false);
      
      // Reload reviews
      loadReviews();

    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error("Error submitting review:", error);
        toast({
          title: "Erreur",
          description: "Impossible de publier l'avis",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[hsl(var(--ios-blue))]" />
          <h3 className="font-semibold text-lg">
            Avis {reviews.length > 0 && `(${reviews.length})`}
          </h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              Laisser un avis
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Laisser un avis</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Note</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onMouseEnter={() => setHoveredRating(rating)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setSelectedRating(rating)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= (hoveredRating || selectedRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Commentaire (optionnel)
                </label>
                <Textarea
                  placeholder="Partagez votre expérience sur ce spot..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/500 caractères
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={selectedRating === 0 || isSubmitting}
                >
                  {isSubmitting ? "Publication..." : "Publier"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-4">Chargement des avis...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          Aucun avis pour le moment. Soyez le premier à en laisser un !
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">
                      {review.profiles.full_name || "Utilisateur"}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.created_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
