const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOrderConfirmation = async ({ name, email, orderId, items, subtotal, shippingCost, total }) => {
  const itemsRows = items.map(item => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${item.price.toLocaleString('fr-FR')} XAF</td>
    </tr>`).join('');

  const shortId = String(orderId).slice(-8).toUpperCase();

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12);">

    <!-- Header -->
    <div style="background:#0A0A0A;padding:32px 24px;text-align:center;">
      <h1 style="color:#C9A84C;margin:0;font-size:26px;letter-spacing:1px;">Bangui est Doux</h1>
      <p style="color:#F5F0E8;margin:8px 0 0;font-size:13px;opacity:.7;">Confirmation de commande</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#333;">Bonjour <strong>${name}</strong>,</p>
      <p style="color:#555;line-height:1.6;">
        Merci pour votre commande chez <strong>Bangui est Doux</strong> ! 🎉<br>
        Nous avons bien reçu votre demande et nous la traiterons dans les plus brefs délais.
      </p>

      <!-- Order summary box -->
      <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin:24px 0;">
        <h3 style="color:#0A0A0A;margin:0 0 16px;font-size:15px;">
          Récapitulatif — Commande <span style="color:#C9A84C;">#${shortId}</span>
        </h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#0A0A0A;">
              <th style="padding:10px 8px;color:#C9A84C;text-align:left;">Article</th>
              <th style="padding:10px 8px;color:#C9A84C;text-align:center;">Qté</th>
              <th style="padding:10px 8px;color:#C9A84C;text-align:right;">Prix</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px;text-align:right;color:#555;">Sous-total :</td>
              <td style="padding:8px;text-align:right;color:#333;">${subtotal.toLocaleString('fr-FR')} XAF</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px;text-align:right;color:#555;">Livraison :</td>
              <td style="padding:8px;text-align:right;color:#333;">${shippingCost > 0 ? shippingCost.toLocaleString('fr-FR') + ' XAF' : '<span style="color:#16a34a;">Gratuite</span>'}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:12px 8px 4px;text-align:right;font-weight:bold;font-size:16px;">Total :</td>
              <td style="padding:12px 8px 4px;text-align:right;font-weight:bold;font-size:16px;color:#C9A84C;">${total.toLocaleString('fr-FR')} XAF</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p style="color:#555;line-height:1.6;">
        Notre équipe vous contactera très prochainement pour confirmer les détails de la livraison.<br>
        Pour toute question, contactez-nous par email ou sur nos réseaux sociaux.
      </p>

      <p style="color:#333;">À très bientôt,<br><strong style="color:#C9A84C;">L'équipe Bangui est Doux</strong></p>
    </div>

    <!-- Footer -->
    <div style="background:#0A0A0A;padding:20px 24px;text-align:center;">
      <p style="color:#F5F0E8;font-size:11px;margin:0;opacity:.5;">
        © ${new Date().getFullYear()} Bangui est Doux — Bangui, République Centrafricaine<br>
        Ce message est automatique, merci de ne pas y répondre directement.
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from:    `"Bangui est Doux" <${process.env.SMTP_USER}>`,
      to:      email,
      subject: `✅ Confirmation de commande #${shortId} – Bangui est Doux`,
      html,
    });
    console.log(`📧 Confirmation email sent to ${email}`);
    return true;
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    return false;
  }
};

module.exports = { sendOrderConfirmation };
