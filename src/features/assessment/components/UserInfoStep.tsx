"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userInfoSchema, type UserInfoFormValues } from "../schemas/userInfoSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitUserInfo } from "@/server/actions/userActions";

const DEPARTMENTS = [
  "Kỹ thuật / Engineering",
  "Nhân sự / HR",
  "Kinh doanh / Sales",
  "Marketing",
  "Kế toán / Finance",
  "Quản lý dự án / PM",
  "QA / Testing",
  "Thiết kế / Design",
  "Ban Giám đốc",
  "Khác",
];

const FIELD_CONFIGS = [
  {
    id: "fullName",
    label: "Họ và Tên",
    placeholder: "Nguyễn Văn A",
    type: "text",
    required: true,
    icon: "👤",
    hint: "Tên đầy đủ của bạn",
  },
  {
    id: "employeeId",
    label: "Mã nhân viên",
    placeholder: "VD: NV001 (tuỳ chọn)",
    type: "text",
    required: false,
    icon: "🏷️",
    hint: "Để trống nếu không có",
  },
  {
    id: "email",
    label: "Email",
    placeholder: "email@techzen.vn",
    type: "email",
    required: false,
    icon: "✉️",
    hint: "Nhận kết quả qua email (tuỳ chọn)",
  },
];

export function UserInfoStep({ onNext }: { onNext: (userId: string) => void }) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoSchema),
  });

  const onSubmit = (data: UserInfoFormValues) => {
    startTransition(async () => {
      const res = await submitUserInfo(data);
      if (res.success && res.userId) {
        onNext(res.userId);
      } else {
        alert(res.error || "Ghi nhận thông tin thất bại!");
      }
    });
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
          <span className="text-3xl">📝</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Thông tin của bạn</h2>
        <p className="text-slate-500 text-sm">Chỉ mất 30 giây — thông tin được bảo mật hoàn toàn</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Progress indicator */}
        <div className="bg-indigo-600 h-1.5 w-1/3" title="Bước 2/3" />

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
          {/* Standard fields */}
          {FIELD_CONFIGS.map(field => (
            <div key={field.id} className="space-y-1.5">
              <Label htmlFor={field.id} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span>{field.icon}</span>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                {...register(field.id as keyof UserInfoFormValues)}
                className="h-11 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors"
              />
              {errors[field.id as keyof typeof errors] && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <span>⚠️</span> {(errors[field.id as keyof typeof errors] as any)?.message}
                </p>
              )}
              <p className="text-xs text-slate-400">{field.hint}</p>
            </div>
          ))}

          {/* Department */}
          <div className="space-y-1.5">
            <Label htmlFor="department" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span>🏢</span> Phòng ban
            </Label>
            <select
              id="department"
              {...register("department")}
              className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white text-slate-700 transition-colors"
            >
              <option value="">-- Chọn phòng ban --</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400">Phục vụ phân tích theo nhóm (tuỳ chọn)</p>
          </div>

          {/* Target role */}
          <div className="space-y-1.5">
            <Label htmlFor="targetRole" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span>🎯</span> Vị trí / Chức danh
            </Label>
            <Input
              id="targetRole"
              placeholder="VD: Kỹ sư phần mềm, Sales, HR..."
              {...register("targetRole")}
              className="h-11 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 transition-colors"
            />
            <p className="text-xs text-slate-400">Hệ thống sẽ phân tích phù hợp với vị trí của bạn</p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.01] shadow-md hover:shadow-lg"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "Tiếp tục làm bài →"
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-slate-400">
            🔒 Thông tin của bạn được bảo mật và chỉ HR mới có quyền xem
          </p>
        </form>
      </div>
    </div>
  );
}
