-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('owner', 'member');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('food', 'transport', 'housing', 'entertainment', 'shopping', 'other');

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_addedById_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_roomId_fkey";

-- DropForeignKey
ALTER TABLE "_RoomToUser" DROP CONSTRAINT "_RoomToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomToUser" DROP CONSTRAINT "_RoomToUser_B_fkey";

-- DropIndex
DROP INDEX "Item_addedById_idx";

-- AlterTable
ALTER TABLE "Item" DROP CONSTRAINT "Item_pkey",
DROP COLUMN "price",
DROP COLUMN "quantity",
ADD COLUMN     "amount" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "category" "ItemCategory" NOT NULL,
ADD COLUMN     "date" DATE NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "paidById" TEXT NOT NULL,
ADD COLUMN     "splitBetween" TEXT[],
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roomId" SET DATA TYPE TEXT,
ALTER COLUMN "addedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "Item_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Item_id_seq";

-- AlterTable
ALTER TABLE "Room" DROP CONSTRAINT "Room_pkey",
DROP COLUMN "totalSum",
ADD COLUMN     "endDate" DATE,
ADD COLUMN     "inviteCode" TEXT NOT NULL,
ADD COLUMN     "startDate" DATE,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Room_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "_RoomToUser";

-- CreateTable
CREATE TABLE "RoomMember" (
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomMember_pkey" PRIMARY KEY ("roomId","userId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomMember_userId_idx" ON "RoomMember"("userId");

-- CreateIndex
CREATE INDEX "Payment_roomId_idx" ON "Payment"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_inviteCode_key" ON "Room"("inviteCode");

-- AddForeignKey
ALTER TABLE "RoomMember" ADD CONSTRAINT "RoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMember" ADD CONSTRAINT "RoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
