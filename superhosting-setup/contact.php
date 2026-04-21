<?php
/**
 * ============================================================
 *  ExpaHome — Contact Form Handler (PHP for SuperHosting.bg)
 *  Uses Resend API to send inquiry + auto-reply emails
 * ============================================================
 *
 *  DEPLOYMENT:
 *  1. Upload this file as /contact.php in your public_html/ folder
 *  2. Edit the CONFIG section below with your Resend API key
 *  3. Make sure PHP 7.4+ is enabled in cPanel → PHP Manager
 *  4. Make sure the cURL module is enabled (default on SuperHosting)
 * ============================================================
 */

// ============================================================
//  CONFIG — edit these values
// ============================================================
$RESEND_API_KEY   = 'YOUR_RESEND_API_KEY_HERE'; // Paste your re_... key
$TO_EMAIL         = 'info@expahome.bg';          // Cloudflare Email Routing forwards this to your Gmail
$FROM_ADDRESS     = 'ExpaHome <noreply@expahome.bg>'; // Requires domain verified in Resend dashboard
$GALLERY_URL      = 'https://expahome.bg/gallery.html';

// ============================================================
//  CORS + headers
// ============================================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://expahome.bg');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// ============================================================
//  Read and parse input (supports both JSON and form-encoded)
// ============================================================
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== false) {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
} else {
    $input = $_POST;
}

$name     = trim($input['name']     ?? '');
$email    = trim($input['email']    ?? '');
$phone    = trim($input['phone']    ?? '');
$model    = trim($input['model']    ?? '');
$message  = trim($input['message']  ?? '');
$honeypot = trim($input['honeypot'] ?? '');

// ============================================================
//  Honeypot spam protection
// ============================================================
if (!empty($honeypot)) {
    // Silently "succeed" for bots — they never know they were blocked
    echo json_encode(['success' => true]);
    exit;
}

// ============================================================
//  Validation
// ============================================================
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error'   => 'Моля, попълнете всички задължителни полета.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error'   => 'Моля, въведете валиден имейл адрес.'
    ]);
    exit;
}

// ============================================================
//  Sanitize inputs (XSS prevention + length limits)
// ============================================================
function clean_input($str, $maxLen = 2000) {
    $str = str_replace(['<', '>'], '', $str);
    return mb_substr(trim($str), 0, $maxLen);
}

$safeName    = clean_input($name, 200);
$safeEmail   = clean_input($email, 200);
$safePhone   = clean_input($phone, 50) ?: 'Не е посочен';
$safeModel   = clean_input($model, 200) ?: 'Не е избран';
$safeMessage = clean_input($message, 2000);

// ============================================================
//  Send both emails via Resend
// ============================================================
$inquiryHtml  = buildInquiryEmail($safeName, $safeEmail, $safePhone, $safeModel, $safeMessage);
$autoReplyHtml = buildAutoReplyEmail($safeName, $safeModel, $safeMessage, $GALLERY_URL);

// Email 1: Notification to ExpaHome
$inquiryResult = sendEmail($RESEND_API_KEY, [
    'from'     => $FROM_ADDRESS,
    'to'       => [$TO_EMAIL],
    'reply_to' => $safeEmail,
    'subject'  => "🏠 Ново запитване от $safeName — $safeModel",
    'html'     => $inquiryHtml
]);

if (!$inquiryResult['success']) {
    error_log('Resend inquiry error: ' . $inquiryResult['error']);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Възникна грешка при изпращането. Моля, опитайте отново или се свържете с нас на ' . $TO_EMAIL
    ]);
    exit;
}

// Email 2: Auto-reply to customer (don't fail whole request if this fails)
$autoReplyResult = sendEmail($RESEND_API_KEY, [
    'from'     => $FROM_ADDRESS,
    'to'       => [$safeEmail],
    'reply_to' => $TO_EMAIL,
    'subject'  => 'Благодарим за вашето запитване — ExpaHome',
    'html'     => $autoReplyHtml
]);

if (!$autoReplyResult['success']) {
    error_log('Resend auto-reply error: ' . $autoReplyResult['error']);
}

// Success
echo json_encode(['success' => true]);
exit;


// ============================================================
//  Helper: Send email via Resend REST API using cURL
// ============================================================
function sendEmail($apiKey, $payload) {
    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ],
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => true
    ]);

    $response   = curl_exec($ch);
    $httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError  = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        return ['success' => false, 'error' => 'cURL error: ' . $curlError];
    }
    if ($httpCode >= 200 && $httpCode < 300) {
        return ['success' => true, 'response' => $response];
    }
    return ['success' => false, 'error' => "HTTP $httpCode: $response"];
}


// ============================================================
//  EMAIL TEMPLATE: Inquiry notification (team)
// ============================================================
function buildInquiryEmail($name, $email, $phone, $model, $message) {
    // Escape for HTML
    $n = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $e = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $p = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
    $mdl = htmlspecialchars($model, ENT_QUOTES, 'UTF-8');
    $msg = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    // Preserve line breaks in message
    $msg = nl2br($msg);

    return <<<HTML
<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ново запитване — ExpaHome</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f1ea;font-family:'Georgia','Times New Roman',serif;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f5f1ea;opacity:0;">Ново запитване от $n — $mdl</div>
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
          <span style="color:#2c1810;font-family:'Georgia',serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">⏱ Отговорете в рамките на 24 часа</span>
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
                <td width="140" style="color:#8b6f47;font-family:'Georgia',serif;font-size:13px;vertical-align:top;padding-right:10px;"><span style="margin-right:8px;">👤</span>Име</td>
                <td style="color:#2c1810;font-family:'Georgia',serif;font-size:16px;font-weight:600;">$n</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #f0e8dc;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="140" style="color:#8b6f47;font-family:'Georgia',serif;font-size:13px;vertical-align:top;padding-right:10px;"><span style="margin-right:8px;">✉</span>Имейл</td>
                <td style="font-family:'Georgia',serif;font-size:15px;"><a href="mailto:$e" style="color:#8b6f47;text-decoration:none;border-bottom:1px solid #d4a574;">$e</a></td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #f0e8dc;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="140" style="color:#8b6f47;font-family:'Georgia',serif;font-size:13px;vertical-align:top;padding-right:10px;"><span style="margin-right:8px;">📞</span>Телефон</td>
                <td style="font-family:'Georgia',serif;font-size:15px;"><a href="tel:$p" style="color:#8b6f47;text-decoration:none;border-bottom:1px solid #d4a574;">$p</a></td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:12px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="140" style="color:#8b6f47;font-family:'Georgia',serif;font-size:13px;vertical-align:top;padding-right:10px;"><span style="margin-right:8px;">🏠</span>Модел</td>
                <td><span style="display:inline-block;background-color:#f5f1ea;color:#2c1810;font-family:'Georgia',serif;font-size:14px;font-weight:600;padding:6px 14px;border-radius:3px;border:1px solid #d4a574;">$mdl</span></td>
              </tr></table>
            </td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 40px 30px 40px;">
          <div style="color:#8b6f47;font-family:'Georgia',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">Съобщение</div>
          <div style="background-color:#faf7f2;border-left:3px solid #d4a574;padding:20px 24px;border-radius:2px;">
            <p style="margin:0;color:#3d2e1f;font-family:'Georgia',serif;font-size:15px;line-height:1.7;font-style:italic;">"$msg"</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 40px 40px 40px;" align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right:10px;">
              <a href="mailto:$e?subject=Re: Вашето запитване към ExpaHome" style="display:inline-block;background-color:#2c1810;color:#ffffff;font-family:'Georgia',serif;font-size:14px;letter-spacing:1px;text-transform:uppercase;padding:14px 28px;text-decoration:none;border-radius:2px;">✉ Отговорете</a>
            </td>
            <td style="padding-left:10px;">
              <a href="tel:$p" style="display:inline-block;background-color:#ffffff;color:#2c1810;font-family:'Georgia',serif;font-size:14px;letter-spacing:1px;text-transform:uppercase;padding:13px 28px;text-decoration:none;border-radius:2px;border:1px solid #2c1810;">📞 Обадете се</a>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#faf7f2;padding:24px 40px;border-top:1px solid #e8ddd0;text-align:center;">
          <p style="margin:0 0 6px 0;color:#8b6f47;font-family:'Georgia',serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;">ExpaHome TD</p>
          <p style="margin:0;color:#a89580;font-family:'Georgia',serif;font-size:12px;font-style:italic;">Автоматично съобщение от формата за контакт</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>
HTML;
}


// ============================================================
//  EMAIL TEMPLATE: Customer auto-reply
// ============================================================
function buildAutoReplyEmail($name, $model, $message, $galleryUrl) {
    $n = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $mdl = htmlspecialchars($model, ENT_QUOTES, 'UTF-8');
    $msg = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
    $url = htmlspecialchars($galleryUrl, ENT_QUOTES, 'UTF-8');

    // 3-step timeline
    $steps = [
        ['Преглед на вашето запитване', 'Нашият екип ще анализира детайлно вашите изисквания.'],
        ['Персонализирана оферта', 'Ще получите детайлна оферта с цени, опции и срокове.'],
        ['Консултация и реализация', 'Среща, уточняване на детайли и стартиране на проекта.']
    ];

    $stepsHtml = '';
    foreach ($steps as $i => [$title, $desc]) {
        $num = $i + 1;
        $stepsHtml .= <<<STEP
            <tr><td style="padding:12px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="50" style="vertical-align:top;">
                  <div style="width:40px;height:40px;background-color:#2c1810;border-radius:50%;text-align:center;line-height:40px;color:#d4a574;font-family:'Georgia',serif;font-size:16px;font-weight:600;">$num</div>
                </td>
                <td style="padding-left:16px;vertical-align:top;">
                  <div style="color:#2c1810;font-family:'Georgia',serif;font-size:16px;font-weight:600;margin-bottom:4px;">$title</div>
                  <div style="color:#6b5d4f;font-family:'Georgia',serif;font-size:14px;line-height:1.5;">$desc</div>
                </td>
              </tr></table>
            </td></tr>
STEP;
    }

    return <<<HTML
<!DOCTYPE html>
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
          <p style="margin:0;color:#2c1810;font-family:'Georgia',serif;font-size:14px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">✓ Вашето запитване е получено</p>
        </td>
      </tr>
      <tr>
        <td style="padding:50px 50px 24px 50px;">
          <p style="margin:0 0 20px 0;color:#2c1810;font-family:'Georgia',serif;font-size:22px;font-weight:400;line-height:1.4;">Здравейте, <em style="color:#8b6f47;">$n</em>,</p>
          <p style="margin:0 0 18px 0;color:#4a3d30;font-family:'Georgia',serif;font-size:16px;line-height:1.7;">Благодарим ви, че избрахте <strong>ExpaHome</strong> за вашия следващ жилищен проект. Получихме вашето запитване и сме развълнувани да обсъдим възможностите заедно с вас.</p>
          <p style="margin:0;color:#4a3d30;font-family:'Georgia',serif;font-size:16px;line-height:1.7;">Наш специалист ще се свърже с вас <strong style="color:#8b6f47;">в рамките на 24 часа</strong> с персонализирана оферта и отговори на всичките ви въпроси.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 50px;" align="center">
          <div style="display:inline-block;width:40px;height:1px;background-color:#d4a574;vertical-align:middle;"></div>
          <span style="display:inline-block;color:#d4a574;font-size:14px;margin:0 12px;vertical-align:middle;">✦</span>
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
                <span style="color:#2c1810;font-family:'Georgia',serif;font-size:16px;font-weight:600;">$mdl</span>
              </td></tr>
              <tr><td>
                <span style="color:#8b6f47;font-family:'Georgia',serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Вашето съобщение:</span><br>
                <span style="color:#4a3d30;font-family:'Georgia',serif;font-size:14px;font-style:italic;line-height:1.6;">"$msg"</span>
              </td></tr>
            </table>
          </td></tr></table>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 50px 40px 50px;">
          <h2 style="margin:0 0 24px 0;color:#2c1810;font-family:'Georgia',serif;font-size:22px;font-weight:400;text-align:center;">Какво <em style="color:#8b6f47;">следва</em>?</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            $stepsHtml
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 50px 40px 50px;" align="center">
          <a href="$url" style="display:inline-block;background-color:#2c1810;color:#ffffff;font-family:'Georgia',serif;font-size:14px;letter-spacing:2px;text-transform:uppercase;padding:16px 40px;text-decoration:none;border-radius:2px;">Разгледайте галерията</a>
        </td>
      </tr>
      <tr>
        <td style="background-color:#faf7f2;padding:32px 50px;border-top:1px solid #e8ddd0;">
          <p style="margin:0 0 16px 0;color:#8b6f47;font-family:'Georgia',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-align:center;">Свържете се с нас директно</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center" style="padding:4px 0;"><a href="tel:+359882541800" style="color:#2c1810;font-family:'Georgia',serif;font-size:15px;text-decoration:none;">📞 +359 88 254 1800</a></td></tr>
            <tr><td align="center" style="padding:4px 0;"><a href="mailto:info@expahome.bg" style="color:#2c1810;font-family:'Georgia',serif;font-size:15px;text-decoration:none;">✉ info@expahome.bg</a></td></tr>
            <tr><td align="center" style="padding:4px 0;color:#6b5d4f;font-family:'Georgia',serif;font-size:15px;">📍 България</td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#2c1810;padding:30px 50px;text-align:center;">
          <p style="margin:0 0 10px 0;color:#d4a574;font-family:'Georgia',serif;font-size:12px;letter-spacing:4px;text-transform:uppercase;">ExpaHome TD</p>
          <p style="margin:0 0 16px 0;color:#a89580;font-family:'Georgia',serif;font-size:12px;font-style:italic;line-height:1.5;">Водещ дистрибутор на разгъваеми<br>и контейнерни жилища в България</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:8px auto 16px auto;"><tr>
            <td style="padding:0 8px;"><a href="https://www.facebook.com/profile.php?id=61585640309355" style="color:#d4a574;text-decoration:none;font-family:'Georgia',serif;font-size:14px;">Facebook</a></td>
            <td style="color:#8b6f47;">·</td>
            <td style="padding:0 8px;"><a href="https://instagram.com/expahome" style="color:#d4a574;text-decoration:none;font-family:'Georgia',serif;font-size:14px;">Instagram</a></td>
            <td style="color:#8b6f47;">·</td>
            <td style="padding:0 8px;"><a href="https://youtube.com/@expahome" style="color:#d4a574;text-decoration:none;font-family:'Georgia',serif;font-size:14px;">YouTube</a></td>
          </tr></table>
          <p style="margin:16px 0 0 0;color:#6b5d4f;font-family:'Georgia',serif;font-size:11px;">© 2026 ExpaHome. Всички права запазени.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>
HTML;
}