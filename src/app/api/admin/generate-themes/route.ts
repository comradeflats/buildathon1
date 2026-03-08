import { NextRequest, NextResponse } from 'next/server';
import { VertexAI, SchemaType } from '@google-cloud/vertexai';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

// Helper to parse private key
function parsePrivateKey(key: string | undefined) {
  if (!key) return undefined;
  let parsedKey = key.replace(/\\n/g, '\n');
  if (parsedKey.startsWith('"') && parsedKey.endsWith('"')) {
    parsedKey = parsedKey.substring(1, parsedKey.length - 1);
  }
  return parsedKey;
}

// Initialize Firebase Admin SDK
function getFirestoreAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials');
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return getFirestore();
}

interface GeneratedTheme {
  name: string;
  emoji: string;
  concept: string;
  judgingCriteria: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, adminSession } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Verify admin session
    if (adminSession !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    console.log('Vertex AI Debug Info:', {
      projectId,
      hasEmail: !!clientEmail,
      hasKey: !!privateKey,
      keyLength: privateKey?.length,
    });

    if (!projectId || !clientEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Vertex AI credentials missing (ProjectID, Email, or Key)' },
        { status: 500 }
      );
    }

    // Initialize Vertex AI with explicit credentials and scopes
    const vertexAI = new VertexAI({
      project: projectId,
      location: 'us-central1',
      googleAuthOptions: {
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
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
              concept: { type: SchemaType.STRING },
              judgingCriteria: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
            },
            required: ['name', 'emoji', 'concept', 'judgingCriteria'],
          },
        },
      },
    });

    const prompt = `Generate 10 "Efficiency Catalyst" web app themes for a 1-HOUR "speed build".

IMPORTANT: The goal is "The Micro-App." Each theme should be a broad problem space that a web application could solve. Keep descriptions extremely concise (1 sentence) and open to interpretation. Avoid technical specifics or step-by-step instructions.

For each theme, provide:
1. A memorable name (2-4 words)
2. A single relevant emoji
3. A "Micro-App Concept": Exactly ONE sentence. Describe a broad friction point or "Superpower" the web app provides.
4. Exactly 5 judging criteria that reward creative execution and utility.

Example good "Open-Ended" themes:
- "The Clarity Engine" ✨ - Concept: A web app that transforms complex, messy data into a single, beautiful visual summary.
- "Focus Horizon" 🌅 - Concept: A minimal workspace that eliminates digital noise and gamifies deep-work productivity.
- "The Connector" 🔗 - Concept: A creative interface for bridging two unrelated APIs or data streams into a single useful flow.
- "Style Alchemist" 🧪 - Concept: A playground for generating and previewing complex UI components or design systems in real-time.

Exactly 5 judging criteria:
- "Creative Interpretation: How unique was the approach to the theme?"
- "Technical Execution: How robust is the web app's implementation?"
- "UI/UX Polish: Is the interface clean, intuitive, and visually engaging?"
- "Utility Impact: Does the app solve the core problem effectively?"
- "The 'Ship' Factor: How complete and polished is the prototype for a 1-hour build?"

Return the response as a valid JSON array of objects.`;

    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from AI model');
    }

    const themes: GeneratedTheme[] = JSON.parse(text);

    if (!Array.isArray(themes) || themes.length !== 10) {
      throw new Error('Expected 10 themes from AI model');
    }

    // Store themes in Firestore
    const db = getFirestoreAdmin();
    
    // First, find and delete existing themes for this event to ensure we replace them
    const existingThemesSnapshot = await db.collection('themes')
      .where('eventId', '==', eventId)
      .get();
    
    const batch = db.batch();
    
    existingThemesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    const storedThemes = [];

    for (const theme of themes) {
      const themeId = uuidv4();
      const themeDoc = {
        id: themeId,
        name: theme.name,
        emoji: theme.emoji,
        concept: theme.concept,
        judgingCriteria: theme.judgingCriteria,
        eventId: eventId,
        createdAt: new Date().toISOString(),
      };

      const themeRef = db.collection('themes').doc(themeId);
      batch.set(themeRef, themeDoc);
      storedThemes.push(themeDoc);
    }

    // Update event to mark themes as generated
    const eventRef = db.collection('events').doc(eventId);
    batch.update(eventRef, { themesGenerated: true });

    await batch.commit();

    return NextResponse.json({
      success: true,
      themes: storedThemes,
    });
  } catch (error) {
    console.error('Generate themes error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate themes' },
      { status: 500 }
    );
  }
}
