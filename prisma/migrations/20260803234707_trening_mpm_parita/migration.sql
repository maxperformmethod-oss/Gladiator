/*
  Warnings:

  - You are about to drop the column `cielOpakovania` on the `PlanCvik` table. All the data in the column will be lost.
  - You are about to drop the column `cielSerie` on the `PlanCvik` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Clen" ADD COLUMN     "odpocinokSek" INTEGER NOT NULL DEFAULT 90,
ADD COLUMN     "tyzdennyCiel" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "zvuk" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PlanCvik" DROP COLUMN "cielOpakovania",
DROP COLUMN "cielSerie",
ADD COLUMN     "poznamka" TEXT;

-- AlterTable
ALTER TABLE "Seria" ADD COLUMN     "dokoncena" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "PlanSeria" (
    "id" TEXT NOT NULL,
    "planCvikId" TEXT NOT NULL,
    "poradie" INTEGER NOT NULL,
    "opakovania" INTEGER NOT NULL,
    "hmotnost" DECIMAL(6,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanSeria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanSeria_planCvikId_poradie_idx" ON "PlanSeria"("planCvikId", "poradie");

-- AddForeignKey
ALTER TABLE "PlanSeria" ADD CONSTRAINT "PlanSeria_planCvikId_fkey" FOREIGN KEY ("planCvikId") REFERENCES "PlanCvik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
