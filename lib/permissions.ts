import type { Capability, Permission, Task, User } from "@/lib/types";

function norm(value: string) {
  return (value || "").trim().toLocaleLowerCase("tr-TR");
}

export function userPermissions(user: User, permissions: Permission[]) {
  return permissions.filter((p) => norm(p.email) === norm(user.email));
}

export function isAdmin(user: User, permissions: Permission[]) {
  return userPermissions(user, permissions).some((p) => p.canAdmin);
}

export function capabilityForTopic(
  user: User,
  permissions: Permission[],
  konuGrubu: string
): Capability {
  const rows = userPermissions(user, permissions).filter(
    (p) => p.konuGrubu === "*" || norm(p.konuGrubu) === norm(konuGrubu)
  );

  return {
    konuGrubu,
    canView: rows.some((p) => p.canView || p.canAdmin),
    canCreate: rows.some((p) => p.canCreate || p.canAdmin),
    canUpdate: rows.some((p) => p.canUpdate || p.canAdmin),
    canComment: rows.some((p) => p.canComment || p.canAdmin),
    canClose: rows.some((p) => p.canClose || p.canAdmin),
    canAdmin: rows.some((p) => p.canAdmin)
  };
}

export function canViewTask(user: User, permissions: Permission[], task: Task) {
  return capabilityForTopic(user, permissions, task.konuGrubu).canView;
}

export function canCreateInTopic(user: User, permissions: Permission[], konuGrubu: string) {
  return capabilityForTopic(user, permissions, konuGrubu).canCreate;
}

export function canUpdateTask(user: User, permissions: Permission[], task: Task) {
  return capabilityForTopic(user, permissions, task.konuGrubu).canUpdate;
}

export function canCommentTask(user: User, permissions: Permission[], task: Task) {
  return capabilityForTopic(user, permissions, task.konuGrubu).canComment;
}

export function canCloseTask(user: User, permissions: Permission[], task: Task) {
  return capabilityForTopic(user, permissions, task.konuGrubu).canClose;
}
