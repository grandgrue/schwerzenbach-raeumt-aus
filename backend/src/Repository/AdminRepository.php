<?php

declare(strict_types=1);

namespace App\Repository;

use App\Database;
use PDO;

final class AdminRepository
{
    private function pdo(): PDO
    {
        return Database::pdo();
    }

    /** @return array<string,mixed>|null */
    public function findByUsername(string $username): ?array
    {
        $stmt = $this->pdo()->prepare('SELECT * FROM `admin_user` WHERE `username` = :u LIMIT 1');
        $stmt->execute(['u' => $username]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }
}
