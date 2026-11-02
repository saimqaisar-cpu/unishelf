"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Fetch all courses with semester, program, and department info
export async function getCoursesWithDetails() {
  return await prisma.course.findMany({
    include: {
      semester: {
        include: {
          scheme: {
            include: {
              program: {
                include: {
                  department: true,
                },
              },
            },
          },
        },
      },
      courseBooks: {
        include: {
          book: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// 2. Fetch all semesters for dropdown selection when adding a course
export async function getAllSemesters() {
  return await prisma.semester.findMany({
    include: {
      scheme: {
        include: {
          program: true,
        },
      },
    },
    orderBy: [{ scheme: { program: { name: "asc" } } }, { number: "asc" }],
  });
}

// 3. Create a New Course under a Semester
export async function createCourse(formData: FormData) {
  const semesterId = formData.get("semesterId") as string;
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const creditHoursStr = formData.get("creditHours") as string;
  const creditHours = creditHoursStr ? parseInt(creditHoursStr) : null;

  if (!semesterId || !code || !name) {
    return { success: false, error: "Semester, course code, and course name are required." };
  }

  try {
    await prisma.course.create({
      data: {
        semesterId,
        code,
        name,
        creditHours,
        isPublished: true,
      },
    });

    revalidatePath("/admin/dashboard/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to create course:", error);
    return { success: false, error: "Course code already exists or database error." };
  }
}

// 4. Delete a Course
export async function deleteCourse(courseId: string) {
  try {
    await prisma.course.delete({
      where: { id: courseId },
    });
    revalidatePath("/admin/dashboard/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete course:", error);
    return { success: false, error: "Failed to delete course." };
  }
}