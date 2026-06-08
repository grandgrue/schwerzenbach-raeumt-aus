<?php

declare(strict_types=1);

namespace Tests;

use App\Support\OrganizerEmails;
use PHPUnit\Framework\TestCase;

final class OrganizerEmailsTest extends TestCase
{
    public function testParsesLinesCommasAndSemicolons(): void
    {
        $raw = "a@example.com\nb@example.com, c@example.com; d@example.com";
        $this->assertSame(
            ['a@example.com', 'b@example.com', 'c@example.com', 'd@example.com'],
            OrganizerEmails::parse($raw),
        );
    }

    public function testTrimsAndDropsEmptyEntries(): void
    {
        $this->assertSame(['a@example.com'], OrganizerEmails::parse("  a@example.com  \n\n"));
    }

    public function testDeduplicatesCaseInsensitive(): void
    {
        $this->assertSame(['Ok@Example.com'], OrganizerEmails::parse("Ok@Example.com\nok@example.com"));
    }

    public function testEmptyInputReturnsEmptyArray(): void
    {
        $this->assertSame([], OrganizerEmails::parse(null));
        $this->assertSame([], OrganizerEmails::parse('   '));
    }

    public function testInvalidDetectsBadAddresses(): void
    {
        $this->assertSame(['keine-mail'], OrganizerEmails::invalid("a@example.com\nkeine-mail"));
        $this->assertSame([], OrganizerEmails::invalid('a@example.com, b@example.com'));
    }
}
