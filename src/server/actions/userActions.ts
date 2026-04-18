"use server";

import prisma from "@/server/db";
import { userInfoSchema, type UserInfoFormValues } from "@/features/assessment/schemas/userInfoSchema";

export async function submitUserInfo(data: UserInfoFormValues) {
  try {
    const parsedData = userInfoSchema.parse(data);

    // Save into database
    const user = await prisma.user.create({
      data: {
        fullName: parsedData.fullName,
        employeeId: parsedData.employeeId || null,
        email: parsedData.email || null,
        department: parsedData.department || null,
        // Using position field to store the role code for now if we don't want to change User schema again
        position: parsedData.targetRole, 
      },
    });

    return { success: true, userId: user.id, targetRole: parsedData.targetRole };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Đã có lỗi xảy ra khi lưu thông tin" };
  }
}
