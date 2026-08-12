/**
 * Authorization utility guards.
 * Centralizes ownership and role-based access checks to keep controllers clean.
 */

/**
 * Returns true if the requesting user is the resource owner or a site admin.
 * Use this before any mutation (update, delete) on user-owned resources.
 */
export function canModifyResource(
  requestingUserId: string,
  resourceOwnerId: string,
  isAdmin: boolean
): boolean {
  return requestingUserId === resourceOwnerId || isAdmin;
}

/**
 * Returns true only if the requesting user is a site admin.
 */
export function checkIsAdmin(isAdminFlag: boolean): boolean {
  return isAdminFlag === true;
}
