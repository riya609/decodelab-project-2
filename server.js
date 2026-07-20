// =====================================================
// PROJECT 2 — Backend API Development
// DecodeLabs Full Stack Internship | Batch 2026
// Tech: Node.js + Express
// Topic: Student Notes API
// =====================================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────
app.use(cors());                        // Allow frontend to talk to API
app.use(express.json());                // Parse JSON request bodies
app.use(express.static(__dirname));     // Serve index.html + CSS

// ── In-Memory "Database" (no DB required for this project) ──
let notes = [
  { id: 1, title: 'CSS Grid Basics',      subject: 'Frontend',  content: 'Grid uses rows and columns. Use grid-template-columns to define layout.',   createdAt: new Date().toISOString() },
  { id: 2, title: 'HTTP Methods',         subject: 'Backend',   content: 'GET = read, POST = create, PUT = update, DELETE = remove.',                  createdAt: new Date().toISOString() },
  { id: 3, title: 'Semantic HTML',        subject: 'Frontend',  content: 'Use header, nav, main, article, footer instead of divs everywhere.',         createdAt: new Date().toISOString() },
];
let nextId = 4; // Auto-increment ID counter

// ── HELPER: validation ────────────────────────────────
function validateNote(body) {
  const errors = [];
  if (!body.title   || body.title.trim().length   < 3)  errors.push('Title must be at least 3 characters.');
  if (!body.subject || body.subject.trim().length  < 2)  errors.push('Subject is required.');
  if (!body.content || body.content.trim().length  < 5)  errors.push('Content must be at least 5 characters.');
  return errors;
}

// =====================================================
//  ROUTES
// =====================================================

// ── GET /  → serve frontend ───────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── GET /api/notes  → fetch all notes ─────────────────
// Query param: ?subject=Frontend  (optional filter)
app.get('/api/notes', (req, res) => {
  const { subject } = req.query;

  let result = notes;
  if (subject) {
    result = notes.filter(n =>
      n.subject.toLowerCase() === subject.toLowerCase()
    );
  }

  res.status(200).json({
    success : true,
    count   : result.length,
    data    : result,
  });
});

// ── GET /api/notes/:id  → fetch single note ───────────
app.get('/api/notes/:id', (req, res) => {
  const id   = parseInt(req.params.id);
  const note = notes.find(n => n.id === id);

  if (!note) {
    // 404 — resource not found
    return res.status(404).json({
      success : false,
      message : `Note with id ${id} not found.`,
    });
  }

  res.status(200).json({ success: true, data: note });
});

// ── POST /api/notes  → create a new note ──────────────
app.post('/api/notes', (req, res) => {
  // Validation — "Gatekeeper Rule: Never trust the client"
  const errors = validateNote(req.body);
  if (errors.length > 0) {
    // 400 — bad request (client sent invalid data)
    return res.status(400).json({
      success : false,
      message : 'Validation failed.',
      errors  : errors,
    });
  }

  const newNote = {
    id        : nextId++,
    title     : req.body.title.trim(),
    subject   : req.body.subject.trim(),
    content   : req.body.content.trim(),
    createdAt : new Date().toISOString(),
  };

  notes.push(newNote);

  // 201 — Created (not just 200, because a new resource was made)
  res.status(201).json({
    success : true,
    message : 'Note created successfully.',
    data    : newNote,
  });
});

// ── DELETE /api/notes/:id  → remove a note ────────────
app.delete('/api/notes/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const index = notes.findIndex(n => n.id === id);

  if (index === -1) {
    return res.status(404).json({
      success : false,
      message : `Note with id ${id} not found.`,
    });
  }

  notes.splice(index, 1);

  // 200 with confirmation (could also be 204 No Content)
  res.status(200).json({
    success : true,
    message : `Note ${id} deleted successfully.`,
  });
});

// ── GET /api/status  → health check endpoint ──────────
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success   : true,
    message   : 'API is running.',
    totalNotes: notes.length,
    uptime    : process.uptime().toFixed(1) + 's',
    timestamp : new Date().toISOString(),
  });
});

// ── 404 catch-all for unknown routes ──────────────────
app.use((req, res) => {
  res.status(404).json({
    success : false,
    message : `Route ${req.method} ${req.originalUrl} does not exist.`,
  });
});

// ── 500 global error handler ──────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    success : false,
    message : 'Internal server error. Please try again.',
  });
});

// ── Start server ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   GET    /api/status`);
  console.log(`   GET    /api/notes`);
  console.log(`   GET    /api/notes/:id`);
  console.log(`   POST   /api/notes`);
  console.log(`   DELETE /api/notes/:id\n`);
});
