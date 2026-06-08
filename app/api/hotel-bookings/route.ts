import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
export const dynamic = 'force-dynamic';

function getAdmin() {
  const url    = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key    = svcKey && svcKey.startsWith('eyJ')
    ? svcKey
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
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

function formatPrice(p: number) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' XAF';
}

function orNull(v: unknown) { return (v === '' || v === undefined) ? null : v; }

export async function GET() {
  try {
    const { data, error } = await getAdmin()
      .from('hotel_bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guest_name, guest_phone, check_in, check_out } = body;
    if (!guest_name || !guest_phone || !check_in || !check_out)
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });

    // Build clean row — strip generated 'nights', coerce empty strings to null
    const row = {
      hotel_id:    orNull(body.hotel_id),
      room_id:     orNull(body.room_id),
      hotel_name:  orNull(body.hotel_name),
      room_type:   orNull(body.room_type),
      guest_name:  String(guest_name).trim(),
      guest_email: orNull(body.guest_email),
      guest_phone: String(guest_phone).trim(),
      check_in,
      check_out,
      total_price: body.total_price ? Math.round(Number(body.total_price)) : null,
      notes:       orNull(body.notes),
      status:      'pending',
    };

    const { data, error } = await getAdmin().from('hotel_bookings').insert([row]).select().single();
    if (error) throw error;

    // ── Emails ────────────────────────────────────────────────────
    const ADMIN = process.env.SMTP_USER || 'contact@banguiestdoux.com';
    const nights = Math.max(0, Math.round(
      (new Date(check_out).getTime() - new Date(check_in).getTime()) / 86400000
    ));
    const firstName = String(guest_name).split(' ')[0];

    try {
      const transporter = getTransporter();

      // 1️⃣  Admin notification
      await transporter.sendMail({
        from:    `"Bangui est Doux" <${ADMIN}>`,
        to:      ADMIN,
        replyTo: row.guest_email || ADMIN,
        subject: `🏨 Nouvelle réservation hôtel — ${row.hotel_name || 'Hôtel'} — ${guest_name}`,
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#f5f0e8;border-radius:12px;">
  <h2 style="color:#e3fc02;margin-bottom:4px;">🏨 Nouvelle réservation hôtel</h2>
  <p style="color:#888;font-size:13px;margin-top:0;">via banguiestdoux.com</p>
  <hr style="border:none;border-top:1px solid #222;margin:16px 0;">
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:6px 0;color:#888;width:120px;">Hôtel</td><td style="padding:6px 0;font-weight:600;">${row.hotel_name || '—'}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">Chambre</td><td style="padding:6px 0;">${row.room_type || '—'}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">Client</td><td style="padding:6px 0;font-weight:600;">${guest_name}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">Téléphone</td><td style="padding:6px 0;">${guest_phone}</td></tr>
    ${row.guest_email ? `<tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;"><a href="mailto:${row.guest_email}" style="color:#e3fc02;">${row.guest_email}</a></td></tr>` : ''}
    <tr><td style="padding:6px 0;color:#888;">Arrivée</td><td style="padding:6px 0;">${check_in}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">Départ</td><td style="padding:6px 0;">${check_out}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">Nuits</td><td style="padding:6px 0;">${nights}</td></tr>
    ${row.total_price ? `<tr><td style="padding:6px 0;color:#888;">Total</td><td style="padding:6px 0;font-weight:600;color:#e3fc02;">${formatPrice(row.total_price)}</td></tr>` : ''}
    ${row.notes ? `<tr><td style="padding:6px 0;color:#888;">Notes</td><td style="padding:6px 0;font-style:italic;">${row.notes}</td></tr>` : ''}
  </table>
  <hr style="border:none;border-top:1px solid #222;margin:16px 0;">
  <p style="font-size:12px;color:#555;">Connectez-vous à l'admin pour confirmer ou annuler cette réservation.</p>
</div>`,
      });

      // 2️⃣  Customer confirmation (only if email provided)
      if (row.guest_email) {
        await transporter.sendMail({
          from:    `"Bangui est Doux" <${ADMIN}>`,
          to:      row.guest_email,
          subject: `✅ Réservation confirmée — ${row.hotel_name || 'Hôtel'} | Bangui est Doux`,
          html: `
<!DOCTYPE html><html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:600px;margin:32px auto;background:#0a0a0a;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.3);">
  <div style="background:linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%);padding:40px 32px;text-align:center;border-bottom:2px solid #e3fc02;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#e3fc02;">Bangui est Doux</p>
    <h1 style="margin:0;font-size:26px;font-weight:bold;color:#ffffff;line-height:1.2;">🏨 Réservation reçue !</h1>
    <p style="margin:8px 0 0;color:#888;font-size:14px;">Merci, ${firstName} — nous vous confirmons sous peu</p>
  </div>
  <div style="padding:36px 32px;color:#f5f0e8;">
    <p style="font-size:15px;line-height:1.8;margin:0 0 20px;">Bonjour <strong>${firstName}</strong>,</p>
    <p style="font-size:14px;line-height:1.8;color:#aaa;margin:0 0 24px;">
      Votre demande de réservation a bien été reçue. Notre équipe va la traiter et vous contacter
      sous <strong style="color:#e3fc02;">24 heures</strong> pour confirmer les détails.
    </p>
    <div style="background:#141414;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #e3fc02;">
      <p style="margin:0 0 12px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#e3fc02;">Détails de la réservation</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:5px 0;color:#888;width:110px;">Hôtel</td><td style="padding:5px 0;font-weight:600;">${row.hotel_name || '—'}</td></tr>
        ${row.room_type ? `<tr><td style="padding:5px 0;color:#888;">Chambre</td><td style="padding:5px 0;">${row.room_type}</td></tr>` : ''}
        <tr><td style="padding:5px 0;color:#888;">Arrivée</td><td style="padding:5px 0;">${check_in}</td></tr>
        <tr><td style="padding:5px 0;color:#888;">Départ</td><td style="padding:5px 0;">${check_out}</td></tr>
        <tr><td style="padding:5px 0;color:#888;">Durée</td><td style="padding:5px 0;">${nights} nuit${nights > 1 ? 's' : ''}</td></tr>
        ${row.total_price ? `<tr><td style="padding:5px 0;color:#888;">Total estimé</td><td style="padding:5px 0;font-weight:600;color:#e3fc02;">${formatPrice(row.total_price)}</td></tr>` : ''}
      </table>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://banguiestdoux.com/hotels" style="display:inline-block;padding:14px 36px;background:#e3fc02;color:#0a0a0a;text-decoration:none;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">
        Voir nos hôtels
      </a>
    </div>
    <p style="font-size:13px;color:#666;line-height:1.7;">Des questions ? Répondez à cet email ou appelez-nous.<br>
    <a href="mailto:contact@banguiestdoux.com" style="color:#e3fc02;">contact@banguiestdoux.com</a></p>
  </div>
  <div style="background:#141414;padding:20px 32px;text-align:center;border-top:1px solid #222;">
    <p style="margin:0;font-size:12px;color:#555;">© ${new Date().getFullYear()} Bangui est Doux · Bangui, République Centrafricaine</p>
  </div>
</div></body></html>`,
        });
      }
    } catch (emailErr) {
      // Email failure never blocks the booking confirmation
      console.error('Hotel booking email error:', emailErr);
    }

    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    const { data, error } = await getAdmin()
      .from('hotel_bookings').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
