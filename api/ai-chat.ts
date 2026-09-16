import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Direct Shopify Storefront API catalog resolver
async function searchShopifyCatalog(query: string) {
  const gql = `
    query searchProducts($query: String!) {
      products(first: 3, query: $query) {
        edges {
          node {
            id
            title
            description
            variants(first: 1) {
              edges {
                node {
                  id
                  price { amount currencyCode }
                }
              }
            }
            images(first: 1) {
              edges { node { url } }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(`https://${process.env.SHOPIFY_DOMAIN}/api/2026-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN!,
      },
      body: JSON.stringify({ query: gql, variables: { query } }),
    });

    const { data } = await res.json();
    return (
      data?.products?.edges.map((e: any) => ({
        title: e.node.title,
        variantId: e.node.variants.edges[0]?.node?.id,
        price: `${e.node.variants.edges[0]?.node?.price.amount} ${e.node.variants.edges[0]?.node?.price.currencyCode}`,
        imageUrl: e.node.images.edges[0]?.node?.url,
      })) || []
    );
  } catch (err) {
    console.error('Shopify tool lookup error:', err);
    return [];
  }
}

export async function POST(req: Request) {
  const { prompt, history, userContext = {} } = await req.json();
  const safeUserContext = userContext || {};

  const searchTool = {
    name: 'searchShopifyCatalog',
    description: 'Lookup hardware inventory, specs, and live pricing from KeyNna store.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Search keywords e.g. "wireless headphones" or "fast charger"',
        },
      },
      required: ['query'],
    },
  };

  const systemInstruction = `
    You are 'Byte', the expert Techbytes AI Concierge based in Nairobi, Kenya. 
    You talk to tech-savvy buyers and sellers. Tone: Professional, sharp, and helpful.

    USER CONTEXT:
    - Customer Name: ${safeUserContext.userName || 'Guest Visitor'}
    - Customer Email: ${safeUserContext.userEmail || 'Not Provided'}
    - Is Authenticated: ${safeUserContext.isLoggedIn ? 'Yes (Google Verified)' : 'No'}
    - Active Cart Items: ${safeUserContext.cartCount ?? 0} item(s)

    STORE DOMAIN KNOWLEDGE:
    - Payments: Supports M-Pesa Express STK Push, Visa, Mastercard, and Cash on Delivery (COD).
    - Shipping: Express dispatch within 24 hours. Orders over $50 quality for free global delivery.
    - Tracking: Customers can track order dispatches at /track-order using their Order Number (#KA-XXXX) and email.

    BEHAVIORAL RULES:
    1. Respond naturally, warmth, and brevity (2 to 3 concise sentences max).
    2. Address the customer by their first name naturally if signed in.
    3. Store accepts M-Pesa Express. Deliveries within Nairobi are done via rider (Same Day). Outside Nairobi via G4S/Fargo Courier (24-48 hrs).
    4. If a user asks a complex technical question (e.g., "Will this dock support dual 4K monitors at 60Hz on an M2 Mac?"), answer accurately using the 'searchShopifyCatalog' tool.
    5. Never lie about stock. If we don't have it, suggest the closest alternative.
    6. If a user seems ready to buy but mentions price, offer the code "TECHBYTES10" for 10% off.
  `;

  try {
    // Format conversation history for Gemini multi-turn chat
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [...formattedHistory, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [searchTool] }],
        temperature: 0.7,
      },
    });

    const response = await chat;
    const functionCalls = response.functionCalls ?? [];

    if (functionCalls.length > 0) {
      const call = functionCalls[0] as { name?: string; args?: { query?: string } };
      if (call.name === 'searchShopifyCatalog') {
        const args = call.args || {};
        const products = await searchShopifyCatalog(args.query || '');

        return new Response(
          JSON.stringify({
            text:
              products.length > 0
                ? `I found these verified hardware items matching "${args.query}" for you:`
                : `I searched our inventory for "${args.query}", but couldn't find an exact match right now. Could I help you look for alternative tech accessories?`,
            products,
          }),
          { headers: { 'Content-Type': 'application/json' } },
        );
      }
    }

    return new Response(
      JSON.stringify({
        text: response.text || 'I can help with product questions, cart updates, or payment setup.',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err: any) {
    console.error('Gemini Execution Error:', err);
    return new Response(
      JSON.stringify({
        text: 'I am experiencing a quick connection update. How else can I assist with your cart or M-Pesa payment setup?',
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }
}
