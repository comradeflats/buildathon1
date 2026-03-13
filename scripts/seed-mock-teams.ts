/**
 * Seed script for mock buildathon submissions
 *
 * Creates a test event, themes, and 15 mock team submissions for testing
 * the voting functionality locally.
 *
 * Run with:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-mock-teams.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Helper to parse private key
function parsePrivateKey(key: string | undefined) {
  if (!key) return undefined;
  let parsedKey = key.replace(/\\n/g, '\n');
  parsedKey = parsedKey.trim();
  if (parsedKey.startsWith('"') && parsedKey.endsWith('"')) {
    parsedKey = parsedKey.substring(1, parsedKey.length - 1).trim();
  }
  return parsedKey;
}

// Initialize Firebase Admin
function initFirebaseAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing Firebase Admin credentials');
      console.error('Required env vars: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
      process.exit(1);
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return getFirestore();
}

// Test themes (subset from themes.json)
const TEST_THEMES = [
  {
    id: 'mock-micro-helper',
    name: 'The Micro-Helper',
    emoji: '🔧',
    concept: 'Build something small but mighty',
    judgingCriteria: [
      'Does it work without errors?',
      'Is the core feature complete and polished?',
      'Can you demo it in under 60 seconds?',
      'Is the UI intuitive without instructions?',
      'Would you actually use this tool?'
    ]
  },
  {
    id: 'mock-cli-champion',
    name: 'The CLI Champion',
    emoji: '💻',
    concept: 'Terminal-only interface',
    judgingCriteria: [
      'Does it run without a GUI?',
      'Is the terminal output clear and readable?',
      'Does it handle errors gracefully?',
      'Is the --help documentation useful?',
      'Would developers actually use this?'
    ]
  },
  {
    id: 'mock-mobile-first',
    name: 'The Mobile-First Mandate',
    emoji: '📱',
    concept: 'Phone-optimized from the start',
    judgingCriteria: [
      'Does it work perfectly on mobile first?',
      'Are all interactive elements touch-friendly?',
      'Can you use it with one hand?',
      'Is the content readable on small screens?',
      'Does it enhance gracefully for larger screens?'
    ]
  },
  {
    id: 'mock-developer-tool',
    name: 'The Developer Tool',
    emoji: '🛠️',
    concept: 'Make coding easier',
    judgingCriteria: [
      'Does it solve a real developer problem?',
      'Is the output accurate and useful?',
      'Does it handle errors well?',
      'Would you add it to your bookmarks?',
      'Is it better than existing alternatives?'
    ]
  },
  {
    id: 'mock-data-visualizer',
    name: 'The Data Visualizer',
    emoji: '📊',
    concept: 'Make data beautiful and clear',
    judgingCriteria: [
      'Does it accept and parse data correctly?',
      'Is the visualization clear and readable?',
      'Does interactivity add value?',
      'Would this help someone understand data?',
      'Is it visually appealing?'
    ]
  }
];

// 15 Mock team submissions
const MOCK_TEAMS = [
  {
    name: 'Team Quantum',
    projectName: 'CodeLens Pro',
    description: 'An AI-powered code review assistant that analyzes pull requests for security vulnerabilities, performance issues, and best practice violations. Integrates with GitHub and GitLab.',
    members: ['Alex Chen', 'Sam Rivera', 'Jordan Lee'],
    techStack: ['TypeScript', 'Next.js', 'OpenAI', 'PostgreSQL'],
    themeIndex: 0 // micro-helper
  },
  {
    name: 'Binary Builders',
    projectName: 'GitFlow CLI',
    description: 'A powerful command-line tool for managing complex Git workflows. Automates branch naming, commit message formatting, and PR creation with team conventions built-in.',
    members: ['Chris Park', 'Morgan Wu'],
    techStack: ['Rust', 'Git', 'Shell'],
    themeIndex: 1 // cli-champion
  },
  {
    name: 'Pixel Pioneers',
    projectName: 'SwipeTask',
    description: 'A mobile-first task manager with gesture-based interactions. Swipe right to complete, left to snooze, up to prioritize. Syncs across devices with offline support.',
    members: ['Taylor Kim', 'Casey Jones', 'Riley Smith', 'Drew Martinez'],
    techStack: ['React Native', 'Firebase', 'TypeScript'],
    themeIndex: 2 // mobile-first
  },
  {
    name: 'Solo Dev Sarah',
    projectName: 'RegexBuilder',
    description: 'Visual regex builder for developers who hate writing regex. Drag-and-drop interface generates regex patterns with real-time testing and explanation of each component.',
    members: ['Sarah Thompson'],
    techStack: ['Vue.js', 'TypeScript', 'WebAssembly'],
    themeIndex: 3 // developer-tool
  },
  {
    name: 'Data Dynamos',
    projectName: 'ChartCraft',
    description: 'Transform any CSV or JSON data into beautiful, interactive charts in seconds. Supports bar, line, scatter, pie, and custom visualizations with export to PNG/SVG.',
    members: ['Jamie Brown', 'Pat Garcia'],
    techStack: ['D3.js', 'Svelte', 'Python'],
    themeIndex: 4 // data-visualizer
  },
  {
    name: 'Hack Squad Alpha',
    projectName: 'EnvGuard',
    description: 'A micro-tool that validates your .env files against a schema, catches missing variables before deployment, and generates TypeScript types for environment variables.',
    members: ['Blake Wilson', 'Quinn Adams', 'Avery Davis'],
    techStack: ['Node.js', 'TypeScript', 'Zod'],
    themeIndex: 0 // micro-helper
  },
  {
    name: 'Terminal Titans',
    projectName: 'DockerEZ',
    description: 'Simplified Docker management from the command line. Interactive container selection, log streaming, and one-command deployments to multiple environments.',
    members: ['Jesse Miller'],
    techStack: ['Go', 'Docker', 'Terminal UI'],
    themeIndex: 1 // cli-champion
  },
  {
    name: 'Mobile Mavens',
    projectName: 'FocusFlow',
    description: 'A minimalist Pomodoro app designed for one-handed use. Large touch targets, haptic feedback, and Apple Watch integration. No account required.',
    members: ['Reese Johnson', 'Finley Williams'],
    techStack: ['Swift', 'SwiftUI', 'HealthKit'],
    themeIndex: 2 // mobile-first
  },
  {
    name: 'CodeCrafters',
    projectName: 'APIPlayground',
    description: 'Interactive API testing environment with automatic request/response logging, mock server generation, and shareable collections. Think Postman, but simpler.',
    members: ['Cameron Moore', 'Hayden Taylor', 'Skyler Anderson'],
    techStack: ['React', 'Express', 'MongoDB', 'WebSocket'],
    themeIndex: 3 // developer-tool
  },
  {
    name: 'Viz Wizards',
    projectName: 'TreeMapper',
    description: 'Visualize hierarchical data as interactive tree maps. Perfect for showing file sizes, budget breakdowns, or org charts. Zoom, filter, and drill down into data.',
    members: ['Peyton White'],
    techStack: ['TypeScript', 'Canvas API', 'Web Workers'],
    themeIndex: 4 // data-visualizer
  },
  {
    name: 'Rapid Devs',
    projectName: 'SnippetVault',
    description: 'Personal code snippet manager with syntax highlighting, tags, and fuzzy search. Browser extension lets you save code from any website with one click.',
    members: ['Charlie Green', 'Emery Hall'],
    techStack: ['Electron', 'SQLite', 'React'],
    themeIndex: 0 // micro-helper
  },
  {
    name: 'CLI Crusaders',
    projectName: 'LogLens',
    description: 'Real-time log viewer and analyzer for the terminal. Supports filtering, highlighting, JSON parsing, and tail-f multiple files simultaneously.',
    members: ['Dakota Lee', 'Kai Robinson', 'Sage Clark'],
    techStack: ['Python', 'Rich', 'asyncio'],
    themeIndex: 1 // cli-champion
  },
  {
    name: 'Touch Team',
    projectName: 'GestureNote',
    description: 'Quick note-taking app optimized for thumb navigation. Shape-based gestures create different note types. Voice-to-text and handwriting recognition included.',
    members: ['River Jackson'],
    techStack: ['Kotlin', 'Jetpack Compose', 'ML Kit'],
    themeIndex: 2 // mobile-first
  },
  {
    name: 'Dev Tools Inc',
    projectName: 'MockMaster',
    description: 'Generate realistic mock data for any JSON schema. Supports custom generators, locale-aware data, and deterministic seeding for reproducible tests.',
    members: ['Phoenix Martin', 'Rowan Lee', 'Aspen Kumar', 'Sage Thompson'],
    techStack: ['TypeScript', 'Faker.js', 'JSON Schema'],
    themeIndex: 3 // developer-tool
  },
  {
    name: 'Chart Champions',
    projectName: 'MetricBoard',
    description: 'Real-time dashboard builder for displaying live metrics. Connect to any data source via webhooks, WebSockets, or REST APIs. Beautiful themes included.',
    members: ['Haven Scott', 'Winter Chen'],
    techStack: ['Next.js', 'Chart.js', 'Redis', 'Socket.io'],
    themeIndex: 4 // data-visualizer
  }
];

async function cleanupMockData(db: FirebaseFirestore.Firestore) {
  console.log('🧹 Cleaning up existing mock data...');

  const collections = ['teams', 'events', 'themes'];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName)
      .where('isMockData', '==', true)
      .get();

    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`   Deleted ${snapshot.size} mock ${collectionName}`);
    } else {
      console.log(`   No mock ${collectionName} to delete`);
    }
  }
}

async function createTestEvent(db: FirebaseFirestore.Firestore): Promise<string> {
  console.log('📅 Creating test event...');

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 1); // Started yesterday
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7); // Ends in a week

  const eventId = 'mock-test-buildathon';
  const eventData = {
    id: eventId,
    name: 'Test Buildathon (Mock Data)',
    description: 'A test event with mock submissions for testing the voting interface.',
    isActive: true,
    status: 'active',
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    submissionDeadline: endDate.toISOString().split('T')[0],
    createdAt: now.toISOString(),
    themesGenerated: true,
    isLive: true,
    visibility: 'public',
    showVotes: true,
    slug: eventId,
    organizationId: 'org-mock',
    isMockData: true
  };

  await db.collection('events').doc(eventId).set(eventData);
  console.log(`   Created event: "${eventData.name}"`);

  return eventId;
}

async function createThemes(db: FirebaseFirestore.Firestore, eventId: string): Promise<string[]> {
  console.log('🎨 Creating themes...');

  const themeIds: string[] = [];
  const batch = db.batch();

  for (const theme of TEST_THEMES) {
    const themeData = {
      ...theme,
      eventId,
      isMockData: true
    };

    batch.set(db.collection('themes').doc(theme.id), themeData);
    themeIds.push(theme.id);
    console.log(`   Created theme: ${theme.emoji} ${theme.name}`);
  }

  await batch.commit();
  return themeIds;
}

async function createMockTeams(db: FirebaseFirestore.Firestore, eventId: string, themeIds: string[]) {
  console.log('👥 Creating mock team submissions...');

  const batch = db.batch();
  const now = new Date().toISOString();

  for (let i = 0; i < MOCK_TEAMS.length; i++) {
    const team = MOCK_TEAMS[i];
    const teamId = `mock-team-${i + 1}`;

    const teamData = {
      id: teamId,
      name: team.name,
      projectName: team.projectName,
      description: team.description,
      members: team.members,
      techStack: team.techStack,
      themeId: themeIds[team.themeIndex],
      eventId,
      githubUrl: `https://github.com/example/${team.projectName.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: now,
      updatedAt: now,
      isMockData: true
    };

    batch.set(db.collection('teams').doc(teamId), teamData);
    console.log(`   [${i + 1}/15] ${team.projectName} by ${team.name}`);
  }

  await batch.commit();
}

async function main() {
  console.log('');
  console.log('🚀 Buildathon Mock Data Seeder');
  console.log('==============================');
  console.log('');

  try {
    const db = initFirebaseAdmin();

    // Step 1: Cleanup existing mock data
    await cleanupMockData(db);
    console.log('');

    // Step 2: Create test event
    const eventId = await createTestEvent(db);
    console.log('');

    // Step 3: Create themes
    const themeIds = await createThemes(db, eventId);
    console.log('');

    // Step 4: Create mock teams
    await createMockTeams(db, eventId, themeIds);
    console.log('');

    console.log('✅ Seeding complete!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Navigate to: http://localhost:3000/vote');
    console.log('  3. Verify all 15 projects appear');
    console.log('  4. Test voting on submissions');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

main();
