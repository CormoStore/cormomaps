import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ExternalLink, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDepartmentsByRegion } from "@/data/fishingRegulations";
import { regions } from "@/data/regions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const RegionRules = () => {
  const { regionId } = useParams();
  const navigate = useNavigate();
  
  const region = regions.find(r => r.id === regionId);
  const departments = getDepartmentsByRegion(regionId || "");

  if (!region) {
    return (
      <div className="min-h-screen bg-background pb-24 pt-4 px-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Région non trouvée</p>
          <Button onClick={() => navigate("/rules")} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-4 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/rules")}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">{region.name}</h1>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-[hsl(var(--ios-blue))]/10 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-[hsl(var(--ios-blue))] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[hsl(var(--ios-blue))]">
          <p className="font-semibold mb-1">Informations générales</p>
          <p>Les règlements détaillés varient selon les départements. Consultez toujours les arrêtés préfectoraux locaux avant de pêcher.</p>
        </div>
      </div>

      {/* Departments List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Départements</h2>
        
        {departments.map((dept) => (
          <Accordion key={dept.id} type="single" collapsible className="w-full">
            <AccordionItem value={dept.id} className="bg-card rounded-2xl px-4 shadow-sm border-0">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--ios-blue))]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[hsl(var(--ios-blue))]">{dept.code}</span>
                  </div>
                  <span className="font-medium">{dept.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {/* Regulations Table */}
                <div className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold mb-3 text-sm">Périodes et tailles</h3>
                    <div className="space-y-2">
                      {dept.regulations.map((reg, idx) => (
                        <div key={idx} className="bg-background/50 rounded-xl p-3 text-sm">
                          <p className="font-semibold mb-1">{reg.species}</p>
                          {reg.category1OpenPeriod && (
                            <p className="text-muted-foreground text-xs mb-1">
                              📅 1ère cat: {reg.category1OpenPeriod}
                            </p>
                          )}
                          {reg.category2OpenPeriod && (
                            <p className="text-muted-foreground text-xs mb-1">
                              📅 2ème cat: {reg.category2OpenPeriod}
                            </p>
                          )}
                          <div className="flex gap-4 mt-2">
                            {reg.minSize && (
                              <span className="text-xs bg-background px-2 py-1 rounded">
                                📏 {reg.minSize}
                              </span>
                            )}
                            {reg.dailyQuota && (
                              <span className="text-xs bg-background px-2 py-1 rounded">
                                🎣 {reg.dailyQuota}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specific Rules */}
                  {dept.specificRules && dept.specificRules.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Règles spécifiques
                      </h3>
                      <ul className="space-y-2">
                        {dept.specificRules.map((rule, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-[hsl(var(--ios-blue))]">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Federation Link */}
                  {dept.federationUrl && (
                    <a
                      href={dept.federationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--ios-blue))] hover:underline mt-4 py-2 bg-[hsl(var(--ios-blue))]/10 rounded-xl"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Site de la fédération
                    </a>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>

      {/* Warning */}
      <div className="mt-6 bg-amber-500/10 rounded-2xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700 dark:text-amber-300">
          <p className="font-semibold mb-1">Attention</p>
          <p>Ces informations sont indicatives. Les arrêtés préfectoraux font foi. Consultez le site de votre fédération départementale pour les règlements exacts et à jour.</p>
        </div>
      </div>
    </div>
  );
};

export default RegionRules;
