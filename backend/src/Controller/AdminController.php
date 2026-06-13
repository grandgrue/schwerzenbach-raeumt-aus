<?php

declare(strict_types=1);

namespace App\Controller;

use App\Auth\AdminAuth;
use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;
use App\Repository\CategoryRepository;
use App\Repository\EventRepository;
use App\Repository\StandRepository;
use App\Service\Mailer;
use App\Support\OrganizerEmails;
use App\Support\StandInput;
use App\Support\Validator;

/**
 * Admin-/OK-Endpunkte: Login, Moderation der Stände, Event-Konfiguration.
 * Alle mutierenden Routen erfordern Session + CSRF-Token (X-CSRF-Token-Header).
 */
final class AdminController
{
    private const VALID_STATUS = ['pending', 'approved', 'rejected', 'withdrawn'];

    public function __construct(
        private readonly AdminAuth $auth = new AdminAuth(),
        private readonly StandRepository $stands = new StandRepository(),
        private readonly EventRepository $events = new EventRepository(),
        private readonly CategoryRepository $categories = new CategoryRepository(),
        private readonly Mailer $mailer = new Mailer(),
    ) {
    }

    /** POST /admin/login */
    public function login(Request $request, array $params): void
    {
        $username = trim((string) $request->input('username', ''));
        $password = (string) $request->input('password', '');

        if ($username === '' || $password === '' || !$this->auth->attempt($username, $password)) {
            throw HttpException::unauthorized('Benutzername oder Passwort falsch');
        }

        Response::json([
            'username'   => $username,
            'csrf_token' => $this->auth->csrfToken(),
        ]);
    }

    /** POST /admin/logout */
    public function logout(Request $request, array $params): void
    {
        $this->auth->requireAuth();
        $this->auth->requireCsrf($request);
        $this->auth->logout();
        Response::noContent();
    }

    /** GET /admin/session — Status der Admin-Session (für die SPA beim Laden). */
    public function session(Request $request, array $params): void
    {
        if (!$this->auth->isAuthenticated()) {
            Response::json(['authenticated' => false]);
            return;
        }
        Response::json([
            'authenticated' => true,
            'username'      => $this->auth->username(),
            'csrf_token'    => $this->auth->csrfToken(),
        ]);
    }

    /** GET /admin/stands?status= — alle Stände (privat) für die Moderation. */
    public function index(Request $request, array $params): void
    {
        $this->auth->requireAuth();
        $status = $request->query('status');
        if ($status !== null && !in_array($status, self::VALID_STATUS, true)) {
            throw HttpException::badRequest('Ungültiger Status', ['status' => 'unbekannt']);
        }
        Response::json($this->stands->adminList($status));
    }

    /**
     * PATCH /admin/stands/{id}
     * - Body mit `status` => Status ändern (freigeben/ablehnen/…)
     * - sonst => Stand-Felder bearbeiten
     */
    public function update(Request $request, array $params): void
    {
        $this->auth->requireAuth();
        $this->auth->requireCsrf($request);

        $id = (int) ($params['id'] ?? 0);
        $existing = $this->stands->findRawById($id);
        if ($existing === null) {
            throw HttpException::notFound('Stand nicht gefunden');
        }

        $status = $request->input('status');
        if ($status !== null) {
            if (!in_array($status, self::VALID_STATUS, true)) {
                throw HttpException::badRequest('Ungültiger Status', ['status' => 'unbekannt']);
            }
            $this->stands->updateStatusById($id, (string) $status);

            // Freigabe-Mail an die anbietende Person (nur beim Wechsel auf "approved")
            if ($status === 'approved' && $existing['status'] !== 'approved') {
                $this->sendApprovalMail((string) $existing['provider_email'], (string) $existing['title']);
            }
        } else {
            [$fields, $categoryIds] = StandInput::validate($request, $this->categories);
            $this->stands->updateFieldsById($id, $fields, $categoryIds);
        }

        $row = $this->stands->findRawById($id);
        Response::json($this->stands->toPrivate($row ?? $existing));
    }

    /** DELETE /admin/stands/{id} */
    public function destroy(Request $request, array $params): void
    {
        $this->auth->requireAuth();
        $this->auth->requireCsrf($request);
        if (!$this->stands->deleteById((int) ($params['id'] ?? 0))) {
            throw HttpException::notFound('Stand nicht gefunden');
        }
        Response::noContent();
    }

    /** Dankes-/Freigabe-Mail an die anbietende Person. */
    private function sendApprovalMail(string $email, string $title): void
    {
        if ($email === '') {
            return;
        }
        $body = "Hallo\n\n"
            . "vielen Dank für deine Anmeldung beim Flohmarkt «Schwerzenbach räumt aus»!\n"
            . "Dein Stand «{$title}» wurde vom Organisationskomitee geprüft und ist jetzt "
            . "freigegeben – er erscheint ab sofort auf der Karte und in der Liste.\n\n"
            . "Hast du noch Fragen oder möchtest du etwas anpassen? Melde dich jederzeit bei uns "
            . "unter info@schwerzenbach-raeumt-aus.ch – wir helfen dir gerne weiter. Über deinen "
            . "persönlichen Bearbeitungs-Link kannst du deinen Stand zudem selbst ändern oder "
            . "zurückziehen.\n\n"
            . "Wir freuen uns auf einen tollen Flohmarkt-Tag mit dir!\n\n"
            . "Herzliche Grüsse\n"
            . "Dein Organisationskomitee\n"
            . "Grüne Schwerzenbach & GLP Schwerzenbach";

        $this->mailer->send($email, 'Dein Stand ist freigegeben – «Schwerzenbach räumt aus»', $body);
    }

    /** GET /admin/event — vollständige Event-Konfiguration inkl. Organisator-Adressen. */
    public function showEvent(Request $request, array $params): void
    {
        $this->auth->requireAuth();
        $event = $this->events->getActive();
        if ($event === null) {
            throw HttpException::notFound('Kein Event konfiguriert');
        }
        Response::json([
            'name'               => $event['name'],
            'event_date'         => $event['event_date'],
            'default_start_time' => $event['default_start_time'] ? substr((string) $event['default_start_time'], 0, 5) : null,
            'default_end_time'   => $event['default_end_time'] ? substr((string) $event['default_end_time'], 0, 5) : null,
            'registration_open'  => (bool) $event['registration_open'],
            'public_spots_total' => (int) $event['public_spots_total'],
            'info_text'          => $event['info_text'],
            'organizer_emails'   => $event['organizer_emails'] ?? '',
        ]);
    }

    /** PUT /admin/event — Event-Konfiguration speichern. */
    public function updateEvent(Request $request, array $params): void
    {
        $this->auth->requireAuth();
        $this->auth->requireCsrf($request);

        $eventId = $this->events->getId();
        if ($eventId === null) {
            throw HttpException::notFound('Kein Event konfiguriert');
        }

        $v = new Validator();
        $name      = trim((string) $request->input('name', ''));
        $date      = $request->input('event_date');
        $start     = $request->input('default_start_time');
        $end       = $request->input('default_end_time');
        $spots     = $request->input('public_spots_total', 0);
        $infoText  = $request->input('info_text');
        $organizerRaw = $request->input('organizer_emails');
        $organizerRaw = is_string($organizerRaw) ? $organizerRaw : '';

        $v->required('name', $name)->maxLength('name', $name, 150);
        if ($date !== null && $date !== '' && (!is_string($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date))) {
            $v->add('event_date', 'Ungültiges Datum (JJJJ-MM-TT)');
        }
        $v->timeOptional('default_start_time', $start);
        $v->timeOptional('default_end_time', $end);
        if (!is_numeric($spots) || (int) $spots < 0) {
            $v->add('public_spots_total', 'Muss eine Zahl ≥ 0 sein');
        }
        $invalidEmails = OrganizerEmails::invalid($organizerRaw);
        if ($invalidEmails !== []) {
            $v->add('organizer_emails', 'Ungültige Adresse(n): ' . implode(', ', $invalidEmails));
        }
        $v->throwIfFails();

        // Normalisiert speichern: eine Adresse pro Zeile.
        $organizerNormalized = implode("\n", OrganizerEmails::parse($organizerRaw));

        $this->events->update($eventId, [
            'name'               => $name,
            'event_date'         => ($date !== '' && $date !== null) ? $date : null,
            'default_start_time' => ($start !== '' && $start !== null) ? $start : null,
            'default_end_time'   => ($end !== '' && $end !== null) ? $end : null,
            'registration_open'  => (bool) $request->input('registration_open', false),
            'public_spots_total' => (int) $spots,
            'info_text'          => is_string($infoText) ? $infoText : null,
            'organizer_emails'   => $organizerNormalized !== '' ? $organizerNormalized : null,
        ]);

        Response::json(['ok' => true]);
    }
}
