-- AlterTable
ALTER TABLE "Catalog" ADD COLUMN "coverPhotoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Catalog_coverPhotoId_key" ON "Catalog"("coverPhotoId");

-- AddForeignKey
ALTER TABLE "Catalog" ADD CONSTRAINT "Catalog_coverPhotoId_fkey" FOREIGN KEY ("coverPhotoId") REFERENCES "Photo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
