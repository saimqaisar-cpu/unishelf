"use server";

import { prisma } from "../lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

async function verifyAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    throw new Error("Unauthorized access");
  }
}

// Fetch all administrators
export async function getAdministrators() {
  return await prisma.administrator.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// Invite New Admin
export async function inviteAdministrator(formData: FormData) {
  await verifyAdminSession();

  const name = formData.get("name") as string;
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!name || !email) {
    return { success: false, error: "Name and email are required." };
  }

  try {
    const existing = await prisma.administrator.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "An administrator with this email already exists." };
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.administrator.create({
      data: {
        name,
        email,
        isInvited: true,
        isActive: false,
        inviteToken,
        tokenExpiry,
      },
    });

    const inviteLink = `http://localhost:3000/admin/setup-password?token=${inviteToken}`;
    revalidatePath("/admin/dashboard/admins");
    return { success: true, inviteLink };
  } catch (error) {
    console.error("Failed to invite admin:", error);
    return { success: false, error: "Database error while inviting administrator." };
  }
}

// Delete Administrator & Trigger Notification Log
export async function deleteAdministrator(adminId: string) {
  await verifyAdminSession();

  try {
    const adminToDelete = await prisma.administrator.findUnique({
      where: { id: adminId },
    });

    if (!adminToDelete) {
      return { success: false, error: "Administrator not found." };
    }

    // Delete admin from database
    await prisma.administrator.delete({
      where: { id: adminId },
    });

    // Notification simulation (In production, integrate Nodemailer/Resend here to dispatch real email)
    const notificationLog = `Notification Email Sent to ${adminToDelete.email}: Your administrator access has been revoked by the system management.`;
    console.log(notificationLog);

    revalidatePath("/admin/dashboard/admins");
    return { success: true, message: notificationLog };
  } catch (error) {
    console.error("Failed to delete administrator:", error);
    return { success: false, error: "Failed to delete administrator." };
  }
}

// Complete Password Setup for Invited Admin
export async function setupAdminPassword(token: string, formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  const admin = await prisma.administrator.findUnique({
    where: { inviteToken: token },
  });

  if (!admin || !admin.tokenExpiry || admin.tokenExpiry < new Date()) {
    return { success: false, error: "Invalid or expired invitation token." };
  }

  await prisma.administrator.update({
    where: { id: admin.id },
    data: {
      passwordHash: password,
      isActive: true,
      isInvited: false,
      inviteToken: null,
      tokenExpiry: null,
    },
  });

  return { success: true };
}