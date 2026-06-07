<?php

declare(strict_types=1);

namespace Tests;

use App\Support\RateLimiter;
use PHPUnit\Framework\TestCase;

final class RateLimiterTest extends TestCase
{
    public function testAllowsUpToLimitThenBlocks(): void
    {
        $dir = sys_get_temp_dir() . '/srau-test-' . uniqid();
        $limiter = new RateLimiter(3, $dir);
        $key = 'tester';

        $this->assertTrue($limiter->allow($key));
        $this->assertTrue($limiter->allow($key));
        $this->assertTrue($limiter->allow($key));
        $this->assertFalse($limiter->allow($key), 'Vierte Anfrage muss blockiert werden');
    }

    public function testSeparateKeysAreIndependent(): void
    {
        $dir = sys_get_temp_dir() . '/srau-test-' . uniqid();
        $limiter = new RateLimiter(1, $dir);

        $this->assertTrue($limiter->allow('a'));
        $this->assertFalse($limiter->allow('a'));
        $this->assertTrue($limiter->allow('b'));
    }
}
