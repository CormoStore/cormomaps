import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import logo from "@/assets/logo.png";

const authSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  username: z.string()
    .trim()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(20, "Le nom d'utilisateur ne peut pas dépasser 20 caractères")
    .regex(/^[a-zA-Z0-9_-]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores")
    .optional(),
  fullName: z.string().trim().max(100).optional(),
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);


  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const emailSchema = z.string().trim().email("Email invalide").max(255);
      emailSchema.parse(email);
      
      setLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          shouldCreateUser: true,
        },
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Email envoyé !",
        description: "Cliquez sur le lien dans votre email pour vous connecter",
      });
      setMagicLinkSent(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Cormo Maps" className="w-24 h-24 object-contain border-0" />
          </div>

          {magicLinkSent ? (
            <>
              <h1 className="text-3xl font-bold text-center mb-2">
                Email envoyé !
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                Cliquez sur le lien dans votre email pour vous connecter
              </p>
              <div className="text-center">
                <button
                  onClick={() => {
                    setMagicLinkSent(false);
                    setEmail("");
                  }}
                  className="text-sm text-[hsl(var(--ios-blue))] hover:underline"
                >
                  Modifier l'email
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-center mb-2">
                Connexion
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                Recevez un lien magique par email
              </p>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean@example.com"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[hsl(var(--ios-blue))] hover:bg-[hsl(var(--ios-blue))]/90"
                  disabled={loading}
                >
                  {loading ? "Envoi..." : "Envoyer le lien magique"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
