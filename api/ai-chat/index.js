export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );

  // Instantly resolve browser CORS preflight checks
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing in Vercel settings.');
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on Vercel.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const prompt = body.prompt;
    const history = body.history || [];

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemInstructionText = `
      You are 'Byte', a lead technical hardware guide and fellow tech enthusiast at DigiTex in Nairobi.
      Talk naturally like a human tech peer on Slack or WhatsApp: warm, direct, wittily knowledgeable, and conversational.
      NEVER say "As an AI language model", "How may I assist you today?", or write generic bullet lists.
      Keep responses concise (1 to 3 short sentences).
    `;

    const firstUserIdx = history.findIndex((msg) => msg.sender === 'user');
    const validHistory = firstUserIdx !== -1 ? history.slice(firstUserIdx) : [];

    const formattedContents = [
      ...validHistory.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    const payload = {
      systemInstruction: { parts: [{ text: systemInstructionText }] },
      contents: formattedContents,
      generationConfig: { temperature: 0.85 },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Gemini API Error:', data);
      return res.status(response.status).json({
        error: data?.error?.message || 'Gemini REST API Error',
        text: 'Connection dipped for a second. Mind firing that query over once more?',
      });
    }

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const responseText =
      parts
        .map((p) => p.text)
        .filter(Boolean)
        .join('\n') || 'Byte online!';

    return res.status(200).json({ text: responseText });
  } catch (err) {
    console.error('Vercel Handler Exception:', err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
