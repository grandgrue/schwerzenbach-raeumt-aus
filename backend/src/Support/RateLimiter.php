<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Einfache datei-basierte Rate-Limitierung pro IP (gleitendes Stundenfenster).
 * Keine externe Abhängigkeit; nutzt das temporäre Verzeichnis.
 */
final class RateLimiter
{
    private const WINDOW_SECONDS = 3600;

    public function __construct(
        private readonly int $maxPerWindow,
        private readonly string $dir = '',
    ) {
    }

    private function dir(): string
    {
        $dir = $this->dir !== '' ? $this->dir : sys_get_temp_dir() . '/srau-ratelimit';
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
        return $dir;
    }

    /** true, wenn die Anfrage erlaubt ist (und zählt sie); false bei Überschreitung. */
    public function allow(string $key): bool
    {
        $file = $this->dir() . '/' . hash('sha256', $key) . '.json';
        $now = time();

        $timestamps = [];
        if (is_file($file)) {
            $decoded = json_decode((string) file_get_contents($file), true);
            if (is_array($decoded)) {
                $timestamps = array_filter(
                    array_map('intval', $decoded),
                    static fn (int $t) => $t > $now - self::WINDOW_SECONDS
                );
            }
        }

        if (count($timestamps) >= $this->maxPerWindow) {
            return false;
        }

        $timestamps[] = $now;
        @file_put_contents($file, json_encode(array_values($timestamps)), LOCK_EX);
        return true;
    }
}
