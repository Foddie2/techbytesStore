import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Shopify GraphQL helper for tool execution
async function searchShopifyProducts(query: string) {
  const gql = `
    query {
      products(first: 3, query: "${query}") {
        edges {
          node {
            title
            variants(first: 1) { edges { node { id price { amount currencyCode } } } }
            images(first: 1) { edges { node { url } } }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${process.env.SHOPIFY_DOMAIN}/api/2026-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query: gql }),
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
}

export async function POST(req: Request) {
  const { prompt, userContext } = await req.json();

  // Define tools for Gemini
  const searchTool = {
    name: 'searchProducts',
    description: 'Search hardware catalog in Shopify store',
    parameters: {
      type: Type.OBJECT,
      properties: { query: { type: Type.STRING } },
      required: ['query'],
    },
  };

  const systemInstruction = `
  You are KeyNna's friendly, expert shopping concierge. 
  
  User Persona Context:
  - First Name: ${userContext.firstName || 'there'}
  - Logged In: ${userContext.isLoggedIn ? 'Yes (Google Authenticated)' : 'No (Guest)'}
  - Active Cart Count: ${userContext.cartCount} items

  Personality Rules:
  1. Talk like a knowledgeable, helpful peer in a tech store—warm, concise, and direct.
  2. If the user's first name is known, address them naturally (e.g., "Hey John!"), but don't overuse it.
  3. Keep prose replies under 2-3 short sentences. Avoid rigid robotic lists unless comparing multiple products.
  4. Use subtle, conversational transitions (e.g., "Got it," "No worries at all," "Let me check that for you").
  5. When users ask about M-Pesa or delivery, reassure them empathetically about speed and security.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [searchTool] }],
    },
  });

  // Handle tool calls
  const functionCalls = response.functionCalls ?? [];
  if (functionCalls.length > 0) {
    const call = functionCalls[0];
    if (call.name === 'searchProducts') {
      const args = call.args as { query: string };
      const products = await searchShopifyProducts(args.query);

      return new Response(
        JSON.stringify({
          text: `Here are the top matches for "${args.query}" from our inventory:`,
          products,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  return new Response(JSON.stringify({ text: response.text }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
