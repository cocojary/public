"use server";

import prisma from "@/server/db";
import { revalidatePath } from "next/cache";

export async function addHrNoteAction(recordId: string, content: string) {
  try {
    const record = await prisma.assessmentRecord.findUnique({
      where: { id: recordId },
      select: { hrNotes: true },
    });

    if (!record) {
      return { success: false, error: "Không tìm thấy hồ sơ đánh giá" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let notes: any[] = [];
    if (record.hrNotes && Array.isArray(record.hrNotes)) {
      notes = [...record.hrNotes];
    } else if (typeof record.hrNotes === "string") {
      try {
        const parsed = JSON.parse(record.hrNotes);
        if (Array.isArray(parsed)) {
          notes = parsed;
        }
      } catch (e) {
        // Not a JSON string, ignore or convert
      }
    }

    // append new note
    const newNote = {
      id: crypto.randomUUID(),
      content,
      author: "Nhân sự HR",
      createdAt: new Date().toISOString(),
    };

    notes.push(newNote);

    await prisma.assessmentRecord.update({
      where: { id: recordId },
      data: { hrNotes: notes },
    });

    revalidatePath(`/result/${recordId}`);
    revalidatePath('/admin');

    return { success: true, data: notes };
  } catch (error: any) {
    console.error("addHrNoteAction error:", error);
    return { success: false, error: "Đã xảy ra lỗi hệ thống" };
  }
}

export async function deleteHrNoteAction(recordId: string, noteId: string) {
  try {
    const record = await prisma.assessmentRecord.findUnique({
      where: { id: recordId },
      select: { hrNotes: true },
    });

    if (!record) {
      return { success: false, error: "Không tìm thấy hồ sơ đánh giá" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let notes: any[] = Array.isArray(record.hrNotes) ? [...record.hrNotes] : [];
    notes = notes.filter((n: any) => n.id !== noteId);

    await prisma.assessmentRecord.update({
      where: { id: recordId },
      data: { hrNotes: notes },
    });

    revalidatePath(`/result/${recordId}`);
    revalidatePath('/admin');

    return { success: true, data: notes };
  } catch (error: any) {
    console.error("deleteHrNoteAction error:", error);
    return { success: false, error: "Đã xảy ra lỗi hệ thống" };
  }
}

export async function updateHrNoteAction(recordId: string, noteId: string, content: string) {
  try {
    const record = await prisma.assessmentRecord.findUnique({
      where: { id: recordId },
      select: { hrNotes: true },
    });

    if (!record) {
      return { success: false, error: "Không tìm thấy hồ sơ đánh giá" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let notes: any[] = Array.isArray(record.hrNotes) ? [...record.hrNotes] : [];
    notes = notes.map((n: any) =>
      n.id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
    );

    await prisma.assessmentRecord.update({
      where: { id: recordId },
      data: { hrNotes: notes },
    });

    revalidatePath(`/result/${recordId}`);
    revalidatePath('/admin');

    return { success: true, data: notes };
  } catch (error: any) {
    console.error("updateHrNoteAction error:", error);
    return { success: false, error: "Đã xảy ra lỗi hệ thống" };
  }
}
