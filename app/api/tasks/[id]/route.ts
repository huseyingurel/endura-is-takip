import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findTaskById, getPermissions, updateTask } from "@/lib/sheets";
import { canCloseTask, canUpdateTask, canViewTask } from "@/lib/permissions";
import { PRIORITIES, STATUSES, type Priority, type Status, type Task } from "@/lib/types";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
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
  return NextResponse.json({ task: updated });
}
