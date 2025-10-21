import { MapPin, Fish, MessageSquare, ChevronRight, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import avatarJean from "@/assets/avatar-jean.jpg";

const stats = [
  { icon: MapPin, label: "Spots visités", value: "12" },
  { icon: Fish, label: "Prises", value: "47" },
  { icon: MessageSquare, label: "Avis", value: "8" },
];

const menuItems = [
  { label: "Mes spots", icon: MapPin },
  { label: "Mes prises", icon: Fish },
  { label: "Paramètres", icon: ChevronRight },
];

const Profile = () => {
  const { user, signOut, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-24 pt-4 px-4">
      <h1 className="text-3xl font-bold mb-6 mt-2">Profil</h1>

      {/* User Header */}
      <div className="bg-card rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={avatarJean}
            alt="Profil"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.email?.split("@")[0]}</h2>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
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
