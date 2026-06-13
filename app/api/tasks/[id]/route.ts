import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { appendAttachments, findTaskById, getPermissions, updateTask } from "@/lib/sheets";
import { canCloseTask, canUpdateTask, canViewTask } from "@/lib/permissions";
import { PRIORITIES, STATUSES, type AttachmentUpload, type Priority, type Status, type Task } from "@/lib/types";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function attachmentsFromBody(body: Record<string, unknown>): AttachmentUpload[] {
  if (!Array.isArray(body.attachments)) return [];
  return body.attachments.map((item) => {
    const file = (item || {}) as Record<string, unknown>;
    const attachment = {
      fileName: String(file.fileName || "").trim(),
      mimeType: String(file.mimeType || "application/octet-stream").trim(),
      size: Number(file.size || 0),
      data: String(file.data || "")
    };
    if (!attachment.fileName || !attachment.data) throw new Error("Ek dosya bilgisi eksik");
    if (attachment.size > MAX_ATTACHMENT_SIZE) throw new Error("Dosya başına en fazla 10 MB yüklenebilir");
    return attachment;
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return bad("Oturum gerekli", 401);

  const { id } = await params;
  const [task, permissions] = await Promise.all([findTaskById(id), getPermissions()]);
  if (!task) return bad("Kayıt bulunamadı", 404);
  if (!canViewTask(user, permissions, task)) return bad("Bu kaydı görüntüleme yetkiniz yok", 403);
  if (!canUpdateTask(user, permissions, task)) return bad("Bu kaydı güncelleme yetkiniz yok", 403);

  const body = await request.json();
  let attachments: AttachmentUpload[];
  try {
    attachments = attachmentsFromBody(body);
  } catch (err) {
    return bad(err instanceof Error ? err.message : "Ek dosyalar okunamadı");
  }

  const nextStatus = body.statu && STATUSES.includes(body.statu) ? (body.statu as Status) : task.statu;
  if (nextStatus === "Tamamlandı" && !canCloseTask(user, permissions, task)) {
    return bad("Tamamlama yetkiniz yok", 403);
  }

  const updated: Task = {
    ...task,
    konuGrubu: body.konuGrubu ? String(body.konuGrubu) : task.konuGrubu,
    baslik: body.baslik ? String(body.baslik) : task.baslik,
    aciklama: body.aciklama !== undefined ? String(body.aciklama) : task.aciklama,
    gorevliEmail: body.gorevliEmail !== undefined ? String(body.gorevliEmail) : task.gorevliEmail,
    gorevliAd: body.gorevliAd !== undefined ? String(body.gorevliAd) : task.gorevliAd,
    oncelik: body.oncelik && PRIORITIES.includes(body.oncelik) ? (body.oncelik as Priority) : task.oncelik,
    statu: nextStatus,
    baslangicTarihi: body.baslangicTarihi !== undefined ? String(body.baslangicTarihi) : task.baslangicTarihi,
    hedefTarih: body.hedefTarih !== undefined ? String(body.hedefTarih) : task.hedefTarih,
    ilerleme: body.ilerleme !== undefined ? Number(body.ilerleme) : task.ilerleme,
    etiketler: body.etiketler !== undefined ? String(body.etiketler) : task.etiketler,
    sonGuncelleme: body.sonGuncelleme !== undefined ? String(body.sonGuncelleme) : task.sonGuncelleme,
    updatedAt: new Date().toISOString(),
    updatedBy: user.email
  };

  await updateTask(updated);
  await appendAttachments({
    parentType: "Task",
    parentId: updated.id,
    taskId: updated.id,
    files: attachments,
    uploadedBy: user.email,
    uploadedAt: updated.updatedAt
  });
  return NextResponse.json({ task: updated });
}
