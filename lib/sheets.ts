import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ATTACHMENT_HEADERS,
  ASSIGNEE_HEADERS,
  PERMISSION_HEADERS,
  TASK_HEADERS,
  TOPIC_HEADERS,
  UPDATE_HEADERS,
  type Attachment,
  type AttachmentParentType,
  type AttachmentUpload,
  type Assignee,
  type Permission,
  type Task,
  type TaskUpdate,
  type Topic
} from "@/lib/types";

const TASKS_SHEET = "Tasks";
const UPDATES_SHEET = "Updates";
const TOPICS_SHEET = "Topics";
const PERMISSIONS_SHEET = "Permissions";
const ASSIGNEES_SHEET = "Assignees";
const ATTACHMENTS_SHEET = "Attachments";

type SheetBundle = {
  tasks: Task[];
  updates: TaskUpdate[];
  permissions: Permission[];
  topics: Topic[];
  assignees: Assignee[];
  attachments: Attachment[];
};

type SheetName =
  | typeof TASKS_SHEET
  | typeof UPDATES_SHEET
  | typeof TOPICS_SHEET
  | typeof PERMISSIONS_SHEET
  | typeof ASSIGNEES_SHEET
  | typeof ATTACHMENTS_SHEET;

function appsScriptUrl() {
  return (process.env.GOOGLE_APPS_SCRIPT_URL || "").trim();
}

function appsScriptToken() {
  return (process.env.GOOGLE_APPS_SCRIPT_TOKEN || "").trim();
}

function shouldUseAppsScript() {
  return Boolean(appsScriptUrl());
}

function shouldUseLocalCsv() {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || "";
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY || "";
  return !email || !key || email.includes("your-") || key.includes("...");
}

function localCsvPath(sheet: SheetName) {
  return path.join(process.cwd(), "sheets", `${sheet}.csv`);
}

function tasksSpreadsheetId() {
  const id = process.env.GOOGLE_TASKS_SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) throw new Error("GOOGLE_TASKS_SPREADSHEET_ID missing");
  return id;
}

function permissionsSpreadsheetId() {
  return process.env.GOOGLE_PERMISSIONS_SPREADSHEET_ID || tasksSpreadsheetId();
}

function privateKey() {
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (!key) throw new Error("GOOGLE_SHEETS_PRIVATE_KEY missing");
  return key.replace(/\\n/g, "\n");
}

function clientEmail() {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  if (!email) throw new Error("GOOGLE_SHEETS_CLIENT_EMAIL missing");
  return email;
}

async function sheetsClient() {
  const importer = new Function("specifier", "return import(specifier)") as (
    specifier: string
  ) => Promise<{ google: any }>;
  const { google } = await importer("googleapis");
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail(),
      private_key: privateKey()
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({ version: "v4", auth });
}

function boolValue(value: unknown) {
  const raw = String(value ?? "").trim().toLocaleLowerCase("tr-TR");
  return ["true", "1", "evet", "yes", "y", "x"].includes(raw);
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === "\"") {
      if (quoted && next === "\"") {
        value += "\"";
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value);
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

function csvCell(value: unknown) {
  const raw = String(value ?? "");
  if (!/[",\r\n]/.test(raw)) return raw;
  return `"${raw.replace(/"/g, "\"\"")}"`;
}

function stringifyCsv(rows: unknown[][]) {
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

function headerRow(row: unknown[] | undefined, fallback: readonly string[]) {
  return row?.map((cell) => String(cell ?? "")) || Array.from(fallback);
}

async function readLocalSheet(sheet: SheetName) {
  const rows = parseCsv(await readFile(localCsvPath(sheet), "utf8"));
  return {
    headers: rows[0] || [],
    dataRows: rows.slice(1)
  };
}

async function writeLocalSheet(sheet: SheetName, headers: readonly string[], rows: unknown[][]) {
  await writeFile(localCsvPath(sheet), stringifyCsv([Array.from(headers), ...rows]), "utf8");
}

function rowToObject<T>(expectedHeaders: readonly string[], actualHeaders: readonly string[], row: unknown[]): T {
  const obj: Record<string, unknown> = {};
  expectedHeaders.forEach((header) => {
    const index = actualHeaders.findIndex((actual) => actual.trim() === header);
    obj[header] = index >= 0 ? row[index] ?? "" : "";
  });
  return obj as T;
}

function normalizeTask(row: unknown[], headers = TASK_HEADERS): Task {
  const t = rowToObject<Task>(TASK_HEADERS, headers, row);
  return {
    ...t,
    ilerleme: Math.max(0, Math.min(100, numberValue(t.ilerleme)))
  };
}

function normalizeUpdate(row: unknown[], headers = UPDATE_HEADERS): TaskUpdate {
  return rowToObject<TaskUpdate>(UPDATE_HEADERS, headers, row);
}

function normalizePermission(row: unknown[], headers = PERMISSION_HEADERS): Permission {
  const p = rowToObject<Permission>(PERMISSION_HEADERS, headers, row);
  return {
    ...p,
    canView: boolValue(p.canView),
    canCreate: boolValue(p.canCreate),
    canUpdate: boolValue(p.canUpdate),
    canComment: boolValue(p.canComment),
    canClose: boolValue(p.canClose),
    canAdmin: boolValue(p.canAdmin)
  };
}

function normalizeTopic(row: unknown[], headers = TOPIC_HEADERS): Topic {
  const t = rowToObject<Topic>(TOPIC_HEADERS, headers, row);
  return {
    ...t,
    aktif: boolValue(t.aktif)
  };
}

function normalizeAssignee(row: unknown[], headers = ASSIGNEE_HEADERS): Assignee {
  const assignee = rowToObject<Assignee>(ASSIGNEE_HEADERS, headers, row);
  return {
    ...assignee,
    aktif: boolValue(assignee.aktif)
  };
}

function normalizeAttachment(row: unknown[], headers = ATTACHMENT_HEADERS): Attachment {
  const attachment = rowToObject<Attachment>(ATTACHMENT_HEADERS, headers, row);
  return {
    ...attachment,
    parentType: attachment.parentType === "Update" ? "Update" : "Task",
    size: numberValue(attachment.size)
  };
}

function taskToRow(task: Task) {
  return TASK_HEADERS.map((key) => String((task as Record<string, unknown>)[key] ?? ""));
}

function updateToRow(update: TaskUpdate) {
  return UPDATE_HEADERS.map((key) => String((update as Record<string, unknown>)[key] ?? ""));
}

function attachmentToRow(attachment: Attachment) {
  return ATTACHMENT_HEADERS.map((key) => String((attachment as Record<string, unknown>)[key] ?? ""));
}

function objectToRow(headers: readonly string[], item: unknown) {
  const record = (item || {}) as Record<string, unknown>;
  return headers.map((key) => record[key] ?? "");
}

async function callAppsScript<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(appsScriptUrl(), {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action,
      token: appsScriptToken(),
      ...payload
    }),
    cache: "no-store"
  });

  const text = await response.text();
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text || "{}") as Record<string, unknown>;
  } catch {
    throw new Error(`Apps Script yanıtı JSON değil: ${text.slice(0, 160)}`);
  }

  if (!response.ok || data.ok === false) {
    throw new Error(String(data.error || `Apps Script isteği başarısız: ${response.status}`));
  }

  return data as T;
}

export async function getDataBundle(): Promise<SheetBundle> {
  if (shouldUseAppsScript()) {
    const data = await callAppsScript<{
      tasks?: unknown[];
      updates?: unknown[];
      permissions?: unknown[];
      topics?: unknown[];
      assignees?: unknown[];
      attachments?: unknown[];
    }>("readAll");

    return {
      tasks: (data.tasks || []).map((item) => normalizeTask(objectToRow(TASK_HEADERS, item))),
      updates: (data.updates || []).map((item) => normalizeUpdate(objectToRow(UPDATE_HEADERS, item))),
      permissions: (data.permissions || []).map((item) => normalizePermission(objectToRow(PERMISSION_HEADERS, item))),
      topics: (data.topics || []).map((item) => normalizeTopic(objectToRow(TOPIC_HEADERS, item))),
      assignees: (data.assignees || []).map((item) => normalizeAssignee(objectToRow(ASSIGNEE_HEADERS, item))),
      attachments: (data.attachments || []).map((item) => normalizeAttachment(objectToRow(ATTACHMENT_HEADERS, item)))
    };
  }

  const [tasks, updates, permissions, topics, assignees, attachments] = await Promise.all([
    getTasks(),
    getUpdates(),
    getPermissions(),
    getTopics(),
    getAssignees(),
    getAttachments()
  ]);

  return { tasks, updates, permissions, topics, assignees, attachments };
}

async function getRows(spreadsheetId: string, range: string): Promise<unknown[][]> {
  const sheets = await sheetsClient();
  const result = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return result.data.values || [];
}

export async function getTasks(): Promise<Task[]> {
  if (shouldUseAppsScript()) return (await getDataBundle()).tasks;

  if (shouldUseLocalCsv()) {
    const { headers, dataRows } = await readLocalSheet(TASKS_SHEET);
    return dataRows.filter((r) => r.length > 0 && r[0]).map((row) => normalizeTask(row, headers));
  }

  const rows = await getRows(tasksSpreadsheetId(), `${TASKS_SHEET}!A:Q`);
  const headers = headerRow(rows[0], TASK_HEADERS);
  return rows.slice(1).filter((r) => r.length > 0 && r[0]).map((row) => normalizeTask(row, headers));
}

export async function getUpdates(): Promise<TaskUpdate[]> {
  if (shouldUseAppsScript()) return (await getDataBundle()).updates;

  if (shouldUseLocalCsv()) {
    const { headers, dataRows } = await readLocalSheet(UPDATES_SHEET);
    return dataRows.filter((r) => r.length > 0 && r[0]).map((row) => normalizeUpdate(row, headers));
  }

  const rows = await getRows(tasksSpreadsheetId(), `${UPDATES_SHEET}!A:H`);
  const headers = headerRow(rows[0], UPDATE_HEADERS);
  return rows.slice(1).filter((r) => r.length > 0 && r[0]).map((row) => normalizeUpdate(row, headers));
}

export async function getPermissions(): Promise<Permission[]> {
  if (shouldUseAppsScript()) return (await getDataBundle()).permissions;

  if (shouldUseLocalCsv()) {
    const { headers, dataRows } = await readLocalSheet(PERMISSIONS_SHEET);
    return dataRows.filter((r) => r.length > 0 && r[0]).map((row) => normalizePermission(row, headers));
  }

  const rows = await getRows(permissionsSpreadsheetId(), `${PERMISSIONS_SHEET}!A:J`);
  const headers = headerRow(rows[0], PERMISSION_HEADERS);
  return rows.slice(1).filter((r) => r.length > 0 && r[0]).map((row) => normalizePermission(row, headers));
}

export async function getTopics(): Promise<Topic[]> {
  if (shouldUseAppsScript()) return (await getDataBundle()).topics;

  if (shouldUseLocalCsv()) {
    const { headers, dataRows } = await readLocalSheet(TOPICS_SHEET);
    return dataRows.filter((r) => r.length > 0 && r[0]).map((row) => normalizeTopic(row, headers));
  }

  const rows = await getRows(tasksSpreadsheetId(), `${TOPICS_SHEET}!A:D`);
  const headers = headerRow(rows[0], TOPIC_HEADERS);
  return rows.slice(1).filter((r) => r.length > 0 && r[0]).map((row) => normalizeTopic(row, headers));
}

export async function getAssignees(): Promise<Assignee[]> {
  if (shouldUseAppsScript()) return (await getDataBundle()).assignees;

  if (shouldUseLocalCsv()) {
    const { headers, dataRows } = await readLocalSheet(ASSIGNEES_SHEET);
    return dataRows.filter((r) => r.length > 0 && r[0]).map((row) => normalizeAssignee(row, headers));
  }

  const rows = await getRows(tasksSpreadsheetId(), `${ASSIGNEES_SHEET}!A:C`);
  const headers = headerRow(rows[0], ASSIGNEE_HEADERS);
  return rows.slice(1).filter((r) => r.length > 0 && r[0]).map((row) => normalizeAssignee(row, headers));
}

export async function getAttachments(): Promise<Attachment[]> {
  if (shouldUseAppsScript()) return (await getDataBundle()).attachments;

  if (shouldUseLocalCsv()) {
    const { headers, dataRows } = await readLocalSheet(ATTACHMENTS_SHEET);
    return dataRows.filter((r) => r.length > 0 && r[0]).map((row) => normalizeAttachment(row, headers));
  }

  const rows = await getRows(tasksSpreadsheetId(), `${ATTACHMENTS_SHEET}!A:K`);
  const headers = headerRow(rows[0], ATTACHMENT_HEADERS);
  return rows.slice(1).filter((r) => r.length > 0 && r[0]).map((row) => normalizeAttachment(row, headers));
}

export async function appendTask(task: Task) {
  if (shouldUseAppsScript()) {
    await callAppsScript("appendTask", { task });
    return;
  }

  if (shouldUseLocalCsv()) {
    const tasks = await getTasks();
    await writeLocalSheet(TASKS_SHEET, TASK_HEADERS, [...tasks, task].map(taskToRow));
    return;
  }

  const sheets = await sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: tasksSpreadsheetId(),
    range: `${TASKS_SHEET}!A:Q`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [taskToRow(task)] }
  });
}

export async function appendUpdate(update: TaskUpdate) {
  if (shouldUseAppsScript()) {
    await callAppsScript("appendUpdate", { update });
    return;
  }

  if (shouldUseLocalCsv()) {
    const updates = await getUpdates();
    await writeLocalSheet(UPDATES_SHEET, UPDATE_HEADERS, [...updates, update].map(updateToRow));
    return;
  }

  const sheets = await sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: tasksSpreadsheetId(),
    range: `${UPDATES_SHEET}!A:H`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [updateToRow(update)] }
  });
}

export async function appendAttachments(params: {
  parentType: AttachmentParentType;
  parentId: string;
  taskId: string;
  files: AttachmentUpload[];
  uploadedBy: string;
  uploadedAt?: string;
}) {
  const files = params.files.filter((file) => file.fileName && file.data);
  if (files.length === 0) return [];

  if (shouldUseAppsScript()) {
    const result = await callAppsScript<{ attachments?: Attachment[] }>("appendAttachments", {
      ...params,
      files
    });
    return result.attachments || [];
  }

  const at = params.uploadedAt || new Date().toISOString();
  const attachments: Attachment[] = files.map((file) => ({
    id: crypto.randomUUID(),
    parentType: params.parentType,
    parentId: params.parentId,
    taskId: params.taskId,
    fileName: file.fileName,
    mimeType: file.mimeType,
    size: file.size,
    driveFileId: "",
    driveUrl: file.data,
    uploadedBy: params.uploadedBy,
    uploadedAt: at
  }));

  if (shouldUseLocalCsv()) {
    const existing = await getAttachments();
    await writeLocalSheet(ATTACHMENTS_SHEET, ATTACHMENT_HEADERS, [...existing, ...attachments].map(attachmentToRow));
    return attachments;
  }

  const sheets = await sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: tasksSpreadsheetId(),
    range: `${ATTACHMENTS_SHEET}!A:K`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: attachments.map(attachmentToRow) }
  });
  return attachments;
}

export async function updateTask(task: Task) {
  if (shouldUseAppsScript()) {
    await callAppsScript("updateTask", { task });
    return;
  }

  if (shouldUseLocalCsv()) {
    const tasks = await getTasks();
    const index = tasks.findIndex((item) => item.id === task.id);
    if (index < 0) throw new Error("Task not found");
    tasks[index] = task;
    await writeLocalSheet(TASKS_SHEET, TASK_HEADERS, tasks.map(taskToRow));
    return;
  }

  const rows = await getRows(tasksSpreadsheetId(), `${TASKS_SHEET}!A2:A`);
  const index = rows.findIndex((row) => row[0] === task.id);
  if (index < 0) throw new Error("Task not found");

  const rowNumber = index + 2;
  const sheets = await sheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: tasksSpreadsheetId(),
    range: `${TASKS_SHEET}!A${rowNumber}:Q${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [taskToRow(task)] }
  });
}

export async function findTaskById(id: string) {
  const tasks = await getTasks();
  return tasks.find((task) => task.id === id) || null;
}

export async function initializeHeaders() {
  if (shouldUseAppsScript()) {
    await callAppsScript("ensureHeaders");
    return;
  }

  if (shouldUseLocalCsv()) {
    await Promise.all([
      writeLocalSheet(TASKS_SHEET, TASK_HEADERS, (await getTasks()).map(taskToRow)),
      writeLocalSheet(UPDATES_SHEET, UPDATE_HEADERS, (await getUpdates()).map(updateToRow)),
      writeLocalSheet(TOPICS_SHEET, TOPIC_HEADERS, (await getTopics()).map((topic) => TOPIC_HEADERS.map((key) => String((topic as Record<string, unknown>)[key] ?? "")))),
      writeLocalSheet(PERMISSIONS_SHEET, PERMISSION_HEADERS, (await getPermissions()).map((permission) => PERMISSION_HEADERS.map((key) => String((permission as Record<string, unknown>)[key] ?? "")))),
      writeLocalSheet(ASSIGNEES_SHEET, ASSIGNEE_HEADERS, (await getAssignees()).map((assignee) => ASSIGNEE_HEADERS.map((key) => String((assignee as Record<string, unknown>)[key] ?? "")))),
      writeLocalSheet(ATTACHMENTS_SHEET, ATTACHMENT_HEADERS, (await getAttachments()).map(attachmentToRow))
    ]);
    return;
  }

  const sheets = await sheetsClient();
  await Promise.all([
    sheets.spreadsheets.values.update({
      spreadsheetId: tasksSpreadsheetId(),
      range: `${TASKS_SHEET}!A1:Q1`,
      valueInputOption: "RAW",
      requestBody: { values: [TASK_HEADERS] }
    }),
    sheets.spreadsheets.values.update({
      spreadsheetId: tasksSpreadsheetId(),
      range: `${UPDATES_SHEET}!A1:H1`,
      valueInputOption: "RAW",
      requestBody: { values: [UPDATE_HEADERS] }
    }),
    sheets.spreadsheets.values.update({
      spreadsheetId: tasksSpreadsheetId(),
      range: `${TOPICS_SHEET}!A1:D1`,
      valueInputOption: "RAW",
      requestBody: { values: [TOPIC_HEADERS] }
    }),
    sheets.spreadsheets.values.update({
      spreadsheetId: permissionsSpreadsheetId(),
      range: `${PERMISSIONS_SHEET}!A1:J1`,
      valueInputOption: "RAW",
      requestBody: { values: [PERMISSION_HEADERS] }
    }),
    sheets.spreadsheets.values.update({
      spreadsheetId: tasksSpreadsheetId(),
      range: `${ASSIGNEES_SHEET}!A1:C1`,
      valueInputOption: "RAW",
      requestBody: { values: [ASSIGNEE_HEADERS] }
    }),
    sheets.spreadsheets.values.update({
      spreadsheetId: tasksSpreadsheetId(),
      range: `${ATTACHMENTS_SHEET}!A1:K1`,
      valueInputOption: "RAW",
      requestBody: { values: [ATTACHMENT_HEADERS] }
    })
  ]);
}
