<?php

declare(strict_types=1);

namespace App\Support;

use App\Http\HttpException;

/**
 * Schlanke Eingabe-Validierung, die feldbezogene Fehler sammelt.
 */
final class Validator
{
    /** @var array<string,string> */
    private array $errors = [];

    public function required(string $field, mixed $value, string $message = 'Pflichtfeld'): self
    {
        if ($value === null || (is_string($value) && trim($value) === '')
            || (is_array($value) && $value === [])) {
            $this->add($field, $message);
        }
        return $this;
    }

    public function maxLength(string $field, mixed $value, int $max): self
    {
        if (is_string($value) && mb_strlen($value) > $max) {
            $this->add($field, "Höchstens {$max} Zeichen");
        }
        return $this;
    }

    public function email(string $field, mixed $value): self
    {
        if (is_string($value) && $value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->add($field, 'Keine gültige E-Mail-Adresse');
        }
        return $this;
    }

    public function latitude(string $field, mixed $value): self
    {
        if (!is_numeric($value) || (float) $value < -90 || (float) $value > 90) {
            $this->add($field, 'Ungültiger Breitengrad');
        }
        return $this;
    }

    public function longitude(string $field, mixed $value): self
    {
        if (!is_numeric($value) || (float) $value < -180 || (float) $value > 180) {
            $this->add($field, 'Ungültiger Längengrad');
        }
        return $this;
    }

    /** Optionale Zeit im Format HH:MM. */
    public function timeOptional(string $field, mixed $value): self
    {
        if ($value !== null && $value !== ''
            && (!is_string($value) || !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $value))) {
            $this->add($field, 'Ungültige Zeit (HH:MM)');
        }
        return $this;
    }

    public function add(string $field, string $message): void
    {
        // Erste Meldung pro Feld behalten
        $this->errors[$field] ??= $message;
    }

    public function fails(): bool
    {
        return $this->errors !== [];
    }

    /** @return array<string,string> */
    public function errors(): array
    {
        return $this->errors;
    }

    public function throwIfFails(string $message = 'Bitte Eingaben prüfen'): void
    {
        if ($this->fails()) {
            throw HttpException::badRequest($message, $this->errors);
        }
    }
}
