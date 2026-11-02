"use server";

import { prisma } from "../lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function verifyAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    throw new Error("Unauthorized access");
  }
}

// Fetch all programs with departments & schemes
export async function getProgramsFull() {
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
    orderBy: { name: "asc" },
  });
}

// Fetch departments for dropdown selection when creating a program
export async function getDepartments() {
  return await prisma.department.findMany({
    orderBy: { name: "asc" },
  });
}

// Create Program & Default Scheme
export async function createProgram(formData: FormData) {
  await verifyAdminSession();

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const departmentId = formData.get("departmentId") as string;

  if (!name || !code || !departmentId) {
    return { success: false, error: "All fields are required." };
  }

  try {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const newProgram = await prisma.program.create({
      data: {
        name,
        code,
        slug: `${slug}-${Date.now()}`,
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
    return { success: true, programId: newProgram.id };
  } catch (error) {
    console.error("Failed to create program:", error);
    return { success: false, error: "Database error or duplicate program code." };
  }
}

// Delete Program
export async function deleteProgram(programId: string) {
  await verifyAdminSession();
  try {
    await prisma.program.delete({
      where: { id: programId },
    });
    revalidatePath("/admin/dashboard/programs");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete program." };
  }
}

// Add Semester to Program's Default Scheme
export async function createSemester(formData: FormData) {
  await verifyAdminSession();

  const programId = formData.get("programId") as string;
  const numberStr = formData.get("number") as string;
  const name = formData.get("name") as string;

  if (!programId || !numberStr || !name) {
    return { success: false, error: "Missing required semester details." };
  }

  const number = parseInt(numberStr, 10);

  try {
    // Find default scheme for this program
    let scheme = await prisma.curriculumScheme.findFirst({
      where: { programId, isDefault: true },
    });

    if (!scheme) {
      scheme = await prisma.curriculumScheme.create({
        data: {
          programId,
          name: "Default Scheme",
          isDefault: true,
          isPublished: true,
        },
      });
    }

    const slug = `semester-${number}-${Date.now()}`;

    await prisma.semester.create({
      data: {
        schemeId: scheme.id,
        number,
        name,
        slug,
        isPublished: true,
      },
    });

    revalidatePath("/admin/dashboard/programs");
    return { success: true };
  } catch (error) {
    console.error("Failed to create semester:", error);
    return { success: false, error: "Semester number already exists for this scheme." };
  }
}

// Delete Semester
export async function deleteSemester(semesterId: string) {
  await verifyAdminSession();
  try {
    await prisma.semester.delete({
      where: { id: semesterId },
    });
    revalidatePath("/admin/dashboard/programs");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete semester." };
  }
}