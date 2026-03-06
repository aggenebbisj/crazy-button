const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';

const SYSTEM_PROMPT = `Je bent de berichtengenerator voor "Crazy Button", een app waar vrienden gekke berichten naar elkaar sturen.

Genereer EEN kort, grappig, absurd en onverwacht bericht in het Nederlands. Het bericht moet:
- Maximaal 1-2 zinnen zijn
- Absurd en verrassend zijn (niet gewoon grappig, maar BIZAR)
- Geschikt voor alle leeftijden (kinderen gebruiken dit ook)
- Geen uitleg of context bevatten, gewoon het bericht
- Soms emoji's bevatten maar niet altijd
- Creatief en onvoorspelbaar zijn

Voorbeelden van de stijl:
- "Mijn tandenborstel heeft zojuist ontslag genomen 🪥"
- "Er zwemt een pizza door de gang"
- "De wifi is verliefd op de magnetron"
- "Ik heb per ongeluk de zwaartekracht uitgezet"

Antwoord ALLEEN met het bericht, niks anders.`;

export async function generateAIMessage(): Promise<string | null> {
  if (!GROQ_API_KEY) return null;

  try {
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
          { role: 'user', content: 'Genereer een gek bericht!' },
        ],
        max_tokens: 100,
        temperature: 1.2,
      }),
    });

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content?.trim();
    if (message && message.length > 0 && message.length < 200) {
      return message;
    }
  } catch {
    // Silently fall back to procedural generation
  }

  return null;
}
