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

    // -- Admin-Verwaltung -----------------------------------------------------

    /** @return array<int,array{id:int,name:string,sort_order:int,stand_count:int}> */
    public function allWithCounts(): array
    {
        $sql = 'SELECT c.`id`, c.`name`, c.`sort_order`,
                       COUNT(sc.`stand_id`) AS stand_count
                FROM `category` c
                LEFT JOIN `stand_category` sc ON sc.`category_id` = c.`id`
                GROUP BY c.`id`, c.`name`, c.`sort_order`
                ORDER BY c.`sort_order`, c.`name`';
        $out = [];
        foreach ($this->pdo()->query($sql)->fetchAll() as $row) {
            $out[] = [
                'id'          => (int) $row['id'],
                'name'        => $row['name'],
                'sort_order'  => (int) $row['sort_order'],
                'stand_count' => (int) $row['stand_count'],
            ];
        }
        return $out;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo()->prepare('SELECT * FROM `category` WHERE `id` = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public function nameExists(string $name, ?int $exceptId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM `category` WHERE `name` = :name';
        $params = ['name' => $name];
        if ($exceptId !== null) {
            $sql .= ' AND `id` <> :id';
            $params['id'] = $exceptId;
        }
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn() > 0;
    }

    public function create(string $name, ?int $sortOrder = null): int
    {
        if ($sortOrder === null) {
            $sortOrder = (int) $this->pdo()->query('SELECT COALESCE(MAX(`sort_order`), 0) + 10 FROM `category`')->fetchColumn();
        }
        $stmt = $this->pdo()->prepare('INSERT INTO `category` (`name`, `sort_order`) VALUES (:n, :s)');
        $stmt->execute(['n' => $name, 's' => $sortOrder]);
        return (int) $this->pdo()->lastInsertId();
    }

    public function update(int $id, string $name, ?int $sortOrder): void
    {
        if ($sortOrder === null) {
            $stmt = $this->pdo()->prepare('UPDATE `category` SET `name` = :n WHERE `id` = :id');
            $stmt->execute(['n' => $name, 'id' => $id]);
            return;
        }
        $stmt = $this->pdo()->prepare('UPDATE `category` SET `name` = :n, `sort_order` = :s WHERE `id` = :id');
        $stmt->execute(['n' => $name, 's' => $sortOrder, 'id' => $id]);
    }

    public function countStands(int $id): int
    {
        $stmt = $this->pdo()->prepare('SELECT COUNT(*) FROM `stand_category` WHERE `category_id` = :id');
        $stmt->execute(['id' => $id]);
        return (int) $stmt->fetchColumn();
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo()->prepare('DELETE FROM `category` WHERE `id` = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
