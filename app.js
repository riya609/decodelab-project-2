// =====================================================
// PROJECT 2 — Frontend JS (talks to the Express API)
// Uses fetch() to call REST endpoints
// =====================================================

const BASE = 'http://localhost:3000/api';

// ── Utility: display response in a box ───────────────
function showResponse(boxId, statusCode, data, isSuccess) {
  const box = document.getElementById(boxId);
  box.className = 'response-box show ' + (isSuccess ? 'success' : 'error');
  box.innerHTML = `
    <div class="response-status">HTTP ${statusCode} ${isSuccess ? '✓' : '✗'}</div>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
}

// ── 1. API STATUS CHECK (on page load) ───────────────
async function checkApiStatus() {
  const dot  = document.querySelector('.status-dot');
  const text = document.getElementById('statusText');
  try {
    const res  = await fetch(`${BASE}/status`);
    const data = await res.json();
    if (data.success) {
      dot.classList.add('online');
      text.textContent = `API Online · ${data.totalNotes} notes`;
    }
  } catch {
    dot.classList.add('offline');
    text.textContent = 'API Offline — run: node server.js';
  }
}

// ── 2. POST /api/notes — create a new note ───────────
document.getElementById('createBtn').addEventListener('click', async () => {
  const title   = document.getElementById('noteTitle').value;
  const subject = document.getElementById('noteSubject').value;
  const content = document.getElementById('noteContent').value;

  try {
    const res  = await fetch(`${BASE}/notes`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ title, subject, content }),
    });
    const data = await res.json();
    showResponse('createResponse', res.status, data, data.success);

    if (data.success) {
      // Clear form on success
      document.getElementById('noteTitle').value   = '';
      document.getElementById('noteSubject').value = '';
      document.getElementById('noteContent').value = '';
      checkApiStatus();   // update note count
      loadAllNotes();     // refresh list
    }
  } catch (err) {
    showResponse('createResponse', 'ERR', { success: false, message: 'Cannot reach server. Is it running?' }, false);
  }
});

// ── 3. GET /api/notes or /api/notes/:id ──────────────
document.getElementById('fetchBtn').addEventListener('click', async () => {
  const id      = document.getElementById('fetchId').value.trim();
  const subject = document.getElementById('filterSubject').value;

  let url = `${BASE}/notes`;
  if (id)             url = `${BASE}/notes/${id}`;
  else if (subject)   url = `${BASE}/notes?subject=${subject}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();
    showResponse('fetchResponse', res.status, data, data.success);
  } catch {
    showResponse('fetchResponse', 'ERR', { success: false, message: 'Cannot reach server.' }, false);
  }
});

// ── 4. DELETE /api/notes/:id ─────────────────────────
async function deleteNote(id, responseBoxId) {
  try {
    const res  = await fetch(`${BASE}/notes/${id}`, { method: 'DELETE' });
    const data = await res.json();
    showResponse(responseBoxId || 'deleteResponse', res.status, data, data.success);
    if (data.success) {
      checkApiStatus();
      loadAllNotes();
    }
  } catch {
    showResponse(responseBoxId || 'deleteResponse', 'ERR', { success: false, message: 'Cannot reach server.' }, false);
  }
}

document.getElementById('deleteBtn').addEventListener('click', () => {
  const id = document.getElementById('deleteId').value.trim();
  if (!id) {
    showResponse('deleteResponse', 400, { success: false, message: 'Please enter a Note ID.' }, false);
    return;
  }
  deleteNote(id, 'deleteResponse');
  document.getElementById('deleteId').value = '';
});

// ── 5. Load all notes into the live list ─────────────
async function loadAllNotes() {
  const container = document.getElementById('notesList');
  try {
    const res  = await fetch(`${BASE}/notes`);
    const data = await res.json();

    if (!data.success || data.data.length === 0) {
      container.innerHTML = '<p class="placeholder-text">No notes found.</p>';
      return;
    }

    container.innerHTML = data.data.map(note => `
      <div class="note-card">
        <div class="note-card-body">
          <h4>${escapeHtml(note.title)}</h4>
          <p>${escapeHtml(note.content)}</p>
          <div class="note-meta">
            <span class="note-id">ID: ${note.id}</span>
            <span class="note-subject">${escapeHtml(note.subject)}</span>
          </div>
        </div>
        <button class="btn-del-card" onclick="deleteNote(${note.id})">✕ Delete</button>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<p class="placeholder-text" style="color:var(--red)">Could not load notes. Make sure the server is running.</p>';
  }
}

// ── Refresh button ────────────────────────────────────
document.getElementById('refreshBtn').addEventListener('click', loadAllNotes);

// ── Safety: escape HTML to prevent XSS ───────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Footer year ───────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Init ──────────────────────────────────────────────
checkApiStatus();
loadAllNotes();
