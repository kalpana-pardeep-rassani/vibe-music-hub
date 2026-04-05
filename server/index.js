import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// CORS — allow requests from the Netlify frontend and local dev
// ---------------------------------------------------------------------------
const allowedOrigins = [
  process.env.FRONTEND_URL,          // e.g. https://your-app.netlify.app
  'http://localhost:8080',
  'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** Health-check — used by Railway to verify the service is alive */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'vibe-music-hub-server',
    timestamp: new Date().toISOString(),
  });
});

/** Root */
app.get('/', (_req, res) => {
  res.json({
    message: 'Vibe Music Hub API is running',
    version: '1.0.0',
    endpoints: ['/health', '/api/status'],
  });
});

/** API status — returns runtime environment info (safe, no secrets) */
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    environment: process.env.NODE_ENV ?? 'production',
    supabaseConfigured: !!(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// 404 fallback
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
