<?php

declare(strict_types=1);

namespace App\Support;

use App\Http\Request;
use App\Repository\CategoryRepository;

/**
 * Validiert und normalisiert die Eingabefelder eines Stands (gemeinsam von
 * Anbieter- und Admin-Endpunkten genutzt).
 */
final class StandInput
{
    /**
     * @return array{0:array<string,mixed>,1:int[]}  [fields, categoryIds]
     */
    public static function validate(Request $request, CategoryRepository $categories): array
    {
        $v = new Validator();

        $title       = trim((string) $request->input('title', ''));
        $description = $request->input('description');
        $address     = trim((string) $request->input('address', ''));
        $lat         = $request->input('lat');
        $lng         = $request->input('lng');
        $email       = trim((string) $request->input('provider_email', ''));
        $mobile      = trim((string) $request->input('provider_mobile', ''));
        $startTime   = $request->input('start_time');
        $endTime     = $request->input('end_time');

        $v->required('title', $title)->maxLength('title', $title, 150);
        $v->required('address', $address)->maxLength('address', $address, 255);
        $v->required('lat', $lat)->latitude('lat', $lat);
        $v->required('lng', $lng)->longitude('lng', $lng);
        $v->required('provider_email', $email)->email('provider_email', $email);
        $v->required('provider_mobile', $mobile)->maxLength('provider_mobile', $mobile, 40);
        $v->timeOptional('start_time', $startTime);
        $v->timeOptional('end_time', $endTime);

        $requested = $request->input('categories', []);
        $categoryIds = is_array($requested) ? $categories->existingIds($requested) : [];

        $v->throwIfFails();

        $fields = [
            'title'                => $title,
            'description'          => is_string($description) ? $description : null,
            'address'              => $address,
            'lat'                  => (float) $lat,
            'lng'                  => (float) $lng,
            'provider_email'       => $email,
            'provider_mobile'      => $mobile,
            'public_contact_name'  => self::nullableString($request->input('public_contact_name')),
            'public_contact_phone' => self::nullableString($request->input('public_contact_phone')),
            'show_public_contact'  => (bool) $request->input('show_public_contact', false),
            'start_time'           => $startTime ?: null,
            'end_time'             => $endTime ?: null,
            'offers_food'          => (bool) $request->input('offers_food', false),
            'offers_drinks'        => (bool) $request->input('offers_drinks', false),
            'needs_public_spot'    => (bool) $request->input('needs_public_spot', false),
        ];

        return [$fields, $categoryIds];
    }

    private static function nullableString(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }
        $value = trim($value);
        return $value === '' ? null : $value;
    }
}
