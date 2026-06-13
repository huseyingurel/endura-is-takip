export const STATUSES = [
  "Başladı",
  "İlerliyor",
  "Duraksadı",
  "Tamamlandı"
] as const;

export const PRIORITIES = ["Düşük", "Normal", "Yüksek", "Kritik"] as const;
export const UPDATE_TYPES = ["Güncelleme", "Fikir", "Soru", "Risk", "Karar"] as const;

export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type UpdateType = (typeof UPDATE_TYPES)[number];

export type User = {
  email: string;
  name: string;
};

export type Task = {
  id: string;
  konuGrubu: string;
  baslik: string;
  aciklama: string;
  gorevliEmail: string;
  gorevliAd: string;
  oncelik: Priority;
  statu: Status;
  baslangicTarihi: string;
  hedefTarih: string;
  ilerleme: number;
  etiketler: string;
  sonGuncelleme: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type TaskUpdate = {
  id: string;
  taskId: string;
  tip: UpdateType;
  metin: string;
  yazarEmail: string;
  yazarAd: string;
  createdAt: string;
  ekLink: string;
};

export type Permission = {
  email: string;
  adSoyad: string;
  rol: string;
  konuGrubu: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canComment: boolean;
  canClose: boolean;
  canAdmin: boolean;
};

export type Topic = {
  konuGrubu: string;
  aciklama: string;
  sahipEmail: string;
  aktif: boolean;
};

export type Assignee = {
  adSoyad: string;
  email: string;
  aktif: boolean;
};

export type Capability = {
  konuGrubu: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canComment: boolean;
  canClose: boolean;
  canAdmin: boolean;
};

export const TASK_HEADERS = [
  "id",
  "konuGrubu",
  "baslik",
  "aciklama",
  "gorevliEmail",
  "gorevliAd",
  "oncelik",
  "statu",
  "baslangicTarihi",
  "hedefTarih",
  "ilerleme",
  "etiketler",
  "sonGuncelleme",
  "createdAt",
  "createdBy",
  "updatedAt",
  "updatedBy"
];

export const UPDATE_HEADERS = [
  "id",
  "taskId",
  "tip",
  "metin",
  "yazarEmail",
  "yazarAd",
  "createdAt",
  "ekLink"
];

export const PERMISSION_HEADERS = [
  "email",
  "adSoyad",
  "rol",
  "konuGrubu",
  "canView",
  "canCreate",
  "canUpdate",
  "canComment",
  "canClose",
  "canAdmin"
];

export const TOPIC_HEADERS = ["konuGrubu", "aciklama", "sahipEmail", "aktif"];
export const ASSIGNEE_HEADERS = ["adSoyad", "email", "aktif"];
