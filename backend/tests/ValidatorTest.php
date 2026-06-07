<?php

declare(strict_types=1);

namespace Tests;

use App\Http\HttpException;
use App\Support\Validator;
use PHPUnit\Framework\TestCase;

final class ValidatorTest extends TestCase
{
    public function testCollectsRequiredAndEmailErrors(): void
    {
        $v = new Validator();
        $v->required('title', '')->email('provider_email', 'keine-mail');

        $this->assertTrue($v->fails());
        $this->assertArrayHasKey('title', $v->errors());
        $this->assertArrayHasKey('provider_email', $v->errors());
    }

    public function testValidInputPasses(): void
    {
        $v = new Validator();
        $v->required('title', 'Flohmi')
            ->email('provider_email', 'a@b.ch')
            ->latitude('lat', 47.38)
            ->longitude('lng', 8.65)
            ->timeOptional('start_time', '09:00');

        $this->assertFalse($v->fails());
        $this->assertSame([], $v->errors());
    }

    public function testRejectsOutOfRangeCoordinates(): void
    {
        $v = new Validator();
        $v->latitude('lat', 95)->longitude('lng', 200);
        $this->assertArrayHasKey('lat', $v->errors());
        $this->assertArrayHasKey('lng', $v->errors());
    }

    public function testRejectsInvalidTime(): void
    {
        $v = new Validator();
        $v->timeOptional('start_time', '25:99');
        $this->assertArrayHasKey('start_time', $v->errors());
    }

    public function testThrowIfFailsThrowsHttpException(): void
    {
        $this->expectException(HttpException::class);
        (new Validator())->required('x', null)->throwIfFails();
    }
}
