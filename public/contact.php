<?php
/**
 * Contact form endpoint for raymarkguevarra.com (Hostinger web hosting).
 *
 * Receives the site's contact form as JSON and emails it to the site owner.
 * No API keys or tokens are involved, and nothing is stored except a short
 * per-visitor rate-limit counter in the server's temp folder.
 *
 * Settings: change TO_EMAIL / FROM_EMAIL below if needed. FROM_EMAIL should be
 * an address on this domain (create it in hPanel > Emails) so mail isn't
 * rejected or marked as spam. Replies go to the visitor via Reply-To.
 */

const TO_EMAIL   = 'markguevarra0530@gmail.com';
const FROM_EMAIL = 'no-reply@raymarkguevarra.com';
const FROM_NAME  = 'raymarkguevarra.com contact form';
const ALLOWED_ORIGINS = ['https://raymarkguevarra.com', 'https://www.raymarkguevarra.com'];
const MAX_PER_HOUR = 5;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

// Only POST requests.
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method']);
}

// Only accept submissions from the site itself.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, ALLOWED_ORIGINS, true)) {
    respond(403, ['ok' => false, 'error' => 'origin']);
}

// Read JSON body (max 20 KB).
$raw = file_get_contents('php://input', false, null, 0, 20480);
$data = json_decode($raw === false ? '' : $raw, true);
if (!is_array($data)) {
    respond(400, ['ok' => false, 'error' => 'invalid']);
}

// Hidden spam trap: real visitors never fill this field. Pretend success for bots.
if (!empty($data['company'])) {
    respond(200, ['ok' => true]);
}

// Remove line breaks (prevents email header injection) and trim.
function one_line($value, int $max): string
{
    $value = is_string($value) ? $value : '';
    $value = trim(preg_replace('/[\r\n\t]+/', ' ', $value));
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

$name    = one_line($data['name'] ?? '', 100);
$email   = one_line($data['email'] ?? '', 254);
$message = is_string($data['message'] ?? null) ? trim($data['message']) : '';

$messageLength = function_exists('mb_strlen') ? mb_strlen($message) : strlen($message);
if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $messageLength > 5000) {
    respond(422, ['ok' => false, 'error' => 'validation']);
}

// Rate limit: at most MAX_PER_HOUR messages per visitor IP per hour.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$bucket = rtrim(sys_get_temp_dir(), '/\\') . '/rmg_contact_' . hash('sha256', $ip) . '.json';
$now = time();
$times = [];
if (is_readable($bucket)) {
    $saved = json_decode((string) @file_get_contents($bucket), true);
    if (is_array($saved)) {
        $times = array_values(array_filter($saved, function ($t) use ($now) {
            return is_int($t) && $t > $now - 3600;
        }));
    }
}
if (count($times) >= MAX_PER_HOUR) {
    respond(429, ['ok' => false, 'error' => 'rate']);
}

// Build and send the email.
$subject = 'Portfolio contact: ' . $name;
$body = "New message from the contact form on raymarkguevarra.com\n\n"
    . "Name: {$name}\n"
    . "Email: {$email}\n"
    . 'Sent: ' . gmdate('Y-m-d H:i') . " UTC\n\n"
    . "Message:\n{$message}\n";

// Letters, numbers, spaces and . ' - only, so the name can't break the header.
$headerName = trim((string) preg_replace("/[^\\p{L}\\p{N} .'-]/u", '', $name));

$headers = [
    'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . ($headerName !== '' ? $headerName . ' ' : '') . '<' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];

$sent = mail(
    TO_EMAIL,
    '=?UTF-8?B?' . base64_encode($subject) . '?=',
    $body,
    implode("\r\n", $headers),
    '-f' . FROM_EMAIL
);

if (!$sent) {
    respond(502, ['ok' => false, 'error' => 'send']);
}

$times[] = $now;
@file_put_contents($bucket, json_encode($times), LOCK_EX);

respond(200, ['ok' => true]);
