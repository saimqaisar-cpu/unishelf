"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to generate URL-friendly slugs
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 1. Fetch all departments
export async function getDepartments() {
  return await prisma.department.findMany({
    orderBy: { name: "asc" },
  });
}

// 2. Create a new Department
export async function createDepartment(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;

  if (!name || !code) {
    return { success: false, error: "Department name and code are required." };
  }

  try {
    // For simplicity, find or create a default university if none exists
    let university = await prisma.university.findFirst();
    if (!university) {
      university = await prisma.university.create({
        data: {
          name: "Government College University Faisalabad",
          code: "GCUF",
          slug: "gcuf",
        },
      });
    }

    const slug = generateSlug(name);

    await prisma.department.create({
      data: {
        name,
        code,
        slug,
        universityId: university.id,
        isPublished: true,
      },
    });

    revalidatePath("/admin/dashboard/programs");
    return { success: true };
  } catch (error) {
    console.error("Failed to create department:", error);
    return { success: false, error: "Department code or name already exists." };
  }
}

// 3. Fetch all programs with departments, schemes, and nested semesters
export async function getProgramsWithDetails() {
  return await prisma.program.findMany({
    include: {
      department: true,
      schemes: {
        include: {
          semesters: {
            orderBy: { number: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// 4. Create a new Program (and automatically create a default Curriculum Scheme)
export async function createProgram(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const departmentId = formData.get("departmentId") as string;

  if (!name || !code || !departmentId) {
    return { success: false, error: "All program fields are required." };
  }

  try {
    const slug = generateSlug(name);

    // Create program and a default curriculum scheme simultaneously
    await prisma.program.create({
      data: {
        name,
        code,
        slug,
        departmentId,
        isPublished: true,
        schemes: {
          create: {
            name: `${name} Default Scheme`,
            isDefault: true,
            isPublished: true,
          },
        },
      },
    });

    revalidatePath("/admin/dashboard/programs");
    return { success: true };
  } catch (error) {
    console.error("Failed to create program:", error);
    return { success: false, error: "Program code or slug already exists." };
  }
}

// 5. Create a Semester inside a Program's Default Scheme
export async function createSemester(formData: FormData) {
  const programId = formData.get("programId") as string;
  const semesterNumber = parseInt(formData.get("semesterNumber") as string);
  const name = formData.get("name") as string;

  if (!programId || !semesterNumber || !name) {
    return { success: false, error: "All semester fields are required." };
  }

  try {
    // Find the default scheme for this program
    let scheme = await prisma.curriculumScheme.findFirst({
      where: { programId, isDefault: true },
    });

    // If no default scheme exists, create one
    if (!scheme) {
      const program = await prisma.program.findUnique({ where: { id: programId } });
      scheme = await prisma.curriculumScheme.create({
        data: {
          programId,
          name: `${program?.name || "Program"} Default Scheme`,
          isDefault: true,
          isPublished: true,
        },
      });
    }

    const slug = generateSlug(`${scheme.name}-${name}`);

    await prisma.semester.create({
      data: {
        schemeId: scheme.id,
        number: semesterNumber,
        name,
        slug,
        isPublished: true,
      },
    });

    revalidatePath("/admin/dashboard/programs");
    return { success: true };
  } catch (error) {
    console.error("Failed to create semester:", error);
    return { success: false, error: "Semester number already exists for this program scheme." };
  }
}

// 6. Delete a Program
export async function deleteProgram(programId: string) {
  try {
    await prisma.program.delete({
      where: { id: programId },
    });
    revalidatePath("/admin/dashboard/programs");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete program:", error);
    return { success: false, error: "Failed to delete program." };
  }
}

// 7. Delete a Semester
export async function deleteSemester(semesterId: string) {
  try {
    await prisma.semester.delete({
      where: { id: semesterId },
    });
    revalidatePath("/admin/dashboard/programs");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete semester:", error);
    return { success: false, error: "Failed to delete semester." };
  }
}