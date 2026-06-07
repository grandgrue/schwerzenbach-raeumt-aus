<?php

declare(strict_types=1);

/**
 * Front-Controller der REST-API «Schwerzenbach räumt aus».
 *
 * Deploy-Ziel: public_html/api/  (.htaccess leitet alle /api/*-Anfragen hierher)
 * Lokal:        php -S localhost:8000 -t backend/public
 */

use App\Config;
use App\Controller\CategoryController;
use App\Controller\EventController;
use App\Controller\StandController;
use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;
use App\Http\Router;

$root = dirname(__DIR__);

// --- Autoloading -----------------------------------------------------------
// Composer-Autoloader nutzen, falls vorhanden (z. B. für PHPMailer);
// sonst schlanker PSR-4-Fallback für den App\-Namespace.
if (is_file($root . '/vendor/autoload.php')) {
    require $root . '/vendor/autoload.php';
} else {
    spl_autoload_register(static function (string $class) use ($root): void {
        $prefix = 'App\\';
        if (!str_starts_with($class, $prefix)) {
            return;
        }
        $relative = substr($class, strlen($prefix));
        $file = $root . '/src/' . str_replace('\\', '/', $relative) . '.php';
        if (is_file($file)) {
            require $file;
        }
    });
}

// --- Konfiguration ---------------------------------------------------------
Config::load($root . '/config/.env');

// --- Routen ----------------------------------------------------------------
$router = new Router();

// Öffentlich
$router->get('/event', [new EventController(), 'show']);
$router->get('/categories', [new CategoryController(), 'index']);
$router->get('/stands', [new StandController(), 'index']);
$router->get('/stands/{id}', [new StandController(), 'show']);

// Anbieter- und Admin-Routen folgen in den nächsten Implementierungsphasen.

// --- Dispatch + zentrale Fehlerbehandlung ----------------------------------
try {
    $router->dispatch(Request::fromGlobals());
} catch (HttpException $e) {
    Response::error($e->errorCode, $e->getMessage(), $e->status, $e->fields);
} catch (Throwable $e) {
    $message = Config::isProd() ? 'Interner Serverfehler' : $e->getMessage();
    Response::error('server_error', $message, 500);
}
