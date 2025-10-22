import { useState, useEffect, useRef } from "react";
import { CreditCard, Plus, Calendar, Building2, Trash2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface FishingLicense {
  id: string;
  license_number: string;
  license_type: string;
  issue_date: string;
  expiry_date: string;
  issuing_organization: string | null;
  image_url: string | null;
}

const LICENSE_TYPES = [
  { value: "daily", label: "Journalière" },
  { value: "annual", label: "Annuelle" },
  { value: "reciprocal", label: "Réciprocitaire" },
  { value: "minor", label: "Mineur" },
  { value: "woman", label: "Femme" },
];

const FishingLicense = () => {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<FishingLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedQRCode, setScannedQRCode] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    license_number: "",
    license_type: "",
    issue_date: "",
    expiry_date: "",
    issuing_organization: "",
  });

  useEffect(() => {
    if (user) {
      fetchLicenses();
    }
  }, [user]);

  const fetchLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from("fishing_licenses")
        .select("*")
        .eq("user_id", user?.id)
        .order("expiry_date", { ascending: false });

      if (error) throw error;
      setLicenses(data || []);
    } catch (error) {
      console.error("Error fetching licenses:", error);
      toast.error("Erreur lors du chargement des cartes de pêche");
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    setIsScanning(true);
    const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
    
    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) throw new Error("Aucune caméra disponible");
      const preferred = devices.find((d) => /back|rear|environment/i.test(d.label || ""));
      const cameraId = preferred?.id || devices[0].id;

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await html5QrCode.start(
        cameraId,
        config,
        async (decodedText) => {
          const QRCode = (await import("qrcode")).default;
          const qrCodeDataUrl = await QRCode.toDataURL(decodedText, {
            width: 256,
            margin: 2,
          });
          setScannedQRCode(qrCodeDataUrl);
          stopScanning();
          toast.success("QR Code scanné avec succès");
        },
        () => {}
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast.error("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    if (!formData.license_number || !formData.license_type || !formData.issue_date || !formData.expiry_date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const { error } = await supabase.from("fishing_licenses").insert({
        user_id: user.id,
        license_number: formData.license_number,
        license_type: formData.license_type,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date,
        issuing_organization: formData.issuing_organization || null,
        image_url: scannedQRCode,
      });

      if (error) throw error;

      toast.success("Carte de pêche ajoutée avec succès");
      setIsDialogOpen(false);
      setScannedQRCode(null);
      setFormData({
        license_number: "",
        license_type: "",
        issue_date: "",
        expiry_date: "",
        issuing_organization: "",
      });
      fetchLicenses();
    } catch (error: any) {
      console.error("Error adding license:", error);
      toast.error(error.message || "Erreur lors de l'ajout de la carte");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("fishing_licenses").delete().eq("id", id);

      if (error) throw error;

      toast.success("Carte de pêche supprimée");
      fetchLicenses();
    } catch (error) {
      console.error("Error deleting license:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pt-4 px-4">
      <div className="flex items-center justify-between mb-6 mt-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Mes cartes de pêche</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) stopScanning(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95%] max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter une carte de pêche</DialogTitle>
              <DialogDescription id="license-dialog-desc">
                Scannez le QR code de votre carte ou saisissez les informations manuellement.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isScanning ? (
                <>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      onClick={startScanning}
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <QrCode className="w-4 h-4" />
                      Scanner le QR code
                    </Button>
                    {scannedQRCode && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">QR Code scanné :</p>
                        <img src={scannedQRCode} alt="QR Code" className="w-32 h-32 mx-auto" />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="license_number">Numéro de carte *</Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="license_type">Type de carte *</Label>
                    <Select
                      value={formData.license_type}
                      onValueChange={(value) => setFormData({ ...formData, license_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LICENSE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="issue_date">Date d'émission *</Label>
                    <Input
                      id="issue_date"
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiry_date">Date d'expiration *</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="issuing_organization">Organisation émettrice</Label>
                    <Input
                      id="issuing_organization"
                      placeholder="Ex: AAPPMA locale"
                      value={formData.issuing_organization}
                      onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Ajouter la carte
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div id="qr-reader" className="w-full"></div>
                  <Button
                    type="button"
                    onClick={stopScanning}
                    variant="outline"
                    className="w-full"
                  >
                    Annuler le scan
                  </Button>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : licenses.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">Aucune carte de pêche enregistrée</p>
          <p className="text-sm text-muted-foreground mb-6">
            Ajoutez vos cartes de pêche pour les avoir toujours à portée de main
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {licenses.map((license) => {
            const expired = isExpired(license.expiry_date);
            const licenseTypeLabel = LICENSE_TYPES.find((t) => t.value === license.license_type)?.label || license.license_type;

            return (
              <Card key={license.id} className={`overflow-hidden ${expired ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        expired ? "bg-muted" : "bg-[hsl(var(--ios-blue))]/10"
                      }`}>
                        <CreditCard className={`w-6 h-6 ${expired ? "text-muted-foreground" : "text-[hsl(var(--ios-blue))]"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{licenseTypeLabel}</h3>
                        <p className="text-sm text-muted-foreground">N° {license.license_number}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(license.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {license.image_url && (
                    <div className="mb-3 p-3 bg-muted/50 rounded-lg flex justify-center">
                      <img src={license.image_url} alt="QR Code" className="w-32 h-32" />
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Du {format(new Date(license.issue_date), "dd MMMM yyyy", { locale: fr })} au{" "}
                        {format(new Date(license.expiry_date), "dd MMMM yyyy", { locale: fr })}
                      </span>
                    </div>

                    {license.issuing_organization && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span>{license.issuing_organization}</span>
                      </div>
                    )}

                    {expired && (
                      <div className="mt-3 px-3 py-2 bg-destructive/10 rounded-lg">
                        <p className="text-xs text-destructive font-medium">Carte expirée</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FishingLicense;
