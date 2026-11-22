<?php
/**
 * Contact form endpoint for raymarkguevarra.com (Hostinger web hosting).
 *
 * Receives the site's contact form as JSON and emails it to the site owner.
 * Nothing is stored except a short per-visitor rate-limit counter in the
 * server's temp folder.
 *
 * Sending: through Hostinger's SMTP server as FROM_EMAIL (a real mailbox in
 * hPanel > Emails), using the password in ../smtp-config.php (outside
 * public_html, see load_smtp_config). Without that file it falls back to PHP
 * mail(). Replies go to the visitor via Reply-To.
 */

const TO_EMAIL   = 'markguevarra0530@gmail.com';
const FROM_EMAIL = 'no-reply@raymarkguevarra.com';
const FROM_NAME  = 'raymarkguevarra.com contact form';
const ALLOWED_ORIGINS = ['https://raymarkguevarra.com', 'https://www.raymarkguevarra.com'];
const MAX_PER_HOUR = 5;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

/** Writes a line to ../contact-errors.log (outside public_html). Never pass secrets to this. */
function log_error(string $message): void
{
    @error_log(gmdate('Y-m-d H:i:s') . ' UTC ' . $message . "\n", 3, dirname(__DIR__) . '/contact-errors.log');
}

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

/**
 * SMTP settings live in smtp-config.php one folder ABOVE public_html, so they
 * can never be downloaded from the website. Expected content:
 *   <?php return ['host' => 'smtp.hostinger.com', 'port' => 465,
 *                 'user' => 'no-reply@raymarkguevarra.com', 'pass' => '...'];
 * Returns null (use the mail() fallback) until a real password is filled in.
 */
function load_smtp_config(): ?array
{
    $file = dirname(__DIR__) . '/smtp-config.php';
    if (!is_readable($file)) {
        return null;
    }
    $c = include $file;
    if (!is_array($c) || empty($c['pass']) || $c['pass'] === 'PASTE_MAILBOX_PASSWORD_HERE') {
        return null;
    }
    return [
        'host' => (string) ($c['host'] ?? 'smtp.hostinger.com'),
        'port' => (int) ($c['port'] ?? 465),
        'user' => (string) ($c['user'] ?? FROM_EMAIL),
        'pass' => (string) $c['pass'],
    ];
}

/** Sends one plain-text email over SMTP with SSL and AUTH LOGIN. Logs the failing step (never the password). */
function smtp_send(array $c, string $to, string $subject, string $replyTo, string $body): bool
{
    $errno = 0;
    $errstr = '';
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
    $fp = @stream_socket_client('ssl://' . $c['host'] . ':' . $c['port'], $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) {
        log_error("SMTP connect to {$c['host']}:{$c['port']} failed: {$errno} {$errstr}");
        return false;
    }
    stream_set_timeout($fp, 15);

    $read = function () use ($fp): string {
        $data = '';
        while (($line = fgets($fp, 515)) !== false) {
            $data .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break; // last line of a (possibly multi-line) reply
            }
        }
        return $data;
    };
    $cmd = function (?string $line, array $okCodes, string $step) use ($fp, $read): bool {
        if ($line !== null) {
            fwrite($fp, $line . "\r\n");
        }
        $resp = $read();
        if (!in_array((int) substr($resp, 0, 3), $okCodes, true)) {
            log_error("SMTP {$step} failed: " . (trim($resp) === '' ? '(no reply / timeout)' : trim($resp)));
            return false;
        }
        return true;
    };

    $domain = substr((string) strrchr($c['user'], '@'), 1);
    $message = 'Date: ' . date('r') . "\r\n"
        . 'From: ' . FROM_NAME . ' <' . $c['user'] . ">\r\n"
        . 'To: <' . $to . ">\r\n"
        . 'Reply-To: ' . $replyTo . "\r\n"
        . 'Subject: ' . $subject . "\r\n"
        . 'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $domain . ">\r\n"
        . "MIME-Version: 1.0\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n\r\n"
        // Base64 lines never start with ".", so no SMTP dot-stuffing is needed.
        . rtrim(chunk_split(base64_encode($body), 76, "\r\n")) . "\r\n";

    $ok = $cmd(null, [220], 'greeting');
    if ($ok) {
        fwrite($fp, 'EHLO ' . $domain . "\r\n");
        $ehlo = $read();
        $ok = (int) substr($ehlo, 0, 3) === 250;
        if (!$ok) {
            log_error('SMTP EHLO failed: ' . trim($ehlo));
        }
    }
    if ($ok) {
        // Try AUTH PLAIN first, then AUTH LOGIN; log the offered methods if both fail.
        $ok = $cmd('AUTH PLAIN ' . base64_encode("\0" . $c['user'] . "\0" . $c['pass']), [235], 'AUTH PLAIN');
        if (!$ok) {
            $ok = $cmd('AUTH LOGIN', [334], 'AUTH LOGIN')
                && $cmd(base64_encode($c['user']), [334], 'AUTH LOGIN user')
                && $cmd(base64_encode($c['pass']), [235], 'AUTH LOGIN password');
        }
        if (!$ok) {
            preg_match('/^250[ -]AUTH[ =](.*)$/mi', $ehlo, $m);
            log_error('SMTP login refused for ' . $c['user'] . ' (password length ' . strlen($c['pass'])
                . '). Server auth methods: ' . (isset($m[1]) ? trim($m[1]) : 'not listed'));
        }
    }
    $ok = $ok
        && $cmd('MAIL FROM:<' . $c['user'] . '>', [250], 'MAIL FROM')
        && $cmd('RCPT TO:<' . $to . '>', [250, 251], 'RCPT TO')
        && $cmd('DATA', [354], 'DATA')
        && $cmd($message . '.', [250], 'message');

    @fwrite($fp, "QUIT\r\n");
    fclose($fp);
    return $ok;
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

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$replyTo = ($headerName !== '' ? $headerName . ' ' : '') . '<' . $email . '>';

$smtp = load_smtp_config();
if ($smtp === null) {
    log_error('SMTP settings not found or no password in ../smtp-config.php; using mail() fallback');
}
if ($smtp !== null) {
    // Preferred: authenticated SMTP through Hostinger's mail server.
    $sent = smtp_send($smtp, TO_EMAIL, $encodedSubject, $replyTo, $body);
} else {
    // Fallback while the SMTP password hasn't been set up.
    $headers = [
        'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
        'Reply-To: ' . $replyTo,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    $sent = mail(TO_EMAIL, $encodedSubject, $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);
}

if (!$sent) {
    log_error($smtp !== null ? 'Message not sent (SMTP)' : 'Message not sent (mail() returned false)');
    respond(502, ['ok' => false, 'error' => 'send']);
}

$times[] = $now;
@file_put_contents($bucket, json_encode($times), LOCK_EX);

respond(200, ['ok' => true]);
