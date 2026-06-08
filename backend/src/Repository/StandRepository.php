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
            // Eigene Platzhalter je Vorkommen: native Prepared Statements erlauben
            // keine Wiederverwendung desselben benannten Parameters.
            $where[] = '(s.`title` LIKE :q1 OR s.`description` LIKE :q2 OR s.`address` LIKE :q3)';
            $like = '%' . $filters['q'] . '%';
            $params['q1'] = $like;
            $params['q2'] = $like;
            $params['q3'] = $like;
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

    // -- Schreiboperationen (Anbieter:in, kontolos) --------------------------

    /**
     * Legt einen neuen Stand (Status pending) inkl. Kategorien an.
     *
     * @param array<string,mixed> $fields
     * @param int[]               $categoryIds
     */
    public function create(array $fields, array $categoryIds): int
    {
        $pdo = $this->pdo();
        $pdo->beginTransaction();
        try {
            $sql = 'INSERT INTO `stand`
                (`event_id`, `title`, `description`, `address`, `lat`, `lng`,
                 `provider_email`, `provider_mobile`,
                 `public_contact_name`, `public_contact_phone`, `show_public_contact`,
                 `start_time`, `end_time`,
                 `offers_food`, `offers_drinks`, `needs_public_spot`,
                 `status`, `edit_token_hash`)
                VALUES
                (:event_id, :title, :description, :address, :lat, :lng,
                 :provider_email, :provider_mobile,
                 :public_contact_name, :public_contact_phone, :show_public_contact,
                 :start_time, :end_time,
                 :offers_food, :offers_drinks, :needs_public_spot,
                 \'pending\', :edit_token_hash)';
            $pdo->prepare($sql)->execute($this->bindFields($fields));
            $id = (int) $pdo->lastInsertId();
            $this->syncCategories($id, $categoryIds);
            $pdo->commit();
            return $id;
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    /** @return array<string,mixed>|null Roher Datensatz (nur nicht zurückgezogene Stände) */
    public function findByEditTokenHash(string $hash): ?array
    {
        $stmt = $this->pdo()->prepare(
            "SELECT * FROM `stand` WHERE `edit_token_hash` = :h AND `status` <> 'withdrawn'"
        );
        $stmt->execute(['h' => $hash]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    /**
     * Aktualisiert einen Stand anhand des Token-Hashes. War der Stand bereits
     * freigegeben, wird er als «bearbeitet» markiert (edited_after_approval).
     *
     * @param array<string,mixed> $fields
     * @param int[]               $categoryIds
     */
    public function updateByEditTokenHash(string $hash, array $fields, array $categoryIds): bool
    {
        $existing = $this->findByEditTokenHash($hash);
        if ($existing === null) {
            return false;
        }
        $id = (int) $existing['id'];
        $markEdited = $existing['status'] === 'approved';

        $pdo = $this->pdo();
        $pdo->beginTransaction();
        try {
            $sql = 'UPDATE `stand` SET
                        `title` = :title,
                        `description` = :description,
                        `address` = :address,
                        `lat` = :lat,
                        `lng` = :lng,
                        `provider_email` = :provider_email,
                        `provider_mobile` = :provider_mobile,
                        `public_contact_name` = :public_contact_name,
                        `public_contact_phone` = :public_contact_phone,
                        `show_public_contact` = :show_public_contact,
                        `start_time` = :start_time,
                        `end_time` = :end_time,
                        `offers_food` = :offers_food,
                        `offers_drinks` = :offers_drinks,
                        `needs_public_spot` = :needs_public_spot'
                . ($markEdited ? ', `edited_after_approval` = 1' : '')
                . ' WHERE `id` = :id';
            $bind = $this->bindFields($fields);
            unset($bind['event_id'], $bind['edit_token_hash']);
            $bind['id'] = $id;
            $pdo->prepare($sql)->execute($bind);
            $this->syncCategories($id, $categoryIds);
            $pdo->commit();
            return true;
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public function withdrawByEditTokenHash(string $hash): bool
    {
        $stmt = $this->pdo()->prepare(
            "UPDATE `stand` SET `status` = 'withdrawn'
             WHERE `edit_token_hash` = :h AND `status` <> 'withdrawn'"
        );
        $stmt->execute(['h' => $hash]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Aktive (nicht zurückgezogene) Stände einer Anbieter-E-Mail.
     *
     * @return array<int,array{id:int,title:string}>
     */
    public function findActiveByProviderEmail(string $email): array
    {
        $stmt = $this->pdo()->prepare(
            "SELECT `id`, `title` FROM `stand`
             WHERE `provider_email` = :e AND `status` <> 'withdrawn'
             ORDER BY `id`"
        );
        $stmt->execute(['e' => $email]);
        $out = [];
        foreach ($stmt->fetchAll() as $row) {
            $out[] = ['id' => (int) $row['id'], 'title' => $row['title']];
        }
        return $out;
    }

    /** Setzt einen neuen Edit-Token-Hash (Token-Rotation beim erneuten Zusenden). */
    public function setEditTokenHashById(int $id, string $hash): void
    {
        $stmt = $this->pdo()->prepare('UPDATE `stand` SET `edit_token_hash` = :h WHERE `id` = :id');
        $stmt->execute(['h' => $hash, 'id' => $id]);
    }

    // -- Admin / Organisationskomitee -----------------------------------------

    /**
     * Alle Stände (optional nach Status gefiltert) in PRIVATER Darstellung.
     *
     * @return array<int,array<string,mixed>>
     */
    public function adminList(?string $status = null): array
    {
        $sql = 'SELECT * FROM `stand`';
        $params = [];
        if ($status !== null && $status !== '') {
            $sql .= ' WHERE `status` = :status';
            $params['status'] = $status;
        }
        $sql .= ' ORDER BY `created_at` DESC';
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);

        return array_map(fn (array $row) => $this->toPrivate($row), $stmt->fetchAll());
    }

    /** @return array<string,mixed>|null */
    public function findRawById(int $id): ?array
    {
        $stmt = $this->pdo()->prepare('SELECT * FROM `stand` WHERE `id` = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public function updateStatusById(int $id, string $status): bool
    {
        $stmt = $this->pdo()->prepare('UPDATE `stand` SET `status` = :s WHERE `id` = :id');
        $stmt->execute(['s' => $status, 'id' => $id]);
        return $stmt->rowCount() >= 0;
    }

    /**
     * Admin-Bearbeitung der Stand-Felder (ohne edited_after_approval-Markierung).
     *
     * @param array<string,mixed> $fields
     * @param int[]               $categoryIds
     */
    public function updateFieldsById(int $id, array $fields, array $categoryIds): void
    {
        $pdo = $this->pdo();
        $pdo->beginTransaction();
        try {
            $sql = 'UPDATE `stand` SET
                        `title` = :title,
                        `description` = :description,
                        `address` = :address,
                        `lat` = :lat,
                        `lng` = :lng,
                        `provider_email` = :provider_email,
                        `provider_mobile` = :provider_mobile,
                        `public_contact_name` = :public_contact_name,
                        `public_contact_phone` = :public_contact_phone,
                        `show_public_contact` = :show_public_contact,
                        `start_time` = :start_time,
                        `end_time` = :end_time,
                        `offers_food` = :offers_food,
                        `offers_drinks` = :offers_drinks,
                        `needs_public_spot` = :needs_public_spot
                    WHERE `id` = :id';
            $bind = $this->bindFields($fields);
            unset($bind['event_id'], $bind['edit_token_hash']);
            $bind['id'] = $id;
            $pdo->prepare($sql)->execute($bind);
            $this->syncCategories($id, $categoryIds);
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public function deleteById(int $id): bool
    {
        $stmt = $this->pdo()->prepare('DELETE FROM `stand` WHERE `id` = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * PRIVATE Darstellung (für Anbieter:in via Edit-Token / Admin):
     * enthält bewusst auch provider_email und provider_mobile.
     *
     * @param array<string,mixed> $row
     * @return array<string,mixed>
     */
    public function toPrivate(array $row): array
    {
        $id = (int) $row['id'];
        return [
            'id'                  => $id,
            'title'               => $row['title'],
            'description'         => $row['description'],
            'address'             => $row['address'],
            'lat'                 => (float) $row['lat'],
            'lng'                 => (float) $row['lng'],
            'provider_email'      => $row['provider_email'],
            'provider_mobile'     => $row['provider_mobile'],
            'public_contact_name' => $row['public_contact_name'],
            'public_contact_phone'=> $row['public_contact_phone'],
            'show_public_contact' => (bool) $row['show_public_contact'],
            'start_time'          => self::time($row['start_time']),
            'end_time'            => self::time($row['end_time']),
            'offers_food'         => (bool) $row['offers_food'],
            'offers_drinks'       => (bool) $row['offers_drinks'],
            'needs_public_spot'   => (bool) $row['needs_public_spot'],
            'status'              => $row['status'],
            'edited_after_approval' => (bool) $row['edited_after_approval'],
            'category_ids'        => array_map(
                static fn ($c) => $c['id'],
                $this->categoriesForStands([$id])[$id] ?? []
            ),
        ];
    }

    /**
     * Bringt die übergebenen Felder in die für INSERT/UPDATE genutzte Bind-Form.
     *
     * @param array<string,mixed> $f
     * @return array<string,mixed>
     */
    private function bindFields(array $f): array
    {
        return [
            'event_id'             => $f['event_id'] ?? null,
            'title'                => $f['title'],
            'description'          => $f['description'] ?? null,
            'address'              => $f['address'],
            'lat'                  => $f['lat'],
            'lng'                  => $f['lng'],
            'provider_email'       => $f['provider_email'],
            'provider_mobile'      => $f['provider_mobile'],
            'public_contact_name'  => $f['public_contact_name'] ?? null,
            'public_contact_phone' => $f['public_contact_phone'] ?? null,
            'show_public_contact'  => !empty($f['show_public_contact']) ? 1 : 0,
            'start_time'           => $f['start_time'] ?? null,
            'end_time'             => $f['end_time'] ?? null,
            'offers_food'          => !empty($f['offers_food']) ? 1 : 0,
            'offers_drinks'        => !empty($f['offers_drinks']) ? 1 : 0,
            'needs_public_spot'    => !empty($f['needs_public_spot']) ? 1 : 0,
            'edit_token_hash'      => $f['edit_token_hash'] ?? null,
        ];
    }

    private function syncCategories(int $standId, array $categoryIds): void
    {
        $pdo = $this->pdo();
        $pdo->prepare('DELETE FROM `stand_category` WHERE `stand_id` = :id')
            ->execute(['id' => $standId]);

        $ids = array_values(array_unique(array_map('intval', $categoryIds)));
        if ($ids === []) {
            return;
        }
        $stmt = $pdo->prepare('INSERT INTO `stand_category` (`stand_id`, `category_id`) VALUES (:s, :c)');
        foreach ($ids as $cid) {
            $stmt->execute(['s' => $standId, 'c' => $cid]);
        }
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
