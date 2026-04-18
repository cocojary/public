"use server";

import prisma from "@/server/db";
import { userInfoSchema, type UserInfoFormValues } from "@/features/assessment/schemas/userInfoSchema";

export async function submitUserInfo(data: UserInfoFormValues) {
  try {
    // Validate the incoming data from server-side as well
    const parsedData = userInfoSchema.parse(data);

    // Save into database
    const user = await prisma.user.create({
      data: {
        fullName: parsedData.fullName,
        employeeId: parsedData.employeeId || null,
        email: parsedData.email || null,
        department: parsedData.department || null,
        position: parsedData.position || null,
      },
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Đã có lỗi xảy ra khi lưu thông tin" };
  }
}
