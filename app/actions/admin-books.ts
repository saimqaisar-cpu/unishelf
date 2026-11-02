"use server";

import { prisma } from "../lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

// Helper to check admin session
async function verifyAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    throw new Error("Unauthorized access");
  }
}

// Fetch Programs dynamically
export async function getPrograms() {
  return await prisma.program.findMany({
    include: { department: true },
    orderBy: { name: "asc" },
  });
}

// Fetch Semesters by Program ID
export async function getSemestersByProgram(programId: string) {
  const schemes = await prisma.curriculumScheme.findMany({
    where: { programId },
    include: { semesters: { orderBy: { number: "asc" } } },
  });
  
  const semesters = schemes.flatMap((scheme: any) => scheme.semesters);
  return semesters;
}

// Fetch Courses by Semester ID
export async function getCoursesBySemester(semesterId: string) {
  return await prisma.course.findMany({
    where: { semesterId },
    orderBy: { code: "asc" },
  });
}

// Create or Save Book Workflow
export async function createBookRecord(formData: FormData) {
  await verifyAdminSession();

  const title = formData.get("title") as string;
  const authors = formData.get("authors") as string;
  const publisher = formData.get("publisher") as string;
  const edition = formData.get("edition") as string;
  const isbn = formData.get("isbn") as string;
  const bookType = formData.get("bookType") as string; // "PDF" or "EXTERNAL"
  const courseId = formData.get("courseId") as string;
  const rightsStatus = formData.get("rightsStatus") as string || "PUBLIC_DOMAIN";

  if (!title || !courseId || !bookType) {
    return { success: false, error: "Missing required fields." };
  }

  let pdfStorageUrl = null;
  let externalUrl = null;
  let coverImageUrl = null;

  const pdfFile = formData.get("pdfFile") as File;
  const coverFile = formData.get("coverFile") as File;

  const uploadsDir = path.join(process.cwd(), "public/uploads");

  if (coverFile && coverFile.size > 0) {
    const coverBytes = await coverFile.arrayBuffer();
    const coverBuffer = Buffer.from(coverBytes);
    const coverFilename = `${Date.now()}-${coverFile.name.replace(/\s+/g, "_")}`;
    await writeFile(path.join(uploadsDir, coverFilename), coverBuffer);
    coverImageUrl = `/uploads/${coverFilename}`;
  }

  if (bookType === "PDF") {
    if (!pdfFile || pdfFile.size === 0) {
      return { success: false, error: "PDF file is required for Upload Complete Book option." };
    }
    if (pdfFile.type !== "application/pdf") {
      return { success: false, error: "Invalid file type. Only PDF files are allowed." };
    }

    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfBytes);
    const pdfFilename = `${Date.now()}-${pdfFile.name.replace(/\s+/g, "_")}`;
    await writeFile(path.join(uploadsDir, pdfFilename), pdfBuffer);
    pdfStorageUrl = `/uploads/${pdfFilename}`;
  } else if (bookType === "EXTERNAL") {
    externalUrl = formData.get("externalUrl") as string;
    if (!externalUrl || externalUrl.startsWith("javascript:")) {
      return { success: false, error: "A valid external URL is required." };
    }
  }

  try {
    const newBook = await prisma.book.create({
      data: {
        title,
        authors,
        publisher,
        edition,
        isbn,
        bookType,
        pdfStorageUrl,
        externalUrl,
        coverImageUrl,
        rightsStatus,
        verificationStatus: "VERIFIED",
        publicationStatus: "PUBLISHED",
        courseMappings: {
          create: {
            courseId,
            role: "TEXTBOOK",
          },
        },
      },
    });

    revalidatePath("/admin/dashboard");
    return { success: true, bookId: newBook.id };
  } catch (error) {
    console.error("Failed to create book:", error);
    return { success: false, error: "Database error while saving the book." };
  }
}