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
 * - No memberships yet (new user before creating a group; they become chairperson on first group)
 * - At least one membership with title CHAIRPERSON, SECRETARY, or TREASURER
 *
 * Blocked:
 * - systemRole === "USER" with one or more memberships where every title is "MEMBER"
 *
 * @param user - The authenticated user from session
 * @returns true if the user can access the web app, false otherwise
 */
export function canAccessWeb(user: WebUser | null | undefined): boolean {
  if (!user) return false;

  // ADMIN system role always has access
  if (user.role === "ADMIN") return true;

  const memberships = user.memberships ?? [];

  // No groups yet — allow so they can use the web app to create one (first group → chairperson)
  if (memberships.length === 0) return true;

  // Block users who are only MEMBER in every group (mobile-app audience)
  const onlyMemberEverywhere = memberships.every((m) => m.title === "MEMBER");
  if (onlyMemberEverywhere) return false;

  // At least one leadership role somewhere
  const hasLeadershipRole = memberships.some((m) =>
    LEADERSHIP_ROLES.includes(m.title as (typeof LEADERSHIP_ROLES)[number])
  );

  return hasLeadershipRole;
}
