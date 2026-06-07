<?php

declare(strict_types=1);

/**
 * Legt einen Admin-Benutzer an oder aktualisiert dessen Passwort.
 *
 * Verwendung:
 *   php backend/bin/create-admin.php <benutzername> <passwort>
 *
 * Das Passwort wird mit password_hash() (bcrypt) gespeichert – niemals im Klartext.
 */

use App\Config;
use App\Database;

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Nur über die Kommandozeile ausführbar.\n");
    exit(1);
}

$root = dirname(__DIR__);

if (is_file($root . '/vendor/autoload.php')) {
    require $root . '/vendor/autoload.php';
} else {
    spl_autoload_register(static function (string $class) use ($root): void {
        if (!str_starts_with($class, 'App\\')) {
            return;
        }
        $file = $root . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (is_file($file)) {
            require $file;
        }
    });
}

$username = $argv[1] ?? null;
$password = $argv[2] ?? null;

if ($username === null || $password === null || $username === '' || $password === '') {
    fwrite(STDERR, "Verwendung: php bin/create-admin.php <benutzername> <passwort>\n");
    exit(1);
}

Config::load($root . '/config/.env');

$hash = password_hash($password, PASSWORD_DEFAULT);

$pdo = Database::pdo();
$stmt = $pdo->prepare(
    'INSERT INTO `admin_user` (`username`, `password_hash`)
     VALUES (:u, :h)
     ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`)'
);
$stmt->execute(['u' => $username, 'h' => $hash]);

fwrite(STDOUT, "Admin-Benutzer «{$username}» wurde angelegt/aktualisiert.\n");
exit(0);
