-- CreateEnum
CREATE TYPE "Partia" AS ENUM ('NOHY', 'HRUD', 'CHRBAT', 'RAMENA', 'BICEPS', 'TRICEPS', 'CORE', 'NEZARADENE');

-- CreateEnum
CREATE TYPE "VyzvaTyp" AS ENUM ('SILOVA', 'CASOVA');

-- AlterTable
ALTER TABLE "Cvik" ADD COLUMN     "clenId" TEXT,
ADD COLUMN     "partia" "Partia" NOT NULL DEFAULT 'NEZARADENE';

-- AlterTable
ALTER TABLE "Vyzva" ADD COLUMN     "typ" "VyzvaTyp" NOT NULL DEFAULT 'SILOVA',
ALTER COLUMN "cvikId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TreningPlan" (
    "id" TEXT NOT NULL,
    "clenId" TEXT NOT NULL,
    "nazov" TEXT NOT NULL,
    "poradie" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreningPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanCvik" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "cvikId" TEXT NOT NULL,
    "cielSerie" INTEGER NOT NULL,
    "cielOpakovania" INTEGER NOT NULL,
    "poradie" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanCvik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trening" (
    "id" TEXT NOT NULL,
    "clenId" TEXT NOT NULL,
    "planId" TEXT,
    "nazov" TEXT NOT NULL,
    "zaciatok" TIMESTAMP(3) NOT NULL,
    "koniec" TIMESTAMP(3),
    "poznamka" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seria" (
    "id" TEXT NOT NULL,
    "treningId" TEXT NOT NULL,
    "cvikId" TEXT NOT NULL,
    "hmotnost" DECIMAL(6,2) NOT NULL,
    "opakovania" INTEGER NOT NULL,
    "poradie" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TreningPlan_clenId_poradie_idx" ON "TreningPlan"("clenId", "poradie");

-- CreateIndex
CREATE INDEX "PlanCvik_planId_poradie_idx" ON "PlanCvik"("planId", "poradie");

-- CreateIndex
CREATE INDEX "Trening_clenId_zaciatok_idx" ON "Trening"("clenId", "zaciatok");

-- CreateIndex
CREATE INDEX "Seria_treningId_poradie_idx" ON "Seria"("treningId", "poradie");

-- CreateIndex
CREATE INDEX "Seria_cvikId_hmotnost_idx" ON "Seria"("cvikId", "hmotnost");

-- CreateIndex
CREATE INDEX "Cvik_clenId_aktivny_idx" ON "Cvik"("clenId", "aktivny");

-- AddForeignKey
ALTER TABLE "Cvik" ADD CONSTRAINT "Cvik_clenId_fkey" FOREIGN KEY ("clenId") REFERENCES "Clen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreningPlan" ADD CONSTRAINT "TreningPlan_clenId_fkey" FOREIGN KEY ("clenId") REFERENCES "Clen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanCvik" ADD CONSTRAINT "PlanCvik_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TreningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanCvik" ADD CONSTRAINT "PlanCvik_cvikId_fkey" FOREIGN KEY ("cvikId") REFERENCES "Cvik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trening" ADD CONSTRAINT "Trening_clenId_fkey" FOREIGN KEY ("clenId") REFERENCES "Clen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trening" ADD CONSTRAINT "Trening_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TreningPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seria" ADD CONSTRAINT "Seria_treningId_fkey" FOREIGN KEY ("treningId") REFERENCES "Trening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seria" ADD CONSTRAINT "Seria_cvikId_fkey" FOREIGN KEY ("cvikId") REFERENCES "Cvik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
