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
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
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

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCooldown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendCooldown, canResend]);

  const handleResendCode = async () => {
    if (!canResend || !email) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
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
        title: "Code envoyé !",
        description: "Vérifiez votre boîte de réception",
      });

      setCanResend(false);
      setResendCooldown(60);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      toast({
        title: "Code invalide",
        description: "Le code doit contenir 6 chiffres",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: verificationCode,
        type: 'email',
      });

      if (error) {
        toast({
          title: "Code incorrect",
          description: "Veuillez vérifier le code et réessayer",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Email vérifié !",
        description: "Vous pouvez maintenant vous connecter",
      });
      
      setShowCodeVerification(false);
      setVerificationCode("");
      setIsLogin(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate input
      const validationData: any = { email, password };
      if (!isLogin) {
        validationData.username = username;
        validationData.fullName = fullName;
      }
      authSchema.parse(validationData);
      
      setLoading(true);

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Erreur",
              description: "Email ou mot de passe incorrect",
              variant: "destructive",
            });
          } else if (error.message.includes("Email not confirmed")) {
            toast({
              title: "Email non vérifié",
              description: "Veuillez entrer le code reçu par email",
              variant: "destructive",
            });
            setShowCodeVerification(true);
          } else {
            toast({
              title: "Erreur",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Connexion réussie !",
          description: "Bienvenue sur Cormo Maps",
        });
        navigate("/");
      } else {
        // First, sign up the user
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              username: username,
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.includes("User already registered")) {
            toast({
              title: "Erreur",
              description: "Cet email est déjà utilisé",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erreur",
              description: signUpError.message,
              variant: "destructive",
            });
          }
          return;
        }

        // Then send OTP code
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: false,
          },
        });

        if (otpError) {
          toast({
            title: "Erreur",
            description: "Impossible d'envoyer le code de vérification",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Code envoyé !",
          description: "Entrez le code à 6 chiffres reçu par email",
        });
        setShowCodeVerification(true);
        setPassword("");
        setFullName("");
        setUsername("");
      }
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

          {showCodeVerification ? (
            <>
              <h1 className="text-3xl font-bold text-center mb-2">
                Vérification
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                Entrez le code à 6 chiffres reçu par email
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code de vérification</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    required
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[hsl(var(--ios-blue))] hover:bg-[hsl(var(--ios-blue))]/90"
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? "Vérification..." : "Vérifier"}
                </Button>
              </form>

              <div className="mt-4">
                <Button
                  onClick={handleResendCode}
                  variant="outline"
                  className="w-full"
                  disabled={loading || !canResend}
                >
                  {!canResend
                    ? `Renvoyer le code (${resendCooldown}s)`
                    : "Renvoyer le code"}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setShowCodeVerification(false);
                    setVerificationCode("");
                  }}
                  className="text-sm text-[hsl(var(--ios-blue))] hover:underline"
                >
                  Retour à la connexion
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-center mb-2">
                {isLogin ? "Connexion" : "Inscription"}
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                {isLogin
                  ? "Accédez à vos spots de pêche"
                  : "Créez votre compte Cormo Maps"}
              </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@votrenom"
                    required
                    pattern="[a-zA-Z0-9_-]{3,20}"
                    title="3-20 caractères: lettres, chiffres, tirets et underscores uniquement"
                  />
                  <p className="text-xs text-muted-foreground">
                    3-20 caractères: lettres, chiffres, tirets et underscores uniquement
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
              </>
            )}

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

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Au moins 6 caractères
                </p>
              )}
            </div>

              <Button
                type="submit"
                className="w-full bg-[hsl(var(--ios-blue))] hover:bg-[hsl(var(--ios-blue))]/90"
                disabled={loading}
              >
                {loading
                  ? "Chargement..."
                  : isLogin
                  ? "Se connecter"
                  : "Créer un compte"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setEmail("");
                  setPassword("");
                  setFullName("");
                  setUsername("");
                }}
                className="text-sm text-[hsl(var(--ios-blue))] hover:underline"
              >
                {isLogin
                  ? "Pas encore de compte ? S'inscrire"
                  : "Déjà un compte ? Se connecter"}
              </button>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
