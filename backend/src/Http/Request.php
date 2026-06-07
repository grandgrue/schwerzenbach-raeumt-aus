<?php

declare(strict_types=1);

namespace App\Http;

/**
 * Kapselt die eingehende HTTP-Anfrage (Methode, Pfad, Query, JSON-Body, Header).
 */
final class Request
{
    /** @var array<string,mixed> */
    private array $body;

    /**
     * @param array<string,string> $query
     * @param array<string,mixed>  $body
     */
    public function __construct(
        public readonly string $method,
        public readonly string $path,
        private readonly array $query,
        array $body,
        private readonly string $clientIp,
    ) {
        $this->body = $body;
    }

    public static function fromGlobals(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        // Optionalen /api-Präfix entfernen (Produktion: .htaccess leitet /api/* hierher).
        if (str_starts_with($path, '/api/')) {
            $path = substr($path, 4);
        } elseif ($path === '/api') {
            $path = '/';
        }
        $path = '/' . trim($path, '/');

        $raw = file_get_contents('php://input') ?: '';
        $body = [];
        if ($raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $body = $decoded;
            }
        }
        if ($body === [] && !empty($_POST)) {
            $body = $_POST;
        }

        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        /** @var array<string,string> $query */
        $query = $_GET;

        return new self($method, $path, $query, $body, $ip);
    }

    public function query(string $key, ?string $default = null): ?string
    {
        $value = $this->query[$key] ?? null;
        return is_string($value) ? $value : $default;
    }

    public function queryBool(string $key): bool
    {
        $value = $this->query[$key] ?? null;
        return $value === '1' || $value === 'true';
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    /** @return array<string,mixed> */
    public function all(): array
    {
        return $this->body;
    }

    public function header(string $name): ?string
    {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        $value = $_SERVER[$key] ?? null;
        return is_string($value) ? $value : null;
    }

    public function clientIp(): string
    {
        return $this->clientIp;
    }
}
