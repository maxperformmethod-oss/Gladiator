-- Seed: päť globálnych cvikov (clenId = NULL). Referenčný katalóg patrí do
-- verzovanej migrácie, nech je identický v každom prostredí. Idempotentné.
INSERT INTO "Cvik" ("id", "slug", "nazov", "jednotka", "partia", "clenId", "aktivny", "poradie", "createdAt", "updatedAt") VALUES
  ('cvik-drep',           'drep',           'Drep',           'KG',         'NOHY',   NULL, true, 1, now(), now()),
  ('cvik-bench-press',    'bench-press',    'Bench press',    'KG',         'HRUD',   NULL, true, 2, now(), now()),
  ('cvik-mrtvy-tah',      'mrtvy-tah',      'Mŕtvy ťah',      'KG',         'CHRBAT', NULL, true, 3, now(), now()),
  ('cvik-tlak-nad-hlavu', 'tlak-nad-hlavu', 'Tlak nad hlavu', 'KG',         'RAMENA', NULL, true, 4, now(), now()),
  ('cvik-zhyby',          'zhyby',          'Zhyby',          'OPAKOVANIA', 'CHRBAT', NULL, true, 5, now(), now())
ON CONFLICT ("slug") DO NOTHING;
