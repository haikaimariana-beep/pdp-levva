const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { getDb, initDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'pdp-levva-secret-2024';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://haikaimariana-beep.github.io',
  ],
  credentials: true,
}));
app.use(express.json());

initDb();

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const db = getDb();
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    if (!name) return res.status(400).json({ error: 'Name required for new users' });
    const result = db.prepare('INSERT INTO users (email, name) VALUES (?, ?)').run(email, name);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  }

  db.close();
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// Categories + Pillars
app.get('/api/pillars', auth, (req, res) => {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM categories ORDER BY order_index').all();
  const pillars = db.prepare('SELECT * FROM pillars ORDER BY category_id, order_index').all();
  db.close();

  const result = categories.map(cat => ({
    ...cat,
    pillars: pillars.filter(p => p.category_id === cat.id)
  }));
  res.json(result);
});

// Get user evaluations
app.get('/api/evaluations', auth, (req, res) => {
  const db = getDb();
  const evals = db.prepare(`
    SELECT e.*, p.code as pillar_code, p.name as pillar_name, c.name as category_name, c.code as category_code
    FROM evaluations e
    JOIN pillars p ON e.pillar_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE e.user_id = ?
  `).all(req.user.id);
  db.close();
  res.json(evals);
});

// Upsert evaluation
app.post('/api/evaluations', auth, (req, res) => {
  const { pillar_id, score, evidence, goal } = req.body;
  if (!pillar_id || !score) return res.status(400).json({ error: 'pillar_id and score required' });
  if (score < 1 || score > 5) return res.status(400).json({ error: 'Score must be 1-5' });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM evaluations WHERE user_id = ? AND pillar_id = ?').get(req.user.id, pillar_id);

  if (existing) {
    db.prepare(`
      UPDATE evaluations SET score = ?, evidence = ?, goal = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND pillar_id = ?
    `).run(score, evidence || null, goal || null, req.user.id, pillar_id);
  } else {
    db.prepare(`
      INSERT INTO evaluations (user_id, pillar_id, score, evidence, goal) VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, pillar_id, score, evidence || null, goal || null);
  }

  const eval_ = db.prepare('SELECT * FROM evaluations WHERE user_id = ? AND pillar_id = ?').get(req.user.id, pillar_id);
  db.close();
  res.json(eval_);
});

// Dashboard summary
app.get('/api/dashboard', auth, (req, res) => {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM categories ORDER BY order_index').all();
  const pillars = db.prepare('SELECT * FROM pillars ORDER BY category_id, order_index').all();
  const evals = db.prepare('SELECT * FROM evaluations WHERE user_id = ?').all(req.user.id);

  const evalMap = {};
  evals.forEach(e => { evalMap[e.pillar_id] = e; });

  const summary = categories.map(cat => {
    const catPillars = pillars.filter(p => p.category_id === cat.id);
    const scores = catPillars.map(p => evalMap[p.id]?.score || 0).filter(s => s > 0);
    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      ...cat,
      avg: Math.round(avg * 10) / 10,
      completed: scores.length,
      total: catPillars.length,
      pillars: catPillars.map(p => ({ ...p, evaluation: evalMap[p.id] || null }))
    };
  });

  const totalPillars = pillars.length;
  const completedPillars = evals.length;

  db.close();
  res.json({ categories: summary, totalPillars, completedPillars });
});

// ─── LEADER ROUTES ───────────────────────────────────────────────────────────

// All users with their completion stats
app.get('/api/leader/users', auth, (req, res) => {
  const db = getDb();
  const totalPillars = db.prepare('SELECT COUNT(*) as n FROM pillars').get().n;
  const users = db.prepare('SELECT * FROM users ORDER BY name').all();

  const result = users.map(u => {
    const evals = db.prepare('SELECT * FROM evaluations WHERE user_id = ?').all(u.id);
    const scores = evals.map(e => e.score);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return {
      ...u,
      completed: evals.length,
      total: totalPillars,
      avg: Math.round(avg * 10) / 10,
    };
  });

  db.close();
  res.json(result);
});

// Individual designer full dashboard
app.get('/api/leader/user/:userId', auth, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const categories = db.prepare('SELECT * FROM categories ORDER BY order_index').all();
  const pillars = db.prepare('SELECT * FROM pillars ORDER BY category_id, order_index').all();
  const evals = db.prepare('SELECT * FROM evaluations WHERE user_id = ?').all(user.id);

  const evalMap = {};
  evals.forEach(e => { evalMap[e.pillar_id] = e; });

  const summary = categories.map(cat => {
    const catPillars = pillars.filter(p => p.category_id === cat.id);
    const scores = catPillars.map(p => evalMap[p.id]?.score || 0).filter(s => s > 0);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return {
      ...cat,
      avg: Math.round(avg * 10) / 10,
      completed: scores.length,
      total: catPillars.length,
      pillars: catPillars.map(p => ({ ...p, evaluation: evalMap[p.id] || null })),
    };
  });

  db.close();
  res.json({ user, categories: summary, totalPillars: pillars.length, completedPillars: evals.length });
});

// Team aggregate: per-category and per-pillar averages + per-designer breakdown
app.get('/api/leader/team', auth, (req, res) => {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM categories ORDER BY order_index').all();
  const pillars = db.prepare('SELECT * FROM pillars ORDER BY category_id, order_index').all();
  const users = db.prepare('SELECT * FROM users ORDER BY name').all();
  const allEvals = db.prepare('SELECT * FROM evaluations').all();

  // Per-pillar team stats
  const pillarStats = pillars.map(p => {
    const pillarEvals = allEvals.filter(e => e.pillar_id === p.id);
    const scores = pillarEvals.map(e => e.score);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const dist = [1, 2, 3, 4, 5].map(n => scores.filter(s => s === n).length);
    return { ...p, avg: Math.round(avg * 10) / 10, dist, respondents: scores.length };
  });

  // Per-category team stats
  const categoryStats = categories.map(cat => {
    const catPillars = pillarStats.filter(p => p.category_id === cat.id);
    const allScores = allEvals.filter(e => catPillars.some(p => p.id === e.pillar_id)).map(e => e.score);
    const avg = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
    return { ...cat, avg: Math.round(avg * 10) / 10, pillars: catPillars };
  });

  // Per-user category averages (for comparison table)
  const totalPillars = pillars.length;
  const designers = users.map(u => {
    const uEvals = allEvals.filter(e => e.user_id === u.id);
    const evalMap = {};
    uEvals.forEach(e => { evalMap[e.pillar_id] = e; });
    const catAvgs = categories.map(cat => {
      const catPillars = pillars.filter(p => p.category_id === cat.id);
      const scores = catPillars.map(p => evalMap[p.id]?.score || 0).filter(s => s > 0);
      return scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;
    });
    const allScores = uEvals.map(e => e.score);
    const globalAvg = allScores.length ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10 : 0;
    return { id: u.id, name: u.name, email: u.email, catAvgs, globalAvg, completed: uEvals.length, total: totalPillars };
  }).filter(d => d.completed > 0);

  db.close();
  res.json({ categories: categoryStats, designers, totalPillars });
});

app.listen(PORT, '0.0.0.0', () => console.log(`PDP API running on port ${PORT}`));
