/*
  Warnings:

  - You are about to drop the `FarmRoute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RouteLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavedRoute` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FarmRoute";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RouteLike";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SavedRoute";
PRAGMA foreign_keys=on;
