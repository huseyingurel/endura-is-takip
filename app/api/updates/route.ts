import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { appendUpdate, findTaskById, getPermissions, getUpdates, updateTask } from "@/lib/sheets";
import { canCommentTask, canViewTask } from "@/lib/permissions";
import { UPDATE_TYPES, type TaskUpdate, type UpdateType } from "@/lib/types";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return bad("Oturum gerekli", 401);
  const taskId = new URL(request.url).searchParams.get("taskId") || "";
  const [task, updates, permissions] = await Promise.all([
    findTaskById(taskId),
    getUpdates(),
    getPermissions()
  ]);
  if (!task) return bad("Kayıt bulunamadı", 404);
  if (!canViewTask(user, permissions, task)) return bad("Bu kaydı görüntüleme yetkiniz yok", 403);
  return NextResponse.json({ updates: updates.filter((u) => u.taskId === taskId) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return bad("Oturum gerekli", 401);
  const body = await request.json();
  const taskId = String(body.taskId || "");
  const [task, permissions] = await Promise.all([findTaskById(taskId), getPermissions()]);
  if (!task) return bad("Kayıt bulunamadı", 404);
  if (!canCommentTask(user, permissions, task)) return bad("Bu kayda güncelleme/fikir/soru girme yetkiniz yok", 403);

  const tip = UPDATE_TYPES.includes(body.tip) ? (body.tip as UpdateType) : "Güncelleme";
  const at = new Date().toISOString();
  const update: TaskUpdate = {
    id: crypto.randomUUID(),
    taskId,
    tip,
    metin: String(body.metin || "").trim(),
    yazarEmail: user.email,
    yazarAd: user.name,
    createdAt: at,
    ekLink: String(body.ekLink || "").trim()
  };
  if (!update.metin) return bad("Metin gerekli");

  await appendUpdate(update);
  await updateTask({
    ...task,
    sonGuncelleme: `${tip}: ${update.metin}`,
    updatedAt: at,
    updatedBy: user.email
  });

  return NextResponse.json({ update }, { status: 201 });
}
