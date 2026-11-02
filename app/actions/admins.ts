"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import crypto from "crypto";

// 1. Fetch all administrators
export async function getAdministrators() {
  return await prisma.administrator.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// 2. Create/Invite a new Administrator
export async function createAdministrator(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const name = formData.get("name") as string;
  const tempPassword = formData.get("password") as string;

  if (!email || !name || !tempPassword) {
    return { success: false, error: "Email, name, and temporary password are required." };
  }

  if (tempPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  try {
    // Hash password using scrypt
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = crypto.scryptSync(tempPassword, salt, 64);
    const passwordHash = `${salt}:${derivedKey.toString("hex")}`;

    const newAdmin = await prisma.administrator.create({
      data: {
        email,
        name,
        passwordHash,
        isActive: true,
        isInvited: false,
      },
    });

    const cookieStore = await cookies();
    const currentAdminEmail = cookieStore.get("admin_email")?.value;
    const currentAdmin = await prisma.administrator.findUnique({ where: { email: currentAdminEmail } });

    if (currentAdmin) {
      await prisma.auditLog.create({
        data: {
          adminId: currentAdmin.id,
          action: "CREATE_ADMIN",
          targetModel: "Administrator",
          targetId: newAdmin.id,
          details: `Created new administrator account for ${email}`,
        },
      });
    }

    revalidatePath("/admin/dashboard/admins");
    return { success: true };
  } catch (error) {
    console.error("Failed to create admin:", error);
    return { success: false, error: "Administrator email already exists." };
  }
}

// 3. Revoke/Delete an Administrator
export async function deleteAdministrator(adminId: string) {
  try {
    const adminToDelete = await prisma.administrator.findUnique({ where: { id: adminId } });
    
    await prisma.administrator.delete({
      where: { id: adminId },
    });

    const cookieStore = await cookies();
    const currentAdminEmail = cookieStore.get("admin_email")?.value;
    const currentAdmin = await prisma.administrator.findUnique({ where: { email: currentAdminEmail } });

    if (currentAdmin) {
      await prisma.auditLog.create({
        data: {
          adminId: currentAdmin.id,
          action: "REVOKE_ADMIN",
          targetModel: "Administrator",
          targetId: adminId,
          details: `Revoked administrator access for ${adminToDelete?.email || adminId}`,
        },
      });
    }

    revalidatePath("/admin/dashboard/admins");
    return { success: true };
  } catch (error) {
    console.error("Failed to revoke admin:", error);
    return { success: false, error: "Failed to revoke administrator access." };
  }
}