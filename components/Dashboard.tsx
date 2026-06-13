"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { PRIORITIES, STATUSES, UPDATE_TYPES, type Assignee, type Capability, type Permission, type Task, type TaskUpdate, type Topic, type User } from "@/lib/types";

type Payload = {
  user: User;
  statuses: string[];
  priorities: string[];
  tasks: Task[];
  updates: TaskUpdate[];
  topics: Topic[];
  assignees: Assignee[];
  permissions: Permission[];
  capabilities: Capability[];
  admin: boolean;
};

type TaskDraft = Partial<Task> & { id?: string };

const emptyDraft: TaskDraft = {
  konuGrubu: "",
  baslik: "",
  aciklama: "",
  gorevliEmail: "",
  gorevliAd: "",
  oncelik: "Normal",
  statu: "Başladı",
  baslangicTarihi: new Date().toISOString().slice(0, 10),
  hedefTarih: "",
  ilerleme: 0,
  etiketler: ""
};

function statusClass(status: string) {
  if (status === "Tamamlandı") return "green";
  if (status === "Duraksadı") return "red";
  if (status === "İlerliyor") return "blue";
  return "";
}

function priorityClass(priority: string) {
  if (priority === "Kritik") return "red";
  if (priority === "Yüksek") return "amber";
  if (priority === "Düşük") return "blue";
  return "";
}

function formatDate(date?: string) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("tr-TR");
}

function overdue(task: Task) {
  if (!task.hedefTarih || task.statu === "Tamamlandı") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.hedefTarih) < today;
}

export default function Dashboard() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"table" | "board" | "matrix">("table");
  const [selected, setSelected] = useState<Task | null>(null);
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [showForm, setShowForm] = useState(false);
  const [comment, setComment] = useState({ tip: "Güncelleme", metin: "", ekLink: "" });
  const [filters, setFilters] = useState({ search: "", topic: "", assignee: "", status: "", priority: "", due: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Veri alınamadı");
      setPayload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const tasks = useMemo(() => payload?.tasks || [], [payload?.tasks]);
  const updates = useMemo(() => payload?.updates || [], [payload?.updates]);
  const topics = useMemo(() => payload?.topics || [], [payload?.topics]);
  const assigneeRows = useMemo(() => payload?.assignees || [], [payload?.assignees]);
  const capabilities = useMemo(() => payload?.capabilities || [], [payload?.capabilities]);

  const topicNames = useMemo(() => {
    return topics.filter((t) => t.aktif).map((t) => t.konuGrubu).filter(Boolean).sort();
  }, [topics]);

  const assignees = useMemo(() => {
    const configured = assigneeRows.filter((assignee) => assignee.aktif).map((assignee) => assignee.adSoyad).filter(Boolean);
    const taskNames = tasks.map((task) => task.gorevliAd || task.gorevliEmail).filter(Boolean);
    return Array.from(new Set(configured.length > 0 ? configured : taskNames)).sort();
  }, [assigneeRows, tasks]);

  const assigneeEmailByName = useMemo(() => {
    return new Map(assigneeRows.map((assignee) => [assignee.adSoyad, assignee.email]));
  }, [assigneeRows]);

  const canCreateTopics = useMemo(() => {
    return capabilities.filter((c) => c.canCreate).map((c) => c.konuGrubu);
  }, [capabilities]);

  const filteredTasks = useMemo(() => {
    const q = filters.search.trim().toLocaleLowerCase("tr-TR");
    return tasks.filter((task) => {
      const text = `${task.konuGrubu} ${task.baslik} ${task.aciklama} ${task.gorevliAd} ${task.etiketler}`.toLocaleLowerCase("tr-TR");
      if (q && !text.includes(q)) return false;
      if (filters.topic && task.konuGrubu !== filters.topic) return false;
      if (filters.assignee && (task.gorevliAd || task.gorevliEmail) !== filters.assignee) return false;
      if (filters.status && task.statu !== filters.status) return false;
      if (filters.priority && task.oncelik !== filters.priority) return false;
      if (filters.due === "overdue" && !overdue(task)) return false;
      if (filters.due === "open" && task.statu === "Tamamlandı") return false;
      return true;
    });
  }, [tasks, filters]);

  const kpis = useMemo(() => {
    const total = filteredTasks.length;
    const closed = filteredTasks.filter((t) => t.statu === "Tamamlandı").length;
    const stalled = filteredTasks.filter((t) => t.statu === "Duraksadı").length;
    const late = filteredTasks.filter(overdue).length;
    const avg = total ? Math.round(filteredTasks.reduce((sum, t) => sum + Number(t.ilerleme || 0), 0) / total) : 0;
    return { total, open: total - closed, closed, stalled, late, avg };
  }, [filteredTasks]);

  function openNewTask() {
    setDraft({ ...emptyDraft, konuGrubu: canCreateTopics[0] || topicNames[0] || "" });
    setSelected(null);
    setShowForm(true);
  }

  function openEditTask(task: Task) {
    setDraft(task);
    setSelected(task);
    setShowForm(true);
  }

  async function saveTask(event: FormEvent) {
    event.preventDefault();
    setError("");
    const method = draft.id ? "PATCH" : "POST";
    const url = draft.id ? `/api/tasks/${draft.id}` : "/api/tasks";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt yapılamadı");
      setShowForm(false);
      setSelected(data.task || null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    }
  }

  async function addUpdate(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setError("");
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...comment, taskId: selected.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncelleme eklenemedi");
      setComment({ tip: "Güncelleme", metin: "", ekLink: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    }
  }

  const selectedUpdates = selected ? updates.filter((u) => u.taskId === selected.id) : [];

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <h1>ENDURA İş Takip</h1>
          <p>Basit takip, net yetki, tek veri kaynağı: Google Sheets. Ne Trello kadar oyuncaklı, ne Excel kadar “hadi bir sütun daha açalım” tuzağı.</p>
          {payload?.user && <p className="muted" style={{ marginTop: 10, color: "#cbd5e1" }}>Oturum: {payload.user.name} · {payload.user.email}</p>}
        </div>
        <div className="hero-actions">
          <button className="btn ghost" onClick={load}>Yenile</button>
          <button className="btn secondary" onClick={openNewTask} disabled={canCreateTopics.length === 0}>Yeni takip konusu</button>
          <Link className="btn ghost" href="/api/auth/signin">Google ile giriş</Link>
        </div>
      </section>

      {error && <div className="error">{error}</div>}
      {loading && <div className="card" style={{ marginTop: 16 }}>Veriler alınıyor...</div>}

      {!loading && !payload && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Oturum veya bağlantı gerekli</h2>
          <p className="muted">Lokal geliştirmede DEV_USER_EMAIL kullanabilir, canlı ortamda Google login açabilirsin.</p>
        </div>
      )}

      {payload && (
        <>
          <section className="grid kpi-grid">
            <div className="card"><div className="kpi-label">Toplam konu</div><div className="kpi-value">{kpis.total}</div></div>
            <div className="card"><div className="kpi-label">Açık konu</div><div className="kpi-value">{kpis.open}</div></div>
            <div className="card"><div className="kpi-label">Geciken</div><div className="kpi-value">{kpis.late}</div></div>
            <div className="card"><div className="kpi-label">Duraksayan</div><div className="kpi-value">{kpis.stalled}</div></div>
            <div className="card"><div className="kpi-label">Ortalama ilerleme</div><div className="kpi-value">%{kpis.avg}</div></div>
          </section>

          <section className="card">
            <div className="toolbar">
              <input className="field" placeholder="Ara: konu, görevli, açıklama, etiket..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
              <select className="field" value={filters.topic} onChange={(e) => setFilters({ ...filters, topic: e.target.value })}>
                <option value="">Konu grubu</option>
                {topicNames.map((topic) => <option key={topic}>{topic}</option>)}
              </select>
              <select className="field" value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}>
                <option value="">Görevli</option>
                {assignees.map((name) => <option key={name}>{name}</option>)}
              </select>
              <select className="field" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">Statü</option>
                {STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
              <select className="field" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                <option value="">Öncelik</option>
                {PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
              </select>
              <select className="field" value={filters.due} onChange={(e) => setFilters({ ...filters, due: e.target.value })}>
                <option value="">Tarih</option>
                <option value="open">Açık konular</option>
                <option value="overdue">Gecikenler</option>
              </select>
            </div>

            <div className="tabs">
              <button className={`tab ${view === "table" ? "active" : ""}`} onClick={() => setView("table")}>Liste</button>
              <button className={`tab ${view === "board" ? "active" : ""}`} onClick={() => setView("board")}>Kanban</button>
              <button className={`tab ${view === "matrix" ? "active" : ""}`} onClick={() => setView("matrix")}>Takım & yetki</button>
            </div>

            {view === "table" && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Konu</th><th>Başlık</th><th>Görevli</th><th>Öncelik</th><th>Statü</th><th>Hedef</th><th>İlerleme</th><th>Son güncelleme</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task.id}>
                        <td><span className="badge">{task.konuGrubu}</span></td>
                        <td><strong>{task.baslik}</strong><div className="muted">{task.aciklama}</div></td>
                        <td>{task.gorevliAd || task.gorevliEmail}<div className="muted">{task.gorevliEmail}</div></td>
                        <td><span className={`badge ${priorityClass(task.oncelik)}`}>{task.oncelik}</span></td>
                        <td><span className={`badge ${statusClass(task.statu)}`}>{task.statu}</span></td>
                        <td>{formatDate(task.hedefTarih)} {overdue(task) && <span className="badge red">Gecikti</span>}</td>
                        <td><div className="progress"><span style={{ width: `${task.ilerleme || 0}%` }} /></div><div className="muted">%{task.ilerleme || 0}</div></td>
                        <td>{task.sonGuncelleme || "—"}</td>
                        <td><button className="btn secondary" onClick={() => { setSelected(task); setShowForm(false); }}>Aç</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTasks.length === 0 && <div className="empty">Bu filtrelerle kayıt yok.</div>}
              </div>
            )}

            {view === "board" && (
              <div className="board">
                {STATUSES.map((status) => {
                  const columnTasks = filteredTasks.filter((task) => task.statu === status);
                  return (
                    <div className="column" key={status}>
                      <h3>{status}<span>{columnTasks.length}</span></h3>
                      {columnTasks.map((task) => (
                        <div className="task-card" key={task.id} onClick={() => { setSelected(task); setShowForm(false); }}>
                          <span className="badge">{task.konuGrubu}</span>
                          <h4>{task.baslik}</h4>
                          <div className="muted">{task.gorevliAd || task.gorevliEmail}</div>
                          <div className="progress" style={{ marginTop: 10 }}><span style={{ width: `${task.ilerleme || 0}%` }} /></div>
                          <div className="muted">Hedef: {formatDate(task.hedefTarih)}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {view === "matrix" && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Kişi</th><th>Rol</th><th>Konu Grubu</th><th>Görür</th><th>Açar</th><th>Günceller</th><th>Yorum/Fikir</th><th>Kapatır</th><th>Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payload.permissions.map((p, idx) => (
                      <tr key={`${p.email}-${p.konuGrubu}-${idx}`}>
                        <td><strong>{p.adSoyad}</strong><div className="muted">{p.email}</div></td>
                        <td>{p.rol}</td>
                        <td><span className="badge">{p.konuGrubu}</span></td>
                        <td>{p.canView ? "✓" : "—"}</td>
                        <td>{p.canCreate ? "✓" : "—"}</td>
                        <td>{p.canUpdate ? "✓" : "—"}</td>
                        <td>{p.canComment ? "✓" : "—"}</td>
                        <td>{p.canClose ? "✓" : "—"}</td>
                        <td>{p.canAdmin ? "✓" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {(selected || showForm) && payload && (
        <div className="drawer" onClick={() => { setSelected(null); setShowForm(false); }}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <h2>{showForm ? (draft.id ? "Takip konusunu düzenle" : "Yeni takip konusu") : selected?.baslik}</h2>
                {!showForm && selected && <p className="muted">{selected.konuGrubu} · {selected.gorevliAd || selected.gorevliEmail}</p>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {selected && !showForm && <button className="btn secondary" onClick={() => openEditTask(selected)}>Düzenle</button>}
                <button className="btn secondary" onClick={() => { setSelected(null); setShowForm(false); }}>Kapat</button>
              </div>
            </div>

            {showForm && (
              <form onSubmit={saveTask} className="grid" style={{ marginTop: 18 }}>
                <div className="form-grid">
                  <label>Konu Grubu
                    <select className="field" value={draft.konuGrubu || ""} onChange={(e) => setDraft({ ...draft, konuGrubu: e.target.value })} required>
                      <option value="">Seç</option>
                      {(draft.id ? topicNames : canCreateTopics).map((topic) => <option key={topic}>{topic}</option>)}
                    </select>
                  </label>
                  <label>Başlık
                    <input className="field" value={draft.baslik || ""} onChange={(e) => setDraft({ ...draft, baslik: e.target.value })} required />
                  </label>
                  <label className="full">Açıklama
                    <textarea className="textarea" value={draft.aciklama || ""} onChange={(e) => setDraft({ ...draft, aciklama: e.target.value })} />
                  </label>
                  <label>Görevli adı
                    <select
                      className="field"
                      value={draft.gorevliAd || ""}
                      onChange={(e) => setDraft({ ...draft, gorevliAd: e.target.value, gorevliEmail: assigneeEmailByName.get(e.target.value) || draft.gorevliEmail || "" })}
                    >
                      <option value="">Seç</option>
                      {assignees.map((name) => <option key={name}>{name}</option>)}
                    </select>
                  </label>
                  <label>Görevli e-posta
                    <input className="field" type="email" value={draft.gorevliEmail || ""} onChange={(e) => setDraft({ ...draft, gorevliEmail: e.target.value })} />
                  </label>
                  <label>Öncelik
                    <select className="field" value={draft.oncelik || "Normal"} onChange={(e) => setDraft({ ...draft, oncelik: e.target.value as Task["oncelik"] })}>
                      {PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
                    </select>
                  </label>
                  <label>Statü
                    <select className="field" value={draft.statu || "Başladı"} onChange={(e) => setDraft({ ...draft, statu: e.target.value as Task["statu"] })}>
                      {STATUSES.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label>Başlangıç
                    <input className="field" type="date" value={draft.baslangicTarihi || ""} onChange={(e) => setDraft({ ...draft, baslangicTarihi: e.target.value })} />
                  </label>
                  <label>Hedef tarih
                    <input className="field" type="date" value={draft.hedefTarih || ""} onChange={(e) => setDraft({ ...draft, hedefTarih: e.target.value })} />
                  </label>
                  <label>İlerleme %
                    <input className="field" type="number" min="0" max="100" value={draft.ilerleme || 0} onChange={(e) => setDraft({ ...draft, ilerleme: Number(e.target.value) })} />
                  </label>
                  <label>Etiketler
                    <input className="field" value={draft.etiketler || ""} onChange={(e) => setDraft({ ...draft, etiketler: e.target.value })} />
                  </label>
                  <label className="full">Son güncelleme özeti
                    <textarea className="textarea" value={draft.sonGuncelleme || ""} onChange={(e) => setDraft({ ...draft, sonGuncelleme: e.target.value })} />
                  </label>
                </div>
                <button className="btn" type="submit">Kaydet</button>
              </form>
            )}

            {!showForm && selected && (
              <section style={{ marginTop: 18 }}>
                <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 16 }}>
                  <div className="card"><div className="kpi-label">Statü</div><span className={`badge ${statusClass(selected.statu)}`}>{selected.statu}</span></div>
                  <div className="card"><div className="kpi-label">Öncelik</div><span className={`badge ${priorityClass(selected.oncelik)}`}>{selected.oncelik}</span></div>
                  <div className="card"><div className="kpi-label">Hedef</div><strong>{formatDate(selected.hedefTarih)}</strong></div>
                </div>
                <p>{selected.aciklama}</p>
                <div className="progress"><span style={{ width: `${selected.ilerleme || 0}%` }} /></div>
                <p className="muted">İlerleme: %{selected.ilerleme || 0} · Oluşturan: {selected.createdBy} · Güncelleyen: {selected.updatedBy}</p>

                <h3>Güncelleme / Fikir / Soru</h3>
                <form onSubmit={addUpdate} className="grid">
                  <select className="field" value={comment.tip} onChange={(e) => setComment({ ...comment, tip: e.target.value })}>
                    {UPDATE_TYPES.map((type) => <option key={type}>{type}</option>)}
                  </select>
                  <textarea className="textarea" placeholder="Gelişme, fikir, soru, risk veya karar notu..." value={comment.metin} onChange={(e) => setComment({ ...comment, metin: e.target.value })} />
                  <input className="field" placeholder="Opsiyonel link" value={comment.ekLink} onChange={(e) => setComment({ ...comment, ekLink: e.target.value })} />
                  <button className="btn" type="submit">Ekle</button>
                </form>

                <div className="update-list">
                  {selectedUpdates.map((u) => (
                    <div className="update-item" key={u.id}>
                      <span className="badge">{u.tip}</span>
                      <p>{u.metin}</p>
                      {u.ekLink && <a className="muted" href={u.ekLink} target="_blank">Ek link</a>}
                      <div className="muted">{u.yazarAd || u.yazarEmail} · {formatDate(u.createdAt)}</div>
                    </div>
                  ))}
                  {selectedUpdates.length === 0 && <div className="empty">Henüz güncelleme yok.</div>}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
