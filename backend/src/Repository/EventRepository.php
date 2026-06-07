<?php

declare(strict_types=1);

namespace App\Repository;

use App\Database;
use PDO;

/**
 * Zugriff auf die (Singleton-)Event-Konfiguration.
 */
final class EventRepository
{
    private function pdo(): PDO
    {
        return Database::pdo();
    }

    /** @return array<string,mixed>|null Roher DB-Datensatz des aktiven Events */
    public function getActive(): ?array
    {
        $stmt = $this->pdo()->query('SELECT * FROM `event` ORDER BY `id` ASC LIMIT 1');
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public function getId(): ?int
    {
        $row = $this->getActive();
        return $row === null ? null : (int) $row['id'];
    }

    /** @param array<string,mixed> $data */
    public function update(int $id, array $data): void
    {
        $sql = 'UPDATE `event` SET
                    `name` = :name,
                    `event_date` = :event_date,
                    `default_start_time` = :default_start_time,
                    `default_end_time` = :default_end_time,
                    `registration_open` = :registration_open,
                    `public_spots_total` = :public_spots_total,
                    `info_text` = :info_text
                WHERE `id` = :id';
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([
            'name'               => $data['name'],
            'event_date'         => $data['event_date'],
            'default_start_time' => $data['default_start_time'],
            'default_end_time'   => $data['default_end_time'],
            'registration_open'  => $data['registration_open'] ? 1 : 0,
            'public_spots_total' => $data['public_spots_total'],
            'info_text'          => $data['info_text'],
            'id'                 => $id,
        ]);
    }
}
