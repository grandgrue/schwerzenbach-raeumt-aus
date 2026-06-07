<?php

declare(strict_types=1);

namespace App\Service;

use App\Config;
use PHPMailer\PHPMailer\PHPMailer;

/**
 * Versendet E-Mails. Transport per MAIL_TRANSPORT:
 *   - log  : schreibt die Nachricht nur ins Log (Dev)
 *   - mail : PHP mail() bzw. PHPMailer, falls installiert
 *   - smtp : PHPMailer über SMTP (PHPMailer erforderlich)
 */
final class Mailer
{
    public function send(string $toEmail, string $subject, string $textBody): bool
    {
        $transport = Config::get('MAIL_TRANSPORT', 'log');
        $fromEmail = Config::get('MAIL_FROM', 'noreply@schwerzenbach-raeumt-aus.ch');
        $fromName  = Config::get('MAIL_FROM_NAME', 'Schwerzenbach räumt aus');

        if ($transport === 'log') {
            error_log("[MAIL:log] An: {$toEmail} | Betreff: {$subject}\n{$textBody}");
            return true;
        }

        if (class_exists(PHPMailer::class)) {
            return $this->sendWithPhpMailer($transport, $toEmail, $subject, $textBody, (string) $fromEmail, (string) $fromName);
        }

        // Fallback: einfaches PHP mail()
        $headers = 'From: ' . sprintf('%s <%s>', $fromName, $fromEmail) . "\r\n"
                 . "Content-Type: text/plain; charset=utf-8\r\n";
        return mail($toEmail, $subject, $textBody, $headers);
    }

    private function sendWithPhpMailer(
        ?string $transport,
        string $to,
        string $subject,
        string $body,
        string $fromEmail,
        string $fromName
    ): bool {
        try {
            $mail = new PHPMailer(true);
            if ($transport === 'smtp') {
                $mail->isSMTP();
                $mail->Host = (string) Config::get('SMTP_HOST', '');
                $mail->Port = Config::int('SMTP_PORT', 587);
                $mail->SMTPAuth = true;
                $mail->Username = (string) Config::get('SMTP_USER', '');
                $mail->Password = (string) Config::get('SMTP_PASS', '');
                $secure = Config::get('SMTP_SECURE', 'tls');
                if ($secure) {
                    $mail->SMTPSecure = $secure;
                }
            }
            $mail->CharSet = 'UTF-8';
            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($to);
            $mail->Subject = $subject;
            $mail->Body = $body;
            return $mail->send();
        } catch (\Throwable $e) {
            error_log('[MAIL:error] ' . $e->getMessage());
            return false;
        }
    }
}
