import express from 'express';
import nodemailer from 'nodemailer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Config (all via environment, see .env.example) ---------------------------
const {
  PORT = 3000,
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = 465,
  SMTP_USER,            // your Gmail address (the sender)
  SMTP_PASS,            // Gmail app-password (NOT your normal password)
  MAIL_TO = 'manuruiz826@gmail.com',
  MAIL_FROM,            // defaults to SMTP_USER if unset
} = process.env;

const app = express();
// Body limit: the form is text-only; 1mb is plenty and caps abuse.
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Form schema --------------------------------------------------------------
// Single source of truth for which fields we accept and how they render in the
// emailed Markdown. `id` must match the input name in the HTML. Keeping the
// schema server-side means we never trust the client for structure or labels.
const SECTIONS = [
  {
    title: '1 — About you and your practice',
    fields: [
      { id: 's1_full_name', label: 'Full name as shown on site', required: true },
      { id: 's1_title', label: 'Professional title', required: true },
      { id: 's1_colegiado', label: 'Colegiado number + college', required: true },
      { id: 's1_experience', label: 'Years of experience', required: true },
      { id: 's1_story', label: 'Your story (basis of About page)', required: true, long: true },
      { id: 's1_quals', label: 'Qualifications & certifications', long: true },
      { id: 's1_memberships', label: 'Professional memberships', long: true },
      { id: 's1_languages', label: 'Languages spoken with patients' },
      { id: 's1_usp', label: 'What makes your approach different', long: true },
    ],
  },
  {
    title: '2 — Your patients (target audience)',
    fields: [
      { id: 's2_audience', label: 'Ideal patients', long: true, required: true },
      { id: 's2_problems', label: 'Most common problems patients present', long: true, required: true },
      { id: 's2_enquiry_lang', label: 'Expected main enquiry language' },
      { id: 's2_first_impression', label: 'What a visitor should feel/do in 10s', long: true },
    ],
  },
  {
    title: '3 — Services offered',
    fields: [
      { id: 's3_service1', label: 'Service 1 (name · description · duration · price)', long: true, required: true },
      { id: 's3_service2', label: 'Service 2 (name · description · duration · price)', long: true },
      { id: 's3_service3', label: 'Service 3 (name · description · duration · price)', long: true },
      { id: 's3_service4', label: 'Service 4 (name · description · duration · price)', long: true },
      { id: 's3_more_services', label: 'Additional services', long: true },
      { id: 's3_first_vs_followup', label: 'First visit vs follow-up differences', long: true, required: true },
      { id: 's3_packages', label: 'Packages / bonos', long: true },
      { id: 's3_show_prices', label: 'Show prices publicly?', required: true },
    ],
  },
  {
    title: '4 — Schedule & availability',
    fields: [
      { id: 's4_days', label: 'Working days', required: true },
      { id: 's4_hours', label: 'Working hours per day (with breaks)', long: true, required: true },
      { id: 's4_default_duration', label: 'Default appointment length (min)', required: true },
      { id: 's4_buffer', label: 'Buffer between appointments' },
      { id: 's4_advance', label: 'How far ahead patients can book' },
      { id: 's4_min_notice', label: 'Minimum notice for a booking', required: true },
      { id: 's4_closures', label: 'Holidays / closures', long: true },
      { id: 's4_capacity', label: 'Patients per slot' },
    ],
  },
  {
    title: '5 — Online booking rules',
    fields: [
      { id: 's5_required_info', label: 'Info patient must provide to book', long: true, required: true },
      { id: 's5_can_cancel', label: 'Can patients cancel online?', required: true },
      { id: 's5_can_reschedule', label: 'Can patients reschedule online?' },
      { id: 's5_cancel_policy', label: 'Cancellation policy & fees', long: true, required: true },
      { id: 's5_payment', label: 'How patients pay', required: true },
      { id: 's5_deposit', label: 'Deposit amount/percentage (if any)' },
      { id: 's5_approval', label: 'Auto-confirm or manual approval?' },
      { id: 's5_reminder', label: 'Reminder timing' },
      { id: 's5_channels', label: 'Confirmation/reminder channels' },
    ],
  },
  {
    title: '6 — Contact, location & hours',
    fields: [
      { id: 's6_address', label: 'Full clinic address (La Zenia/Torrevieja)', long: true, required: true },
      { id: 's6_phone', label: 'Public phone', required: true },
      { id: 's6_email', label: 'Public email', required: true },
      { id: 's6_whatsapp', label: 'WhatsApp number' },
      { id: 's6_public_hours', label: 'Public opening hours as displayed', long: true, required: true },
      { id: 's6_gmaps', label: 'Google Business / Maps link' },
      { id: 's6_social', label: 'Social media profiles', long: true },
      { id: 's6_parking', label: 'Parking / transport info', long: true },
    ],
  },
  {
    title: '7 — Brand & visual identity',
    fields: [
      { id: 's7_logo', label: 'Logo status', required: true },
      { id: 's7_colors', label: 'Brand colours / preference' },
      { id: 's7_feeling', label: 'Desired feeling of the site' },
      { id: 's7_likes', label: 'Websites you like (+ why)', long: true },
      { id: 's7_dislikes', label: 'Websites to avoid resembling', long: true },
      { id: 's7_photos', label: 'Photos you can provide', long: true, required: true },
      { id: 's7_testimonials', label: 'Testimonials / reviews', long: true },
    ],
  },
  {
    title: '8 — Languages',
    fields: [
      { id: 's8_bilingual', label: 'Bilingual EN+ES?', required: true },
      { id: 's8_default_lang', label: 'Default language on landing', required: true },
      { id: 's8_translations', label: 'Who provides Spanish translations' },
      { id: 's8_draft_copy', label: 'Use the draft texts already sent?', long: true },
    ],
  },
  {
    title: '9 — Legal & data protection (GDPR / RGPD)',
    fields: [
      { id: 's9_business_name', label: 'Registered business / autónomo details', long: true, required: true },
      { id: 's9_nif', label: 'NIF/NIE/CIF for legal texts', required: true },
      { id: 's9_policies', label: 'Existing privacy/cookie policy?' },
      { id: 's9_health_data', label: 'Health info collected via site at this stage?' },
      { id: 's9_notify_email', label: 'Inbox for booking notifications' },
    ],
  },
  {
    title: '10 — Scope, priorities & logistics',
    fields: [
      { id: 's10_priorities', label: 'Top priority for v1', required: true },
      { id: 's10_launch_date', label: 'Target launch date' },
      { id: 's10_domain', label: 'Domain owned?' },
      { id: 's10_hosting', label: 'Hosting arranged?' },
      { id: 's10_maintenance', label: 'Who updates content after launch' },
      { id: 's10_budget', label: 'Budget range', required: true },
    ],
  },
  {
    title: '11 — Anything we missed (open section)',
    fields: [
      { id: 's11_open', label: 'Anything else we should know — anything this form did not ask', long: true },
    ],
  },
];

const FIELD_INDEX = new Map(
  SECTIONS.flatMap((s) => s.fields.map((f) => [f.id, { ...f, section: s.title }])),
);

// --- Helpers ------------------------------------------------------------------
function sanitize(value) {
  // Responses are text. Coerce to string, trim, cap length to avoid abuse.
  if (value == null) return '';
  return String(value).slice(0, 20000).trim();
}

function buildMarkdown(answers, meta) {
  const lines = [];
  lines.push('# Briefing — Dr. Randall Morgan Jones');
  lines.push('');
  lines.push('> Respuestas del cuestionario de descubrimiento. Esta es la guía para la especificación del proyecto.');
  lines.push('');
  lines.push(`**Recibido:** ${meta.receivedAt}`);
  if (meta.respondentName) lines.push(`**Respondido por:** ${meta.respondentName}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const section of SECTIONS) {
    lines.push(`## ${section.title}`);
    lines.push('');
    for (const field of section.fields) {
      const raw = sanitize(answers[field.id]);
      const value = raw === '' ? '_(sin respuesta)_' : raw;
      lines.push(`### ${field.label}`);
      lines.push('');
      // Block-quote multi-line answers so Markdown renders them cleanly.
      lines.push(value.includes('\n') ? value.split('\n').map((l) => `> ${l}`).join('\n') : value);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }
  return lines.join('\n');
}

function validate(answers) {
  const missing = [];
  for (const [id, field] of FIELD_INDEX) {
    if (field.required && sanitize(answers[id]) === '') missing.push(field.label);
  }
  return missing;
}

let transporter = null;
function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP_USER / SMTP_PASS not configured. Set them in the environment.');
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

// --- Routes -------------------------------------------------------------------
app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/submit', async (req, res) => {
  try {
    const answers = req.body && typeof req.body === 'object' ? req.body : {};

    const missing = validate(answers);
    if (missing.length > 0) {
      return res.status(400).json({
        ok: false,
        error: 'missing_required',
        missing,
      });
    }

    const receivedAt = req.body.__receivedAt || new Date().toISOString();
    const respondentName = sanitize(answers.s1_full_name) || 'Randall Morgan Jones';
    const markdown = buildMarkdown(answers, { receivedAt, respondentName });

    const stamp = receivedAt.replace(/[:.]/g, '-');
    const filename = `briefing-randall-${stamp}.md`;

    await getTransporter().sendMail({
      from: MAIL_FROM || SMTP_USER,
      to: MAIL_TO,
      subject: `Briefing completado — ${respondentName}`,
      text:
        `Randall ha completado el briefing de la web.\n\n` +
        `Se adjunta la copia en Markdown (${filename}).\n\n` +
        `--- Vista previa ---\n\n${markdown.slice(0, 4000)}`,
      attachments: [{ filename, content: markdown, contentType: 'text/markdown; charset=utf-8' }],
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('submit failed:', err.message);
    return res.status(500).json({ ok: false, error: 'send_failed', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Briefing server listening on :${PORT}`);
});
