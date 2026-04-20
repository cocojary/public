"use client";

import { useState, useTransition } from "react";
import { addHrNoteAction } from "@/server/actions/hrNoteActions";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Plus, User } from "lucide-react";

export type HRNote = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export default function HRCommentSection({
  recordId,
  initialNotes,
}: {
  recordId: string;
  initialNotes: HRNote[];
}) {
  const [notes, setNotes] = useState<HRNote[]>(initialNotes);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!newContent.trim()) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await addHrNoteAction(recordId, newContent);
        if (result.success && result.data) {
          // Update the local list
          setNotes(result.data);
          setNewContent("");
          setIsAdding(false);
        } else {
          setError(result.error ?? "Đã xảy ra lỗi khi lưu nhận xét.");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối.");
      }
    });
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 border-t-[6px] border-amber-400 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-amber-600" />
        <h3 className="text-lg font-bold text-slate-800">Ghi chú & Đánh giá của HR</h3>
      </div>

      {/* History of notes */}
      <div className="space-y-4 mb-6">
        {notes.length === 0 ? (
          <p className="text-sm text-slate-400 italic bg-amber-50/50 p-4 rounded-lg text-center border border-amber-100/50">
            Chưa có ghi chú nào từ bộ phận nhân sự.
          </p>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {notes.map((note) => (
              <div key={note.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <User size={14} />
                </div>
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-slate-700">{note.author}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(note.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Add */}
      {!isAdding ? (
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm nhận xét mới
          </Button>
        </div>
      ) : (
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 animate-in fade-in slide-in-from-top-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-3">Biên soạn nhận xét</h4>
          <textarea
            autoFocus
            className="w-full text-sm p-3 border border-amber-200 rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            placeholder="Nhập nội dung quan sát/phân tích thực tế người này..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewContent("");
                setError(null);
              }}
              disabled={isPending}
              className="text-slate-500"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending || !newContent.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu nhận xét
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
