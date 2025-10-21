import { FileText, Ruler, Calendar, Fish, ChevronRight, Info, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { regions } from "@/data/regions";

const generalRules = [
  {
    icon: FileText,
    title: "Permis obligatoire",
    description: "Une carte de pêche est nécessaire pour pratiquer la pêche en eau douce en France.",
  },
  {
    icon: Ruler,
    title: "Tailles minimales",
    description: "Chaque espèce a une taille minimale de capture à respecter pour préserver les populations.",
  },
  {
    icon: Calendar,
    title: "Périodes d'ouverture",
    description: "La pêche est réglementée selon les saisons pour protéger la reproduction des poissons.",
  },
  {
    icon: Fish,
    title: "Quotas journaliers",
    description: "Un nombre maximum de captures par jour est fixé pour chaque catégorie de poisson.",
  },
];

const Rules = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24 pt-4 px-4">
      <h1 className="text-3xl font-bold mb-6 mt-2">Règles de pêche</h1>

      {/* My Fishing License */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/fishing-license")}
          className="w-full bg-gradient-to-r from-[hsl(var(--ios-blue))]/10 to-[hsl(var(--ios-blue))]/5 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-[hsl(var(--ios-blue))]/20 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-[hsl(var(--ios-blue))]" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold mb-1">Ma carte de pêche</h3>
            <p className="text-sm text-muted-foreground">Gérez vos cartes et permis de pêche</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* General Rules */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Règles générales</h2>
        <div className="space-y-3">
          {generalRules.map((rule, index) => {
            const Icon = rule.icon;
            return (
              <div
                key={index}
                className="bg-card rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--ios-blue))]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-[hsl(var(--ios-blue))]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{rule.title}</h3>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* By Region */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Par région</h2>
        <div className="space-y-2">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => navigate(`/rules/region/${region.id}`)}
              className="w-full bg-card rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="font-medium">{region.name}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-[hsl(var(--ios-blue))]/10 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-[hsl(var(--ios-blue))] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[hsl(var(--ios-blue))]">
          Pensez à vérifier les règles locales spécifiques à chaque plan d'eau avant de pêcher.
        </p>
      </div>
    </div>
  );
};

export default Rules;
