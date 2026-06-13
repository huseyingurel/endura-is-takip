import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  appendTask,
  getAssignees,
  getPermissions,
  getTasks,
  getTopics,
  getUpdates,
  initializeHeaders
} from "@/lib/sheets";
import { canCreateInTopic, canViewTask, capabilityForTopic, isAdmin } from "@/lib/permissions";
import { PRIORITIES, STATUSES, type Priority, type Status, type Task } from "@/lib/types";

function nowIso() {
  return new Date().toISOString();
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return bad("Oturum gerekli", 401);

  const [tasks, updates, permissions, topics, assignees] = await Promise.all([
    getTasks(),
    getUpdates(),
    getPermissions(),
    getTopics(),
    getAssignees()
  ]);

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
