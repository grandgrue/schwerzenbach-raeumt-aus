<?php

declare(strict_types=1);

namespace App\Repository;

use App\Database;
use PDO;

/**
 * Datenzugriff für Stände inkl. öffentlicher Serialisierung.
 *
 * WICHTIG (Datenschutz): Öffentliche Methoden liefern niemals provider_email
 * oder provider_mobile. Öffentlicher Kontakt nur, wenn show_public_contact = 1.
 */
final class StandRepository
{
    private function pdo(): PDO
    {
        return Database::pdo();
    }

    /**
     * Liste freigegebener Stände (öffentliche Felder) mit optionalen Filtern.
     *
     * @param array{category?:?int,food?:bool,drinks?:bool,q?:?string} $filters
     * @return array<int,array<string,mixed>>
     */
    public function publicList(array $filters = []): array
    {
        $where = ["s.`status` = 'approved'"];
        $params = [];

        if (!empty($filters['category'])) {
            $where[] = 's.`id` IN (SELECT `stand_id` FROM `stand_category` WHERE `category_id` = :category)';
            $params['category'] = (int) $filters['category'];
        }
        if (!empty($filters['food'])) {
            $where[] = 's.`offers_food` = 1';
        }
        if (!empty($filters['drinks'])) {
            $where[] = 's.`offers_drinks` = 1';
        }
        if (!empty($filters['q'])) {
            $where[] = '(s.`title` LIKE :q OR s.`description` LIKE :q OR s.`address` LIKE :q)';
            $params['q'] = '%' . $filters['q'] . '%';
        }

        $sql = 'SELECT * FROM `stand` s WHERE ' . implode(' AND ', $where)
             . ' ORDER BY s.`title` ASC';
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $categories = $this->categoriesForStands(array_map(static fn ($r) => (int) $r['id'], $rows));

        return array_map(
            fn (array $row) => $this->toPublic($row, $categories[(int) $row['id']] ?? []),
            $rows
        );
    }

    /** @return array<string,mixed>|null */
    public function publicFind(int $id): ?array
    {
        $stmt = $this->pdo()->prepare("SELECT * FROM `stand` WHERE `id` = :id AND `status` = 'approved'");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        if ($row === false) {
            return null;
        }
        $categories = $this->categoriesForStands([$id]);
        return $this->toPublic($row, $categories[$id] ?? []);
    }

    /**
     * Anzahl belegter Plätze am Gemeindehaus/an der Schule:
     * alle Stände mit needs_public_spot = 1 und Status ≠ rejected/withdrawn.
     */
    public function countActivePublicSpotBookings(?int $excludeStandId = null): int
    {
        $sql = "SELECT COUNT(*) FROM `stand`
                WHERE `needs_public_spot` = 1
                  AND `status` IN ('pending','approved')";
        $params = [];
        if ($excludeStandId !== null) {
            $sql .= ' AND `id` <> :exclude';
            $params['exclude'] = $excludeStandId;
        }
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    /**
     * Kategorien gruppiert nach Stand-ID.
     *
     * @param int[] $standIds
     * @return array<int,array<int,array{id:int,name:string}>>
     */
    private function categoriesForStands(array $standIds): array
    {
        $standIds = array_values(array_filter(array_map('intval', $standIds)));
        if ($standIds === []) {
            return [];
        }
        $placeholders = implode(',', array_fill(0, count($standIds), '?'));
        $sql = "SELECT sc.`stand_id`, c.`id`, c.`name`
                FROM `stand_category` sc
                JOIN `category` c ON c.`id` = sc.`category_id`
                WHERE sc.`stand_id` IN ($placeholders)
                ORDER BY c.`sort_order`, c.`name`";
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($standIds);

        $out = [];
        foreach ($stmt->fetchAll() as $row) {
            $out[(int) $row['stand_id']][] = ['id' => (int) $row['id'], 'name' => $row['name']];
        }
        return $out;
    }

    /**
     * Wandelt einen DB-Datensatz in die ÖFFENTLICHE Darstellung (ohne private Felder).
     *
     * @param array<string,mixed> $row
     * @param array<int,array{id:int,name:string}> $categories
     * @return array<string,mixed>
     */
    private function toPublic(array $row, array $categories): array
    {
        $public = [
            'id'            => (int) $row['id'],
            'title'         => $row['title'],
            'description'   => $row['description'],
            'address'       => $row['address'],
            'lat'           => (float) $row['lat'],
            'lng'           => (float) $row['lng'],
            'start_time'    => self::time($row['start_time']),
            'end_time'      => self::time($row['end_time']),
            'offers_food'   => (bool) $row['offers_food'],
            'offers_drinks' => (bool) $row['offers_drinks'],
            'categories'    => $categories,
        ];

        if ((int) $row['show_public_contact'] === 1) {
            $public['contact'] = [
                'name'  => $row['public_contact_name'] ?: null,
                'phone' => $row['public_contact_phone'] ?: null,
            ];
        }

        return $public;
    }

    private static function time(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        return substr($value, 0, 5); // "HH:MM"
    }
}
