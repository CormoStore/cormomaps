import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, description, fish, images } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare content for moderation
    const textContent = `
Nom du spot: ${name}
Description: ${description}
Poissons: ${fish?.join(', ') || 'Non spécifié'}
    `.trim();

    // Build messages array with text and images
    const messageContent: any[] = [
      {
        type: "text",
        text: `Tu es un modérateur de contenu pour une application de spots de pêche. Analyse le contenu suivant et détermine s'il est approprié.

Contenu à analyser:
${textContent}

Critères de rejet:
- Langage offensant, vulgaire ou inapproprié
- Spam ou publicité
- Contenu haineux ou discriminatoire
- Informations manifestement fausses ou trompeuses
- Images inappropriées (violence, contenu adulte, hors-sujet)

Réponds UNIQUEMENT avec un JSON au format:
{
  "decision": "approve" | "reject" | "review",
  "reason": "explication courte",
  "confidence": 0.0-1.0
}

- "approve": contenu approprié et confiance élevée (>0.8)
- "reject": contenu inapproprié détecté
- "review": contenu suspect nécessitant une revue humaine`
      }
    ];

    // Add images if provided
    if (images && images.length > 0) {
      for (const imageUrl of images.slice(0, 3)) { // Limit to 3 images
        if (imageUrl && imageUrl.startsWith('http')) {
          messageContent.push({
            type: "image_url",
            image_url: { url: imageUrl }
          });
        }
      }
    }

    console.log('Calling Lovable AI for moderation...');
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: messageContent
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            decision: "review", 
            reason: "Service temporairement indisponible (limite de requêtes atteinte)",
            confidence: 0.0
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    console.log('AI moderation response:', aiResponse);

    // Parse AI response
    let moderationResult;
    try {
      // Extract JSON from response (AI might add markdown formatting)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        moderationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Default to review on parsing error
      moderationResult = {
        decision: "review",
        reason: "Erreur d'analyse de la réponse IA",
        confidence: 0.0
      };
    }

    // Validate and ensure proper decision
    if (!['approve', 'reject', 'review'].includes(moderationResult.decision)) {
      moderationResult.decision = 'review';
    }

    return new Response(
      JSON.stringify(moderationResult),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in moderate-spot function:", error);
    
    // On error, default to manual review
    return new Response(
      JSON.stringify({ 
        decision: "review", 
        reason: "Erreur lors de la modération automatique",
        confidence: 0.0,
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  }
});
