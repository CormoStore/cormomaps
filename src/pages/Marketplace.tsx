import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, User, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useMessaging } from "@/hooks/use-messaging";

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  location: string | null;
  status: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const categories = [
  "Cannes",
  "Moulinets",
  "Leurres",
  "Appâts",
  "Accessoires",
  "Matériel carpe",
  "Matériel feeder",
  "Électronique",
  "Vêtements",
  "Autre"
];

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startConversation } = useMessaging();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "",
    image: null as File | null,
  });

  useEffect(() => {
    loadListings();
  }, [selectedCategory]);

  const loadListings = async () => {
    try {
      let query = supabase
        .from("marketplace_listings")
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error loading listings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      let imageUrl = "";

      if (formData.image) {
        const fileExt = formData.image.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("marketplace-images")
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("marketplace-images")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("marketplace_listings").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        location: formData.location || null,
        images: imageUrl ? [imageUrl] : [],
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Annonce créée",
        description: "Votre annonce a été publiée avec succès",
      });

      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        location: "",
        image: null,
      });
      loadListings();
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'annonce",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Marketplace</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1 sm:gap-2 text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4">
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline">Créer une annonce</span>
                  <span className="xs:hidden">Créer</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Nouvelle annonce</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm">Titre</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Ex: Canne carpe 3.60m"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-sm">Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-sm sm:text-base">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-sm">Prix (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="Ex: 150.00"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm">Localisation</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: Paris, 75001"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                      placeholder="Décrivez votre matériel..."
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image" className="text-sm">Photo</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.files?.[0] || null })
                      }
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <Button type="submit" className="w-full text-sm sm:text-base">
                    Publier l'annonce
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              Toutes
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 sm:h-80 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-muted-foreground">Aucune annonce disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {listing.images.length > 0 && (
                  <div className="relative h-40 sm:h-48 bg-muted">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 text-xs">{listing.category}</Badge>
                  </div>
                )}
                <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg line-clamp-2">{listing.title}</CardTitle>
                  <p className="text-xl sm:text-2xl font-bold text-primary">{listing.price.toFixed(2)} €</p>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {listing.description}
                  </p>
                  {listing.location && (
                    <div className="flex items-center gap-1 mt-2 text-xs sm:text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t p-3 sm:p-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">
                      {listing.profiles.username}
                    </span>
                  </div>
                  {user && listing.user_id !== user.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startConversation(user.id, listing.user_id, listing.id)}
                      className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 whitespace-nowrap flex-shrink-0"
                    >
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden xs:inline">Contacter</span>
                      <span className="xs:hidden">Contact</span>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;