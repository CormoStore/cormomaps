import { useState, useEffect } from "react";
import { Search, MapPin, Fish, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  spot_count?: number;
  review_count?: number;
}

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url");

    if (profilesError) {
      console.error("Error loading profiles:", profilesError);
      setIsLoading(false);
      return;
    }

    // Get spot counts
    const { data: spotCounts } = await supabase
      .from("fishing_spots")
      .select("created_by")
      .eq("status", "approved");

    // Get review counts
    const { data: reviewCounts } = await supabase
      .from("reviews")
      .select("user_id");

    const spotCountMap = spotCounts?.reduce((acc, spot) => {
      acc[spot.created_by!] = (acc[spot.created_by!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const reviewCountMap = reviewCounts?.reduce((acc, review) => {
      acc[review.user_id] = (acc[review.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const enrichedProfiles = profilesData?.map(profile => ({
      ...profile,
      spot_count: spotCountMap[profile.id] || 0,
      review_count: reviewCountMap[profile.id] || 0,
    })) || [];

    setProfiles(enrichedProfiles);
    setIsLoading(false);
  };

  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchQuery.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(searchLower) ||
      profile.username?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background pb-24 pt-4 px-4">
      <h1 className="text-3xl font-bold mb-6 mt-2">Communauté</h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Rechercher un pêcheur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl"
        />
      </div>

      {/* Profiles List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement...
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun profil trouvé
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => navigate(`/user/${profile.id}`)}
              className="w-full bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg">
                    {profile.full_name || profile.username || "Utilisateur"}
                  </h3>
                  <p className="text-sm text-[hsl(var(--ios-blue))]">
                    @{profile.username || "utilisateur"}
                  </p>
                  
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.spot_count} spots</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Fish className="w-4 h-4" />
                      <span>{profile.review_count} avis</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;
