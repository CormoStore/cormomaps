import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ImportSpots = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [manualForm, setManualForm] = useState({
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    fish: "",
    aappma: "",
  });

  const handleCSVImport = async () => {
    if (!csvData.trim()) {
      toast.error("Veuillez coller des données CSV");
      return;
    }

    setIsLoading(true);
    try {
      // Parse CSV (format: nom,description,latitude,longitude,poissons,aappma)
      const lines = csvData.trim().split("\n");
      const spots = [];

      for (let i = 1; i < lines.length; i++) {
        const [name, description, latitude, longitude, fish, aappma] = lines[i].split(",");
        if (name && latitude && longitude) {
          spots.push({
            name: name.trim(),
            description: description?.trim() || `Parcours AAPPMA ${aappma || ""}`,
            latitude: parseFloat(latitude.trim()),
            longitude: parseFloat(longitude.trim()),
            fish: fish ? fish.trim().split(";").filter(Boolean) : ["Tous poissons"],
            created_by: user?.id,
            status: "approved",
            permit_required: true,
            issuing_organization: aappma?.trim() || null,
          });
        }
      }

      if (spots.length === 0) {
        toast.error("Aucun spot valide trouvé dans le CSV");
        return;
      }

      const { error } = await supabase.from("fishing_spots").insert(spots);

      if (error) throw error;

      toast.success(`${spots.length} spots importés avec succès`);
      setCsvData("");
    } catch (error: any) {
      console.error("Error importing CSV:", error);
      toast.error(error.message || "Erreur lors de l'import");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.from("fishing_spots").insert({
        name: manualForm.name,
        description: manualForm.description,
        latitude: parseFloat(manualForm.latitude),
        longitude: parseFloat(manualForm.longitude),
        fish: manualForm.fish.split(",").map((f) => f.trim()).filter(Boolean),
        created_by: user?.id,
        status: "approved",
        permit_required: true,
        issuing_organization: manualForm.aappma || null,
      });

      if (error) throw error;

      toast.success("Spot ajouté avec succès");
      setManualForm({
        name: "",
        description: "",
        latitude: "",
        longitude: "",
        fish: "",
        aappma: "",
      });
    } catch (error: any) {
      console.error("Error adding spot:", error);
      toast.error(error.message || "Erreur lors de l'ajout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background safe-bottom safe-top-content px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Import de spots AAPPMA</h1>
          <p className="text-muted-foreground">
            Ajoutez des parcours de pêche AAPPMA manuellement ou via import CSV
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Ajout manuel
            </CardTitle>
            <CardDescription>Ajoutez un spot AAPPMA individuellement</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du parcours *</Label>
                <Input
                  id="name"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  placeholder="Ex: Parcours de la Rivière"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={manualForm.description}
                  onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                  placeholder="Description du parcours"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={manualForm.latitude}
                    onChange={(e) => setManualForm({ ...manualForm, latitude: e.target.value })}
                    placeholder="46.603354"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={manualForm.longitude}
                    onChange={(e) => setManualForm({ ...manualForm, longitude: e.target.value })}
                    placeholder="1.888334"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fish">Poissons (séparés par des virgules)</Label>
                <Input
                  id="fish"
                  value={manualForm.fish}
                  onChange={(e) => setManualForm({ ...manualForm, fish: e.target.value })}
                  placeholder="Truite, Brochet, Carpe"
                />
              </div>

              <div>
                <Label htmlFor="aappma">AAPPMA</Label>
                <Input
                  id="aappma"
                  value={manualForm.aappma}
                  onChange={(e) => setManualForm({ ...manualForm, aappma: e.target.value })}
                  placeholder="Ex: AAPPMA de Lyon"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                Ajouter le spot
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import CSV
            </CardTitle>
            <CardDescription>
              Format: nom,description,latitude,longitude,poissons(séparés par ;),aappma
              <br />
              La première ligne doit contenir les en-têtes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv">Données CSV</Label>
              <Textarea
                id="csv"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="nom,description,latitude,longitude,poissons,aappma
Lac de Vassivière,Beau lac de montagne,45.8567,1.8834,Truite;Brochet,AAPPMA Limoges"
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <Button onClick={handleCSVImport} disabled={isLoading} className="w-full">
              Importer les spots
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Sources de données AAPPMA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>GEOPECHE:</strong>{" "}
              <a
                href="https://map.geopeche.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                map.geopeche.com
              </a>
            </p>
            <p>
              <strong>Fédération Nationale:</strong>{" "}
              <a
                href="https://www.federationpeche.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                federationpeche.fr
              </a>
            </p>
            <p className="text-muted-foreground mt-4">
              Note: Les données AAPPMA ne sont pas centralisées. Consultez les sites des fédérations
              départementales pour obtenir les coordonnées GPS des parcours.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportSpots;
