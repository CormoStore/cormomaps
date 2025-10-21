import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const categories = [
  { value: "carpe", label: "Carpe" },
  { value: "coup", label: "Coup" },
  { value: "feeder", label: "Feeder" },
  { value: "leurre", label: "Leurre" },
  { value: "mouche", label: "Mouche" },
  { value: "truite", label: "Truite" },
  { value: "carnassier", label: "Carnassier" },
];

const equipmentSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  brand: z.string().optional(),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
  description: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface Equipment {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description: string | null;
}

interface FishingEquipmentProps {
  userId?: string;
  isOwnProfile?: boolean;
}

export function FishingEquipment({ userId, isOwnProfile = true }: FishingEquipmentProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      brand: "",
      category: "",
      description: "",
    },
  });

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from("fishing_equipment")
        .select("*")
        .eq("user_id", targetUserId)
        .order("category", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error("Error loading equipment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le matériel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: EquipmentFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingId) {
        const { error } = await supabase
          .from("fishing_equipment")
          .update({
            name: values.name,
            brand: values.brand || null,
            category: values.category,
            description: values.description || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Matériel modifié avec succès" });
      } else {
        const { error } = await supabase
          .from("fishing_equipment")
          .insert({
            user_id: user.id,
            name: values.name,
            brand: values.brand || null,
            category: values.category,
            description: values.description || null,
          });

        if (error) throw error;
        toast({ title: "Matériel ajouté avec succès" });
      }

      setOpen(false);
      setEditingId(null);
      form.reset();
      loadEquipment();
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le matériel",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: Equipment) => {
    setEditingId(item.id);
    form.reset({
      name: item.name,
      brand: item.brand || "",
      category: item.category,
      description: item.description || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("fishing_equipment")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Matériel supprimé" });
      loadEquipment();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le matériel",
        variant: "destructive",
      });
    }
  };

  const groupedEquipment = categories.reduce((acc, cat) => {
    acc[cat.value] = equipment.filter((item) => item.category === cat.value);
    return acc;
  }, {} as Record<string, Equipment[]>);

  if (isLoading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{isOwnProfile ? "Mon Matériel" : "Matériel"}</h2>
        {isOwnProfile && (
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              setEditingId(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Modifier le matériel" : "Ajouter du matériel"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du matériel</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Canne 3.90m" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque (optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Shimano" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Détails supplémentaires..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {editingId ? "Modifier" : "Ajouter"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <Accordion type="single" collapsible className="w-full">
        {categories.map((cat) => {
          const items = groupedEquipment[cat.value] || [];
          if (items.length === 0) return null;

          return (
            <AccordionItem key={cat.value} value={cat.value}>
              <AccordionTrigger className="text-lg font-semibold">
                {cat.label} ({items.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {items.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{item.name}</CardTitle>
                            {item.brand && (
                              <CardDescription>{item.brand}</CardDescription>
                            )}
                          </div>
                          {isOwnProfile && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      {item.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {equipment.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {isOwnProfile 
              ? "Aucun matériel enregistré. Commencez par ajouter votre premier équipement !"
              : "Aucun matériel enregistré."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}