<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Hilfsfunktionen für die Liste der Organisator-E-Mail-Adressen
 * (gespeichert als Freitext: eine Adresse pro Zeile oder per Komma getrennt).
 */
final class OrganizerEmails
{
    /**
     * Zerlegt den Freitext in eine bereinigte Liste eindeutiger Adressen.
     *
     * @return string[]
     */
    public static function parse(?string $raw): array
    {
        if ($raw === null || trim($raw) === '') {
            return [];
        }
        $parts = preg_split('/[\r\n,;]+/', $raw) ?: [];
        $emails = [];
        foreach ($parts as $part) {
            $email = trim($part);
            if ($email !== '') {
                // dedupliziert case-insensitive; erste Schreibweise gewinnt
                $emails[strtolower($email)] ??= $email;
            }
        }
        return array_values($emails);
    }

    /**
     * Liefert die ungültigen Adressen aus dem Freitext (leer = alle gültig).
     *
     * @return string[]
     */
    public static function invalid(?string $raw): array
    {
        return array_values(array_filter(
            self::parse($raw),
            static fn (string $email) => !filter_var($email, FILTER_VALIDATE_EMAIL),
        ));
    }
}
