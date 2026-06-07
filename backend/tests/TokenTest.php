<?php

declare(strict_types=1);

namespace Tests;

use App\Support\Token;
use PHPUnit\Framework\TestCase;

final class TokenTest extends TestCase
{
    public function testGenerateProduces64HexChars(): void
    {
        $token = Token::generate();
        $this->assertSame(64, strlen($token));
        $this->assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $token);
    }

    public function testGenerateIsUnique(): void
    {
        $this->assertNotSame(Token::generate(), Token::generate());
    }

    public function testHashIsDeterministicSha256(): void
    {
        $this->assertSame(hash('sha256', 'abc'), Token::hash('abc'));
        $this->assertSame(64, strlen(Token::hash('abc')));
    }
}
