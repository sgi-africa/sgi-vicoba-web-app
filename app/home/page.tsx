import GroupDashboard from "@/components/GroupDashboard"
import homeAction from "./_action"

export default async function page() {
  
  const groups = await homeAction()

  return (
    <GroupDashboard groups={groups} />
  )
}
