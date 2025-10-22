import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MapPin, Fish, Calendar, Weight, Ruler, Heart, MessageSquare, MoreVertical, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Post {
  id: string;
  user_id: string;
  image: string;
  caption: string | null;
  fish_species: string | null;
  weight: string | null;
  length: string | null;
  location: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [uploadingPost, setUploadingPost] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newPost, setNewPost] = useState({
    image: null as File | null,
    caption: "",
    fish_species: "",
    weight: "",
    length: "",
    location: "",
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("fishing_posts")
      .select(`
        *,
        profiles!fishing_posts_user_id_fkey (
          full_name,
          username,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading posts:", error);
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Le fichier doit être une image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image doit faire moins de 5MB",
        variant: "destructive",
      });
      return;
    }

    setNewPost({ ...newPost, image: file });
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.image) return;

    setUploadingPost(true);

    try {
      // Upload image
      const fileExt = newPost.image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("fishing-posts")
        .upload(filePath, newPost.image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("fishing-posts")
        .getPublicUrl(filePath);

      // Create post
      const { error: insertError } = await supabase
        .from("fishing_posts")
        .insert({
          user_id: user.id,
          image: publicUrl,
          caption: newPost.caption || null,
          fish_species: newPost.fish_species || null,
          weight: newPost.weight || null,
          length: newPost.length || null,
          location: newPost.location || null,
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Publication créée",
      });

      setIsCreateOpen(false);
      setNewPost({
        image: null,
        caption: "",
        fish_species: "",
        weight: "",
        length: "",
        location: "",
      });
      setPreviewImage(null);
      loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la publication",
        variant: "destructive",
      });
    } finally {
      setUploadingPost(false);
    }
  };

  const handleDeletePost = async (postId: string, imageUrl: string) => {
    try {
      // Delete image from storage
      const imagePath = imageUrl.split("/").slice(-2).join("/");
      await supabase.storage.from("fishing-posts").remove([imagePath]);

      // Delete post from database
      const { error } = await supabase
        .from("fishing_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Publication supprimée",
      });
      loadPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la publication",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Mon fil</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-full"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Posts Grid - Instagram Style */}
      <div className="px-2 pt-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Chargement...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Fish className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">Aucune capture partagée</p>
            <p className="text-sm text-muted-foreground mb-6">
              Commencez à partager vos plus belles prises !
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Première publication
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-card rounded-2xl overflow-hidden shadow-sm">
                {/* Post Header */}
                <div className="flex items-center justify-between p-4">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/user/${post.user_id}`)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.profiles.avatar_url || undefined} />
                      <AvatarFallback>
                        {post.profiles.full_name?.[0] || post.profiles.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">
                        {post.profiles.full_name || post.profiles.username || "Utilisateur"}
                      </p>
                      {post.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {post.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {post.user_id === user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeletePost(post.id, post.image)}
                        >
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Post Image */}
                <img
                  src={post.image}
                  alt={post.caption || "Capture"}
                  className="w-full aspect-square object-cover"
                />

                {/* Post Details */}
                <div className="p-4">
                  {/* Fish Info */}
                  {(post.fish_species || post.weight || post.length) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.fish_species && (
                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                          <Fish className="w-3 h-3" />
                          {post.fish_species}
                        </div>
                      )}
                      {post.weight && (
                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                          <Weight className="w-3 h-3" />
                          {post.weight}
                        </div>
                      )}
                      {post.length && (
                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                          <Ruler className="w-3 h-3" />
                          {post.length}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Caption */}
                  {post.caption && (
                    <p className="text-sm mb-2">
                      <span className="font-semibold mr-2">
                        {post.profiles.username || "utilisateur"}
                      </span>
                      {post.caption}
                    </p>
                  )}

                  {/* Date */}
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle publication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <Label>Photo *</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                ) : (
                  <div>
                    <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour ajouter une photo
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Caption */}
            <div>
              <Label htmlFor="caption">Description</Label>
              <Textarea
                id="caption"
                placeholder="Partagez votre expérience..."
                value={newPost.caption}
                onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                rows={3}
              />
            </div>

            {/* Fish Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fish_species">Espèce</Label>
                <Input
                  id="fish_species"
                  placeholder="Carpe, brochet..."
                  value={newPost.fish_species}
                  onChange={(e) => setNewPost({ ...newPost, fish_species: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  placeholder="Lac d'Annecy..."
                  value={newPost.location}
                  onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Poids</Label>
                <Input
                  id="weight"
                  placeholder="2.5 kg"
                  value={newPost.weight}
                  onChange={(e) => setNewPost({ ...newPost, weight: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="length">Taille</Label>
                <Input
                  id="length"
                  placeholder="45 cm"
                  value={newPost.length}
                  onChange={(e) => setNewPost({ ...newPost, length: e.target.value })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewPost({
                    image: null,
                    caption: "",
                    fish_species: "",
                    weight: "",
                    length: "",
                    location: "",
                  });
                  setPreviewImage(null);
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={!newPost.image || uploadingPost}
              >
                {uploadingPost ? "Publication..." : "Publier"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feed;
