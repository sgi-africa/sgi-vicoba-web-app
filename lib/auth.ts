/**
 * Leadership roles that are allowed to access the web application.
 * Users with systemRole ADMIN always have access.
 */
const LEADERSHIP_ROLES = ["CHAIRPERSON", "SECRETARY", "TREASURER"] as const;

export type WebUser = {
  role: string;
  memberships?: { groupId: number; groupName: string; title: string }[];
};

/**
 * Determines if a user can access the web application.
 *
 * Allowed:
 * - systemRole === "ADMIN" (always)
 * - At least one membership with title in CHAIRPERSON, SECRETARY, TREASURER
 *
 * Blocked:
 * - systemRole === "USER" AND all memberships have title === "MEMBER"
 * - (or no memberships at all for a USER)
 *
 * @param user - The authenticated user from session
 * @returns true if the user can access the web app, false otherwise
 */
export function canAccessWeb(user: WebUser | null | undefined): boolean {
  if (!user) return false;

  // ADMIN system role always has access
  if (user.role === "ADMIN") return true;

  const memberships = user.memberships ?? [];

  // If no memberships and not ADMIN, block (e.g. USER with no groups)
  if (memberships.length === 0) return false;

  // Check if user has at least one leadership role in any membership
  const hasLeadershipRole = memberships.some((m) =>
    LEADERSHIP_ROLES.includes(m.title as (typeof LEADERSHIP_ROLES)[number])
  );

  return hasLeadershipRole;
}
