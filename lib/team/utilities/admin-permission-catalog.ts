/** A permission entry from the role-permissions catalog or a role default set. */
export interface AdminTeamPermissionCatalogItem {
    id?: string;
    resource?: string;
    action?: string;
    scope?: string;
    description?: string;
    [key: string]: unknown;
}

function normalizePart(value?: string): string {
    return value?.trim().toLowerCase() ?? "";
}

/** Returns true for the global wildcard permission that should stay hidden in invite UI. */
export function isGlobalWildcardPermission(permission: AdminTeamPermissionCatalogItem): boolean {
    return normalizePart(permission.resource) === "*"
        && normalizePart(permission.action) === "*"
        && normalizePart(permission.scope) === "*";
}

/** Returns a sentence-style permission label, including scope when specific. */
export function formatAdminPermissionLabel(permission: AdminTeamPermissionCatalogItem): string {
    const resource = normalizePart(permission.resource) || "system";
    const action = normalizePart(permission.action);
    const scope = normalizePart(permission.scope);

    const resourceLabel = resource === "*" ? "all resources" : resource.replace(/-/g, " ");
    const actionLabel =
        !action || action === "*"
            ? "manage"
            : action.replace(/-/g, " ");

    const rawTitle = `${actionLabel} ${resourceLabel}`.trim();
    const base = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase();

    if (!scope || scope === "*") {
        return base;
    }

    return `${base} · ${scope.replace(/-/g, " ")}`;
}

/** Builds a stable identity that keeps scoped variants distinct even when ids collide. */
function permissionCatalogKey(permission: AdminTeamPermissionCatalogItem): string {
    const parts = [
        normalizePart(permission.resource),
        normalizePart(permission.action),
        normalizePart(permission.scope),
    ].join(":");

    return permission.id ? `${permission.id}|${parts}` : parts;
}

/**
 * Merges the top-level catalog with every role's permission list so scoped
 * variants (e.g. settings edit/general) are not dropped when missing from catalog.
 */
export function buildAdminPermissionCatalog(
    catalogPermissions: readonly AdminTeamPermissionCatalogItem[] | null | undefined,
    rolePermissions: ReadonlyArray<{ permissions?: readonly AdminTeamPermissionCatalogItem[] }> | null | undefined,
): AdminTeamPermissionCatalogItem[] {
    const byKey = new Map<string, AdminTeamPermissionCatalogItem>();

    const addPermission = (permission: AdminTeamPermissionCatalogItem | null | undefined) => {
        if (!permission || isGlobalWildcardPermission(permission)) {
            return;
        }

        // Invite toggles need an id; skip incomplete rows that cannot be granted.
        if (!permission.id) {
            return;
        }

        const key = permissionCatalogKey(permission);
        if (!byKey.has(key)) {
            byKey.set(key, permission);
        }
    };

    for (const permission of catalogPermissions ?? []) {
        addPermission(permission);
    }

    for (const role of rolePermissions ?? []) {
        for (const permission of role.permissions ?? []) {
            addPermission(permission);
        }
    }

    return Array.from(byKey.values()).sort((left, right) => {
        const leftKey = [
            normalizePart(left.resource),
            normalizePart(left.action),
            normalizePart(left.scope),
        ].join(":");
        const rightKey = [
            normalizePart(right.resource),
            normalizePart(right.action),
            normalizePart(right.scope),
        ].join(":");

        return leftKey.localeCompare(rightKey);
    });
}

/** Sorts catalog items with role-default permissions first, then by resource/action/scope. */
export function sortAdminPermissionCatalog(
    permissions: readonly AdminTeamPermissionCatalogItem[],
    defaultPermissionIds: ReadonlySet<string>,
): AdminTeamPermissionCatalogItem[] {
    return [...permissions].sort((left, right) => {
        const leftDefault = defaultPermissionIds.has(left.id ?? "");
        const rightDefault = defaultPermissionIds.has(right.id ?? "");

        if (leftDefault !== rightDefault) {
            return leftDefault ? -1 : 1;
        }

        const leftKey = [
            normalizePart(left.resource),
            normalizePart(left.action),
            normalizePart(left.scope),
        ].join(":");
        const rightKey = [
            normalizePart(right.resource),
            normalizePart(right.action),
            normalizePart(right.scope),
        ].join(":");

        return leftKey.localeCompare(rightKey);
    });
}
