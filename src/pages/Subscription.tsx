import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Loader2, Crown, Zap } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { Capacitor } from "@capacitor/core";

const Subscription = () => {
  const navigate = useNavigate();
  const { isLoading, offerings, subscriptionStatus, purchasePackage, restorePurchases } = useSubscription();

  const isNativePlatform = Capacitor.isNativePlatform();

  const features = {
    free: [
      "Accès aux spots de pêche publics",
      "Marquage des favoris",
      "Consultation des règles",
    ],
    premium: [
      "Tous les avantages Free",
      "Spots de pêche privés",
      "Carte de pêche numérique",
      "Notifications météo",
      "Sans publicité",
    ],
    pro: [
      "Tous les avantages Premium",
      "Accès anticipé aux nouveaux spots",
      "Statistiques avancées",
      "Support prioritaire",
      "Badges exclusifs",
    ],
  };

  const handlePurchase = async (pkg: any) => {
    await purchasePackage(pkg);
  };

  if (!isNativePlatform) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 safe-bottom">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Abonnements</h1>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Fonctionnalité mobile uniquement</CardTitle>
              <CardDescription>
                Les abonnements via App Store et Play Store sont disponibles uniquement dans l'application mobile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pour gérer vos abonnements, veuillez utiliser l'application mobile Cormo Maps disponible sur iOS et Android.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 safe-bottom">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Abonnements</h1>
          </div>
          <Button variant="outline" onClick={restorePurchases} disabled={isLoading}>
            Restaurer
          </Button>
        </div>

        {subscriptionStatus !== "free" && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Abonnement actif
              </CardTitle>
              <CardDescription>
                Vous êtes actuellement abonné au plan {subscriptionStatus.toUpperCase()}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {/* Free Plan */}
          <Card className={subscriptionStatus === "free" ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Free
                {subscriptionStatus === "free" && <Badge>Actuel</Badge>}
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">0€</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {features.free.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={subscriptionStatus === "premium" ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Premium
                </div>
                {subscriptionStatus === "premium" && <Badge>Actuel</Badge>}
              </CardTitle>
              <CardDescription>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : offerings?.availablePackages.find(p => p.identifier.includes("premium")) ? (
                  <>
                    <span className="text-3xl font-bold">
                      {offerings.availablePackages.find(p => p.identifier.includes("premium"))?.product.priceString}
                    </span>
                    <span className="text-sm">/mois</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">4.99€</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {features.premium.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {subscriptionStatus !== "premium" && subscriptionStatus !== "pro" && (
                <Button
                  className="w-full"
                  onClick={() => {
                    const pkg = offerings?.availablePackages.find(p => p.identifier.includes("premium"));
                    if (pkg) handlePurchase(pkg);
                  }}
                  disabled={isLoading || !offerings}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "S'abonner"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={subscriptionStatus === "pro" ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Pro
                </div>
                {subscriptionStatus === "pro" && <Badge>Actuel</Badge>}
              </CardTitle>
              <CardDescription>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : offerings?.availablePackages.find(p => p.identifier.includes("pro")) ? (
                  <>
                    <span className="text-3xl font-bold">
                      {offerings.availablePackages.find(p => p.identifier.includes("pro"))?.product.priceString}
                    </span>
                    <span className="text-sm">/mois</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">9.99€</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {features.pro.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {subscriptionStatus !== "pro" && (
                <Button
                  className="w-full"
                  onClick={() => {
                    const pkg = offerings?.availablePackages.find(p => p.identifier.includes("pro"));
                    if (pkg) handlePurchase(pkg);
                  }}
                  disabled={isLoading || !offerings}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "S'abonner"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Les abonnements sont gérés via l'App Store ou le Play Store</p>
            <p>• Vous pouvez annuler à tout moment depuis les paramètres de votre compte</p>
            <p>• Le renouvellement est automatique sauf annulation 24h avant la fin de période</p>
            <p>• Utilisez "Restaurer" si vous avez déjà un abonnement actif</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Subscription;
