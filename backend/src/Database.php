<?php

declare(strict_types=1);

namespace App;

use PDO;

/**
 * Stellt eine gemeinsam genutzte PDO-Verbindung (MySQL) bereit.
 */
final class Database
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $host = Config::get('DB_HOST', '127.0.0.1');
        $port = Config::get('DB_PORT', '3306');
        $name = Config::get('DB_NAME', '');
        $user = Config::get('DB_USER', 'root');
        $pass = Config::get('DB_PASS', '');

        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);

        self::$pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);

        return self::$pdo;
    }

    /** Nur für Tests: erlaubt das Einspeisen einer eigenen Verbindung. */
    public static function setPdo(?PDO $pdo): void
    {
        self::$pdo = $pdo;
    }
}
