const bufferModule = require('buffer');
if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = bufferModule.Buffer;
}

const express = require('express');
const cors = require('cors');

const rateLimit = require('express-rate-limit');
const { randomUUID } = require('crypto');

// ─── Security: Load and validate required environment variables ───────────────
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// ─── CORS: Env-aware allowlist (NO wildcard in production) ───────────────────
const rawAllowedOrigins = process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = rawAllowedOrigins.split(',').map((o) => o.trim()).filter(Boolean);

// ALLOW_ALL_ORIGINS must never be true in production
if (isProd && process.env.ALLOW_ALL_ORIGINS === 'true') {
  console.warn(
    '[SECURITY] ALLOW_ALL_ORIGINS=true is set in production. This is a security risk. ' +
    'It will be ignored — using CLIENT_URL allowlist instead.'
  );
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server requests (no origin header) and allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In development only, allow any localhost port
    if (!isProd && origin && origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin ${origin} is not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Version', 'X-Requested-With', 'Accept', 'X-Request-ID'],
  credentials: false,
};

const app = express();

// ─── Security middleware ──────────────────────────────────────────────────────
// Add helmet for security headers when available
try {
  const helmet = require('helmet');
  app.use(helmet({ contentSecurityPolicy: false }));
} catch (_) {
  // helmet not installed in this env; skip silently
}

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Request ID middleware (for tracing in n8n / external pipelines) ─────────
// SECURITY: Never trust the incoming X-Request-ID blindly — validate it as a
// UUID first. An attacker-controlled value reflected in error responses is an
// injection vector for log-injection or XSS in downstream monitoring UIs.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
app.use((req, res, next) => {
  const incoming = req.headers['x-request-id'];
  const requestId =
    typeof incoming === 'string' && UUID_REGEX.test(incoming)
      ? incoming
      : randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// ─── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 300,                  // 300 req/min per IP globally
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests. Please try again later.' } },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,                   // 20 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many authentication attempts. Please try again later.' } },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'AI generation rate limit reached. Please wait a moment.' } },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai', aiLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
let routes;
try {
  routes = require('./routes').default;
} catch (error) {
  console.error('[STARTUP] Failed to load TypeScript routes:', error.message);
  try {
    routes = require('./routes/index.js');
  } catch (jsError) {
    console.error('[STARTUP] Failed to load JavaScript routes:', jsError.message);
    routes = require('express').Router();
    routes.get('/health', (_req, res) =>
      res.status(200).json({ success: true, data: { status: 'limited' }, meta: { timestamp: new Date().toISOString() } })
    );
    routes.get('/templates', (_req, res) =>
      res.status(200).json({ success: true, data: [], meta: { timestamp: new Date().toISOString() } })
    );
  }
}

// Bare health check (no API prefix) — used by Vercel health probes
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok', environment: NODE_ENV },
    meta: { timestamp: new Date().toISOString() },
  });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { name: 'ReadyForms API', version: process.env.npm_package_version || '1.0.0', environment: NODE_ENV },
    meta: { timestamp: new Date().toISOString() },
  });
});

app.use('/api', routes);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[ERROR]', { requestId: req.requestId, message: err.message, stack: isProd ? undefined : err.stack });

  if (err.message && err.message.toLowerCase().includes('cors')) {
    return res.status(403).json({
      success: false,
      error: { code: 'CORS_ERROR', message: 'Origin not allowed' },
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    });
  }

  const isDbError =
    err.name === 'SequelizeConnectionError' ||
    err.name === 'SequelizeConnectionRefusedError' ||
    (err.original && err.original.code === 'ECONNREFUSED');

  if (isDbError) {
    return res.status(503).json({
      success: false,
      error: { code: 'DB_UNAVAILABLE', message: 'Service temporarily unavailable' },
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? 'An unexpected error occurred' : err.message,
    },
    meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
  });
});

module.exports = app;
module.exports.default = app;
