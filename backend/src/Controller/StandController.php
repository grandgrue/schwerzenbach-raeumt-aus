<?php

declare(strict_types=1);

namespace App\Controller;

use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;
use App\Repository\StandRepository;

final class StandController
{
    public function __construct(
        private readonly StandRepository $stands = new StandRepository(),
    ) {
    }

    /** GET /stands — freigegebene Stände mit optionalen Filtern. */
    public function index(Request $request, array $params): void
    {
        $category = $request->query('category');
        $filters = [
            'category' => $category !== null ? (int) $category : null,
            'food'     => $request->queryBool('food'),
            'drinks'   => $request->queryBool('drinks'),
            'q'        => $request->query('q'),
        ];

        Response::json($this->stands->publicList($filters));
    }

    /** GET /stands/{id} — einzelner freigegebener Stand. */
    public function show(Request $request, array $params): void
    {
        $id = (int) ($params['id'] ?? 0);
        $stand = $this->stands->publicFind($id);
        if ($stand === null) {
            throw HttpException::notFound('Stand nicht gefunden');
        }
        Response::json($stand);
    }
}
