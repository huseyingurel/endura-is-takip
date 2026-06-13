const TASK_HEADERS = [
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
  "updatedBy",
  "archivedAt",
  "archivedBy",
  "deletedAt",
  "deletedBy"
];

const UPDATE_HEADERS = ["id", "taskId", "tip", "metin", "yazarEmail", "yazarAd", "createdAt", "ekLink"];
const TOPIC_HEADERS = ["konuGrubu", "aciklama", "sahipEmail", "aktif"];
const ASSIGNEE_HEADERS = ["adSoyad", "email", "aktif"];
const ATTACHMENT_HEADERS = [
  "id",
  "parentType",
  "parentId",
  "taskId",
  "fileName",
  "mimeType",
  "size",
  "driveFileId",
  "driveUrl",
  "uploadedBy",
  "uploadedAt"
];
const PERMISSION_HEADERS = [
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

const SHEETS = {
  Tasks: TASK_HEADERS,
  Updates: UPDATE_HEADERS,
  Topics: TOPIC_HEADERS,
  Assignees: ASSIGNEE_HEADERS,
  Attachments: ATTACHMENT_HEADERS,
  Permissions: PERMISSION_HEADERS
};

const DEFAULT_TOPICS = [
  ["Sanduz Depo Hr.", "Sanduz depo hareketleri", "", true],
  ["Endura Sevkan Satış", "Endura Sevkan satış takipleri", "", true],
  ["Berk Erel Tahsilat", "Berk Erel tahsilat takipleri", "", true],
  ["Genel Merkez", "Genel merkez takipleri", "", true],
  ["Sanduz Muhasebe", "Sanduz muhasebe takipleri", "", true],
  ["Moya Depo Giriş-Çıkış", "Moya depo giriş-çıkış takipleri", "", true],
  ["Moya Muhasebe", "Moya muhasebe takipleri", "", true],
  ["Tetra Maslak Depo", "Tetra Maslak depo takipleri", "", true],
  ["Sevkan Muhasebe", "Sevkan muhasebe takipleri", "", true],
  ["Depo Bulgaristan", "Depo Bulgaristan takipleri", "", true],
  ["Dijital", "Dijital takipler", "", true]
];

const DEFAULT_ASSIGNEES = [
  ["Mehmet Ali İyi Güngör", "", true],
  ["Oya İyi Güngör", "", true],
  ["Mine Erel", "", true],
  ["Berk Erel", "", true],
  ["Kerem Karapazar", "", true],
  ["Hüseyin Gürel", "", true],
  ["Cihan Oktar", "", true],
  ["Orhan Kurt", "", true],
  ["Emre Sarı", "", true],
  ["Murat Örgün", "", true],
  ["Serkan Kılaf", "", true],
  ["Sevkan Şenol", "", true],
  ["Sercan Şenol", "", true],
  ["Tarık Polat", "", true],
  ["Özkan", "", true],
  ["Murat Barut", "", true],
  ["Demre Çankaya", "", true],
  ["Tayfun Özkan", "", true],
  ["Bora", "", true],
  ["Erol Alver", "", true]
];

const DEFAULT_PERMISSIONS = [
  ["huseyin.gurel@gmail.com", "Hüseyin Gürel", "Yönetim", "*", true, true, true, true, true, true]
];

function doGet(e) {
  return handle_(e);
}

function doPost(e) {
  return handle_(e);
}

function handle_(e) {
  try {
    const input = parseInput_(e);
    checkToken_(input.token);
    ensureHeaders_();

    if (input.action === "readAll") return json_(readAll_());
    if (input.action === "appendTask") return json_(appendObject_("Tasks", TASK_HEADERS, input.task));
    if (input.action === "appendUpdate") return json_(appendObject_("Updates", UPDATE_HEADERS, input.update));
    if (input.action === "updateTask") return json_(updateObjectById_("Tasks", TASK_HEADERS, input.task));
    if (input.action === "appendAttachments") return json_(appendAttachments_(input));
    if (input.action === "ensureHeaders") return json_({ ok: true });

    throw new Error("Unknown action: " + input.action);
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function parseInput_(e) {
  if (e && e.postData && e.postData.contents) return JSON.parse(e.postData.contents);
  return (e && e.parameter) || {};
}

function checkToken_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty("APP_TOKEN");
  if (expected && token !== expected) throw new Error("Unauthorized");
}

function spreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function ensureHeaders_() {
  Object.keys(SHEETS).forEach(function (name) {
    const sheet = sheet_(name);
    const headers = SHEETS[name];
    const range = sheet.getRange(1, 1, 1, headers.length);
    const current = range.getValues()[0];
    const needsHeader = current.join("") === "" || headers.some(function (header, index) {
      return current[index] !== header;
    });

    if (needsHeader) range.setValues([headers]);
  });

  seedIfEmpty_("Topics", DEFAULT_TOPICS);
  seedIfEmpty_("Assignees", DEFAULT_ASSIGNEES);
  seedIfEmpty_("Permissions", DEFAULT_PERMISSIONS);
}

function sheet_(name) {
  const ss = spreadsheet_();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function seedIfEmpty_(name, rows) {
  const sheet = sheet_(name);
  if (sheet.getLastRow() > 1) return;
  if (rows.length) sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function readAll_() {
  return {
    ok: true,
    tasks: readObjects_("Tasks", TASK_HEADERS),
    updates: readObjects_("Updates", UPDATE_HEADERS),
    topics: readObjects_("Topics", TOPIC_HEADERS),
    assignees: readObjects_("Assignees", ASSIGNEE_HEADERS),
    attachments: readObjects_("Attachments", ATTACHMENT_HEADERS),
    permissions: readObjects_("Permissions", PERMISSION_HEADERS)
  };
}

function readObjects_(name, headers) {
  const sheet = sheet_(name);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values.filter(function (row) {
    return row.some(function (cell) {
      return cell !== "";
    });
  }).map(function (row) {
    return rowToObject_(headers, row);
  });
}

function rowToObject_(headers, row) {
  const obj = {};
  headers.forEach(function (header, index) {
    obj[header] = row[index] === undefined ? "" : row[index];
  });
  return obj;
}

function objectToRow_(headers, obj) {
  obj = obj || {};
  return headers.map(function (header) {
    return obj[header] === undefined ? "" : obj[header];
  });
}

function appendObject_(name, headers, obj) {
  const sheet = sheet_(name);
  sheet.appendRow(objectToRow_(headers, obj));
  return { ok: true };
}

function appendAttachments_(input) {
  const files = Array.isArray(input.files) ? input.files : [];
  if (!input.parentType || !input.parentId || !input.taskId) throw new Error("Missing attachment parent");
  if (files.length === 0) return { ok: true, attachments: [] };

  const folder = attachmentsFolder_();
  const uploadedAt = input.uploadedAt || new Date().toISOString();
  const attachments = files.map(function (file) {
    if (!file.fileName || !file.data) throw new Error("Missing attachment data");

    const bytes = Utilities.base64Decode(file.data);
    const blob = Utilities.newBlob(bytes, file.mimeType || "application/octet-stream", file.fileName);
    const driveFile = folder.createFile(blob);
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      id: Utilities.getUuid(),
      parentType: input.parentType === "Update" ? "Update" : "Task",
      parentId: input.parentId,
      taskId: input.taskId,
      fileName: file.fileName,
      mimeType: file.mimeType || "",
      size: file.size || bytes.length,
      driveFileId: driveFile.getId(),
      driveUrl: driveFile.getUrl(),
      uploadedBy: input.uploadedBy || "",
      uploadedAt: uploadedAt
    };
  });

  const sheet = sheet_("Attachments");
  const rows = attachments.map(function (attachment) {
    return objectToRow_(ATTACHMENT_HEADERS, attachment);
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, ATTACHMENT_HEADERS.length).setValues(rows);

  return { ok: true, attachments: attachments };
}

function attachmentsFolder_() {
  const props = PropertiesService.getScriptProperties();
  const configuredId = props.getProperty("DRIVE_FOLDER_ID");
  if (configuredId) return DriveApp.getFolderById(configuredId);

  const folderName = "Endura İş Takip Dosyaları";
  const folders = DriveApp.getFoldersByName(folderName);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  props.setProperty("DRIVE_FOLDER_ID", folder.getId());
  return folder;
}

function updateObjectById_(name, headers, obj) {
  if (!obj || !obj.id) throw new Error("Missing id");

  const sheet = sheet_(name);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error("Task not found");

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const index = ids.findIndex(function (row) {
    return row[0] === obj.id;
  });
  if (index < 0) throw new Error("Task not found");

  sheet.getRange(index + 2, 1, 1, headers.length).setValues([objectToRow_(headers, obj)]);
  return { ok: true };
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
