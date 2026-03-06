const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';

const SYSTEM_PROMPT = `Maak totale random berichten geschikt voor kinderen vanaf 8 jaar en gebruik alleen gen z / gen alpha taal. Hoe vreemder / raarder hoe beter.

Maximaal 1-2 zinnen. Antwoord ALLEEN met het bericht, niks anders. Geen aanhalingstekens. Wees NIET voorspelbaar. Gebruik NIET steeds dezelfde onderwerpen.`;

const RANDOM_VIBES = [
  'iets met eten dat levend is geworden',
  'een conspiracy theory over schoolspullen',
  'een raar compliment',
  'een nep-nieuwsbericht',
  'iets over een glitch in de matrix',
  'een review van iets dat niet bestaat',
  'een onzin-lifehack',
  'een bericht vanuit een parallel universum',
  'een drama tussen twee random objecten',
  'een existentiele crisis van een voorwerp',
  'een sportcommentaar over iets dat geen sport is',
  'een weersverwachting voor een plek die niet bestaat',
  'een product-reclame voor iets nutteloos',
  'een geheim dat niemand wilde weten',
  'een slechte grap die zo slecht is dat ie weer grappig is',
  'een bericht alsof je net wakker bent uit een gekke droom',
  'hot take die nergens op slaat',
  'een raar excuus waarom je te laat bent',
  'een update die niemand heeft gevraagd',
  'een bericht in de stijl van een videogame-melding',
  'een roast van een random emoji',
  'een motivational quote maar dan heel erg fout',
  'een bericht alsof je een alien bent die mensen probeert te begrijpen',
  'een klacht over iets dat niet echt een probleem is',
  'een onzin-weetje dat je net verzonnen hebt',
  'een bericht alsof het 3 uur s nachts is en je kunt niet slapen',
  'een drama-update alsof het een reality show is',
  'een random skill die je net hebt unlocked',
  'een bericht in de stijl van een foutmelding',
  'iets over een beef tussen twee dieren',
];

function getRandomVibe(): string {
  return RANDOM_VIBES[Math.floor(Math.random() * RANDOM_VIBES.length)];
}

export async function generateAIMessage(): Promise<string | null> {
  if (!GROQ_API_KEY) return null;

  try {
    const vibe = getRandomVibe();
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `vibe: ${vibe}` },
        ],
        max_tokens: 100,
        temperature: 1.3,
      }),
    });

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content?.trim();
    if (message && message.length > 0 && message.length < 200) {
      // Strip quotes if the model wraps them
      return message.replace(/^["']|["']$/g, '');
    }
  } catch {
    // Silently fall back to procedural generation
  }

  return null;
}
