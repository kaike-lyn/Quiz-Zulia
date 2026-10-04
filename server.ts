import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers for reading/writing persistent json data
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/quiz-config
app.get('/api/quiz-config', (_req: Request, res: Response) => {
  const data = readJsonFile(QUESTIONS_FILE, null);
  res.json(data);
});

// PUT /api/quiz-config
app.put('/api/quiz-config', (req: Request, res: Response) => {
  const { questions, settings } = req.body;
  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: 'questions must be an array' });
  }
  const payload = { questions, settings: settings || {}, updatedAt: new Date().toISOString() };
  writeJsonFile(QUESTIONS_FILE, payload);
  res.json({ success: true, count: questions.length });
});

// GET /api/photo
app.get('/api/photo', (_req: Request, res: Response) => {
  const photoPath = path.join(DATA_DIR, 'nutricionista_foto.txt');
  if (fs.existsSync(photoPath)) {
    const dataUrl = fs.readFileSync(photoPath, 'utf-8');
    res.json({ photoUrl: dataUrl });
  } else {
    res.json({ photoUrl: null });
  }
});

// POST /api/upload-photo
app.post('/api/upload-photo', (req: Request, res: Response) => {
  const { photoData } = req.body;
  if (typeof photoData !== 'string') {
    return res.status(400).json({ error: 'photoData string is required' });
  }
  const photoPath = path.join(DATA_DIR, 'nutricionista_foto.txt');
  fs.writeFileSync(photoPath, photoData, 'utf-8');
  res.json({ success: true });
});

// GET /api/logo
app.get('/api/logo', (_req: Request, res: Response) => {
  const logoPath = path.join(DATA_DIR, 'nutricionista_logo.txt');
  if (fs.existsSync(logoPath)) {
    const dataUrl = fs.readFileSync(logoPath, 'utf-8');
    res.json({ logoUrl: dataUrl || null });
  } else {
    res.json({ logoUrl: null });
  }
});

// POST /api/upload-logo
app.post('/api/upload-logo', (req: Request, res: Response) => {
  const { logoData } = req.body;
  if (typeof logoData !== 'string') {
    return res.status(400).json({ error: 'logoData string is required' });
  }
  const logoPath = path.join(DATA_DIR, 'nutricionista_logo.txt');
  fs.writeFileSync(logoPath, logoData, 'utf-8');
  res.json({ success: true });
});

// GET /api/submissions
app.get('/api/submissions', (_req: Request, res: Response) => {
  const submissions = readJsonFile<any[]>(SUBMISSIONS_FILE, []);
  res.json(submissions);
});

// POST /api/submissions
app.post('/api/submissions', (req: Request, res: Response) => {
  const submission = req.body;
  if (!submission || !submission.participantEmail || typeof submission.score !== 'number') {
    return res.status(400).json({ error: 'Missing required submission fields' });
  }

  const cleanEmail = String(submission.participantEmail).trim().toLowerCase();
  const submissions = readJsonFile<any[]>(SUBMISSIONS_FILE, []);
  
  // Enforce 1 submission per email
  const existingIndex = submissions.findIndex(
    (s) => String(s.participantEmail).trim().toLowerCase() === cleanEmail
  );

  if (existingIndex !== -1) {
    return res.status(409).json({
      error: 'Este e-mail já realizou o quiz anteriormente.',
      existing: submissions[existingIndex]
    });
  }

  // Attach id and timestamp if not already provided
  const entry = {
    ...submission,
    participantEmail: cleanEmail,
    id: submission.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    submittedAt: submission.submittedAt || new Date().toISOString()
  };

  submissions.unshift(entry);
  writeJsonFile(SUBMISSIONS_FILE, submissions);

  res.status(201).json({ success: true, submission: entry });
});

// DELETE /api/submissions/:id
app.delete('/api/submissions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const submissions = readJsonFile<any[]>(SUBMISSIONS_FILE, []);
  const filtered = submissions.filter(s => s.id !== id);
  writeJsonFile(SUBMISSIONS_FILE, filtered);
  res.json({ success: true, remaining: filtered.length });
});

// POST /api/submissions/reset
app.post('/api/submissions/reset', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin !== 'julia2026') {
    return res.status(401).json({ error: 'PIN de segurança incorreto' });
  }
  writeJsonFile(SUBMISSIONS_FILE, []);
  res.json({ success: true, message: 'Ranking e resultados resetados com sucesso.' });
});

// GET /api/leaderboard
app.get('/api/leaderboard', (_req: Request, res: Response) => {
  const submissions = readJsonFile<any[]>(SUBMISSIONS_FILE, []);

  // Sort primarily by score DESC (highest score first)
  // Secondary / tie-breaker: totalDurationSeconds ASC (fastest completed first)
  const sorted = [...submissions].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (a.totalDurationSeconds || 999999) - (b.totalDurationSeconds || 999999);
  });

  const ranked = sorted.map((sub, index) => ({
    rank: index + 1,
    id: sub.id,
    participantName: sub.participantName,
    participantEmail: sub.participantEmail,
    score: sub.score,
    totalQuestions: sub.totalQuestions,
    percentage: sub.percentage,
    totalDurationSeconds: sub.totalDurationSeconds,
    formattedTime: sub.formattedTime,
    submittedAt: sub.submittedAt
  }));

  res.json(ranked);
});

// POST /api/admin/verify-pin
app.post('/api/admin/verify-pin', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin === 'julia2026' || pin === 'nutri2026') {
    return res.json({ valid: true });
  }
  return res.status(401).json({ valid: false, error: 'PIN inválido' });
});

// Vite or Static file serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quiz server running at http://localhost:${PORT} (${isProduction ? 'prod' : 'dev'})`);
  });
}

startServer();
