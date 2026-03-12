import GroupDashboard from "@/components/home/group-dashboard"
import homeAction from "./_action"
import { auth } from "@/auth"
import { GroupResponse } from "@/interfaces/interface"

export default async function page() {

  const groups = await homeAction()
  const session = await auth()

  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // Filter groups to only those user is a member of
  const userGroupIds = session.user.memberships.map(m => m.groupId)
  const userGroups: GroupResponse[] = groups.filter((group: GroupResponse) => userGroupIds.includes(group.id))

  return (
    <GroupDashboard groups={userGroups} />
  )
}
