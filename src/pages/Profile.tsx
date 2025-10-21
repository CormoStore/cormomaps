import { MapPin, Fish, MessageSquare, ChevronRight, LogOut, Shield, Edit2, Camera, Settings, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import avatarJean from "@/assets/avatar-jean.jpg";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";

const stats = [
  { icon: MapPin, label: "Spots visités", value: "12" },
  { icon: Fish, label: "Prises", value: "47" },
  { icon: MessageSquare, label: "Avis", value: "8" },
];

const menuItems = [
  { label: "Mes spots", icon: MapPin, action: "mySpots" as const },
  { label: "Mon matériel", icon: Package, action: "equipment" as const },
  { label: "Mes prises", icon: Fish, action: "myCatches" as const },
  { label: "Paramètres", icon: Settings, action: "settings" as const },
];

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
  username: z.string()
    .trim()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(20, "Le nom d'utilisateur doit contenir au maximum 20 caractères")
    .regex(/^[a-zA-Z0-9_-]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null; username: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      username: "",
    },
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, username")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
    } else if (data) {
      setProfile(data);
      form.reset({ 
        full_name: data.full_name || "",
        username: data.username || ""
      });
    }
    setIsLoading(false);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Le fichier doit être une image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image doit faire moins de 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      // Convert image to base64 for moderation
      const reader = new FileReader();
      const imageDataPromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const imageData = await imageDataPromise;

      // Moderate the image with AI
      toast({
        title: "Vérification",
        description: "Modération de l'image en cours...",
      });

      const { data: moderationData, error: moderationError } = await supabase.functions.invoke(
        "moderate-avatar",
        { body: { imageData } }
      );

      if (moderationError) {
        console.error("Moderation error:", moderationError);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier l'image",
          variant: "destructive",
        });
        return;
      }

      // Check moderation result
      if (!moderationData.approved) {
        toast({
          title: "Image refusée",
          description: moderationData.reason || "Cette image n'est pas appropriée comme photo de profil",
          variant: "destructive",
        });
        return;
      }

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("avatars")
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast({
        title: "Succès",
        description: "Photo de profil mise à jour",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la photo",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    // Check if username is already taken by another user
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username)
      .neq("id", user.id)
      .maybeSingle();

    if (checkError) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le nom d'utilisateur",
        variant: "destructive",
      });
      return;
    }

    if (existingUser) {
      toast({
        title: "Erreur",
        description: "Ce nom d'utilisateur est déjà utilisé",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ 
        full_name: data.full_name,
        username: data.username
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
      setProfile({ 
        ...profile, 
        full_name: data.full_name, 
        username: data.username,
        avatar_url: profile?.avatar_url || null 
      });
      setIsEditOpen(false);
    }
  };

  const handleMenuClick = (action: typeof menuItems[number]["action"]) => {
    if (!user) return;
    
    switch (action) {
      case "mySpots":
        navigate(`/user/${user.id}`);
        break;
      case "equipment":
        navigate("/equipment");
        break;
      case "myCatches":
        toast({
          title: "Bientôt disponible",
          description: "La fonctionnalité Mes prises sera bientôt disponible",
        });
        break;
      case "settings":
        navigate("/settings");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-4 px-4">
      <h1 className="text-3xl font-bold mb-6 mt-2">Profil</h1>

      {/* User Header */}
      <div className="bg-card rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <img
              src={profile?.avatar_url || avatarJean}
              alt="Profil"
              className="w-20 h-20 rounded-full object-cover"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[hsl(var(--ios-blue))] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[hsl(var(--ios-blue))]/90 transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {profile?.full_name || user?.email?.split("@")[0]}
              </h2>
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifier le profil</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre nom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom d'utilisateur</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                <Input placeholder="username" {...field} className="pl-8" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                          Annuler
                        </Button>
                        <Button type="submit">
                          Enregistrer
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-muted-foreground text-sm">
              @{profile?.username || "utilisateur"}
            </p>
            {isAdmin && (
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-500">Administrateur</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
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

      {/* Menu Items */}
      <div className="space-y-2 mb-6">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => handleMenuClick(item.action)}
              className="w-full bg-card rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <Button
        variant="destructive"
        className="w-full rounded-xl h-12"
        onClick={signOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Déconnexion
      </Button>
    </div>
  );
};

export default Profile;
