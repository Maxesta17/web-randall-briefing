/* Renders the briefing form from window.BRIEFING_SCHEMA, autosaves to
 * localStorage, tracks progress, validates required fields client-side, and
 * posts answers to /submit. Server re-validates — client checks are UX only. */
(function () {
  'use strict';

  const SCHEMA = window.BRIEFING_SCHEMA || [];
  const STORAGE_KEY = 'randall-briefing-draft-v1';
  const form = document.getElementById('briefingForm');
  const sectionsEl = document.getElementById('sections');
  const progressFill = document.getElementById('progressFill');
  const resultEl = document.getElementById('result');
  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Checkbox group values are stored joined; this separator is unlikely in text.
  const MULTI_SEP = ' | ';

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else node.setAttribute(k, attrs[k]);
    }
    (children || []).forEach((c) => node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return node;
  }

  function renderField(field) {
    const wrap = el('div', { class: 'field' });
    const labelText = field.label + (field.required ? ' *' : '');
    wrap.appendChild(el('label', { for: field.id, class: 'field-label' }, [labelText]));
    if (field.help) wrap.appendChild(el('p', { class: 'field-help' }, [field.help]));

    if (field.type === 'textarea') {
      wrap.appendChild(el('textarea', {
        id: field.id, name: field.id, rows: '4',
        placeholder: field.placeholder || '',
      }));
    } else if (field.type === 'select') {
      const sel = el('select', { id: field.id, name: field.id });
      sel.appendChild(el('option', { value: '' }, ['— select —']));
      (field.options || []).forEach((opt) => sel.appendChild(el('option', { value: opt }, [opt])));
      wrap.appendChild(sel);
    } else if (field.type === 'checkboxes') {
      const group = el('div', { class: 'checkbox-group', 'data-group': field.id });
      (field.options || []).forEach((opt, i) => {
        const cbId = `${field.id}__${i}`;
        const row = el('label', { class: 'checkbox-row', for: cbId });
        row.appendChild(el('input', { type: 'checkbox', id: cbId, value: opt, 'data-group': field.id }));
        row.appendChild(el('span', {}, [opt]));
        group.appendChild(row);
      });
      // Hidden input carries the joined value for save/submit.
      group.appendChild(el('input', { type: 'hidden', id: field.id, name: field.id }));
      wrap.appendChild(group);
    } else {
      wrap.appendChild(el('input', {
        type: 'text', id: field.id, name: field.id,
        placeholder: field.placeholder || '',
      }));
    }
    return wrap;
  }

  function renderSections() {
    SCHEMA.forEach((section, idx) => {
      const details = el('details', { class: 'section-card' });
      if (idx === 0) details.setAttribute('open', '');
      const summary = el('summary', { class: 'section-summary' }, [
        el('span', { class: 'section-title' }, [section.title]),
        el('span', { class: 'section-status', 'data-status-for': String(idx) }, ['']),
      ]);
      details.appendChild(summary);
      const body = el('div', { class: 'section-body' });
      if (section.intro) body.appendChild(el('p', { class: 'section-intro' }, [section.intro]));
      section.fields.forEach((f) => body.appendChild(renderField(f)));
      details.appendChild(body);
      sectionsEl.appendChild(details);
    });
  }

  // --- State <-> DOM ---------------------------------------------------------
  function collect() {
    const data = {};
    SCHEMA.forEach((section) => section.fields.forEach((field) => {
      if (field.type === 'checkboxes') {
        const checked = Array.from(document.querySelectorAll(`input[data-group="${field.id}"]:checked`))
          .map((c) => c.value);
        data[field.id] = checked.join(MULTI_SEP);
      } else {
        const node = document.getElementById(field.id);
        data[field.id] = node ? node.value : '';
      }
    }));
    return data;
  }

  function restore(data) {
    SCHEMA.forEach((section) => section.fields.forEach((field) => {
      const val = data[field.id];
      if (val == null) return;
      if (field.type === 'checkboxes') {
        const set = new Set(String(val).split(MULTI_SEP));
        document.querySelectorAll(`input[data-group="${field.id}"]`).forEach((c) => {
          c.checked = set.has(c.value);
        });
        const hidden = document.getElementById(field.id);
        if (hidden) hidden.value = val;
      } else {
        const node = document.getElementById(field.id);
        if (node) node.value = val;
      }
    }));
  }

  function syncHiddenForGroup(groupId) {
    const checked = Array.from(document.querySelectorAll(`input[data-group="${groupId}"]:checked`))
      .map((c) => c.value);
    const hidden = document.getElementById(groupId);
    if (hidden) hidden.value = checked.join(MULTI_SEP);
  }

  // --- Progress & validation -------------------------------------------------
  function requiredFields() {
    return SCHEMA.flatMap((s) => s.fields.filter((f) => f.required));
  }

  function isFilled(field, data) {
    return String(data[field.id] || '').trim() !== '';
  }

  function updateProgress() {
    const data = collect();
    const req = requiredFields();
    const done = req.filter((f) => isFilled(f, data)).length;
    const pct = req.length ? done / req.length : 0;
    progressFill.style.transform = 'scaleX(' + pct + ')';

    SCHEMA.forEach((section, idx) => {
      const reqInSection = section.fields.filter((f) => f.required);
      const statusEl = document.querySelector(`[data-status-for="${idx}"]`);
      if (!statusEl) return;
      if (reqInSection.length === 0) { statusEl.textContent = ''; return; }
      const filled = reqInSection.filter((f) => isFilled(f, data)).length;
      const complete = filled === reqInSection.length;
      statusEl.textContent = complete ? '✓ complete' : `${filled}/${reqInSection.length}`;
      statusEl.className = 'section-status' + (complete ? ' done' : '');
    });
  }

  // --- Autosave --------------------------------------------------------------
  let saveTimer = null;
  function saveDraft() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(collect())); } catch (_) {}
    }, 300);
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) restore(JSON.parse(raw));
    } catch (_) {}
  }

  // --- Submit ----------------------------------------------------------------
  function showResult(kind, html) {
    resultEl.hidden = false;
    resultEl.className = 'result ' + kind;
    resultEl.innerHTML = html;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const data = collect();
    const missing = requiredFields().filter((f) => !isFilled(f, data));
    if (missing.length > 0) {
      showResult('error',
        `<strong>Please complete the required fields (${missing.length}):</strong><ul>` +
        missing.map((f) => `<li>${f.label}</li>`).join('') + '</ul>');
      // Open the first section containing a missing field.
      const firstId = missing[0].id;
      SCHEMA.forEach((section, idx) => {
        if (section.fields.some((f) => f.id === firstId)) {
          const card = sectionsEl.children[idx];
          if (card) card.setAttribute('open', '');
        }
      });
      const node = document.getElementById(firstId);
      if (node) node.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    data.__receivedAt = new Date().toISOString();

    try {
      const res = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        showResult('success',
          '<strong>Thank you, Randall — your answers have been sent.</strong>' +
          '<p>The project team has received your briefing. You can close this page now.</p>');
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
        submitBtn.textContent = 'Sent ✓';
      } else if (json.error === 'missing_required') {
        showResult('error', '<strong>Some required answers are missing:</strong><ul>' +
          (json.missing || []).map((m) => `<li>${m}</li>`).join('') + '</ul>');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send my answers';
      } else {
        throw new Error(json.detail || 'Unexpected error');
      }
    } catch (err) {
      showResult('error',
        '<strong>Sorry — sending failed.</strong>' +
        '<p>Please try again in a moment. If it keeps failing, contact the project team — your answers are still saved in this browser.</p>' +
        `<p class="err-detail">${err.message}</p>`);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send my answers';
    }
  }

  // --- Init ------------------------------------------------------------------
  renderSections();
  loadDraft();
  updateProgress();

  form.addEventListener('input', (e) => {
    if (e.target && e.target.dataset && e.target.dataset.group) {
      syncHiddenForGroup(e.target.dataset.group);
    }
    saveDraft();
    updateProgress();
  });
  form.addEventListener('change', (e) => {
    if (e.target && e.target.dataset && e.target.dataset.group) {
      syncHiddenForGroup(e.target.dataset.group);
    }
    saveDraft();
    updateProgress();
  });
  form.addEventListener('submit', onSubmit);

  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear all your saved answers in this browser?')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    form.reset();
    document.querySelectorAll('input[type="hidden"]').forEach((h) => { h.value = ''; });
    updateProgress();
    showResult('info', 'Draft cleared. You can start fresh.');
  });
})();
