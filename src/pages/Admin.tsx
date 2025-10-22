import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFishingSpots } from "@/hooks/use-fishing-spots";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, MapPin, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const { isAdmin, isLoading } = useAuth();
  const { spots, loading, approveSpot, rejectSpot, deleteSpot } = useFishingSpots();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingSpots = spots.filter(spot => spot.status === 'pending');
  const approvedSpots = spots.filter(spot => spot.status === 'approved');
  const rejectedSpots = spots.filter(spot => spot.status === 'rejected');

  const SpotCard = ({ spot, showActions = false }: { spot: any; showActions?: boolean }) => (
    <Card key={spot.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {spot.name}
              {spot.status === 'pending' && <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">En attente</Badge>}
              {spot.status === 'approved' && <Badge variant="outline" className="bg-green-500/10 text-green-500">Approuvé</Badge>}
              {spot.status === 'rejected' && <Badge variant="outline" className="bg-red-500/10 text-red-500">Rejeté</Badge>}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {spot.image && (
          <img 
            src={spot.image} 
            alt={spot.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        <p className="text-sm text-muted-foreground mb-3">{spot.description}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {spot.fish?.map((fish: string, index: number) => (
            <Badge key={index} variant="secondary">{fish}</Badge>
          ))}
        </div>
        {showActions && (
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={() => approveSpot(spot.id)}
              className="flex-1"
              variant="default"
            >
              <Check className="h-4 w-4 mr-2" />
              Approuver
            </Button>
            <Button 
              onClick={() => rejectSpot(spot.id)}
              className="flex-1"
              variant="destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button 
              onClick={() => deleteSpot(spot.id)}
              variant="outline"
            >
              Supprimer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 safe-bottom">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Modération des spots</h1>
          <p className="text-muted-foreground">Gérez les spots de pêche en attente de validation</p>
        </div>
        <Button onClick={() => navigate("/import-spots")} size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import AAPPMA</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending" className="relative">
            En attente
            {pendingSpots.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {pendingSpots.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvés ({approvedSpots.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetés ({rejectedSpots.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingSpots.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Aucun spot en attente de validation</p>
              </CardContent>
            </Card>
          ) : (
            pendingSpots.map(spot => <SpotCard key={spot.id} spot={spot} showActions={true} />)
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedSpots.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Aucun spot approuvé</p>
              </CardContent>
            </Card>
          ) : (
            approvedSpots.map(spot => <SpotCard key={spot.id} spot={spot} />)
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedSpots.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Aucun spot rejeté</p>
              </CardContent>
            </Card>
          ) : (
            rejectedSpots.map(spot => <SpotCard key={spot.id} spot={spot} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
