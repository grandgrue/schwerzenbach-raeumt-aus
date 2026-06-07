<?php

declare(strict_types=1);

namespace App\Auth;

use App\Config;
use App\Http\HttpException;
use App\Http\Request;
use App\Repository\AdminRepository;

/**
 * Admin-Authentifizierung über PHP-Session (httpOnly-Cookie) + CSRF-Token.
 */
final class AdminAuth
{
    public function __construct(
        private readonly AdminRepository $admins = new AdminRepository(),
    ) {
    }

    private function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure'   => Config::isProd(),
        ]);
        session_name('srau_admin');
        session_start();
    }

    /** Versucht den Login; bei Erfolg wird die Session aufgebaut. */
    public function attempt(string $username, string $password): bool
    {
        $this->start();
        $admin = $this->admins->findByUsername($username);
        if ($admin === null || !password_verify($password, $admin['password_hash'])) {
            return false;
        }
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int) $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        return true;
    }

    public function logout(): void
    {
        $this->start();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
    }

    public function isAuthenticated(): bool
    {
        $this->start();
        return !empty($_SESSION['admin_id']);
    }

    public function username(): ?string
    {
        $this->start();
        return $_SESSION['admin_username'] ?? null;
    }

    public function csrfToken(): string
    {
        $this->start();
        if (empty($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf'];
    }

    public function requireAuth(): void
    {
        if (!$this->isAuthenticated()) {
            throw HttpException::unauthorized('Bitte als Administrator anmelden');
        }
    }

    /** Prüft das CSRF-Token im Header X-CSRF-Token für mutierende Requests. */
    public function requireCsrf(Request $request): void
    {
        $this->start();
        $sent = $request->header('X-CSRF-Token');
        $expected = $_SESSION['csrf'] ?? '';
        if (!is_string($sent) || $expected === '' || !hash_equals($expected, $sent)) {
            throw HttpException::forbidden('Ungültiges oder fehlendes CSRF-Token');
        }
    }
}
