<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Erzeugung und Hashing des geheimen Bearbeitungs-Tokens (Capability-URL).
 */
final class Token
{
    /** Erzeugt einen neuen, kryptografisch zufälligen Token (Rohwert). */
    public static function generate(): string
    {
        return bin2hex(random_bytes(32));
    }

    /** Liefert den in der DB gespeicherten Hash eines Tokens. */
    public static function hash(string $token): string
    {
        return hash('sha256', $token);
    }
}
