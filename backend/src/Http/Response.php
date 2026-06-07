<?php

declare(strict_types=1);

namespace App\Http;

/**
 * Hilfsfunktionen zum Senden von JSON-Antworten.
 */
final class Response
{
    public static function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * @param array<string,string> $fields Feldbezogene Validierungsfehler
     */
    public static function error(string $code, string $message, int $status, array $fields = []): void
    {
        $error = ['code' => $code, 'message' => $message];
        if ($fields !== []) {
            $error['fields'] = $fields;
        }
        self::json(['error' => $error], $status);
    }

    public static function noContent(): void
    {
        http_response_code(204);
    }
}
