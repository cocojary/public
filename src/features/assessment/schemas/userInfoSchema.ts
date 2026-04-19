import { z } from "zod";

export const userInfoSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  employeeId: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal('')),
  targetRole: z.string().optional(),
});

export type UserInfoFormValues = z.infer<typeof userInfoSchema>;
