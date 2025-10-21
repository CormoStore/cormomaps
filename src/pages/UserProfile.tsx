import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Fish, MessageSquare, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { FishingEquipment } from "@/components/FishingEquipment";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface Spot {
  id: string;
  name: string;
  description: string;
  image: string | null;
  rating: number;
  fish: string[];
  status: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  spot: {
    name: string;
  };
}

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    setIsLoading(true);

    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .eq("id", userId)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Load spots - show all spots if viewing own profile, only approved for others
    let spotsQuery = supabase
      .from("fishing_spots")
      .select("id, name, description, image, rating, fish, status")
      .eq("created_by", userId);
    
    // Only filter by approved status if viewing another user's profile
    if (!isOwnProfile) {
      spotsQuery = spotsQuery.eq("status", "approved");
    }

    const { data: spotsData } = await spotsQuery;

    if (spotsData) {
      setSpots(spotsData);
    }

    // Load reviews
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        fishing_spots!inner(name)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (reviewsData) {
      setReviews(reviewsData.map(review => ({
        ...review,
        spot: { name: (review as any).fishing_spots.name }
      })));
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Profil non trouvé</p>
      </div>
    );
  }

  const stats = [
    { icon: MapPin, label: "Spots", value: spots.length.toString() },
    { icon: MessageSquare, label: "Avis", value: reviews.length.toString() },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 pt-4 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Profil</h1>
      </div>

      {/* User Info */}
      <div className="bg-card rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">
              {profile.full_name?.[0] || profile.username?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">
              {profile.full_name || profile.username || "Utilisateur"}
            </h2>
            <p className="text-muted-foreground text-sm">
              @{profile.username || "utilisateur"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--ios-blue))]/10 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5 text-[hsl(var(--ios-blue))]" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="spots" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="spots">Spots</TabsTrigger>
          <TabsTrigger value="reviews">Avis</TabsTrigger>
          <TabsTrigger value="equipment">Matériel</TabsTrigger>
        </TabsList>

        <TabsContent value="spots" className="space-y-4 mt-4">
          {spots.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun spot publié
            </p>
          ) : (
            spots.map((spot) => (
              <Card
                key={spot.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/map?spot=${spot.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {spot.image && (
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{spot.name}</h3>
                        {spot.status === "pending" && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            En attente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {spot.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{spot.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {spot.fish.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 mt-4">
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun avis publié
            </p>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{review.spot.name}</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
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
                    {new Date(review.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          <FishingEquipment userId={userId} isOwnProfile={isOwnProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
