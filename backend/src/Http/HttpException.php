<?php

declare(strict_types=1);

namespace App\Http;

use RuntimeException;

/**
 * Fehler, der direkt in eine JSON-Fehlerantwort übersetzt wird.
 */
final class HttpException extends RuntimeException
{
    /** @param array<string,string> $fields */
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message,
        public readonly array $fields = [],
    ) {
        parent::__construct($message);
    }

    public static function notFound(string $message = 'Nicht gefunden'): self
    {
        return new self(404, 'not_found', $message);
    }

    public static function badRequest(string $message, array $fields = []): self
    {
        return new self(422, 'validation_error', $message, $fields);
    }

    public static function unauthorized(string $message = 'Nicht angemeldet'): self
    {
        return new self(401, 'unauthorized', $message);
    }

    public static function forbidden(string $message = 'Nicht erlaubt'): self
    {
        return new self(403, 'forbidden', $message);
    }
}
