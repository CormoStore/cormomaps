import { useState, useEffect } from "react";
import { FishingSpot } from "@/types";
import { fishingSpots as defaultSpots } from "@/data/spots";

const SPOTS_STORAGE_KEY = "fishspot-custom-spots";

export const useSpots = () => {
  const [spots, setSpots] = useState<FishingSpot[]>([]);

  useEffect(() => {
    // Load custom spots from localStorage
    const customSpotsJson = localStorage.getItem(SPOTS_STORAGE_KEY);
    const customSpots = customSpotsJson ? JSON.parse(customSpotsJson) : [];
    setSpots([...defaultSpots, ...customSpots]);
  }, []);

  const addSpot = (spot: FishingSpot) => {
    const customSpotsJson = localStorage.getItem(SPOTS_STORAGE_KEY);
    const customSpots = customSpotsJson ? JSON.parse(customSpotsJson) : [];
    const updatedCustomSpots = [...customSpots, { ...spot, isCustom: true }];
    localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(updatedCustomSpots));
    setSpots([...defaultSpots, ...updatedCustomSpots]);
  };

  const updateSpot = (updatedSpot: FishingSpot) => {
    const customSpotsJson = localStorage.getItem(SPOTS_STORAGE_KEY);
    const customSpots = customSpotsJson ? JSON.parse(customSpotsJson) : [];
    
    // Update in custom spots if it exists
    const spotIndex = customSpots.findIndex((s: FishingSpot) => s.id === updatedSpot.id);
    if (spotIndex !== -1) {
      customSpots[spotIndex] = { ...updatedSpot, isCustom: true };
      localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(customSpots));
      setSpots([...defaultSpots, ...customSpots]);
      return true;
    }
    return false;
  };

  return { spots, addSpot, updateSpot };
};
