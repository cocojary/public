"use client";

import { useState, useTransition } from "react";
import { addHrNoteAction, deleteHrNoteAction, updateHrNoteAction } from "@/server/actions/hrNoteActions";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Plus, User, Trash2, Pencil, Check, X } from "lucide-react";

export type HRNote = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
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

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = () => {
    if (!newContent.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await addHrNoteAction(recordId, newContent);
        if (result.success && result.data) {
          setNotes(result.data as HRNote[]);
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

  const handleDelete = (noteId: string) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteHrNoteAction(recordId, noteId);
        if (result.success && result.data) {
          setNotes(result.data as HRNote[]);
          setDeletingId(null);
        } else {
          setError(result.error ?? "Lỗi xóa ghi chú.");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối.");
      }
    });
  };

  const handleUpdate = (noteId: string) => {
    if (!editContent.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateHrNoteAction(recordId, noteId, editContent);
        if (result.success && result.data) {
          setNotes(result.data as HRNote[]);
          setEditingId(null);
        } else {
          setError(result.error ?? "Lỗi cập nhật ghi chú.");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối.");
      }
    });
  };

  const startEdit = (note: HRNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setDeletingId(null);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 border-t-[6px] border-amber-400 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-amber-600" />
        <h3 className="text-lg font-bold text-slate-800">Ghi chú & Đánh giá của HR</h3>
        {notes.length > 0 && (
          <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {notes.length} ghi chú
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* History of notes */}
      <div className="space-y-4 mb-6">
        {notes.length === 0 ? (
          <p className="text-sm text-slate-400 italic bg-amber-50/50 p-4 rounded-lg text-center border border-amber-100/50">
            Chưa có ghi chú nào từ bộ phận nhân sự.
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm group">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <User size={13} className="text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-slate-700 block">{note.author}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(note.createdAt).toLocaleString("vi-VN")}
                        {note.updatedAt && (
                          <span className="ml-1 text-slate-300">(đã sửa)</span>
                        )}
                      </span>
                    </div>
                  </div>
                  {/* Actions — show on hover */}
                  {editingId !== note.id && deletingId !== note.id && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => startEdit(note)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg hover:bg-amber-100 text-slate-400 hover:text-amber-700 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingId(note.id)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit mode */}
                {editingId === note.id ? (
                  <div>
                    <textarea
                      autoFocus
                      className="w-full text-sm p-2.5 border border-amber-300 rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-y"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={isPending}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded"
                      >
                        <X size={12} /> Hủy
                      </button>
                      <button
                        onClick={() => handleUpdate(note.id)}
                        disabled={isPending || !editContent.trim()}
                        className="flex items-center gap-1 text-xs text-white bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded-lg disabled:opacity-50"
                      >
                        {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Lưu
                      </button>
                    </div>
                  </div>
                ) : deletingId === note.id ? (
                  <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm">
                    <p className="text-red-700 font-medium mb-2">Xác nhận xóa ghi chú này?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeletingId(null)}
                        disabled={isPending}
                        className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 px-2 py-1 rounded border border-slate-300 bg-white"
                      >
                        <X size={12} /> Hủy
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        disabled={isPending}
                        className="flex items-center gap-1 text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded disabled:opacity-50"
                      >
                        {isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Xóa
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Add */}
      {!isAdding ? (
        <div className="flex justify-center mt-4">
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
            className="w-full text-sm p-3 border border-amber-200 rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white resize-y"
            placeholder="Nhập nội dung quan sát/phân tích thực tế người này..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
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
