-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ObjednavkaStav" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "RedemptionMethod" AS ENUM ('EMAIL', 'QR', 'CHIP');

-- CreateEnum
CREATE TYPE "ProduktTyp" AS ENUM ('VSTUP', 'PERMANENTKA', 'BALIK', 'INE');

-- CreateEnum
CREATE TYPE "DopytTyp" AS ENUM ('REZERVACIA', 'KONTAKT');

-- CreateEnum
CREATE TYPE "PermanentkaStav" AS ENUM ('AKTIVNA', 'EXPIROVANA', 'ZRUSENA');

-- CreateEnum
CREATE TYPE "SposobVstupu" AS ENUM ('QR', 'RUCNE');

-- CreateEnum
CREATE TYPE "Rola" AS ENUM ('CLEN', 'ADMIN');

-- CreateEnum
CREATE TYPE "Jednotka" AS ENUM ('KG', 'OPAKOVANIA', 'SEKUNDY');

-- CreateEnum
CREATE TYPE "VyzvaStav" AS ENUM ('NAVRH', 'AKTIVNA', 'UZAVRETA');

-- CreateEnum
CREATE TYPE "VysledokStav" AS ENUM ('SUKROMNY', 'CAKA', 'SCHVALENE', 'ZAMIETNUTE');

-- CreateTable
CREATE TABLE "Pobocka" (
    "id" TEXT NOT NULL,
    "kluc" TEXT NOT NULL,
    "nazov" TEXT NOT NULL,
    "adresa" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "aktivna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pobocka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trener" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "meno" TEXT NOT NULL,
    "bio" TEXT,
    "foto" TEXT,
    "aktivny" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pobockaId" TEXT,

    CONSTRAINT "Trener_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sluzba" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nazov" TEXT NOT NULL,
    "popis" TEXT,
    "aktivna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pobockaId" TEXT,

    CONSTRAINT "Sluzba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cennik" (
    "id" TEXT NOT NULL,
    "kluc" TEXT NOT NULL,
    "nazov" TEXT NOT NULL,
    "popis" TEXT,
    "typ" "ProduktTyp" NOT NULL,
    "cenaCenty" INTEGER,
    "mena" TEXT NOT NULL DEFAULT 'eur',
    "kupitelneOnline" BOOLEAN NOT NULL DEFAULT false,
    "platnost" TEXT,
    "poznamka" TEXT,
    "poradie" INTEGER NOT NULL DEFAULT 0,
    "aktivna" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pobockaId" TEXT,

    CONSTRAINT "Cennik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clen" (
    "id" TEXT NOT NULL,
    "authUserId" UUID,
    "email" TEXT,
    "prezyvka" TEXT,
    "prezyvkaNorm" TEXT,
    "rola" "Rola" NOT NULL DEFAULT 'CLEN',
    "aktivny" BOOLEAN NOT NULL DEFAULT true,
    "meno" TEXT,
    "telefon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pobockaId" TEXT,

    CONSTRAINT "Clen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objednavka" (
    "id" TEXT NOT NULL,
    "cisloObjednavky" TEXT NOT NULL,
    "meno" TEXT,
    "email" TEXT,
    "produktKluc" TEXT NOT NULL,
    "produktNazov" TEXT NOT NULL,
    "produktTyp" "ProduktTyp" NOT NULL,
    "suma" INTEGER NOT NULL,
    "mena" TEXT NOT NULL DEFAULT 'eur',
    "stav" "ObjednavkaStav" NOT NULL DEFAULT 'PENDING',
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "redemptionMethod" "RedemptionMethod",
    "redeemedAt" TIMESTAMP(3),
    "clenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objednavka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permanentka" (
    "id" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "platnostOd" TIMESTAMP(3) NOT NULL,
    "platnostDo" TIMESTAMP(3) NOT NULL,
    "stav" "PermanentkaStav" NOT NULL DEFAULT 'AKTIVNA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clenId" TEXT NOT NULL,
    "pobockaId" TEXT NOT NULL,

    CONSTRAINT "Permanentka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "vytvorenyAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirujeO" TIMESTAMP(3) NOT NULL,
    "pouzity" BOOLEAN NOT NULL DEFAULT false,
    "clenId" TEXT NOT NULL,

    CONSTRAINT "QRToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VstupHistoria" (
    "id" TEXT NOT NULL,
    "datumCas" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sposob" "SposobVstupu" NOT NULL,
    "uspesny" BOOLEAN NOT NULL,
    "clenId" TEXT NOT NULL,
    "pobockaId" TEXT NOT NULL,

    CONSTRAINT "VstupHistoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dopyt" (
    "id" TEXT NOT NULL,
    "typ" "DopytTyp" NOT NULL,
    "meno" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefon" TEXT,
    "sprava" TEXT,
    "sluzba" TEXT,
    "terminPozadovany" TEXT,
    "vybaveny" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dopyt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cvik" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nazov" TEXT NOT NULL,
    "popis" TEXT,
    "jednotka" "Jednotka" NOT NULL,
    "aktivny" BOOLEAN NOT NULL DEFAULT true,
    "poradie" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cvik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rekord" (
    "id" TEXT NOT NULL,
    "clenId" TEXT NOT NULL,
    "cvikId" TEXT NOT NULL,
    "hodnota" DECIMAL(8,2) NOT NULL,
    "dosiahnute" DATE NOT NULL,
    "poznamka" TEXT,
    "stav" "VysledokStav" NOT NULL DEFAULT 'SUKROMNY',
    "posudilId" TEXT,
    "posudene" TIMESTAMP(3),
    "dovodZamietnutia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rekord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vyzva" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nazov" TEXT NOT NULL,
    "popis" TEXT,
    "cvikId" TEXT NOT NULL,
    "zaciatok" DATE NOT NULL,
    "koniec" DATE NOT NULL,
    "stav" "VyzvaStav" NOT NULL DEFAULT 'NAVRH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vyzva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VyzvaZapis" (
    "id" TEXT NOT NULL,
    "vyzvaId" TEXT NOT NULL,
    "clenId" TEXT NOT NULL,
    "hodnota" DECIMAL(8,2) NOT NULL,
    "stav" "VysledokStav" NOT NULL DEFAULT 'CAKA',
    "posudilId" TEXT,
    "posudene" TIMESTAMP(3),
    "dovodZamietnutia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VyzvaZapis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "aktorId" TEXT,
    "aktorPrezyvka" TEXT NOT NULL,
    "akcia" TEXT NOT NULL,
    "cielTyp" TEXT NOT NULL,
    "cielId" TEXT,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pobocka_kluc_key" ON "Pobocka"("kluc");

-- CreateIndex
CREATE UNIQUE INDEX "Trener_slug_key" ON "Trener"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Sluzba_slug_key" ON "Sluzba"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Cennik_kluc_key" ON "Cennik"("kluc");

-- CreateIndex
CREATE UNIQUE INDEX "Clen_authUserId_key" ON "Clen"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Clen_email_key" ON "Clen"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Clen_prezyvkaNorm_key" ON "Clen"("prezyvkaNorm");

-- CreateIndex
CREATE INDEX "Clen_rola_aktivny_idx" ON "Clen"("rola", "aktivny");

-- CreateIndex
CREATE UNIQUE INDEX "Objednavka_cisloObjednavky_key" ON "Objednavka"("cisloObjednavky");

-- CreateIndex
CREATE UNIQUE INDEX "Objednavka_stripeSessionId_key" ON "Objednavka"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Objednavka_stav_createdAt_idx" ON "Objednavka"("stav", "createdAt");

-- CreateIndex
CREATE INDEX "Permanentka_clenId_stav_idx" ON "Permanentka"("clenId", "stav");

-- CreateIndex
CREATE UNIQUE INDEX "QRToken_token_key" ON "QRToken"("token");

-- CreateIndex
CREATE INDEX "QRToken_clenId_pouzity_idx" ON "QRToken"("clenId", "pouzity");

-- CreateIndex
CREATE INDEX "VstupHistoria_clenId_datumCas_idx" ON "VstupHistoria"("clenId", "datumCas");

-- CreateIndex
CREATE INDEX "Dopyt_typ_vybaveny_createdAt_idx" ON "Dopyt"("typ", "vybaveny", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Cvik_slug_key" ON "Cvik"("slug");

-- CreateIndex
CREATE INDEX "Cvik_aktivny_poradie_idx" ON "Cvik"("aktivny", "poradie");

-- CreateIndex
CREATE INDEX "Rekord_clenId_cvikId_dosiahnute_idx" ON "Rekord"("clenId", "cvikId", "dosiahnute");

-- CreateIndex
CREATE INDEX "Rekord_cvikId_stav_hodnota_idx" ON "Rekord"("cvikId", "stav", "hodnota");

-- CreateIndex
CREATE UNIQUE INDEX "Vyzva_slug_key" ON "Vyzva"("slug");

-- CreateIndex
CREATE INDEX "Vyzva_stav_zaciatok_idx" ON "Vyzva"("stav", "zaciatok");

-- CreateIndex
CREATE INDEX "VyzvaZapis_vyzvaId_stav_hodnota_idx" ON "VyzvaZapis"("vyzvaId", "stav", "hodnota");

-- CreateIndex
CREATE UNIQUE INDEX "VyzvaZapis_vyzvaId_clenId_key" ON "VyzvaZapis"("vyzvaId", "clenId");

-- CreateIndex
CREATE INDEX "AdminLog_createdAt_idx" ON "AdminLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminLog_aktorId_createdAt_idx" ON "AdminLog"("aktorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Trener" ADD CONSTRAINT "Trener_pobockaId_fkey" FOREIGN KEY ("pobockaId") REFERENCES "Pobocka"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sluzba" ADD CONSTRAINT "Sluzba_pobockaId_fkey" FOREIGN KEY ("pobockaId") REFERENCES "Pobocka"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cennik" ADD CONSTRAINT "Cennik_pobockaId_fkey" FOREIGN KEY ("pobockaId") REFERENCES "Pobocka"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clen" ADD CONSTRAINT "Clen_pobockaId_fkey" FOREIGN KEY ("pobockaId") REFERENCES "Pobocka"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objednavka" ADD CONSTRAINT "Objednavka_clenId_fkey" FOREIGN KEY ("clenId") REFERENCES "Clen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permanentka" ADD CONSTRAINT "Permanentka_clenId_fkey" FOREIGN KEY ("clenId") REFERENCES "Clen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permanentka" ADD CONSTRAINT "Permanentka_pobockaId_fkey" FOREIGN KEY ("pobockaId") REFERENCES "Pobocka"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRToken" ADD CONSTRAINT "QRToken_clenId_fkey" FOREIGN KEY ("clenId") REFERENCES "Clen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VstupHistoria" ADD CONSTRAINT "VstupHistoria_clenId_fkey" FOREIGN KEY ("clenId") REFERENCES "Clen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VstupHistoria" ADD CONSTRAINT "VstupHistoria_pobockaId_fkey" FOREIGN KEY ("pobockaId") REFERENCES "Pobocka"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rekord" ADD CONSTRAINT "Rekord_clenId_fkey" FOREIGN KEY ("clenId") REFERENCES "Clen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rekord" ADD CONSTRAINT "Rekord_cvikId_fkey" FOREIGN KEY ("cvikId") REFERENCES "Cvik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rekord" ADD CONSTRAINT "Rekord_posudilId_fkey" FOREIGN KEY ("posudilId") REFERENCES "Clen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vyzva" ADD CONSTRAINT "Vyzva_cvikId_fkey" FOREIGN KEY ("cvikId") REFERENCES "Cvik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VyzvaZapis" ADD CONSTRAINT "VyzvaZapis_vyzvaId_fkey" FOREIGN KEY ("vyzvaId") REFERENCES "Vyzva"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VyzvaZapis" ADD CONSTRAINT "VyzvaZapis_clenId_fkey" FOREIGN KEY ("clenId") REFERENCES "Clen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VyzvaZapis" ADD CONSTRAINT "VyzvaZapis_posudilId_fkey" FOREIGN KEY ("posudilId") REFERENCES "Clen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_aktorId_fkey" FOREIGN KEY ("aktorId") REFERENCES "Clen"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ─────────────────────────────────────────────────────────────────
-- Obmedzenia, ktoré Prisma nevie vyjadriť v schéme.
-- Zdroj: docs/DATABASE.md, sekcia 4.
-- ─────────────────────────────────────────────────────────────────

-- Nikto nesmie schváliť vlastný výsledok — vynútené databázou,
-- nie len aplikačným kódom.
ALTER TABLE "Rekord"
  ADD CONSTRAINT "rekord_ziadne_samoschvalenie"
  CHECK ("posudilId" IS NULL OR "posudilId" <> "clenId");

ALTER TABLE "VyzvaZapis"
  ADD CONSTRAINT "vyzvazapis_ziadne_samoschvalenie"
  CHECK ("posudilId" IS NULL OR "posudilId" <> "clenId");

-- Zápis do výzvy je z definície odoslaný, nikdy súkromný.
ALTER TABLE "VyzvaZapis"
  ADD CONSTRAINT "vyzvazapis_nie_sukromny"
  CHECK ("stav" <> 'SUKROMNY');

-- Posúdený výsledok musí mať zaznamenané, kedy bol posúdený.
ALTER TABLE "Rekord"
  ADD CONSTRAINT "rekord_posudenie_uplne"
  CHECK (
    ("stav" IN ('SUKROMNY','CAKA') AND "posudilId" IS NULL AND "posudene" IS NULL)
    OR ("stav" IN ('SCHVALENE','ZAMIETNUTE') AND "posudene" IS NOT NULL)
  );

ALTER TABLE "VyzvaZapis"
  ADD CONSTRAINT "vyzvazapis_posudenie_uplne"
  CHECK (
    ("stav" = 'CAKA' AND "posudilId" IS NULL AND "posudene" IS NULL)
    OR ("stav" IN ('SCHVALENE','ZAMIETNUTE') AND "posudene" IS NOT NULL)
  );

-- Výkon nemôže byť nulový ani záporný.
ALTER TABLE "Rekord"
  ADD CONSTRAINT "rekord_hodnota_kladna" CHECK ("hodnota" > 0);

ALTER TABLE "VyzvaZapis"
  ADD CONSTRAINT "vyzvazapis_hodnota_kladna" CHECK ("hodnota" > 0);

-- Výzva nemôže skončiť skôr, než začne.
ALTER TABLE "Vyzva"
  ADD CONSTRAINT "vyzva_platne_obdobie" CHECK ("koniec" >= "zaciatok");