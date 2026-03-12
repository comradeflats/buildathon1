import { NextRequest, NextResponse } from 'next/server';
import { VertexAI, SchemaType } from '@google-cloud/vertexai';
import { requireOrgAdmin, handleAuthError } from '@/lib/auth-helpers';

export const runtime = 'nodejs';

function parsePrivateKey(key: string | undefined) {
  if (!key) return undefined;
  let parsedKey = key.replace(/\\n/g, '\n');
  parsedKey = parsedKey.trim();
  if (parsedKey.startsWith('"') && parsedKey.endsWith('"')) {
    parsedKey = parsedKey.substring(1, parsedKey.length - 1).trim();
  }
  return parsedKey;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await request.json();
    const { idea, organizationId } = body;

    // Verify user is org admin
    await requireOrgAdmin(request, organizationId);

    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Vertex AI credentials missing');
    }

    const vertexAI = new VertexAI({
      project: projectId,
      location: 'us-central1',
      googleAuthOptions: {
        credentials: { client_email: clientEmail, private_key: privateKey },
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
      }
    });

    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              emoji: { type: SchemaType.STRING },
              iconKey: { type: SchemaType.STRING },
              concept: { type: SchemaType.STRING },
              judgingCriteria: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
            },
            required: ['name', 'emoji', 'iconKey', 'concept', 'judgingCriteria'],
          },
        },
      },
    });

    const prompt = `Generate 3 unique and creative hackathon themes based on this rough idea: "${idea || 'Innovation and Creativity'}".

Each theme should follow these guidelines:
1. It should be broad enough for creative interpretation but specific enough to provide focus.
2. It should be suitable for a fast-paced buildathon.
3. The names should be memorable (2-4 words).
4. Provide a single relevant emoji.
5. Select ONE iconKey from: sparkles, zap, link, clock, palette, target, lightbulb, globe, gauge, code, wand, eye, rocket, brain, compass, layers.
6. The "Concept" should be exactly ONE concise sentence describing the friction point or "Superpower" the app provides.
7. Provide exactly 5 judging criteria that reward creative execution, design, and utility.

Return the response as a valid JSON array of 3 objects.`;

    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error('No response from AI model');

    const themes = JSON.parse(text);

    return NextResponse.json({ themes });
  } catch (error) {
    return handleAuthError(error);
  }
}
