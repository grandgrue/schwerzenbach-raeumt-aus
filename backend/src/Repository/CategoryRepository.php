<?php

declare(strict_types=1);

namespace App\Repository;

use App\Database;
use PDO;

final class CategoryRepository
{
    private function pdo(): PDO
    {
        return Database::pdo();
    }

    /** @return array<int,array{id:int,name:string}> */
    public function all(): array
    {
        $stmt = $this->pdo()->query('SELECT `id`, `name` FROM `category` ORDER BY `sort_order`, `name`');
        $out = [];
        foreach ($stmt->fetchAll() as $row) {
            $out[] = ['id' => (int) $row['id'], 'name' => $row['name']];
        }
        return $out;
    }

    /** @return int[] Liste gültiger Kategorie-IDs */
    public function existingIds(array $ids): array
    {
        $ids = array_values(array_unique(array_map('intval', $ids)));
        if ($ids === []) {
            return [];
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $this->pdo()->prepare("SELECT `id` FROM `category` WHERE `id` IN ($placeholders)");
        $stmt->execute($ids);
        return array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
    }
}
