import { useState, useEffect } from "react";
import { Purchases, PurchasesOffering, CustomerInfo } from "@revenuecat/purchases-capacitor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type SubscriptionStatus = "free" | "premium" | "pro";

export const useSubscription = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("free");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    initializePurchases();
  }, [user]);

  const initializePurchases = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Configure RevenueCat with your API keys
      // Note: Replace with your actual RevenueCat API keys from the dashboard
      const apiKey = import.meta.env.VITE_REVENUECAT_API_KEY;
      
      if (apiKey) {
        await Purchases.configure({
          apiKey,
          appUserID: user.id,
        });

        // Get current offerings
        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setOfferings(offerings.current);
        }

        // Get customer info
        await refreshSubscriptionStatus();
      }
    } catch (error) {
      console.error("Error initializing purchases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscriptionStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      setCustomerInfo(customerInfo.customerInfo);

      // Check active entitlements
      const entitlements = customerInfo.customerInfo.entitlements.active;
      
      let status: SubscriptionStatus = "free";
      if (entitlements["pro"]) {
        status = "pro";
      } else if (entitlements["premium"]) {
        status = "premium";
      }

      setSubscriptionStatus(status);

      // Update Supabase
      if (user) {
        await updateSubscriptionInDatabase(status, customerInfo.customerInfo);
      }
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    }
  };

  const updateSubscriptionInDatabase = async (
    status: SubscriptionStatus,
    info: CustomerInfo
  ) => {
    if (!user) return;

    const activeSubscription = Object.values(info.entitlements.active)[0];
    
    await supabase.from("subscriptions").upsert({
      user_id: user.id,
      status: activeSubscription ? "active" : "expired",
      plan_type: status,
      subscription_id: activeSubscription?.productIdentifier,
      expires_at: activeSubscription?.expirationDate,
      platform: info.originalAppUserId.includes("android") ? "android" : "ios",
    });
  };

  const purchasePackage = async (packageToPurchase: any) => {
    try {
      setIsLoading(true);
      const result = await Purchases.purchasePackage({
        aPackage: packageToPurchase,
      });

      if (result.customerInfo.entitlements.active) {
        await refreshSubscriptionStatus();
        toast.success("Abonnement activé avec succès !");
        return true;
      }
    } catch (error: any) {
      if (error.code !== "1" && error.code !== 1) { // User cancelled
        toast.error("Erreur lors de l'achat");
        console.error("Purchase error:", error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setIsLoading(true);
      const result = await Purchases.restorePurchases();
      await refreshSubscriptionStatus();
      
      if (Object.keys(result.customerInfo.entitlements.active).length > 0) {
        toast.success("Abonnements restaurés !");
      } else {
        toast.info("Aucun abonnement à restaurer");
      }
    } catch (error) {
      toast.error("Erreur lors de la restauration");
      console.error("Restore error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    offerings,
    subscriptionStatus,
    customerInfo,
    purchasePackage,
    restorePurchases,
    refreshSubscriptionStatus,
  };
};
