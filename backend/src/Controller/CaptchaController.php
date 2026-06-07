<?php

declare(strict_types=1);

namespace App\Controller;

use App\Http\Request;
use App\Http\Response;
use App\Support\Captcha;

final class CaptchaController
{
    /** GET /captcha — liefert eine Rechenfrage + signiertes Token. */
    public function show(Request $request, array $params): void
    {
        Response::json(Captcha::challenge());
    }
}
