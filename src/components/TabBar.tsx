import { MapPin, Heart, BookOpen, User, Shield, Users, ShoppingBag, MessageCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const TabBar = () => {
  const { isAdmin } = useAuth();
  
  const tabs = [
    { name: "Carte", path: "/", icon: MapPin },
    { name: "Favoris", path: "/favorites", icon: Heart },
    { name: "Communauté", path: "/community", icon: Users },
    { name: "Messages", path: "/messages", icon: MessageCircle },
    { name: "Règles", path: "/rules", icon: BookOpen },
    ...(isAdmin ? [
      { name: "Marketplace", path: "/marketplace", icon: ShoppingBag },
      { name: "Admin", path: "/admin", icon: Shield }
    ] : []),
    { name: "Profil", path: "/profile", icon: User },
  ];
  return (
    <div className="ios-tab-bar flex items-center px-1 xs:px-2 sm:px-3 md:px-4 z-50 overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-around w-full gap-0.5 xs:gap-1 sm:gap-2 md:gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 xs:gap-1 py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 md:px-4 lg:px-5 transition-all duration-200 flex-1 min-w-[50px] xs:min-w-[60px] sm:min-w-[70px] md:min-w-[80px] ${
                  isActive ? "text-[hsl(var(--ios-blue))]" : "text-[hsl(var(--ios-gray-5))]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${isActive ? "scale-110" : ""}`} />
                  <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-medium whitespace-nowrap">{tab.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;
