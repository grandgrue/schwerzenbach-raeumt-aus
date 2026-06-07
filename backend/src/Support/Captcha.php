<?php

declare(strict_types=1);

namespace App\Support;

use App\Config;

/**
 * Zustandslose Rechen-Captcha: Das Backend liefert eine Frage und ein
 * signiertes Token (HMAC). Beim Absenden wird die Antwort gegen das Token
 * geprüft – ganz ohne Server-Session oder externen Dienst.
 */
final class Captcha
{
    private const TTL_SECONDS = 600; // 10 Minuten

    /** @return array{question:string,token:string} */
    public static function challenge(): array
    {
        $a = random_int(1, 9);
        $b = random_int(1, 9);
        $answer = $a + $b;
        $expires = time() + self::TTL_SECONDS;
        $token = $expires . '.' . self::sign($expires, $answer);

        return [
            'question' => "Wie viel ist {$a} + {$b}?",
            'token'    => $token,
        ];
    }

    public static function verify(?string $token, mixed $answer): bool
    {
        if (!is_string($token) || !str_contains($token, '.')) {
            return false;
        }
        [$expires, $signature] = explode('.', $token, 2);
        if (!ctype_digit($expires) || (int) $expires < time()) {
            return false;
        }
        if (!is_numeric($answer)) {
            return false;
        }
        $expected = self::sign((int) $expires, (int) $answer);
        return hash_equals($expected, $signature);
    }

    private static function sign(int $expires, int $answer): string
    {
        $secret = Config::get('APP_SECRET', 'insecure-dev-secret') ?? 'insecure-dev-secret';
        return hash_hmac('sha256', $expires . '|' . $answer, $secret);
    }
}
