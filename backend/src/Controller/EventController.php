<?php

declare(strict_types=1);

namespace App\Controller;

use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;
use App\Repository\EventRepository;
use App\Repository\StandRepository;

final class EventController
{
    public function __construct(
        private readonly EventRepository $events = new EventRepository(),
        private readonly StandRepository $stands = new StandRepository(),
    ) {
    }

    /** GET /event — öffentliche Event-Konfiguration inkl. freier Plätze. */
    public function show(Request $request, array $params): void
    {
        $event = $this->events->getActive();
        if ($event === null) {
            throw HttpException::notFound('Kein Event konfiguriert');
        }

        $total = (int) $event['public_spots_total'];
        $taken = $this->stands->countActivePublicSpotBookings();
        $available = max(0, $total - $taken);

        Response::json([
            'name'                   => $event['name'],
            'event_date'             => $event['event_date'],
            'default_start_time'     => self::time($event['default_start_time']),
            'default_end_time'       => self::time($event['default_end_time']),
            'registration_open'      => (bool) $event['registration_open'],
            'public_spots_total'     => $total,
            'public_spots_available' => $available,
            'info_text'              => $event['info_text'],
        ]);
    }

    private static function time(?string $value): ?string
    {
        return ($value === null || $value === '') ? null : substr($value, 0, 5);
    }
}
