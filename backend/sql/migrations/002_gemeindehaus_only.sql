-- Migration (002): Standplatz nur noch beim Gemeindehaus (keine Schule/Primarschule mehr)
--
-- Aktualisiert die gespeicherte Adresse bestehender Gemeindehaus-Stände auf den neuen
-- Wortlaut. Es werden NUR Adress-Texte angepasst – keine Stände gelöscht, keine anderen
-- Felder (lat/lng, Status, Kontaktdaten) verändert.
--
-- Import z. B. über phpMyAdmin. Idempotent: mehrfaches Ausführen ist unschädlich.

UPDATE `stand`
   SET `address` = 'Parkplatz Gemeindehaus, 8603 Schwerzenbach'
 WHERE `address` = 'Parkplatz Gemeindehaus / Primarschule, 8603 Schwerzenbach';
