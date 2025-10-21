import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Map from "./pages/Map";
import Favorites from "./pages/Favorites";
import Rules from "./pages/Rules";
import Profile from "./pages/Profile";
import TabBar from "./components/TabBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="relative min-h-screen w-full">
          <Routes>
            <Route path="/" element={<Map />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <TabBar />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
