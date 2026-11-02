"use server";

import { cookies } from "next/headers";
import { prisma } from "../lib/prisma";

export async function handleAdminLogin(formData: FormData) {
  const email = (formData.get("unishelf_user_id") as string)?.trim().toLowerCase();
  const password = formData.get("unishelf_user_pass") as string;

  if (!email || !password) {
    return { success: false, error: "Invalid credentials" };
  }

  const validEmail = (process.env.ADMIN_USERNAME || "qrssaimqaisar@gmail.com").trim().toLowerCase();
  const validPassword = process.env.ADMIN_PASSWORD || "unishelf2026";

  let isAuthenticated = false;
  let adminIdForLog = "";

  if (email === validEmail && password === validPassword) {
    isAuthenticated = true;
  } else {
    const adminUser = await prisma.administrator.findUnique({
      where: { email },
    });

    if (adminUser && adminUser.isActive && adminUser.passwordHash === password) {
      isAuthenticated = true;
      adminIdForLog = adminUser.id;
    }
  }

  if (isAuthenticated) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated_true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    cookieStore.set("admin_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    if (adminIdForLog) {
      await prisma.auditLog.create({
        data: {
          adminId: adminIdForLog,
          action: "LOGIN",
          targetModel: "Administrator",
          targetId: adminIdForLog,
          details: `Admin logged in successfully: ${email}`,
        },
      });
    }

    return { success: true };
  } else {
    return { success: false, error: "Invalid credentials" };
  }
}

export async function handleAdminLogout() {
  const cookieStore = await cookies();
  cookieStore.set("admin_session", "", { maxAge: 0, path: "/" });
  cookieStore.set("admin_email", "", { maxAge: 0, path: "/" });
}

export async function changeAdminPassword(formData: FormData) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const adminEmail = cookieStore.get("admin_email")?.value;

  if (!session || session.value !== "authenticated_true" || !adminEmail) {
    return { success: false, error: "Unauthorized session." };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmNewPassword = formData.get("confirmNewPassword") as string;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return { success: false, error: "All password fields are required." };
  }

  // Enforce stronger password policy (minimum 8 characters)
  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long." };
  }

  if (newPassword !== confirmNewPassword) {
    return { success: false, error: "New passwords do not match." };
  }

  const validEmail = (process.env.ADMIN_USERNAME || "qrssaimqaisar@gmail.com").trim().toLowerCase();
  const validPassword = process.env.ADMIN_PASSWORD || "unishelf2026";

  try {
    if (adminEmail === validEmail) {
      if (currentPassword !== validPassword) {
        return { success: false, error: "Incorrect current password." };
      }
      
      const dbAdmin = await prisma.administrator.findUnique({ where: { email: validEmail } });
      if (dbAdmin) {
        await prisma.administrator.update({
          where: { email: validEmail },
          data: { passwordHash: newPassword },
        });
        await prisma.auditLog.create({
          data: {
            adminId: dbAdmin.id,
            action: "UPDATE_PASSWORD",
            targetModel: "Administrator",
            targetId: dbAdmin.id,
            details: "Master administrator updated password.",
          },
        });
      }
      
      // Invalidate session on password change for security
      cookieStore.set("admin_session", "", { maxAge: 0, path: "/" });
      cookieStore.set("admin_email", "", { maxAge: 0, path: "/" });

      return { success: true, message: "Password updated successfully! Please log in again." };
    }

    const adminUser = await prisma.administrator.findUnique({
      where: { email: adminEmail },
    });

    if (!adminUser || adminUser.passwordHash !== currentPassword) {
      return { success: false, error: "Incorrect current password." };
    }

    await prisma.administrator.update({
      where: { email: adminEmail },
      data: { passwordHash: newPassword },
    });

    await prisma.auditLog.create({
      data: {
        adminId: adminUser.id,
        action: "UPDATE_PASSWORD",
        targetModel: "Administrator",
        targetId: adminUser.id,
        details: "Administrator updated password.",
      },
    });

    // Invalidate session on password change
    cookieStore.set("admin_session", "", { maxAge: 0, path: "/" });
    cookieStore.set("admin_email", "", { maxAge: 0, path: "/" });

    return { success: true, message: "Password updated successfully! Please log in again." };
  } catch (error) {
    console.error("Failed to change password:", error);
    return { success: false, error: "Database error while updating password." };
  }
}