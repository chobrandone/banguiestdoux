import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Service-role client (server-only, never exposed to browser)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// SMTP transporter — Hostinger mail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER || 'contact@banguiestdoux.com',
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body as {
      name: string;
      email: string;
      phone?: string;
      subject?: string;
      message: string;
    };

    // Basic validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nom, email et message sont requis.' },
        { status: 400 },
      );
    }

    // 1️⃣  Save to Supabase messages table
    const { error: dbError } = await supabaseAdmin.from('messages').insert([{
      name:    name.trim(),
      email:   email.trim(),
      phone:   phone?.trim() || null,
      subject: subject?.trim() || null,
      message: message.trim(),
    }]);

    if (dbError) {
      console.error('Contact save error:', dbError);
      // Don't block the email — log and continue
    }

    // 2️⃣  Send notification to admin
    await transporter.sendMail({
      from:    `"Bangui est Doux" <${process.env.SMTP_USER || 'contact@banguiestdoux.com'}>`,
      to:      process.env.SMTP_USER || 'contact@banguiestdoux.com',
      replyTo: email,
      subject: `[Contact] ${subject || 'Nouveau message'} — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#f5f0e8;border-radius:12px;">
          <h2 style="color:#16A34A;margin-bottom:4px;">Nouveau message reçu</h2>
          <p style="color:#888;font-size:13px;margin-top:0;">via le formulaire de contact de banguiestdoux.com</p>
          <hr style="border:none;border-top:1px solid #222;margin:16px 0;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#888;width:80px;">Nom</td><td style="padding:6px 0;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#16A34A;">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding:6px 0;color:#888;">Tél</td><td style="padding:6px 0;">${phone}</td></tr>` : ''}
            ${subject ? `<tr><td style="padding:6px 0;color:#888;">Sujet</td><td style="padding:6px 0;">${subject}</td></tr>` : ''}
          </table>
          <hr style="border:none;border-top:1px solid #222;margin:16px 0;">
          <p style="font-size:14px;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
      `,
    });

    // 3️⃣  Send personalised auto-reply to sender
    const firstName = name.split(' ')[0];
    await transporter.sendMail({
      from:    `"Bangui est Doux" <${process.env.SMTP_USER || 'contact@banguiestdoux.com'}>`,
      to:      email,
      subject: `Merci ${firstName} — Votre message a bien été reçu ✨`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:600px;margin:32px auto;background:#0a0a0a;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.3);">

    <!-- Header banner -->
    <div style="background:linear-gradient(135deg,#16A34A 0%,#86EFAC 50%,#16A34A 100%);padding:40px 32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:rgba(0,0,0,0.5);">Bangui est Doux</p>
      <h1 style="margin:0;font-size:28px;font-weight:bold;color:#0a0a0a;line-height:1.2;">
        Merci, ${firstName}&nbsp;!
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:40px 32px;color:#f5f0e8;">
      <p style="font-size:16px;line-height:1.8;margin:0 0 20px;">
        Cher·e <strong>${firstName}</strong>,
      </p>
      <p style="font-size:15px;line-height:1.8;color:#d4d0c8;margin:0 0 16px;">
        Nous avons bien reçu votre message et nous vous remercions sincèrement de l'intérêt que vous portez à
        <strong style="color:#86EFAC;">Bangui est Doux</strong> — la plateforme qui célèbre le meilleur de la vie
        à Bangui&nbsp;🌟
      </p>
      <p style="font-size:15px;line-height:1.8;color:#d4d0c8;margin:0 0 16px;">
        Notre équipe a pris note de votre demande et reviendra vers vous dans les plus brefs délais, généralement
        <strong>sous 24&nbsp;à 48&nbsp;heures</strong> ouvrables.
      </p>
      <p style="font-size:15px;line-height:1.8;color:#d4d0c8;margin:0 0 32px;">
        En attendant, n'hésitez pas à explorer nos derniers événements, restaurants et articles sur notre site.
        Bangui est vivante, et <em>Bangui est Doux</em>&nbsp;!
      </p>

      <!-- CTA button -->
      <div style="text-align:center;margin:32px 0;">
        <a href="https://banguiestdoux.com"
           style="display:inline-block;padding:14px 36px;background:#16A34A;color:#fff;text-decoration:none;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">
          Explorer le site
        </a>
      </div>

      <!-- Recap box -->
      <div style="background:#141414;border-radius:12px;padding:20px 24px;margin-top:8px;">
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#86EFAC;">Votre message</p>
        <p style="margin:0;font-size:13px;color:#888;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 300)}${message.length > 300 ? '…' : ''}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#141414;padding:24px 32px;text-align:center;border-top:1px solid #222;">
      <p style="margin:0 0 8px;font-size:12px;color:#555;">
        Vous recevez cet email car vous avez contacté Bangui est Doux via notre site web.
      </p>
      <p style="margin:0;font-size:12px;color:#555;">
        © ${new Date().getFullYear()} Bangui est Doux · Bangui, République Centrafricaine
      </p>
    </div>
  </div>
</body>
</html>
      `,
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
