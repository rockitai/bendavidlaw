// Vercel serverless function: sends the contact form straight to the office mailbox over SMTP.
// Required environment variables (Vercel -> Project -> Settings -> Environment Variables):
//   SMTP_HOST, SMTP_PORT (465 or 587), SMTP_USER, SMTP_PASS   and optionally MAIL_FROM
// Brevo: SMTP_HOST=smtp-relay.brevo.com, SMTP_PORT=587, SMTP_USER=<Brevo SMTP login>, SMTP_PASS=<Brevo SMTP key>.
// The Brevo SMTP login is not a sender address, so the sender defaults to the office address (must be a verified sender in Brevo).
// The recipient is fixed here on the server and can never be set by the client.
const nodemailer = require('nodemailer');

const TO = 'Avibd@bendavidlaw.co.il';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (s, max) => String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim().slice(0, max);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};

  if (b.website) return res.status(200).json({ ok: true }); // honeypot: silently drop bots

  const name = clean(b.name, 120), phone = clean(b.phone, 40), email = clean(b.email, 160), page = clean(b.page, 200);
  const message = String(b.message || '').trim().slice(0, 5000);
  if (name.length < 2 || phone.replace(/\D/g, '').length < 7) return res.status(400).json({ ok: false, error: 'invalid' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: 'invalid_email' });

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return res.status(500).json({ ok: false, error: 'smtp_not_configured' });

  try {
    const port = Number(SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
    const rows = [['שם', name], ['טלפון', phone], ['אימייל', email || '—'], ['עמוד', page || '—'], ['הודעה', message || '—']];
    await transporter.sendMail({
      from: MAIL_FROM || `"אתר בן דוד" <${TO}>`,
      to: TO,
      replyTo: email || undefined,
      subject: `פנייה חדשה מהאתר - ${name}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7"><h2>פנייה חדשה מהאתר</h2><table cellpadding="6">${rows.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table></div>`,
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('mail error', e && e.message);
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }
};
