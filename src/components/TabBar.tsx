import { MapPin, Heart, BookOpen, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const tabs = [
  { name: "Carte", path: "/", icon: MapPin },
  { name: "Favoris", path: "/favorites", icon: Heart },
  { name: "Règles", path: "/rules", icon: BookOpen },
  { name: "Profil", path: "/profile", icon: User },
];

const TabBar = () => {
  return (
    <div className="ios-tab-bar flex items-center justify-around px-4 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 px-4 transition-all duration-200 ${
                isActive ? "text-[hsl(var(--ios-blue))]" : "text-[hsl(var(--ios-gray-5))]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""}`} />
                <span className="text-[10px] font-medium">{tab.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

export default TabBar;
