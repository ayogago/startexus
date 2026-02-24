-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "askingPrice" INTEGER,
    "priceType" TEXT NOT NULL DEFAULT 'ASKING',
    "revenueTtm" INTEGER,
    "profitTtm" INTEGER,
    "mrr" INTEGER,
    "aov" INTEGER,
    "trafficTtm" INTEGER,
    "monetization" TEXT NOT NULL DEFAULT '[]',
    "platform" TEXT NOT NULL DEFAULT '[]',
    "techStack" TEXT NOT NULL DEFAULT '[]',
    "establishedAt" DATETIME,
    "workloadHrsPerWk" INTEGER,
    "teamSize" INTEGER,
    "description" TEXT NOT NULL,
    "highlights" TEXT NOT NULL DEFAULT '[]',
    "growthOps" TEXT NOT NULL DEFAULT '[]',
    "risks" TEXT NOT NULL DEFAULT '[]',
    "assetsIncluded" TEXT NOT NULL DEFAULT '[]',
    "reasonForSale" TEXT,
    "location" TEXT,
    "confidential" BOOLEAN NOT NULL DEFAULT false,
    "siteUrl" TEXT,
    "analyticsProofUrl" TEXT,
    "revenueProofUrl" TEXT,
    "ndaRequired" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "favorites" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredAt" DATETIME,
    CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("analyticsProofUrl", "aov", "askingPrice", "assetsIncluded", "businessType", "category", "confidential", "createdAt", "description", "establishedAt", "favorites", "flagged", "growthOps", "highlights", "id", "location", "monetization", "mrr", "ndaRequired", "platform", "priceType", "profitTtm", "publishedAt", "reasonForSale", "revenueProofUrl", "revenueTtm", "risks", "sellerId", "siteUrl", "slug", "status", "teamSize", "techStack", "title", "trafficTtm", "updatedAt", "views", "workloadHrsPerWk") SELECT "analyticsProofUrl", "aov", "askingPrice", "assetsIncluded", "businessType", "category", "confidential", "createdAt", "description", "establishedAt", "favorites", "flagged", "growthOps", "highlights", "id", "location", "monetization", "mrr", "ndaRequired", "platform", "priceType", "profitTtm", "publishedAt", "reasonForSale", "revenueProofUrl", "revenueTtm", "risks", "sellerId", "siteUrl", "slug", "status", "teamSize", "techStack", "title", "trafficTtm", "updatedAt", "views", "workloadHrsPerWk" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
