<?php

declare(strict_types=1);

namespace App;

/**
 * Lädt die Konfiguration aus config/.env (einfacher Parser, ohne externe
 * Abhängigkeit) und stellt typisierte Getter bereit.
 */
final class Config
{
    /** @var array<string,string> */
    private static array $values = [];
    private static bool $loaded = false;

    public static function load(string $envPath): void
    {
        self::$values = [];
        if (is_file($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines ?: [] as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#')) {
                    continue;
                }
                $pos = strpos($line, '=');
                if ($pos === false) {
                    continue;
                }
                $key = trim(substr($line, 0, $pos));
                $value = trim(substr($line, $pos + 1));
                // Inline-Kommentare und umschließende Anführungszeichen entfernen
                $value = preg_replace('/\s+#.*$/', '', $value) ?? $value;
                $value = trim($value);
                if (strlen($value) >= 2
                    && ($value[0] === '"' || $value[0] === "'")
                    && $value[-1] === $value[0]) {
                    $value = substr($value, 1, -1);
                }
                self::$values[$key] = $value;
            }
        }
        self::$loaded = true;
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        if (!self::$loaded) {
            return $default;
        }
        $value = self::$values[$key] ?? null;
        return ($value === null || $value === '') ? $default : $value;
    }

    public static function int(string $key, int $default = 0): int
    {
        $value = self::get($key);
        return $value === null ? $default : (int) $value;
    }

    public static function isProd(): bool
    {
        return self::get('APP_ENV', 'prod') === 'prod';
    }
}
