import { NextRequest, NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin SDK
function getFirestoreAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

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

    if (!projectId) {
      return NextResponse.json(
        { error: 'Google Cloud project not configured' },
        { status: 500 }
      );
    }

    // Initialize Vertex AI
    const vertexAI = new VertexAI({
      project: projectId,
      location: 'us-central1',
    });

    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const prompt = `Generate 10 unique "Creative Prompts" for a 1-HOUR "speed build" coding challenge.

IMPORTANT: The goal is to provide themes that allow for HUMAN INTERPRETATION. Avoid rigid technical specs that can be solved by a single copy-paste into an AI agent. Each theme should feel like a "Creative Brief" rather than a Jira ticket.

For each theme, provide:
1. A memorable, slightly abstract name (2-4 words)
2. A single relevant emoji
3. A "Creative Brief" (2-3 sentences) that describes a problem space or a vibe, rather than a specific feature list.
4. A "Unique Twist" or "Constraint" that forces participants to think differently.
5. Exactly 5 judging criteria that reward interpretation, cleverness, and polish.

Example good "Interpretive" 1-hour themes:
- "The Distracted Writer" ✍️ - Brief: Build an interface for writing that actively fights against the user's focus or celebrates their distractions. Twist: The UI must change or react based on how fast or slow the user is typing.
- "Non-Linear Time" ⏳ - Brief: Create a way to visualize or track time that doesn't use standard numbers or progress bars. Twist: Must use a metaphor from nature (growth, decay, tides, etc.) to represent the passing of time.
- "The Opinionated Assistant" 🤖 - Brief: Build a tool that helps a user make a decision, but it must have a very specific "personality" or "bias" that influences its advice. Twist: No traditional "Yes/No" or "Pick one" UI elements allowed.
- "Data as Art" 🎭 - Brief: Take a mundane stream of data (like mouse movements, system clock, or random numbers) and transform it into a living digital "painting". Twist: The "art" must be interactive and change based on user proximity or hover.

Exactly 5 judging criteria (measurable but focused on interpretation):
- "Originality of interpretation: How unique was the approach to the brief?"
- "Clever execution of the Twist: Did they lean into the constraint or work around it?"
- "Aesthetic Cohesion: Does the UI/UX match the 'vibe' of the prompt?"
- "Technical Bravery: Did they try a smart architectural pattern or a new library to solve the problem?"
- "Completeness: Is the core 'hook' functional and polished within the 60 minutes?"

Return the response as a valid JSON array with this exact structure:
[
  {
    "name": "Theme Name",
    "emoji": "🔧",
    "concept": "Creative Brief and the Unique Twist",
    "judgingCriteria": [
      "Criterion 1",
      "Criterion 2",
      "Criterion 3",
      "Criterion 4",
      "Criterion 5"
    ]
  }
]

Only respond with the JSON array, no other text.`;

    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from AI model');
    }

    // Parse the JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI model');
    }

    const themes: GeneratedTheme[] = JSON.parse(jsonMatch[0]);

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
