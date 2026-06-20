/* Briefing form schema (client-side render).
 * Mirrors the field IDs the server expects in server.js. The server is the
 * authority for required/labels; this file adds input types and helper text
 * for a good filling experience. Keep field IDs identical on both sides. */
window.BRIEFING_SCHEMA = [
  {
    title: '1 — About you & your practice',
    intro: 'This section builds your "About" page and establishes your credibility.',
    fields: [
      { id: 's1_full_name', label: 'Full name as it should appear on the website', type: 'text', required: true, placeholder: 'e.g. Dr. Randall Morgan Jones, D.C.' },
      { id: 's1_title', label: 'Professional title / how you want to be described', type: 'text', required: true, placeholder: 'e.g. Doctor of Chiropractic & Physiotherapist' },
      { id: 's1_colegiado', label: 'Spanish registration number (colegiado) + which college', type: 'text', required: true, help: 'We have 1883 on file — confirm and name the colegio.' },
      { id: 's1_experience', label: 'Years of professional experience', type: 'text', required: true, placeholder: 'e.g. 35+ years' },
      { id: 's1_story', label: 'Your story — training, where you have practised, specialities, why you are opening now', type: 'textarea', required: true, help: 'Write as much as you like. This becomes the heart of your About page.' },
      { id: 's1_quals', label: 'Qualifications, degrees & certifications (one per line)', type: 'textarea' },
      { id: 's1_memberships', label: 'Professional memberships / associations', type: 'textarea' },
      { id: 's1_languages', label: 'Languages you speak with patients', type: 'text', placeholder: 'e.g. English, Spanish' },
      { id: 's1_usp', label: 'What makes your approach different from other chiropractors nearby?', type: 'textarea' },
    ],
  },
  {
    title: '2 — Your patients',
    intro: 'Who we are designing the site to attract and reassure.',
    fields: [
      { id: 's2_audience', label: 'Who are your ideal patients?', type: 'textarea', required: true, help: 'e.g. local residents, English-speaking expats, retirees, athletes, office workers, pregnant women, families…' },
      { id: 's2_problems', label: 'Most common problems people come to you with', type: 'textarea', required: true, placeholder: 'e.g. lower back pain, sciatica, neck pain, headaches, sports injuries' },
      { id: 's2_enquiry_lang', label: 'Expected main language of enquiries', type: 'select', options: ['Mostly English', 'Mostly Spanish', 'A mix of both'] },
      { id: 's2_first_impression', label: 'What should a first-time visitor feel or do within 10 seconds?', type: 'textarea' },
    ],
  },
  {
    title: '3 — Services offered',
    intro: 'For each service: name · short description · duration (min) · price (€ or "consult"). List everything you offer.',
    fields: [
      { id: 's3_service1', label: 'Service 1 — name · description · duration · price', type: 'textarea', required: true, placeholder: 'e.g. Chiropractic adjustment · spinal manipulation to relieve pain · 30 min · €45' },
      { id: 's3_service2', label: 'Service 2 — name · description · duration · price', type: 'textarea' },
      { id: 's3_service3', label: 'Service 3 — name · description · duration · price', type: 'textarea' },
      { id: 's3_service4', label: 'Service 4 — name · description · duration · price', type: 'textarea' },
      { id: 's3_more_services', label: 'Any additional services', type: 'textarea' },
      { id: 's3_first_vs_followup', label: 'Is a first visit different from a follow-up? (length / price)', type: 'textarea', required: true },
      { id: 's3_packages', label: 'Packages or bonos (e.g. 5 sessions at a discount)', type: 'textarea' },
      { id: 's3_show_prices', label: 'Should prices be shown publicly on the website?', type: 'select', required: true, options: ['Yes — show all prices', 'Show some prices', 'No — "consult" only', 'Not sure, let’s discuss'] },
    ],
  },
  {
    title: '4 — Schedule & availability',
    intro: 'This drives how the booking calendar offers free slots.',
    fields: [
      { id: 's4_days', label: 'Which days of the week do you work?', type: 'checkboxes', required: true, options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      { id: 's4_hours', label: 'Working hours per day (include any midday break)', type: 'textarea', required: true, placeholder: 'e.g. Mon–Fri 09:00–14:00 and 16:00–20:00; Sat 10:00–14:00' },
      { id: 's4_default_duration', label: 'Default appointment length (minutes)', type: 'text', required: true, placeholder: 'e.g. 30' },
      { id: 's4_buffer', label: 'Buffer/gap you want between appointments (minutes)', type: 'text', placeholder: 'e.g. 10' },
      { id: 's4_advance', label: 'How far in advance can patients book?', type: 'select', options: ['Up to 2 weeks', 'Up to 30 days', 'Up to 60 days', 'Up to 90 days', 'No limit'] },
      { id: 's4_min_notice', label: 'Minimum notice for an online booking', type: 'text', required: true, placeholder: 'e.g. no bookings less than 24h before' },
      { id: 's4_closures', label: 'Known closures: holidays, vacation, days off', type: 'textarea' },
      { id: 's4_capacity', label: 'How many patients can share one time slot?', type: 'text', placeholder: 'Usually 1 for a solo practice' },
    ],
  },
  {
    title: '5 — Online booking rules',
    intro: 'How patients book, pay, cancel and get reminded.',
    fields: [
      { id: 's5_required_info', label: 'What information must a patient provide to book?', type: 'checkboxes', required: true, options: ['Full name', 'Phone', 'Email', 'Reason for visit', 'First-time vs returning', 'Date of birth', 'Address'] },
      { id: 's5_can_cancel', label: 'Can patients cancel their own appointment online (link in email)?', type: 'select', required: true, options: ['Yes', 'No', 'Not sure'] },
      { id: 's5_can_reschedule', label: 'Can patients reschedule online, or only cancel & rebook?', type: 'select', options: ['Reschedule online', 'Cancel & rebook only', 'Not sure'] },
      { id: 's5_cancel_policy', label: 'Cancellation policy — notice required & any fee', type: 'textarea', required: true },
      { id: 's5_payment', label: 'How do patients pay?', type: 'select', required: true, options: ['Pay in person at the clinic (no online payment)', 'Pay a deposit online when booking', 'Pay full amount online when booking', 'Not sure'] },
      { id: 's5_deposit', label: 'If deposit/online payment: amount or percentage', type: 'text' },
      { id: 's5_approval', label: 'Auto-confirm bookings, or do you approve each one?', type: 'select', options: ['Auto-confirm', 'I approve each one', 'Not sure'] },
      { id: 's5_reminder', label: 'Send patients a reminder before the appointment?', type: 'select', options: ['24h before', '48h before', 'Both', 'No reminder'] },
      { id: 's5_channels', label: 'Channels for confirmation & reminders', type: 'checkboxes', options: ['Email', 'SMS', 'WhatsApp'] },
    ],
  },
  {
    title: '6 — Contact, location & hours',
    intro: 'Public details shown on the site and used for the map.',
    fields: [
      { id: 's6_address', label: 'Full clinic address (street, number, floor, postcode) in La Zenia / Torrevieja', type: 'textarea', required: true },
      { id: 's6_phone', label: 'Public phone number', type: 'text', required: true },
      { id: 's6_email', label: 'Public email address', type: 'text', required: true },
      { id: 's6_whatsapp', label: 'WhatsApp number (if you want a WhatsApp button)', type: 'text' },
      { id: 's6_public_hours', label: 'Opening hours as you want them displayed', type: 'textarea', required: true },
      { id: 's6_gmaps', label: 'Google Business / Google Maps link', type: 'text' },
      { id: 's6_social', label: 'Social media profiles to link (one per line)', type: 'textarea' },
      { id: 's6_parking', label: 'Parking / public transport info worth mentioning', type: 'textarea' },
    ],
  },
  {
    title: '7 — Brand & visual identity',
    intro: 'The look and feel of the website.',
    fields: [
      { id: 's7_logo', label: 'Do you have a logo?', type: 'select', required: true, options: ['Yes — I will provide it', 'No — needs to be designed', 'Not sure'] },
      { id: 's7_colors', label: 'Brand colours or colour preference', type: 'text' },
      { id: 's7_feeling', label: 'Overall feeling the site should convey (pick up to 3)', type: 'checkboxes', options: ['Professional / clinical', 'Warm & welcoming', 'Modern & minimal', 'Trustworthy & established', 'Calm & wellness', 'Premium', 'Energetic'] },
      { id: 's7_likes', label: 'Websites you like (paste links + what you like)', type: 'textarea' },
      { id: 's7_dislikes', label: 'Websites you dislike / want to avoid resembling', type: 'textarea' },
      { id: 's7_photos', label: 'Photos you can provide', type: 'checkboxes', required: true, options: ['Photo of you', 'Clinic interior', 'Treatments', 'Logo files', 'None yet'] },
      { id: 's7_testimonials', label: 'Patient testimonials/reviews — can you provide some?', type: 'textarea' },
    ],
  },
  {
    title: '8 — Languages',
    intro: 'The clinic is in an international area, so language matters.',
    fields: [
      { id: 's8_bilingual', label: 'Should the website be in both English and Spanish?', type: 'select', required: true, options: ['Yes — both', 'English only', 'Spanish only'] },
      { id: 's8_default_lang', label: 'Default language when someone first lands on the site', type: 'select', required: true, options: ['English', 'Spanish', 'Detect automatically'] },
      { id: 's8_translations', label: 'Who provides the Spanish translations?', type: 'select', options: ['I will provide them', 'Please arrange translation', 'Not sure'] },
      { id: 's8_draft_copy', label: 'You sent draft texts (Intro / EN / ES). Should we use them? Paste the final text here.', type: 'textarea' },
    ],
  },
  {
    title: '9 — Legal & data protection (GDPR / RGPD)',
    intro: 'The clinic handles personal data; health data is sensitive under Spanish/EU law.',
    fields: [
      { id: 's9_business_name', label: 'Registered business name / autónomo details for the legal notice', type: 'textarea', required: true },
      { id: 's9_nif', label: 'NIF / NIE / CIF for legal texts', type: 'text', required: true, help: 'Tell us if you prefer this kept private and not shown publicly.' },
      { id: 's9_policies', label: 'Do you already have privacy/cookie policy texts?', type: 'select', options: ['Yes, I have them', 'No — please draft templates for my lawyer', 'Not sure'] },
      { id: 's9_health_data', label: 'Should the website collect any health info at this stage? (We plan contact-only.)', type: 'select', options: ['Contact details only is fine', 'I want to collect more', 'Not sure'] },
      { id: 's9_notify_email', label: 'Inbox where booking notifications should arrive', type: 'text' },
    ],
  },
  {
    title: '10 — Scope, priorities & logistics',
    intro: 'Helps us scope and plan realistically.',
    fields: [
      { id: 's10_priorities', label: 'Top priority for the first version', type: 'select', required: true, options: ['Getting found by new patients', 'Online booking that removes phone calls', 'Professional image & credibility', 'All equally'] },
      { id: 's10_launch_date', label: 'Target launch date or event', type: 'text' },
      { id: 's10_domain', label: 'Do you own a domain name? Which?', type: 'text', placeholder: 'e.g. drrandalljones.com' },
      { id: 's10_hosting', label: 'Is hosting arranged?', type: 'select', options: ['Yes, I have hosting', 'No — please advise', 'Not sure'] },
      { id: 's10_maintenance', label: 'Who keeps content updated after launch?', type: 'select', options: ['Me', 'The project team', 'Not sure'] },
    ],
  },
  {
    title: '11 — Anything we missed',
    intro: 'Open space — tell us anything important this form did not ask about. Ideas, worries, must-haves, examples… anything.',
    fields: [
      { id: 's11_open', label: 'Anything else we should know', type: 'textarea' },
    ],
  },
];
