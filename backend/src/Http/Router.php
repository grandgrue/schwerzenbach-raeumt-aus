<?php

declare(strict_types=1);

namespace App\Http;

/**
 * Einfacher Pfad-Router. Routen werden mit Platzhaltern im Stil «/stands/{id}»
 * registriert; gefundene Platzhalter werden als Assoziativ-Array an den
 * Handler übergeben.
 */
final class Router
{
    /** @var array<int,array{method:string,regex:string,params:string[],handler:callable}> */
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, callable $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function patch(string $path, callable $handler): void
    {
        $this->add('PATCH', $path, $handler);
    }

    public function delete(string $path, callable $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    private function add(string $method, string $path, callable $handler): void
    {
        $params = [];
        $regex = preg_replace_callback('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', function (array $m) use (&$params): string {
            $params[] = $m[1];
            return '([^/]+)';
        }, $path);
        $this->routes[] = [
            'method'  => $method,
            'regex'   => '#^' . $regex . '$#',
            'params'  => $params,
            'handler' => $handler,
        ];
    }

    public function dispatch(Request $request): void
    {
        $pathMatched = false;
        foreach ($this->routes as $route) {
            if (!preg_match($route['regex'], $request->path, $matches)) {
                continue;
            }
            $pathMatched = true;
            if ($route['method'] !== $request->method) {
                continue;
            }
            array_shift($matches);
            $params = [];
            foreach ($route['params'] as $i => $name) {
                $params[$name] = $matches[$i] ?? null;
            }
            ($route['handler'])($request, $params);
            return;
        }

        if ($pathMatched) {
            throw new HttpException(405, 'method_not_allowed', 'Methode nicht erlaubt');
        }
        throw HttpException::notFound('Endpunkt nicht gefunden');
    }
}
