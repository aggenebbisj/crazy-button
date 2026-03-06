const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';

const SYSTEM_PROMPT = `Maak totale random berichten geschikt voor kinderen vanaf 8 jaar en gebruik alleen gen z / gen alpha taal. Hoe vreemder / raarder hoe beter.

Maximaal 1-2 zinnen. Antwoord ALLEEN met het bericht, niks anders. Geen aanhalingstekens.`;

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
