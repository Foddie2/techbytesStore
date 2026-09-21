export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // FIX (TS4111): Use bracket notation for process.env
    const apiKey = (globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }).process?.env?.['GEMINI_API_KEY'];
    if (!apiKey) {
      console.error('GEMINI_API_KEY missing in Vercel environment.');
      return res
        .status(500)
        .json({ error: 'GEMINI_API_KEY is not configured in Vercel settings.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { prompt, history } = body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemInstructionText = `
      You are 'Byte', a lead technical hardware guide and fellow tech enthusiast at DigiTex in Nairobi.
      Talk naturally like a human tech peer on Slack or WhatsApp: warm, direct, wittily knowledgeable, and conversational.
      NEVER say "As an AI language model", "How may I assist you today?", or write generic bullet lists.
      Keep responses concise (1 to 3 short sentences).
    `;

    const rawHistory = history || [];
    const firstUserIdx = rawHistory.findIndex((msg: any) => msg.sender === 'user');
    const validHistory = firstUserIdx !== -1 ? rawHistory.slice(firstUserIdx) : [];

    const formattedContents = [
      ...validHistory.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }],
      },
      contents: formattedContents,
      tools: [
        {
          functionDeclarations: [
            {
              name: 'searchShopifyCatalog',
              description:
                'Search DigiTex store for fast chargers, Type-C hubs, mechanical keyboards, and tech accessories.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  query: { type: 'STRING' },
                },
                required: ['query'],
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.85,
      },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Gemini API REST Error:', data);
      return res.status(response.status).json({
        error: data?.error?.message || 'Gemini REST API Error',
        text: 'Connection dipped for a second. Mind firing that query over once more?',
      });
    }

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    const functionCallPart = parts.find((p: any) => p.functionCall);
    if (functionCallPart) {
      const args = functionCallPart.functionCall.args || {};
      return res.status(200).json({
        text: `I checked our catalog—here are our top picks for ${args.query || prompt}:`,
        products: [],
      });
    }

    const responseText =
      parts
        .map((p: any) => p.text)
        .filter(Boolean)
        .join('\n') || 'I am right here! How can I help?';

    return res.status(200).json({ text: responseText });
  } catch (err: any) {
    console.error('Vercel Handler Exception:', err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
