"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Fetch all books with their course mappings and semester/program details
export async function getBooksWithDetails() {
  return await prisma.book.findMany({
    include: {
      courseMappings: {
        include: {
          course: {
            include: {
              semester: {
                include: {
                  scheme: {
                    include: {
                      program: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// 2. Fetch all courses for mapping dropdown
export async function getAllCourses() {
  return await prisma.course.findMany({
    include: {
      semester: {
        include: {
          scheme: {
            include: {
              program: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

// 3. Create a new Book and optionally map it to a course
export async function createBook(formData: FormData) {
  const title = formData.get("title") as string;
  const authors = formData.get("authors") as string;
  const edition = formData.get("edition") as string;
  const publisher = formData.get("publisher") as string;
  const bookType = formData.get("bookType") as string || "PDF";
  const pdfStorageUrl = formData.get("pdfStorageUrl") as string;
  const externalUrl = formData.get("externalUrl") as string;
  const courseId = formData.get("courseId") as string;
  const role = formData.get("role") as string || "TEXTBOOK";

  if (!title) {
    return { success: false, error: "Book title is required." };
  }

  try {
    const newBook = await prisma.book.create({
      data: {
        title,
        authors,
        edition,
        publisher,
        bookType,
        pdfStorageUrl: pdfStorageUrl || null,
        externalUrl: externalUrl || null,
        verificationStatus: "VERIFIED",
        rightsStatus: "OPEN_LICENSE",
        publicationStatus: "PUBLISHED",
      },
    });

    // If a course is selected, map the book to that course
    if (courseId) {
      await prisma.courseBookMapping.create({
        data: {
          courseId,
          bookId: newBook.id,
          role,
        },
      });
    }

    revalidatePath("/admin/dashboard/books");
    return { success: true };
  } catch (error) {
    console.error("Failed to create book:", error);
    return { success: false, error: "Failed to create book or map to course." };
  }
}

// 4. Delete a Book
export async function deleteBook(bookId: string) {
  try {
    await prisma.book.delete({
      where: { id: bookId },
    });
    revalidatePath("/admin/dashboard/books");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete book:", error);
    return { success: false, error: "Failed to delete book." };
  }
}