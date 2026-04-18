"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userInfoSchema, type UserInfoFormValues } from "../schemas/userInfoSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { submitUserInfo } from "@/server/actions/userActions";

export function UserInfoStep({ onNext }: { onNext: (userId: string, role: string) => void }) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoSchema),
  });

  const onSubmit = (data: UserInfoFormValues) => {
    startTransition(async () => {
      const res = await submitUserInfo(data);
      if (res.success && res.userId && res.targetRole) {
        onNext(res.userId, res.targetRole);
      } else {
        alert(res.error || "Ghi nhận thông tin thất bại!");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">Thông tin cá nhân</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Họ và Tên *</Label>
          <Input id="fullName" placeholder="Nguyễn Văn A" {...register("fullName")} />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <Label htmlFor="employeeId">Mã nhân viên (Tuỳ chọn)</Label>
          <Input id="employeeId" placeholder="VD: NV001" {...register("employeeId")} />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="email@example.com" {...register("email")} />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="targetRole">Vị trí ứng tuyển / Chức danh (Bắt buộc) *</Label>
          <Select onValueChange={(val) => setValue("targetRole", val)}>
            <SelectTrigger className="h-12 border-slate-200">
              <SelectValue placeholder="Chọn vị trí của bạn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIR">Giám đốc (Director)</SelectItem>
              <SelectItem value="HEAD">Trưởng bộ phận (Department Head)</SelectItem>
              <SelectItem value="DEV">Lập trình viên (Dev)</SelectItem>
              <SelectItem value="TESTER">Kiểm thử phần mềm (Tester)</SelectItem>
              <SelectItem value="MANAGER">Quản lý / Leader</SelectItem>
              <SelectItem value="PM">Project Manager (PM)</SelectItem>
              <SelectItem value="HR">Nhân sự (HR)</SelectItem>
              <SelectItem value="SALES">Kinh doanh / Sales</SelectItem>
              <SelectItem value="BRSE">Kỹ sư cầu nối (BrSE)</SelectItem>
              <SelectItem value="COMTOR">Biên phiên dịch (Comtor)</SelectItem>
              <SelectItem value="ACC">Kế toán (Accounting)</SelectItem>
              <SelectItem value="MKT">Marketing</SelectItem>
            </SelectContent>
          </Select>
          {errors.targetRole && <p className="text-red-500 text-sm mt-1">{errors.targetRole.message}</p>}
        </div>

        <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all" disabled={isPending}>
          {isPending ? "Đang xử lý..." : "Bắt đầu làm bài trắc nghiệm"}
        </Button>
      </form>
    </div>
  );
}
