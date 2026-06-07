<?php

declare(strict_types=1);

namespace Tests;

use App\Http\HttpException;
use App\Http\Request;
use App\Http\Router;
use PHPUnit\Framework\TestCase;

final class RouterTest extends TestCase
{
    private function request(string $method, string $path): Request
    {
        return new Request($method, $path, [], [], '127.0.0.1');
    }

    public function testDispatchExtractsRouteParams(): void
    {
        $router = new Router();
        $captured = [];
        $router->get('/stands/{id}', function (Request $r, array $params) use (&$captured): void {
            $captured = $params;
        });

        $router->dispatch($this->request('GET', '/stands/42'));
        $this->assertSame('42', $captured['id']);
    }

    public function testUnknownPathThrowsNotFound(): void
    {
        $router = new Router();
        $router->get('/event', fn () => null);

        try {
            $router->dispatch($this->request('GET', '/gibtsnicht'));
            $this->fail('HttpException erwartet');
        } catch (HttpException $e) {
            $this->assertSame(404, $e->status);
        }
    }

    public function testWrongMethodThrowsMethodNotAllowed(): void
    {
        $router = new Router();
        $router->get('/event', fn () => null);

        try {
            $router->dispatch($this->request('POST', '/event'));
            $this->fail('HttpException erwartet');
        } catch (HttpException $e) {
            $this->assertSame(405, $e->status);
        }
    }

    public function testDistinguishesStaticFromParamRoutes(): void
    {
        $router = new Router();
        $hit = '';
        $router->get('/stands/edit/{token}', function (Request $r, array $p) use (&$hit): void {
            $hit = 'edit:' . $p['token'];
        });
        $router->get('/stands/{id}', function (Request $r, array $p) use (&$hit): void {
            $hit = 'show:' . $p['id'];
        });

        $router->dispatch($this->request('GET', '/stands/7'));
        $this->assertSame('show:7', $hit);

        $router->dispatch($this->request('GET', '/stands/edit/abc123'));
        $this->assertSame('edit:abc123', $hit);
    }
}
