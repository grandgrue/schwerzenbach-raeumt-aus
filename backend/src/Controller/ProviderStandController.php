<?php

declare(strict_types=1);

namespace App\Controller;

use App\Config;
use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;
use App\Repository\CategoryRepository;
use App\Repository\EventRepository;
use App\Repository\StandRepository;
use App\Service\Mailer;
use App\Support\Captcha;
use App\Support\RateLimiter;
use App\Support\StandInput;
use App\Support\Token;

/**
 * Kontolose Anbieter-Endpunkte: Stand anmelden, per Edit-Token laden,
 * aktualisieren und zurückziehen.
 */
final class ProviderStandController
{
    public function __construct(
        private readonly EventRepository $events = new EventRepository(),
        private readonly StandRepository $stands = new StandRepository(),
        private readonly CategoryRepository $categories = new CategoryRepository(),
        private readonly Mailer $mailer = new Mailer(),
    ) {
    }

    /** POST /stands — neuen Stand anmelden. */
    public function store(Request $request, array $params): void
    {
        // 1) Honeypot: von Bots ausgefüllt -> stillschweigend "Erfolg"
        if (trim((string) $request->input('website', '')) !== '') {
            Response::json(['status' => 'pending'], 201);
            return;
        }

        // 2) Rate-Limit pro IP
        $limiter = new RateLimiter(Config::int('RATE_LIMIT_PER_HOUR', 10));
        if (!$limiter->allow('stand-create:' . $request->clientIp())) {
            throw new HttpException(429, 'rate_limited', 'Zu viele Anmeldungen. Bitte später erneut versuchen.');
        }

        // 3) Captcha
        if (!Captcha::verify($request->input('captcha_token'), $request->input('captcha_answer'))) {
            throw HttpException::badRequest('Bitte Eingaben prüfen', ['captcha_answer' => 'Antwort stimmt nicht']);
        }

        // 4) Event / Anmeldefenster
        $event = $this->events->getActive();
        if ($event === null) {
            throw HttpException::notFound('Kein Event konfiguriert');
        }
        if ((int) $event['registration_open'] !== 1) {
            throw new HttpException(403, 'registration_closed', 'Die Anmeldung ist derzeit geschlossen.');
        }

        // 5) Felder validieren
        [$fields, $categoryIds] = $this->validatedInput($request);
        $fields['event_id'] = (int) $event['id'];

        // 6) Platz-Kapazität (automatische Grenze)
        if (!empty($fields['needs_public_spot'])) {
            $this->assertSpotAvailable($event, null);
        }

        // 7) Token + Speichern
        $token = Token::generate();
        $fields['edit_token_hash'] = Token::hash($token);
        $id = $this->stands->create($fields, $categoryIds);

        // 8) Bearbeitungs-Link per E-Mail
        $this->sendEditLink((string) $fields['provider_email'], (string) $fields['title'], $token);

        Response::json(['id' => $id, 'status' => 'pending'], 201);
    }

    /** GET /stands/edit/{token} — eigenen Stand laden (inkl. privater Felder). */
    public function editShow(Request $request, array $params): void
    {
        $row = $this->findByTokenOrFail((string) ($params['token'] ?? ''));
        Response::json($this->stands->toPrivate($row));
    }

    /** PUT /stands/edit/{token} — eigenen Stand aktualisieren. */
    public function editUpdate(Request $request, array $params): void
    {
        $token = (string) ($params['token'] ?? '');
        $existing = $this->findByTokenOrFail($token);

        [$fields, $categoryIds] = $this->validatedInput($request);

        if (!empty($fields['needs_public_spot'])) {
            $event = $this->events->getActive();
            if ($event !== null) {
                $this->assertSpotAvailable($event, (int) $existing['id']);
            }
        }

        $this->stands->updateByEditTokenHash(Token::hash($token), $fields, $categoryIds);

        $row = $this->findByTokenOrFail($token);
        Response::json($this->stands->toPrivate($row));
    }

    /** DELETE /stands/edit/{token} — Stand zurückziehen. */
    public function editDelete(Request $request, array $params): void
    {
        $ok = $this->stands->withdrawByEditTokenHash(Token::hash((string) ($params['token'] ?? '')));
        if (!$ok) {
            throw HttpException::notFound('Stand nicht gefunden');
        }
        Response::noContent();
    }

    // -- intern ---------------------------------------------------------------

    /** @return array<string,mixed> */
    private function findByTokenOrFail(string $token): array
    {
        $row = $token === '' ? null : $this->stands->findByEditTokenHash(Token::hash($token));
        if ($row === null) {
            throw HttpException::notFound('Stand nicht gefunden oder bereits zurückgezogen');
        }
        return $row;
    }

    /**
     * Validiert die Stand-Felder und liefert [fields, categoryIds] zurück.
     *
     * @return array{0:array<string,mixed>,1:int[]}
     */
    private function validatedInput(Request $request): array
    {
        return StandInput::validate($request, $this->categories);
    }

    /** @param array<string,mixed> $event */
    private function assertSpotAvailable(array $event, ?int $excludeStandId): void
    {
        $total = (int) $event['public_spots_total'];
        $taken = $this->stands->countActivePublicSpotBookings($excludeStandId);
        if ($taken >= $total) {
            throw new HttpException(
                409,
                'public_spots_full',
                'Es sind leider keine Plätze am Gemeindehaus/an der Schule mehr verfügbar.'
            );
        }
    }

    private function sendEditLink(string $email, string $title, string $token): void
    {
        $base = rtrim((string) Config::get('APP_BASE_URL', ''), '/');
        $editUrl = $base . '/bearbeiten/' . $token;

        $body = "Hallo\n\n"
            . "vielen Dank für deine Anmeldung beim Flohmarkt «Schwerzenbach räumt aus».\n"
            . "Dein Stand «{$title}» wurde eingereicht und wird vom Organisationskomitee geprüft.\n\n"
            . "Mit folgendem Link kannst du deinen Stand jederzeit bearbeiten oder zurückziehen:\n"
            . "{$editUrl}\n\n"
            . "Bitte bewahre diesen Link sicher auf und teile ihn nicht weiter.\n\n"
            . "Herzliche Grüsse\nDein Organisationskomitee";

        $this->mailer->send($email, 'Dein Stand bei «Schwerzenbach räumt aus»', $body);
    }
}
