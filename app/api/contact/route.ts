import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

function getAdmin() {
  const url    = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key    = svcKey && svcKey.startsWith('eyJ')
    ? svcKey
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;          // fail gracefully — email still sends
  return createClient(url, key);
}

function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.hostinger.com',
    port:   Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'contact@banguiestdoux.com',
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body as {
      name: string; email: string; phone?: string;
      subject?: string; message: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nom, email et message sont requis.' },
        { status: 400 },
      );
    }

    const ADMIN     = process.env.SMTP_USER || 'contact@banguiestdoux.com';
    const firstName = name.trim().split(' ')[0];

    // 1️⃣  Save to Supabase (non-blocking)
    try {
      const admin = getAdmin();
      if (admin) {
        await admin.from('messages').insert([{
          name:    name.trim(),
          email:   email.trim(),
          phone:   phone?.trim()   || null,
          subject: subject?.trim() || null,
          message: message.trim(),
        }]);
      }
    } catch (dbErr) {
      console.error('Contact DB save error:', dbErr);
    }

    const transporter = getTransporter();

    // 2️⃣  Admin notification
    await transporter.sendMail({
      from:    `"Bangui est Doux" <${ADMIN}>`,
      to:      ADMIN,
      replyTo: email.trim(),
      subject: `📩 Nouveau message — ${subject || 'Contact'} — ${name}`,
      html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#f5f0e8;border-radius:12px;">
  <h2 style="color:#e3fc02;margin-bottom:4px;">📩 Nouveau message de contact</h2>
  <p style="color:#888;font-size:13px;margin-top:0;">via banguiestdoux.com</p>
  <hr style="border:none;border-top:1px solid #222;margin:16px 0;">
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:6px 0;color:#888;width:80px;">Nom</td><td style="padding:6px 0;font-weight:600;">${name}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#e3fc02;">${email}</a></td></tr>
    ${phone ? `<tr><td style="padding:6px 0;color:#888;">Tél</td><td style="padding:6px 0;">${phone}</td></tr>` : ''}
    ${subject ? `<tr><td style="padding:6px 0;color:#888;">Sujet</td><td style="padding:6px 0;">${subject}</td></tr>` : ''}
  </table>
  <hr style="border:none;border-top:1px solid #222;margin:16px 0;">
  <p style="font-size:14px;line-height:1.7;white-space:pre-wrap;background:#141414;padding:16px;border-radius:8px;border-left:3px solid #e3fc02;">
    ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
  </p>
  <p style="font-size:12px;color:#555;margin-top:16px;">Répondez directement à cet email pour contacter ${firstName}.</p>
</div>`,
    });

    // 3️⃣  Customer auto-reply
    await transporter.sendMail({
      from:    `"Bangui est Doux" <${ADMIN}>`,
      to:      email.trim(),
      subject: `✅ Merci ${firstName} — Votre message a bien été reçu`,
      html: `
<!DOCTYPE html><html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:600px;margin:32px auto;background:#0a0a0a;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.3);">
  <div style="background:linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%);padding:40px 32px;text-align:center;border-bottom:2px solid #e3fc02;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#e3fc02;">Bangui est Doux</p>
    <h1 style="margin:0;font-size:26px;font-weight:bold;color:#ffffff;line-height:1.2;">Merci, ${firstName}&nbsp;!</h1>
    <p style="margin:8px 0 0;color:#888;font-size:14px;">Votre message a bien été reçu</p>
  </div>
  <div style="padding:36px 32px;color:#f5f0e8;">
    <p style="font-size:15px;line-height:1.8;margin:0 0 20px;">Bonjour <strong>${firstName}</strong>,</p>
    <p style="font-size:14px;line-height:1.8;color:#aaa;margin:0 0 16px;">
      Nous avons bien reçu votre message et vous remercions de l'intérêt que vous portez à
      <strong style="color:#e3fc02;">Bangui est Doux</strong>.
    </p>
    <p style="font-size:14px;line-height:1.8;color:#aaa;margin:0 0 24px;">
      Notre équipe reviendra vers vous dans les plus brefs délais, généralement
      sous <strong style="color:#e3fc02;">24 à 48 heures</strong> ouvrables.
    </p>
    <div style="background:#141414;border-radius:12px;padding:16px 20px;margin-bottom:28px;border-left:3px solid #e3fc02;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#e3fc02;">Votre message</p>
      <p style="margin:0;font-size:13px;color:#888;line-height:1.7;white-space:pre-wrap;">
        ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 300)}${message.length > 300 ? '…' : ''}
      </p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://banguiestdoux.com" style="display:inline-block;padding:14px 36px;background:#e3fc02;color:#0a0a0a;text-decoration:none;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">
        Explorer le site
      </a>
    </div>
    <p style="font-size:13px;color:#666;line-height:1.7;">
      En attendant, n'hésitez pas à explorer nos derniers événements, restaurants et articles.<br>
      Bangui est vivante, et <em>Bangui est Doux</em>&nbsp;🌟
    </p>
  </div>
  <div style="background:#141414;padding:20px 32px;text-align:center;border-top:1px solid #222;">
    <p style="margin:0;font-size:12px;color:#555;">
      © ${new Date().getFullYear()} Bangui est Doux · Bangui, République Centrafricaine
    </p>
  </div>
</div></body></html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Contact API error:', err);
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 },
    );
  }
}
