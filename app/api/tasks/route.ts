import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  appendAttachments,
  appendTask,
  getDataBundle,
  getPermissions,
  initializeHeaders
} from "@/lib/sheets";
import { canCreateInTopic, canViewTask, capabilityForTopic, isAdmin } from "@/lib/permissions";
import { PRIORITIES, STATUSES, type AttachmentUpload, type Priority, type Status, type Task } from "@/lib/types";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

function nowIso() {
  return new Date().toISOString();
}

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

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return bad("Oturum gerekli", 401);

  const { tasks, updates, permissions, topics, assignees, attachments } = await getDataBundle();

  const visibleTasks = tasks.filter((task) => canViewTask(user, permissions, task));
  const visibleTaskIds = new Set(visibleTasks.map((task) => task.id));
  const visibleUpdates = updates.filter((u) => visibleTaskIds.has(u.taskId));
  const admin = isAdmin(user, permissions);
  const topicNames = topics.filter((topic) => topic.aktif).map((topic) => topic.konuGrubu).filter(Boolean);

  return NextResponse.json({
    user,
    statuses: STATUSES,
    priorities: PRIORITIES,
    tasks: visibleTasks,
    updates: visibleUpdates,
    attachments: attachments.filter((attachment) => visibleTaskIds.has(attachment.taskId)),
    topics,
    assignees,
    permissions: admin ? permissions : permissions.filter((p) => p.email === user.email),
    capabilities: topicNames.map((topic) => capabilityForTopic(user, permissions, topic)),
    admin
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return bad("Oturum gerekli", 401);

  const body = await request.json();
  let attachments: AttachmentUpload[];
  try {
    attachments = attachmentsFromBody(body);
  } catch (err) {
    return bad(err instanceof Error ? err.message : "Ek dosyalar okunamadı");
  }

  const permissions = await getPermissions();
  const konuGrubu = String(body.konuGrubu || "").trim();

  if (!konuGrubu) return bad("Konu grubu gerekli");
  if (!canCreateInTopic(user, permissions, konuGrubu)) return bad("Bu konu grubunda kayıt açma yetkiniz yok", 403);

  const at = nowIso();
  const task: Task = {
    id: crypto.randomUUID(),
    konuGrubu,
    baslik: String(body.baslik || "Yeni konu").trim(),
    aciklama: String(body.aciklama || "").trim(),
    gorevliEmail: body.gorevliEmail !== undefined ? String(body.gorevliEmail).trim() : user.email,
    gorevliAd: String(body.gorevliAd || user.name).trim(),
    oncelik: (PRIORITIES.includes(body.oncelik) ? body.oncelik : "Normal") as Priority,
    statu: (STATUSES.includes(body.statu) ? body.statu : "Başladı") as Status,
    baslangicTarihi: String(body.baslangicTarihi || new Date().toISOString().slice(0, 10)),
    hedefTarih: String(body.hedefTarih || ""),
    ilerleme: Number(body.ilerleme || 0),
    etiketler: String(body.etiketler || ""),
    sonGuncelleme: String(body.sonGuncelleme || ""),
    createdAt: at,
    createdBy: user.email,
    updatedAt: at,
    updatedBy: user.email
  };

  await appendTask(task);
  await appendAttachments({
    parentType: "Task",
    parentId: task.id,
    taskId: task.id,
    files: attachments,
    uploadedBy: user.email,
    uploadedAt: at
  });
  return NextResponse.json({ task }, { status: 201 });
}

export async function PUT() {
  const user = await getCurrentUser();
  if (!user) return bad("Oturum gerekli", 401);
  const permissions = await getPermissions();
  if (!isAdmin(user, permissions)) return bad("Sadece admin başlıkları başlatabilir", 403);
  await initializeHeaders();
  return NextResponse.json({ ok: true });
}
