<?php

declare(strict_types=1);

namespace Tests;

use App\Support\Captcha;
use PHPUnit\Framework\TestCase;

final class CaptchaTest extends TestCase
{
    private function answerFor(string $question): int
    {
        preg_match('/(\d+) \+ (\d+)/', $question, $m);
        return (int) $m[1] + (int) $m[2];
    }

    public function testVerifyAcceptsCorrectAnswer(): void
    {
        $challenge = Captcha::challenge();
        $answer = $this->answerFor($challenge['question']);
        $this->assertTrue(Captcha::verify($challenge['token'], $answer));
    }

    public function testVerifyRejectsWrongAnswer(): void
    {
        $challenge = Captcha::challenge();
        $answer = $this->answerFor($challenge['question']) + 1;
        $this->assertFalse(Captcha::verify($challenge['token'], $answer));
    }

    public function testVerifyRejectsMalformedToken(): void
    {
        $this->assertFalse(Captcha::verify('kein-punkt', 5));
        $this->assertFalse(Captcha::verify(null, 5));
    }

    public function testVerifyRejectsExpiredToken(): void
    {
        // Abgelaufener Zeitstempel wird vor der Signaturprüfung abgelehnt.
        $expired = (time() - 100) . '.deadbeef';
        $this->assertFalse(Captcha::verify($expired, 5));
    }

    public function testVerifyRejectsNonNumericAnswer(): void
    {
        $challenge = Captcha::challenge();
        $this->assertFalse(Captcha::verify($challenge['token'], 'abc'));
    }
}
