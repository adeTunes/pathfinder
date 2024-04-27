-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MENTOR', 'MENTEE');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('course', 'article');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('MENTOR_ACCEPTED', 'PENDING_REQUEST', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "SessionRequestStatus" AS ENUM ('ACCEPTED', 'PENDING', 'DECLINED');

-- CreateEnum
CREATE TYPE "DaysType" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MENTEE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "profilePicture" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resources" (
    "id" SERIAL NOT NULL,
    "type" "ResourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "coverPhoto" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentsEnrolled" INTEGER DEFAULT 0,
    "price" DOUBLE PRECISION,
    "level" TEXT,
    "duration" TEXT NOT NULL,
    "lessons" INTEGER,
    "quizzes" INTEGER DEFAULT 0,
    "hasCertifications" BOOLEAN DEFAULT false,
    "studentGraduated" INTEGER DEFAULT 0,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnverifiedUser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" INTEGER,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UnverifiedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Biodata" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "gender" TEXT,
    "institution" TEXT,
    "location" TEXT,
    "parentEmail" TEXT,
    "skills" TEXT[],
    "industry" TEXT,
    "yearsOfExperience" INTEGER,
    "levelOfExpertise" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Biodata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "mentorId" INTEGER NOT NULL,
    "dayAvailable" "DaysType" NOT NULL,
    "timeAvailable" INTEGER NOT NULL,
    "timeRemainingForSchedule" INTEGER,
    "lastDateScheduled" TIMESTAMP(3),

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionRequests" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateScheduled" TIMESTAMP(3) NOT NULL,
    "timeScheduled" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "expectations" TEXT[],
    "questions" TEXT[],
    "message" TEXT,
    "status" "SessionRequestStatus" DEFAULT 'PENDING',
    "mentorId" INTEGER NOT NULL,
    "menteeId" INTEGER NOT NULL,

    CONSTRAINT "SessionRequests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menteeId" INTEGER NOT NULL,
    "mentorId" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING_REQUEST',

    CONSTRAINT "Relation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UnverifiedUser_email_key" ON "UnverifiedUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UnverifiedUser_userId_key" ON "UnverifiedUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Biodata_userId_key" ON "Biodata"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_dayAvailable_mentorId_key" ON "Availability"("dayAvailable", "mentorId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionRequests_menteeId_mentorId_key" ON "SessionRequests"("menteeId", "mentorId");

-- CreateIndex
CREATE UNIQUE INDEX "Relation_menteeId_mentorId_key" ON "Relation"("menteeId", "mentorId");

-- AddForeignKey
ALTER TABLE "Resources" ADD CONSTRAINT "Resources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnverifiedUser" ADD CONSTRAINT "UnverifiedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Biodata" ADD CONSTRAINT "Biodata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Biodata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionRequests" ADD CONSTRAINT "SessionRequests_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionRequests" ADD CONSTRAINT "SessionRequests_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
