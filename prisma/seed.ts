import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Initial Admin Account
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.administrator.upsert({
    where: { email: "admin@unishelf.com" },
    update: {},
    create: {
      email: "admin@unishelf.com",
      name: "Project Founder",
      passwordHash: passwordHash,
      isActive: true,
    },
  });
  console.log("Admin created:", admin.email);

  // 2. Create University (GCUF)
  const university = await prisma.university.upsert({
    where: { code: "GCUF" },
    update: {},
    create: {
      name: "Government College University Faisalabad",
      code: "GCUF",
      slug: "gcuf",
    },
  });

  // 3. Create Department (Information Technology)
  const department = await prisma.department.upsert({
    where: { slug: "department-of-information-technology" },
    update: {},
    create: {
      universityId: university.id,
      name: "Department of Information Technology",
      code: "IT",
      slug: "department-of-information-technology",
      isPublished: true,
    },
  });

  // 4. Create Program (ADP IT)
  const program = await prisma.program.upsert({
    where: { slug: "adp-information-technology" },
    update: {},
    create: {
      departmentId: department.id,
      name: "ADP Information Technology",
      code: "ADP-IT",
      slug: "adp-information-technology",
      isPublished: true,
    },
  });

  // 5. Create Curriculum Scheme (Session 2024-2026)
  const scheme = await prisma.curriculumScheme.create({
    data: {
      programId: program.id,
      name: "Session 2024–2026",
      isDefault: true,
      isPublished: true,
    },
  });

  // 6. Create Semesters 1 to 4
  const semesterData = [
    { number: 1, name: "Semester 1", slug: "semester-1" },
    { number: 2, name: "Semester 2", slug: "semester-2" },
    { number: 3, name: "Semester 3", slug: "semester-3" },
    { number: 4, name: "Semester 4", slug: "semester-4" },
  ];

  for (const semInfo of semesterData) {
    const semester = await prisma.semester.create({
      data: {
        schemeId: scheme.id,
        number: semInfo.number,
        name: semInfo.name,
        slug: semInfo.slug,
        isPublished: true,
      },
    });

    // Add Sample Courses & Books for Semester 1 & 2 as proof of concept
    if (semInfo.number === 1) {
      const course1 = await prisma.course.create({
        data: {
          semesterId: semester.id,
          code: "ITC-301",
          name: "Introduction to Information and Communication Technologies",
          creditHours: 3,
        },
      });

      const book1 = await prisma.book.create({
        data: {
          title: "Introduction to Computers",
          authors: "Peter Norton",
          edition: "7th",
          isbn: "978-0073516571",
          publisher: "McGraw-Hill",
          verificationStatus: "VERIFIED",
          rightsStatus: "EXTERNAL_ONLY",
          accessType: "EXTERNAL_LINK",
          externalUrl: "https://example.com/peter-norton-intro-to-computers",
          sourceReference: "GCUF Official Syllabus 2024",
        },
      });

      await prisma.courseBookMapping.create({
        data: {
          courseId: course1.id,
          bookId: book1.id,
        },
      });
    }

    if (semInfo.number === 2) {
      const course2 = await prisma.course.create({
        data: {
          semesterId: semester.id,
          code: "CC-321",
          name: "Object Oriented Programming",
          creditHours: 4,
        },
      });

      const book2 = await prisma.book.create({
        data: {
          title: "Java: How to Program",
          authors: "Paul Deitel, Harvey Deitel",
          edition: "11th",
          isbn: "978-0134743356",
          publisher: "Pearson",
          verificationStatus: "VERIFIED",
          rightsStatus: "EXTERNAL_ONLY",
          accessType: "EXTERNAL_LINK",
          externalUrl: "https://example.com/deitel-java-how-to-program",
          sourceReference: "GCUF Official Syllabus 2024",
        },
      });

      await prisma.courseBookMapping.create({
        data: {
          courseId: course2.id,
          bookId: book2.id,
        },
      });
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });