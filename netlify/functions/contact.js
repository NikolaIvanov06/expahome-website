// ============================================================
//  ExpaHome — Contact Form Handler (Netlify Function)
//  Uses Resend free tier (3,000 emails/month)
//  Set RESEND_API_KEY in Netlify → Site Settings → Environment Variables
// ============================================================

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Invalid request body' }) };
    }

    const { name, email, phone, model, message, honeypot } = body;

    // Honeypot spam protection
    if (honeypot) {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // Validation
    if (!name || !email || !message) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Моля, попълнете всички задължителни полета.' }) };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Моля, въведете валиден имейл адрес.' }) };
    }

    const clean = (str) => String(str || '').replace(/[<>]/g, '').trim().slice(0, 2000);
    const safeName = clean(name);
    const safeEmail = clean(email);
    const safePhone = clean(phone) || 'Не е посочен';
    const safeModel = clean(model) || 'Не е избран';
    const safeMessage = clean(message);

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Server configuration error' }) };
    }

    // EMAIL 1 — Notification to ExpaHome team
    const inquiryResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ExpaHome Website <noreply@expahome.bg>',
        to: ['expahomedt@gmail.com'],
        reply_to: safeEmail,
        subject: `🏠 Ново запитване от ${safeName} — ${safeModel}`,
        html: buildInquiryEmail({ name: safeName, email: safeEmail, phone: safePhone, model: safeModel, message: safeMessage })
      })
    });

    if (!inquiryResponse.ok) {
      const err = await inquiryResponse.json();
      console.error('Resend inquiry error:', err);
      throw new Error('Failed to send inquiry email');
    }

    // EMAIL 2 — Auto-reply to customer
    const autoReplyResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ExpaHome <noreply@expahome.bg>',
        to: [safeEmail],
        reply_to: 'expahomedt@gmail.com',
        subject: 'Благодарим за вашето запитване — ExpaHome',
        html: buildAutoReplyEmail({ name: safeName, model: safeModel, message: safeMessage })
      })
    });

    if (!autoReplyResponse.ok) {
      const err = await autoReplyResponse.json();
      console.error('Resend auto-reply error:', err);
      // Don't fail — main inquiry was already sent
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

  } catch (error) {
    console.error('Contact form error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Възникна грешка при изпращането. Моля, опитайте отново.' })
    };
  }
};


// ============================================================
//  EMAIL TEMPLATE: Inquiry notification to ExpaHome team
// ============================================================
function buildInquiryEmail({ name, email, phone, model, message }) {
  return `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ново запитване — ExpaHome</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f1ea;font-family:'Georgia','Times New Roman',serif;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f5f1ea;opacity:0;">Ново запитване от ${name} — ${model}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f1ea;padding:40px 20px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 20px rgba(60,45,30,0.08);">
      <tr>
        <td style="background-color:#2c1810;padding:32px 40px;text-align:center;">
          <div style="color:#d4a574;font-family:'Georgia',serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">EXPAHOME</div>
          <div style="color:#ffffff;font-family:'Georgia',serif;font-size:22px;font-style:italic;font-weight:300;">Ново запитване от уебсайта</div>
        </td>
      </tr>
      <tr>
        <td style="background-color:#d4a574;padding:14px 40px;text-align:center;">
          <span style="color:#2c1810;font-family:'Georgia',serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">&#9203; Отговорете в рамките на 24 часа</span>
        </td>
      </tr>
      <tr>
        <td style="padding:40px 40px 20px 40px;">
          <h1 style="margin:0 0 12px 0;color:#2c1810;font-family:'Georgia',serif;font-size:28px;font-weight:400;line-height:1.3;">Здравейте, екип <em style="color:#8b6f47;">ExpaHome</em></h1>
          <p style="margin:0;color:#6b5d4f;font-family:'Georgia',serif;font-size:15px;line-height:1.6;">Получихте ново запитване чрез формата за контакт. Детайлите са по-долу.</p>
        </td>
      </tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#e8ddd0;"></div></td></tr>
      <tr>
        <td style="padding:30px 40px 10px 40px;">
          <div style="color:#8b6f47;font-family:'Georgia',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;">Информация за клиента</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:12px 0;border-bottom:1px solid #f0e8dc;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="140" style="color:#8b6f47;font-family:'Georgia',serif;font-size:13px;vertical-align:top;padding-right:10px;">&#128100; Име</td>
                <td style="color:#2c1810;font-family:'Georgia',serif;font-size:16px;font-weight:600;">${name}</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #f0e8dc;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="140" style="color:#8b6f47;font-family:'Georgia',serif;font-size:13px;vertical-align:top;padding-right:10px;">&#9993; Имейл</td>
                <td style="font-family:'Georgia',serif;font-size:15px;"><a href="mailto:${email}" style="color:#8b6f47;text-decoration:none;border-bottom:1px solid #d4a574;">${email}</a></td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #f0e8dc;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="140" style="color:#8b6f47;font-family:'Georgia',serif;font-size:13px;vertical-align:top;padding-right:10px;">&#128222; Телефон</td>
                <td style="font-family:'Georgia',serif;font-size:15px;"><a href="tel:${phone}" style="color:#8b6f47;text-decoration:none;border-bottom:1px solid #d4a574;">${phone}</a></td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:12px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="140" style="color:#8b6f47;font-family:'Georgia',serif;font-size:13px;vertical-align:top;padding-right:10px;">&#127968; Модел</td>
                <td><span style="display:inline-block;background-color:#f5f1ea;color:#2c1810;font-family:'Georgia',serif;font-size:14px;font-weight:600;padding:6px 14px;border-radius:3px;border:1px solid #d4a574;">${model}</span></td>
              </tr></table>
            </td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 40px 30px 40px;">
          <div style="color:#8b6f47;font-family:'Georgia',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">Съобщение</div>
          <div style="background-color:#faf7f2;border-left:3px solid #d4a574;padding:20px 24px;border-radius:2px;">
            <p style="margin:0;color:#3d2e1f;font-family:'Georgia',serif;font-size:15px;line-height:1.7;font-style:italic;">&ldquo;${message}&rdquo;</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 40px 40px 40px;" align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right:10px;">
              <a href="mailto:${email}?subject=Re: Вашето запитване към ExpaHome" style="display:inline-block;background-color:#2c1810;color:#ffffff;font-family:'Georgia',serif;font-size:14px;letter-spacing:1px;text-transform:uppercase;padding:14px 28px;text-decoration:none;border-radius:2px;">&#9993; Отговорете</a>
            </td>
            <td style="padding-left:10px;">
              <a href="tel:${phone}" style="display:inline-block;background-color:#ffffff;color:#2c1810;font-family:'Georgia',serif;font-size:14px;letter-spacing:1px;text-transform:uppercase;padding:13px 28px;text-decoration:none;border-radius:2px;border:1px solid #2c1810;">&#128222; Обадете се</a>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#faf7f2;padding:24px 40px;border-top:1px solid #e8ddd0;text-align:center;">
          <p style="margin:0 0 6px 0;color:#8b6f47;font-family:'Georgia',serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;">ExpaHome TD</p>
          <p style="margin:0;color:#a89580;font-family:'Georgia',serif;font-size:12px;font-style:italic;">Автоматично съобщение от формата за контакт на expahome.bg</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}


// ============================================================
//  EMAIL TEMPLATE: Customer auto-reply
// ============================================================
function buildAutoReplyEmail({ name, model, message }) {
  return `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Благодарим за вашето запитване — ExpaHome</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f1ea;font-family:'Georgia','Times New Roman',serif;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f5f1ea;opacity:0;">Получихме вашето запитване — ще се свържем с вас в рамките на 24 часа.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f1ea;padding:40px 20px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 20px rgba(60,45,30,0.08);">
      <tr>
        <td style="background-color:#2c1810;padding:50px 40px 40px 40px;text-align:center;">
          <div style="color:#d4a574;font-family:'Georgia',serif;font-size:12px;letter-spacing:5px;text-transform:uppercase;margin-bottom:12px;">EXPAHOME</div>
          <div style="height:1px;width:60px;background-color:#d4a574;margin:0 auto 20px auto;"></div>
          <h1 style="margin:0;color:#ffffff;font-family:'Georgia',serif;font-size:32px;font-weight:300;line-height:1.3;">Благодарим<br><em style="color:#d4a574;">за вашия интерес</em></h1>
        </td>
      </tr>
      <tr>
        <td style="background:linear-gradient(135deg,#d4a574 0%,#b8935f 100%);padding:20px 40px;text-align:center;">
          <p style="margin:0;color:#2c1810;font-family:'Georgia',serif;font-size:14px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">&#10003; Вашето запитване е получено</p>
        </td>
      </tr>
      <tr>
        <td style="padding:50px 50px 24px 50px;">
          <p style="margin:0 0 20px 0;color:#2c1810;font-family:'Georgia',serif;font-size:22px;font-weight:400;line-height:1.4;">Здравейте, <em style="color:#8b6f47;">${name}</em>,</p>
          <p style="margin:0 0 18px 0;color:#4a3d30;font-family:'Georgia',serif;font-size:16px;line-height:1.7;">Благодарим ви, че избрахте <strong>ExpaHome</strong> за вашия следващ жилищен проект. Получихме вашето запитване и сме развълнувани да обсъдим възможностите заедно с вас.</p>
          <p style="margin:0;color:#4a3d30;font-family:'Georgia',serif;font-size:16px;line-height:1.7;">Наш специалист ще се свърже с вас <strong style="color:#8b6f47;">в рамките на 24 часа</strong> с персонализирана оферта и отговори на всичките ви въпроси.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 50px;" align="center">
          <div style="display:inline-block;width:40px;height:1px;background-color:#d4a574;vertical-align:middle;"></div>
          <span style="display:inline-block;color:#d4a574;font-size:14px;margin:0 12px;vertical-align:middle;">&#10022;</span>
          <div style="display:inline-block;width:40px;height:1px;background-color:#d4a574;vertical-align:middle;"></div>
        </td>
      </tr>
      <tr>
        <td style="padding:30px 50px;">
          <div style="color:#8b6f47;font-family:'Georgia',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;text-align:center;">Резюме на запитването</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#faf7f2;border-radius:4px;"><tr><td style="padding:24px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="padding-bottom:14px;">
                <span style="color:#8b6f47;font-family:'Georgia',serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Интерес:</span><br>
                <span style="color:#2c1810;font-family:'Georgia',serif;font-size:16px;font-weight:600;">${model}</span>
              </td></tr>
              <tr><td>
                <span style="color:#8b6f47;font-family:'Georgia',serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Вашето съобщение:</span><br>
                <span style="color:#4a3d30;font-family:'Georgia',serif;font-size:14px;font-style:italic;line-height:1.6;">&ldquo;${message}&rdquo;</span>
              </td></tr>
            </table>
          </td></tr></table>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 50px 40px 50px;">
          <h2 style="margin:0 0 24px 0;color:#2c1810;font-family:'Georgia',serif;font-size:22px;font-weight:400;text-align:center;">Какво <em style="color:#8b6f47;">следва</em>?</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:12px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="50" style="vertical-align:top;"><div style="width:40px;height:40px;background-color:#2c1810;border-radius:50%;text-align:center;line-height:40px;color:#d4a574;font-family:'Georgia',serif;font-size:16px;font-weight:600;">1</div></td>
                <td style="padding-left:16px;vertical-align:top;"><div style="color:#2c1810;font-family:'Georgia',serif;font-size:16px;font-weight:600;margin-bottom:4px;">Преглед на вашето запитване</div><div style="color:#6b5d4f;font-family:'Georgia',serif;font-size:14px;line-height:1.5;">Нашият екип ще анализира детайлно вашите изисквания.</div></td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:12px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="50" style="vertical-align:top;"><div style="width:40px;height:40px;background-color:#2c1810;border-radius:50%;text-align:center;line-height:40px;color:#d4a574;font-family:'Georgia',serif;font-size:16px;font-weight:600;">2</div></td>
                <td style="padding-left:16px;vertical-align:top;"><div style="color:#2c1810;font-family:'Georgia',serif;font-size:16px;font-weight:600;margin-bottom:4px;">Персонализирана оферта</div><div style="color:#6b5d4f;font-family:'Georgia',serif;font-size:14px;line-height:1.5;">Ще получите детайлна оферта с цени, опции и срокове.</div></td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:12px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="50" style="vertical-align:top;"><div style="width:40px;height:40px;background-color:#2c1810;border-radius:50%;text-align:center;line-height:40px;color:#d4a574;font-family:'Georgia',serif;font-size:16px;font-weight:600;">3</div></td>
                <td style="padding-left:16px;vertical-align:top;"><div style="color:#2c1810;font-family:'Georgia',serif;font-size:16px;font-weight:600;margin-bottom:4px;">Консултация и реализация</div><div style="color:#6b5d4f;font-family:'Georgia',serif;font-size:14px;line-height:1.5;">Среща, уточняване на детайли и стартиране на проекта.</div></td>
              </tr></table>
            </td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 50px 40px 50px;" align="center">
          <a href="https://expahome.bg/gallery.html" style="display:inline-block;background-color:#2c1810;color:#ffffff;font-family:'Georgia',serif;font-size:14px;letter-spacing:2px;text-transform:uppercase;padding:16px 40px;text-decoration:none;border-radius:2px;">Разгледайте галерията</a>
        </td>
      </tr>
      <tr>
        <td style="background-color:#faf7f2;padding:32px 50px;border-top:1px solid #e8ddd0;">
          <p style="margin:0 0 16px 0;color:#8b6f47;font-family:'Georgia',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-align:center;">Свържете се с нас директно</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center" style="padding:4px 0;"><a href="tel:+359882541800" style="color:#2c1810;font-family:'Georgia',serif;font-size:15px;text-decoration:none;">&#128222; +359 88 254 1800</a></td></tr>
            <tr><td align="center" style="padding:4px 0;"><a href="mailto:expahometd@gmail.com" style="color:#2c1810;font-family:'Georgia',serif;font-size:15px;text-decoration:none;">&#9993; expahometd@gmail.com</a></td></tr>
            <tr><td align="center" style="padding:4px 0;color:#6b5d4f;font-family:'Georgia',serif;font-size:15px;">&#128205; България</td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#2c1810;padding:30px 50px;text-align:center;">
          <p style="margin:0 0 10px 0;color:#d4a574;font-family:'Georgia',serif;font-size:12px;letter-spacing:4px;text-transform:uppercase;">ExpaHome TD</p>
          <p style="margin:0 0 16px 0;color:#a89580;font-family:'Georgia',serif;font-size:12px;font-style:italic;line-height:1.5;">Водещ дистрибутор на разгъваеми<br>и контейнерни жилища в България</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:8px auto 16px auto;"><tr>
            <td style="padding:0 8px;"><a href="https://www.facebook.com/profile.php?id=61585640309355" style="color:#d4a574;text-decoration:none;font-family:'Georgia',serif;font-size:14px;">Facebook</a></td>
            <td style="color:#8b6f47;">&#183;</td>
            <td style="padding:0 8px;"><a href="https://instagram.com/expahome" style="color:#d4a574;text-decoration:none;font-family:'Georgia',serif;font-size:14px;">Instagram</a></td>
            <td style="color:#8b6f47;">&#183;</td>
            <td style="padding:0 8px;"><a href="https://youtube.com/@expahome" style="color:#d4a574;text-decoration:none;font-family:'Georgia',serif;font-size:14px;">YouTube</a></td>
          </tr></table>
          <p style="margin:16px 0 0 0;color:#6b5d4f;font-family:'Georgia',serif;font-size:11px;">&#169; 2026 ExpaHome. Всички права запазени.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
